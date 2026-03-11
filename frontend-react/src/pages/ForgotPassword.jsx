import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-icon">
            <KeyRound size={40} />
          </div>
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="forgot-success"
          >
            <CheckCircle size={48} className="forgot-success-icon" />
            <h3>Check Your Email</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              The link expires in <strong>1 hour</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
              Don't see it? Check your spam folder.
            </p>
            <Link to="/login" className="btn-submit" style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'flex' }}>
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </motion.div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-footer">
              <p><Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Back to Login</Link></p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
