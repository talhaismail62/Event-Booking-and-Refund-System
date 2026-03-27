import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import api from '../services/api';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    
    const [myBookings, setMyBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const hallsRes = await api.get('/halls');
                const hallsData = hallsRes.data;
                let hallsArray = [];
                
                if (Array.isArray(hallsData)) hallsArray = hallsData;
                else if (hallsData && Array.isArray(hallsData.data)) hallsArray = hallsData.data;
                else if (hallsData && Array.isArray(hallsData.halls)) hallsArray = hallsData.halls;
                
                setHalls(hallsArray);
                setLoadingHalls(false);

                const bookingsRes = await api.get('/bookings/my-bookings');
                console.log("Raw Bookings from Backend:", bookingsRes.data); 

                const bData = bookingsRes.data;
                let bookingsArray = [];

                if (Array.isArray(bData)) {
                    bookingsArray = bData;
                } else if (bData && Array.isArray(bData.data)) {
                    bookingsArray = bData.data;
                } else if (bData && Array.isArray(bData.bookings)) {
                    bookingsArray = bData.bookings; 
                } else {
                    console.warn("Could not find an array of bookings inside:", bData);
                }

                setMyBookings(bookingsArray);
                setLoadingBookings(false);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError('Failed to load dashboard data. Please ensure the backend is running.');
                setLoadingHalls(false);
                setLoadingBookings(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleBookHall = (hall) => {
        navigate('/book-hall', { state: { selectedHall: hall } });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Welcome to your Dashboard, {user?.name}!</h2>
            
            {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6' }}>{error}</div>}

            <p>Ready to plan your next event? Browse our available halls below.</p>
            <h3>Available Halls</h3>

            {loadingHalls ? <p>Loading halls...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {halls.length === 0 ? (
                        <p>No halls available at the moment.</p>
                    ) : (
                        halls.map((hall) => (
                            <div key={hall.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#333', color: 'white' }}>
                                <div>
                                    <h4 style={{ marginTop: 0 }}>{hall.name}</h4>
                                    <p><strong>Capacity:</strong> {hall.capacity} guests</p>
                                    <p><strong>Morning Price:</strong> Rs. {hall.morningprice}</p>
                                    <p><strong>Evening Price:</strong> Rs. {hall.eveningprice}</p>
                                </div>
                                <button 
                                    onClick={() => handleBookHall(hall)} 
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}
                                >
                                    Book This Hall
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            <hr style={{ margin: '40px 0', borderColor: '#444' }} />

            <h3>My Current Bookings</h3>
            
            {loadingBookings ? <p>Loading your bookings...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {myBookings.length === 0 ? (
                        <p style={{ color: '#888' }}>You haven't made any bookings yet.</p>
                    ) : (
                        myBookings.map((booking) => {
                            return (
                                <div key={booking.booking_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #555', borderRadius: '8px', padding: '15px', backgroundColor: '#222', color: 'white' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#007BFF', textTransform: 'capitalize' }}>
                                            {booking.hall_name}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.9em' }}>
                                            <strong>Date:</strong> {formatDate(booking.event_date)} | <strong>Slot:</strong> <span style={{ textTransform: 'capitalize' }}>{booking.slot}</span>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                                            Rs. {booking.total_amount ? booking.total_amount : 'TBD'}
                                        </p>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8em',
                                            backgroundColor: booking.status === 'pending' ? '#ffc107' : booking.status === 'approved' ? '#28a745' : '#dc3545',
                                            color: booking.status === 'pending' ? 'black' : 'white'
                                        }}>
                                            {booking.status ? booking.status.toUpperCase() : 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;