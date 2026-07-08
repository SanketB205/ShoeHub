import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        addToast(`Welcome back, ${data.name}!`, 'success');
        navigate('/');
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image-side">
          <div className="login-quote glass-dark">
            <h3>"Elegance is the only beauty that never fades."</h3>
            <p>- Step into Luxury</p>
          </div>
        </div>

        <div className="login-form-side">
          <div className="form-wrapper">
            <Link to="/" className="back-link">
              &larr; Back to Home
            </Link>
            
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your exclusive collection.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="forgot-password">
                  <a href="#forgot">Forgot password?</a>
                </div>
              </div>

              <button type="submit" className="btn btn-gold login-btn">
                Sign In <ArrowRight size={18} className="ml-2" />
              </button>
            </form>

            <div className="form-footer">
              <p>Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
