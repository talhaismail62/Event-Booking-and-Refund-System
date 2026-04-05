import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import api from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const formatRs   = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;
const flash      = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 4000); };

const statusStyle = (s) => ({
    padding: '3px 8px', borderRadius: '12px', fontSize: '0.78em', fontWeight: 'bold',
    textTransform: 'uppercase', color: s === 'pending' ? 'black' : 'white',
    backgroundColor: s === 'pending' ? '#ffc107' : s === 'confirmed' ? '#28a745' : '#dc3545',
});

const S = {
    input:   { width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#111', color: 'white', fontSize: '0.9em', outline: 'none', boxSizing: 'border-box' },
    label:   { display: 'block', marginBottom: '5px', fontSize: '0.82em', color: '#aaa' },
    gray:    { padding: '8px 18px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btn:     (color, dis) => ({ padding: '8px 18px', backgroundColor: dis ? '#555' : color, color: 'white', border: 'none', borderRadius: '4px', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.7 : 1 }),
    smallBtn:(color, dis) => ({ padding: '4px 11px', backgroundColor: dis ? '#555' : color, color: 'white', border: 'none', borderRadius: '4px', cursor: dis ? 'not-allowed' : 'pointer', fontSize: '0.8em', opacity: dis ? 0.6 : 1 }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    modal:   { background: '#1a1a1a', border: '1px solid #444', borderRadius: '10px', padding: '24px', width: '100%', maxWidth: '460px', color: 'white', fontFamily: 'sans-serif', maxHeight: '90vh', overflowY: 'auto' },
    row:     { borderBottom: '1px solid #2a2a2a', color: 'white' },
    cell:    (color) => ({ padding: '10px 12px', color: color || 'white' }),
    th:      { padding: '10px 12px', color: '#aaa', fontWeight: '600', borderBottom: '1px solid #444', whiteSpace: 'nowrap' },
};

const Msg = ({ msg, ok }) => msg
    ? <div style={{ color: ok ? 'green' : 'red', padding: '10px', backgroundColor: ok ? '#e6ffe6' : '#ffe6e6', borderRadius: '4px', marginBottom: '14px' }}>{ok ? `✓ ${msg}` : msg}</div>
    : null;

const Modal = ({ title, fields, values, onChange, onSave, onClose, saving, error, saveLabel = 'Save', saveColor = '#28a745' }) => (
    <div style={S.overlay} onClick={onClose}>
        <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            {fields.map(f => (
                <div key={f.key} style={{ marginBottom: '14px' }}>
                    <label style={S.label}>{f.label}</label>
                    <input type={f.type || 'text'} style={S.input} value={values[f.key] || ''}
                        onChange={e => onChange(f.key, e.target.value)} />
                </div>
            ))}
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.85em', marginBottom: '12px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={S.gray} onClick={onClose}>Cancel</button>
                <button style={S.btn(saveColor, saving)} onClick={onSave} disabled={saving}>
                    {saving ? 'Saving...' : saveLabel}
                </button>
            </div>
        </div>
    </div>
);

const CrudTable = ({ title, cols, data, loading, onAdd, onEdit, success, error }) => (
    <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#ccc' }}>{title}</h4>
            <button style={S.btn('#28a745', false)} onClick={onAdd}>+ Add {title.slice(0, -1)}</button>
        </div>
        <Msg msg={success} ok />
        <Msg msg={error} />
        {loading ? <p style={{ color: '#aaa' }}>Loading...</p> : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#2a2a2a', textAlign: 'left' }}>
                            {[...cols.map(c => c.label), 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0
                            ? <tr><td colSpan={cols.length + 1} style={{ padding: '14px 12px', color: '#888' }}>No {title.toLowerCase()} found.</td></tr>
                            : data.map((row, i) => (
                                <tr key={row.id || i} style={S.row}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1a2a'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    {cols.map(c => <td key={c.key} style={S.cell(c.color)}>{c.format ? c.format(row[c.key]) : row[c.key]}</td>)}
                                    <td style={S.cell()}>
                                        <button style={S.smallBtn('#007BFF', false)} onClick={() => onEdit(row)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const useCrud = (endpoint, emptyForm) => {
    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error,   setError]   = useState('');
    const [adding,  setAdding]  = useState(false);
    const [form,    setForm]    = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [saving,  setSaving]  = useState(false);
    const [modalErr,setModalErr]= useState('');
    const [showAdd, setShowAdd] = useState(false);

    const fetch = () => {
    setLoading(true);
    api.get(endpoint)
        .then(res => {
            const d = res.data;
            if (Array.isArray(d)) {
                setData(d);
            } else if (d?.halls)     { setData(d.halls);    }
            else if (d?.services)    { setData(d.services); }
            else if (d?.food)        { setData(d.food);     }
            else                     { setData([]); }
        })
        .catch(() => setError('Failed to load.'))
        .finally(() => setLoading(false));
};

    useEffect(() => { fetch(); }, []);

    const openAdd  = () => { setModalErr(''); setForm(emptyForm); setShowAdd(true); };
    const openEdit = (row) => { setModalErr(''); setEditing({ ...row }); };

    const handleAdd = async () => {
        setModalErr('');
        if (Object.values(form).some(v => !v)) { setModalErr('All fields are required.'); return; }
        setSaving(true);
        try {
            await api.post(endpoint, Object.fromEntries(Object.entries(form).map(([k, v]) => [k, isNaN(v) ? v : Number(v)])));
            setShowAdd(false); setForm(emptyForm);
            flash(setSuccess, 'Added successfully.');
            fetch();
        } catch (err) { setModalErr(err.response?.data?.error || 'Failed.'); }
        finally { setSaving(false); }
    };

    const handleEdit = async () => {
        setModalErr('');
        setSaving(true);
        try {
            await api.patch(`${endpoint}/${editing.id}`, Object.fromEntries(Object.entries(editing).map(([k, v]) => [k, isNaN(v) ? v : Number(v)])));
            setEditing(null);
            flash(setSuccess, 'Updated successfully.');
            fetch();
        } catch (err) { setModalErr(err.response?.data?.error || 'Failed.'); }
        finally { setSaving(false); }
    };

    return { data, loading, success, error, showAdd, form, setForm, editing, setEditing, saving, modalErr, openAdd, openEdit, handleAdd, handleEdit };
};

const CONFIGS = [
    {
        title:    'Halls',
        endpoint: '/halls',
        empty:    { name: '', capacity: '', morningprice: '', eveningprice: '' },
        cols:     [
            { key: 'id',           label: 'ID',            color: '#888', format: v => `#${v}` },
            { key: 'name',         label: 'Name' },
            { key: 'capacity',     label: 'Capacity',       color: '#ccc' },
            { key: 'morningprice', label: 'Morning Price',  color: '#28a745', format: formatRs },
            { key: 'eveningprice', label: 'Evening Price',  color: '#28a745', format: formatRs },
        ],
        fields: [
            { key: 'name',         label: 'Hall Name' },
            { key: 'capacity',     label: 'Capacity (guests)', type: 'number' },
            { key: 'morningprice', label: 'Morning Price (Rs.)', type: 'number' },
            { key: 'eveningprice', label: 'Evening Price (Rs.)', type: 'number' },
        ],
    },
    {
        title:    'Services',
        endpoint: '/menu/services',
        empty:    { name: '', price: '' },
        cols:     [
            { key: 'id',    label: 'ID',    color: '#888', format: v => `#${v}` },
            { key: 'name',  label: 'Name' },
            { key: 'price', label: 'Price', color: '#28a745', format: formatRs },
        ],
        fields: [
            { key: 'name',  label: 'Service Name' },
            { key: 'price', label: 'Price (Rs.)', type: 'number' },
        ],
    },
    {
        title:    'Food Items',
        endpoint: '/menu/food',
        empty:    { name: '', unit_price: '' },
        cols:     [
            { key: 'id',         label: 'ID',         color: '#888', format: v => `#${v}` },
            { key: 'name',       label: 'Name' },
            { key: 'unit_price', label: 'Unit Price',  color: '#28a745', format: formatRs },
        ],
        fields: [
            { key: 'name',       label: 'Item Name' },
            { key: 'unit_price', label: 'Unit Price (Rs.)', type: 'number' },
        ],
    },
];

const CrudSection = ({ config }) => {
    const crud = useCrud(config.endpoint, config.empty);
    return (
        <>
            <CrudTable title={config.title} cols={config.cols} data={crud.data} loading={crud.loading}
                success={crud.success} error={crud.error} onAdd={crud.openAdd} onEdit={crud.openEdit} />

            {crud.showAdd && (
                <Modal title={`Add ${config.title.slice(0, -1)}`} fields={config.fields}
                    values={crud.form} onChange={(k, v) => crud.setForm(f => ({ ...f, [k]: v }))}
                    onSave={crud.handleAdd} onClose={() => crud.setEditing(null) || crud.setForm(config.empty)}
                    saving={crud.saving} error={crud.modalErr} saveLabel="Add" saveColor="#28a745" />
            )}
            {crud.editing && (
                <Modal title={`Edit ${config.title.slice(0, -1)}`} fields={config.fields}
                    values={crud.editing} onChange={(k, v) => crud.setEditing(e => ({ ...e, [k]: v }))}
                    onSave={crud.handleEdit} onClose={() => crud.setEditing(null)}
                    saving={crud.saving} error={crud.modalErr} saveLabel="Save Changes" saveColor="#007BFF" />
            )}
        </>
    );
};

const BookingsSection = () => {
    const [bookings, setBookings] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');
    const [delTarget,setDelTarget]= useState(null);
    const [delBusy,  setDelBusy]  = useState(false);
    const [delErr,   setDelErr]   = useState('');

    const fetch = () => {
        setLoading(true);
        api.get('/bookings/all')
            .then(res => { const d = res.data; setBookings(Array.isArray(d) ? d : d?.bookings || []); })
            .catch(() => setError('Failed to load bookings.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleDelete = async () => {
        setDelErr(''); setDelBusy(true);
        try {
            await api.delete(`/bookings/${delTarget.booking_id}`);
            flash(setSuccess, `Booking #${delTarget.booking_id} deleted.`);
            setDelTarget(null); fetch();
        } catch (err) { setDelErr(err.response?.data?.error || 'Delete failed.'); }
        finally { setDelBusy(false); }
    };

    return (
        <div>
            <h3 style={{ marginTop: 0 }}>All Bookings</h3>
            <Msg msg={error} /><Msg msg={success} ok />
            {loading ? <p style={{ color: '#aaa' }}>Loading...</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2a2a2a', textAlign: 'left' }}>
                                {['ID', 'Hall', 'Customer', 'Contact', 'Date', 'Slot', 'Amount', 'Status', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0
                                ? <tr><td colSpan={9} style={{ padding: '20px 12px', color: '#888', textAlign: 'center' }}>No bookings found.</td></tr>
                                : bookings.map((b, i) => (
                                    <tr key={b.booking_id || i} style={S.row}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1a2a'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={S.cell('#888')}>#{b.booking_id}</td>
                                        <td style={S.cell()}>{b.hall_name}</td>
                                        <td style={S.cell('#ccc')}>{b.customer_name || '—'}</td>
                                        <td style={S.cell('#888')}>{b.contact || '—'}</td>
                                        <td style={{ ...S.cell('#ccc'), whiteSpace: 'nowrap' }}>{formatDate(b.event_date)}</td>
                                        <td style={{ ...S.cell('#ccc'), textTransform: 'capitalize' }}>{b.slot}</td>
                                        <td style={S.cell('#28a745')}>{b.total_amount ? formatRs(b.total_amount) : '—'}</td>
                                        <td style={S.cell()}><span style={statusStyle(b.status)}>{b.status}</span></td>
                                        <td style={S.cell()}>
                                            <button style={S.smallBtn('#dc3545', false)} onClick={() => { setDelErr(''); setDelTarget(b); }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {delTarget && (
                <div style={S.overlay} onClick={() => setDelTarget(null)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Delete Booking</h3>
                        <div style={{ backgroundColor: '#2a1a1a', border: '1px solid #553333', borderRadius: '6px', padding: '12px 14px', fontSize: '0.88em', color: '#ffaaaa', marginBottom: '16px' }}>
                            ⚠️ This permanently removes the booking. This action cannot be undone.
                        </div>
                        {[['Booking ID', `#${delTarget.booking_id}`], ['Hall', delTarget.hall_name], ['Customer', delTarget.customer_name || '—'], ['Date', formatDate(delTarget.event_date)], ['Status', delTarget.status?.toUpperCase()]].map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #2a2a2a', fontSize: '0.9em' }}>
                                <span style={{ color: '#aaa' }}>{l}</span><span>{v}</span>
                            </div>
                        ))}
                        {delErr && <div style={{ color: '#ff6b6b', fontSize: '0.85em', margin: '12px 0' }}>{delErr}</div>}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button style={S.gray} onClick={() => setDelTarget(null)}>Cancel</button>
                            <button style={S.btn('#dc3545', delBusy)} onClick={handleDelete} disabled={delBusy}>
                                {delBusy ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const navigate   = useNavigate();
    const [section, setSection] = useState('bookings');

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1300px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Admin Portal</h2>
                <button style={S.btn('#dc3545', false)} onClick={() => { logout(); navigate('/login'); }}>Log Out</button>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                {[{ id: 'bookings', label: '📋  All Bookings' }, { id: 'rules', label: '⚙️  Business Rules' }].map(item => (
                    <button key={item.id} onClick={() => setSection(item.id)}
                        style={{ padding: '8px 18px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.9em', fontWeight: '500', backgroundColor: section === item.id ? '#007BFF' : '#222', color: section === item.id ? 'white' : '#aaa' }}>
                        {item.label}
                    </button>
                ))}
            </div>
            <div style={{ color: 'white' }}>
                {section === 'bookings' && <BookingsSection />}
                {section === 'rules'    && CONFIGS.map(c => <CrudSection key={c.title} config={c} />)}
            </div>
        </div>
    );
};

export default AdminDashboard;