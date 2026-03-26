import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

/* ── Decorative SVG graphic (same as Login) ── */
const AuthGraphic = () => (
  <div className="auth-left-graphic">
    {/* Thumbs-up hand */}
    <svg className="auth-hand-svg" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="38" width="14" height="30" rx="4" fill="rgba(255,255,255,0.85)"/>
      <path d="M22 52 Q24 38 32 34 L38 32 Q44 30 44 38 L44 50 Q44 54 40 56 L28 58 Q22 60 22 56 Z" fill="rgba(255,255,255,0.85)"/>
      <path d="M32 34 L34 22 Q34 16 40 18 Q44 20 42 28 L38 32" fill="rgba(255,255,255,0.75)"/>
    </svg>

    {/* Phone */}
    <svg className="auth-phone-svg" viewBox="0 0 90 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="80" height="146" rx="14" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.7)" strokeWidth="3"/>
      <rect x="10" y="16" width="70" height="112" rx="6" fill="rgba(255,255,255,0.12)"/>
      <circle cx="45" cy="140" r="5" fill="rgba(255,255,255,0.5)"/>
      <rect x="30" y="6" width="30" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
      <circle cx="28" cy="50" r="6" fill="rgba(255,255,255,0.3)"/>
      <circle cx="45" cy="50" r="6" fill="rgba(255,255,255,0.3)"/>
      <circle cx="62" cy="50" r="6" fill="rgba(255,255,255,0.3)"/>
      <rect x="18" y="66" width="54" height="3" rx="1.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="18" y="74" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)"/>
      <rect x="18" y="90" width="54" height="3" rx="1.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="18" y="98" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.15)"/>
    </svg>

    {/* Bell */}
    <svg className="auth-bell-svg" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6 Q30 2 34 2 Q38 2 38 6 L40 10 Q52 18 52 34 L52 46 L8 46 L8 34 Q8 18 20 10 Z" fill="#4db6ac" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
      <path d="M8 46 L52 46 L56 52 L4 52 Z" fill="#4db6ac"/>
      <ellipse cx="30" cy="54" rx="6" ry="4" fill="rgba(255,255,255,0.6)"/>
      <circle cx="49" cy="14" r="7" fill="#ef5350" stroke="white" strokeWidth="2"/>
      <text x="49" y="18" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">3</text>
    </svg>
  </div>
);

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({ users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await api.post('/auth/register', { name, username, email, password });
      setSuccess(data.message || 'Registration successful!');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-split-card"
      >
        {/* ── Left Panel ── */}
        <div className="auth-left-panel">
          <p className="auth-left-tagline">Join {(stats?.users || 0).toLocaleString()}+ believers<br />on ScriptureLight!</p>
          <AuthGraphic />
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-right-panel">
          <h2>Sign Up</h2>
          <p>Create your free account</p>

          {error && <div className="auth-error">{error}</div>}

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pending-approval-screen"
            >
              <div className="pending-icon-ring">
                <Clock size={36} />
              </div>
              <h3>Account Created!</h3>
              <h4 className="pending-subtitle">Awaiting Admin Approval</h4>
              <p className="pending-message">
                Your account has been created successfully. An admin will review and approve your account before you can log in.
              </p>
              <div className="pending-steps">
                <div className="pending-step">
                  <ShieldCheck size={16} />
                  <span>Admin reviews your account</span>
                </div>
                <div className="pending-step">
                  <ShieldCheck size={16} />
                  <span>You receive approval to access ScriptureLight</span>
                </div>
                <div className="pending-step">
                  <ShieldCheck size={16} />
                  <span>Log in and begin your faith journey</span>
                </div>
              </div>
              <Link to="/login" className="btn-submit" style={{ textDecoration: 'none', display: 'flex' }}>
                Back to Login
              </Link>
              <p className="pending-contact">
                Questions? <a href="mailto:admin@scripturelight.com">Contact Admin</a>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="register-name"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username (e.g. john_doe)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  required
                  minLength={3}
                  id="register-username"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="register-email"
                />
              </div>

              <div className="form-group">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    id="register-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="approval-notice">
                <Clock size={14} />
                <span>New accounts require admin approval before login.</span>
              </div>

              <button type="submit" className="btn-submit" disabled={loading} id="register-submit">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </button>

              <div className="auth-footer">
                <p>Already have an account? <Link to="/login">Login here</Link></p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
