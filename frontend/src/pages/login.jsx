import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);

        if (result.success) {
            if (result.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (result.role === 'staff') {
                navigate('/staff-dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Event Booking Login</h2>
            
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;