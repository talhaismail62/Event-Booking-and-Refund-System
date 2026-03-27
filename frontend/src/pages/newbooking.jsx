import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import api from '../services/api';

const NewBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const selectedHall = location.state?.selectedHall;

    const [bookingDate, setBookingDate] = useState('');
    const [shift, setShift] = useState('morning');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!selectedHall) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2>No Hall Selected</h2>
                <p>Please select a hall from the dashboard first.</p>
                <button 
                    onClick={() => navigate('/customer-dashboard')}
                    style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const price = shift === 'morning' ? selectedHall.morningprice : selectedHall.eveningprice;

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                hall_id: selectedHall.id,
                user_id: user.id,
                event_date: bookingDate,
                slot: shift,
                total_amount: price,
                rule_id: 1
            };

            await api.post('/bookings', payload);
            
            setSuccess('Booking created successfully! Redirecting...');
            
            setTimeout(() => {
                navigate('/customer-dashboard');
            }, 2000);

        } catch (err) {
            console.error("Booking error:", err);
            setError(err.response?.data?.error || 'An error occurred while creating the booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Book {selectedHall.name}</h2>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <p style={{ margin: '0 0 10px 0', color: 'black' }}><strong>Capacity:</strong> {selectedHall.capacity} guests</p>
                <p style={{ margin: 0, color: '#28a745', fontSize: '1.2em' }}>
                    <strong>Total Price: Rs. {price}</strong>
                </p>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>{success}</div>}

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date of Event</label>
                    <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#333', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Shift</label>
                    <select 
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#333', color: 'white' }}
                    >
                        <option value="morning">Morning (Rs. {selectedHall.morningprice})</option>
                        <option value="evening">Evening (Rs. {selectedHall.eveningprice})</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/customer-dashboard')}
                        style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            flex: 2,
                            padding: '12px', 
                            backgroundColor: loading ? '#ccc' : '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewBooking;