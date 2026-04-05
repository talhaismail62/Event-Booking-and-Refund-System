import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import api from '../services/api';

const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString(); };
const formatRs   = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
};
const modalStyle = {
    background: '#1a1a1a', border: '1px solid #444', borderRadius: '10px',
    padding: '24px', width: '100%', maxWidth: '460px', color: 'white',
    fontFamily: 'sans-serif', maxHeight: '90vh', overflowY: 'auto',
};
const modalRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' };
const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: '4px',
    border: '1px solid #444', backgroundColor: '#111', color: 'white',
    fontSize: '0.9em', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.82em', color: '#aaa' };
const btnGray    = { padding: '8px 18px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnGreen   = (dis) => ({ padding: '8px 18px', backgroundColor: dis ? '#555' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.7 : 1 });
const btnRed     = (dis) => ({ padding: '8px 18px', backgroundColor: dis ? '#555' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.7 : 1 });

const getStatusStyle = (status) => ({
    padding: '3px 8px', borderRadius: '12px', fontSize: '0.78em', fontWeight: 'bold',
    backgroundColor: status === 'pending' ? '#ffc107' : status === 'confirmed' ? '#28a745' : '#dc3545',
    color: status === 'pending' ? 'black' : 'white', textTransform: 'uppercase',
});

const NewBookingPanel = ({ onBooked }) => {
    const { user } = useContext(AuthContext);
    const [halls,    setHalls]    = useState([]);
    const [hallId,   setHallId]   = useState('');
    const [date,     setDate]     = useState('');
    const [slot,     setSlot]     = useState('morning');
    const [numPpl,   setNumPpl]   = useState('');
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');

    useEffect(() => {
        api.get('/halls').then(res => {
            const d = res.data;
            setHalls(Array.isArray(d) ? d : d?.halls || []);
        }).catch(() => setError('Could not load halls.'));
    }, []);

    const selectedHall = halls.find(h => String(h.id) === String(hallId));
    const price = selectedHall ? (slot === 'morning' ? selectedHall.morningprice : selectedHall.eveningprice) : null;

    const handleSubmit = async () => {
        setError('');
        if (!hallId || !date || !numPpl) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            await api.post('/bookings', {
                hall_id: Number(hallId),
                event_date: date,
                slot,
                num_of_ppl: Number(numPpl),
                rule_id: 1,
            });
            setHallId(''); setDate(''); setSlot('morning'); setNumPpl('');
            onBooked('Booking created! You have 24 hours to complete payment.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create booking.');
        } finally { setLoading(false); }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>New Booking</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Hall *</label>
                    <select style={inputStyle} value={hallId} onChange={e => setHallId(e.target.value)}>
                        <option value="">— Select a Hall —</option>
                        {halls.map(h => (
                            <option key={h.id} value={h.id}>
                                {h.name} (capacity: {h.capacity})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Event Date *</label>
                    <input type="date" style={inputStyle} min={today} value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div>
                    <label style={labelStyle}>Slot *</label>
                    <select style={inputStyle} value={slot} onChange={e => setSlot(e.target.value)}>
                        <option value="morning">Morning{selectedHall ? ` — ${formatRs(selectedHall.morningprice)}` : ''}</option>
                        <option value="evening">Evening{selectedHall ? ` — ${formatRs(selectedHall.eveningprice)}` : ''}</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Number of Guests *</label>
                    <input type="number" min="1" style={inputStyle} placeholder="e.g. 200"
                        value={numPpl} onChange={e => setNumPpl(e.target.value)} />
                </div>

                {price !== null && (
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #555', borderRadius: '6px', padding: '10px 14px', width: '100%' }}>
                            <span style={{ fontSize: '0.8em', color: '#aaa' }}>Estimated Price</span>
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>{formatRs(price)}</div>
                        </div>
                    </div>
                )}
            </div>

            {error && <div style={{ color: '#ff6b6b', backgroundColor: '#2a1a1a', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85em', marginTop: '12px' }}>{error}</div>}

            <button
                onClick={handleSubmit} disabled={loading}
                style={{ ...btnGreen(loading), marginTop: '16px', padding: '10px 24px' }}
            >
                {loading ? 'Creating...' : 'Confirm Booking'}
            </button>
        </div>
    );
};

const MyBookingsPanel = ({ refreshKey, onAction }) => {
    const [bookings, setBookings] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');

    const [payModal,   setPayModal]   = useState(null);
    const [payMethod,  setPayMethod]  = useState('card');
    const [payLoading, setPayLoading] = useState(false);
    const [payError,   setPayError]   = useState('');

    const [cancelModal,   setCancelModal]   = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError,   setCancelError]   = useState('');

    const [invoiceModal,   setInvoiceModal]   = useState(null);
    const [invoice,        setInvoice]        = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError,   setInvoiceError]   = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/my-bookings');
            const d = res.data;
            setBookings(Array.isArray(d) ? d : d?.bookings || []);
        } catch { setError('Failed to load your bookings.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [refreshKey]);

    const getDaysUntil   = (dt) => Math.ceil((new Date(dt) - new Date()) / 86400000);
    const getRefundPct   = (days) => days >= 7 ? 100 : days >= 3 ? 50 : 0;

    const openPay = (b) => { setPayError(''); setPayMethod('card'); setPayModal(b); };
    const handlePay = async () => {
        setPayError(''); setPayLoading(true);
        try {
            await api.post(`/bookings/${payModal.booking_id}/pay`, {
                amount: payModal.total_amount, payment_type: 'advance', payment_method: payMethod,
            });
            setPayModal(null);
            onAction('Payment successful! Booking is now confirmed.');
            fetch();
        } catch (err) { setPayError(err.response?.data?.error || 'Payment failed.'); }
        finally { setPayLoading(false); }
    };

    const openCancel = (b) => { setCancelError(''); setCancelModal(b); };
    const handleCancel = async () => {
        setCancelError(''); setCancelLoading(true);
        try {
            const res = await api.post(`/bookings/${cancelModal.booking_id}/cancel`);
            const { refund_amount } = res.data;
            setCancelModal(null);
            onAction(refund_amount > 0
                ? `Booking cancelled. Refund of ${formatRs(refund_amount)} is pending.`
                : 'Booking cancelled. No refund applicable.');
            fetch();
        } catch (err) { setCancelError(err.response?.data?.error || 'Cancellation failed.'); }
        finally { setCancelLoading(false); }
    };

    const openInvoice = async (b) => {
        setInvoice(null); setInvoiceError(''); setInvoiceLoading(true); setInvoiceModal(b);
        try {
            try {
                const res = await api.get(`/invoices/${b.booking_id}`);
                setInvoice(res.data.invoice);
            } catch {
                const res = await api.post(`/invoices/${b.booking_id}/generate`);
                setInvoice(res.data.invoice);
            }
        } catch (err) { setInvoiceError(err.response?.data?.error || 'Could not load invoice.'); }
        finally { setInvoiceLoading(false); }
    };

    if (loading) return <p style={{ color: '#aaa' }}>Loading your bookings...</p>;
    if (error)   return <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>;

    return (
        <>
            <h3>My Bookings</h3>
            {bookings.length === 0 ? (
                <p style={{ color: '#888' }}>You have no bookings yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings.map(b => (
                        <div key={b.booking_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #555', borderRadius: '8px', padding: '14px 16px', backgroundColor: '#222', color: 'white', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#007BFF', textTransform: 'capitalize' }}>{b.hall_name}</h4>
                                <p style={{ margin: 0, fontSize: '0.88em', color: '#aaa' }}>
                                    {formatDate(b.event_date)} &nbsp;·&nbsp; <span style={{ textTransform: 'capitalize' }}>{b.slot}</span>
                                    {b.expires_at && b.status === 'pending' && (
                                        <span style={{ color: '#ffc107', marginLeft: '10px' }}>
                                            ⏱ Pay by {formatDate(b.expires_at)}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{b.total_amount ? formatRs(b.total_amount) : '—'}</p>
                                <span style={getStatusStyle(b.status)}>{b.status || 'pending'}</span>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                                    {b.status === 'pending' && (
                                        <button onClick={() => openPay(b)}
                                            style={{ padding: '4px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82em' }}>
                                            Pay Now
                                        </button>
                                    )}
                                    {b.status === 'confirmed' && (
                                        <button onClick={() => openInvoice(b)}
                                            style={{ padding: '4px 12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82em' }}>
                                            Invoice
                                        </button>
                                    )}
                                    {b.status !== 'cancelled' && (
                                        <button onClick={() => openCancel(b)}
                                            style={{ padding: '4px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82em' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {payModal && (
                <div style={overlayStyle} onClick={() => setPayModal(null)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Pay for Booking</h3>
                        <div style={{ fontSize: '0.9em', marginBottom: '16px' }}>
                            <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Hall</span><span>{payModal.hall_name}</span></div>
                            <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Date</span><span>{formatDate(payModal.event_date)}</span></div>
                            <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Slot</span><span style={{ textTransform: 'capitalize' }}>{payModal.slot}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: '#aaa' }}>Amount Due</span>
                                <span style={{ fontWeight: 'bold', color: '#28a745' }}>{formatRs(payModal.total_amount)}</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Payment Method</label>
                            <select style={inputStyle} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                                <option value="card">Credit / Debit Card</option>
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>
                        {payError && <div style={{ color: '#ff6b6b', fontSize: '0.85em', marginBottom: '12px' }}>{payError}</div>}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button style={btnGray} onClick={() => setPayModal(null)}>Cancel</button>
                            <button style={btnGreen(payLoading)} onClick={handlePay} disabled={payLoading}>
                                {payLoading ? 'Processing...' : `Pay ${formatRs(payModal.total_amount)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cancelModal && (() => {
                const days      = getDaysUntil(cancelModal.event_date);
                const pct       = getRefundPct(days);
                const refundAmt = (Number(cancelModal.total_amount || 0) * pct) / 100;
                return (
                    <div style={overlayStyle} onClick={() => setCancelModal(null)}>
                        <div style={modalStyle} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginTop: 0 }}>Cancel Booking</h3>
                            <p style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '14px' }}>{cancelModal.hall_name} — {formatDate(cancelModal.event_date)}</p>
                            <div style={{ backgroundColor: '#2a1a1a', border: '1px solid #553333', borderRadius: '6px', padding: '10px 14px', fontSize: '0.85em', color: '#ffaaaa', marginBottom: '14px', lineHeight: '1.5' }}>
                                This action cannot be undone. Refund eligibility depends on how far the event is.
                            </div>
                            <div style={{ fontSize: '0.9em', marginBottom: '14px' }}>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Days Before Event</span><span>{days > 0 ? `${days} days` : 'Past / Today'}</span></div>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Refund Eligible</span><span style={{ color: pct > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{pct}%</span></div>
                                {cancelModal.status === 'confirmed' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                        <span style={{ color: '#aaa' }}>Estimated Refund</span>
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatRs(refundAmt)}</span>
                                    </div>
                                )}
                            </div>
                            {cancelError && <div style={{ color: '#ff6b6b', fontSize: '0.85em', marginBottom: '12px' }}>{cancelError}</div>}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button style={btnGray} onClick={() => setCancelModal(null)}>Keep Booking</button>
                                <button style={btnRed(cancelLoading)} onClick={handleCancel} disabled={cancelLoading}>
                                    {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {invoiceModal && (
                <div style={overlayStyle} onClick={() => setInvoiceModal(null)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Invoice</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '14px' }}>{invoiceModal.hall_name} — {formatDate(invoiceModal.event_date)}</p>
                        {invoiceLoading && <p style={{ color: '#aaa' }}>Loading invoice...</p>}
                        {invoiceError   && <div style={{ color: '#ff6b6b', fontSize: '0.85em', marginBottom: '12px' }}>{invoiceError}</div>}
                        {invoice && (
                            <div style={{ fontSize: '0.9em', marginBottom: '14px' }}>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Subtotal</span><span>{formatRs(invoice.subtotal)}</span></div>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Tax (10%)</span><span>{formatRs(invoice.tax_amount)}</span></div>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Total</span><span style={{ fontWeight: 'bold' }}>{formatRs(invoice.total_amount)}</span></div>
                                <div style={modalRowStyle}><span style={{ color: '#aaa' }}>Paid</span><span style={{ color: '#28a745' }}>{formatRs(invoice.paid_amount)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span style={{ color: '#aaa' }}>Balance Due</span>
                                    <span style={{ color: Number(invoice.balance_due) > 0 ? '#ffc107' : '#28a745', fontWeight: 'bold' }}>
                                        {Number(invoice.balance_due) > 0 ? formatRs(invoice.balance_due) : 'Fully Paid ✓'}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={btnGray} onClick={() => setInvoiceModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const CustomerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [successMsg,  setSuccessMsg]  = useState('');
    const [bookingKey,  setBookingKey]  = useState(0);

    const handleAction = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 5000);
        setBookingKey(k => k + 1);
    };

    const handleBooked = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 5000);
        setBookingKey(k => k + 1);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0 }}>Welcome, {user?.name}!</h2>
                <button onClick={() => { logout(); navigate('/login'); }}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log Out
                </button>
            </div>

            {successMsg && (
                <div style={{ color: 'green', marginBottom: '16px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
                    ✓ {successMsg}
                </div>
            )}

            <NewBookingPanel onBooked={handleBooked} />

            <hr style={{ margin: '10px 0 24px 0', borderColor: '#444' }} />

            <MyBookingsPanel refreshKey={bookingKey} onAction={handleAction} />
        </div>
    );
};

export default CustomerDashboard;