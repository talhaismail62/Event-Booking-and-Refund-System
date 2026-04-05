import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import api from '../services/api';

const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString(); };
const formatRs   = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const getStatusStyle = (status) => ({
    padding: '3px 8px', borderRadius: '12px', fontSize: '0.78em', fontWeight: 'bold',
    backgroundColor: status === 'pending' ? '#ffc107' : status === 'confirmed' ? '#28a745' : '#dc3545',
    color: status === 'pending' ? 'black' : 'white', textTransform: 'uppercase',
});

const inputStyle = {
    padding: '8px 10px', borderRadius: '4px', border: '1px solid #444',
    backgroundColor: '#111', color: 'white', fontSize: '0.9em', outline: 'none',
};

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bookings,  setBookings]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');
    const [filter,    setFilter]    = useState('all');
    const [search,    setSearch]    = useState('');

    useEffect(() => {
        api.get('/bookings/all')
            .then(res => {
                const d = res.data;
                setBookings(Array.isArray(d) ? d : d?.bookings || []);
            })
            .catch(() => setError('Failed to load bookings. Ensure the backend is running.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = bookings.filter(b => {
        const matchStatus = filter === 'all' || b.status === filter;
        const matchSearch = !search ||
            (b.hall_name     || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
            String(b.booking_id || '').includes(search);
        return matchStatus && matchSearch;
    });

    const counts = {
        all:       bookings.length,
        pending:   bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0' }}>Staff Portal</h2>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9em' }}>
                        Logged in as <strong style={{ color: '#ccc' }}>{user?.name}</strong>
                    </p>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log Out
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Bookings', value: counts.all,       color: '#007BFF' },
                    { label: 'Confirmed',       value: counts.confirmed, color: '#28a745' },
                    { label: 'Pending',         value: counts.pending,   color: '#ffc107' },
                    { label: 'Cancelled',       value: counts.cancelled, color: '#dc3545' },
                ].map(s => (
                    <div key={s.label} style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', padding: '16px' }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8em', color: '#aaa' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            <h3 style={{ margin: '0 0 14px 0' }}>All Bookings</h3>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    style={{ ...inputStyle, width: '240px' }}
                    placeholder="Search by ID, hall or customer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{
                            padding: '7px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            fontSize: '0.85em', fontWeight: '500', textTransform: 'capitalize',
                            backgroundColor: filter === f ? '#007BFF' : '#333',
                            color: filter === f ? 'white' : '#aaa',
                        }}>
                        {f} {f !== 'all' && `(${counts[f]})`}
                    </button>
                ))}
                <span style={{ color: '#666', fontSize: '0.85em', marginLeft: 'auto' }}>
                    Showing {filtered.length} of {bookings.length}
                </span>
            </div>

            {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px', marginBottom: '14px' }}>{error}</div>}

            {loading ? (
                <p style={{ color: '#aaa' }}>Loading bookings...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2a2a2a', textAlign: 'left' }}>
                                {['Booking ID', 'Hall', 'Customer', 'Contact', 'Event Date', 'Slot', 'Amount', 'Status', 'Booked Until'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', color: '#aaa', fontWeight: '600', borderBottom: '1px solid #444', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '20px 12px', color: '#888', textAlign: 'center' }}>
                                        No bookings match your search.
                                    </td>
                                </tr>
                            ) : filtered.map((b, i) => (
                                <tr key={b.booking_id || i}
                                    style={{ borderBottom: '1px solid #2a2a2a', color: 'white' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1a2a'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '10px 12px', color: '#888' }}>#{b.booking_id}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{b.hall_name}</td>
                                    <td style={{ padding: '10px 12px', color: '#ccc' }}>{b.customer_name || '—'}</td>
                                    <td style={{ padding: '10px 12px', color: '#888' }}>{b.contact || '—'}</td>
                                    <td style={{ padding: '10px 12px', color: '#ccc', whiteSpace: 'nowrap' }}>{formatDate(b.event_date)}</td>
                                    <td style={{ padding: '10px 12px', color: '#ccc', textTransform: 'capitalize' }}>{b.slot}</td>
                                    <td style={{ padding: '10px 12px', color: '#28a745' }}>{b.total_amount ? formatRs(b.total_amount) : '—'}</td>
                                    <td style={{ padding: '10px 12px' }}><span style={getStatusStyle(b.status)}>{b.status}</span></td>
                                    <td style={{ padding: '10px 12px', color: '#888', whiteSpace: 'nowrap', fontSize: '0.85em' }}>
                                        {b.expires_at ? formatDate(b.expires_at) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;