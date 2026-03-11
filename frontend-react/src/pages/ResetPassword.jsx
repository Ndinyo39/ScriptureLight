import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Guard: invalid link
  if (!token || !email) {
    return (
      <div className="auth-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="auth-card"
          style={{ textAlign: 'center' }}
        >
          <AlertCircle size={56} style={{ color: 'var(--danger)', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ color: 'var(--dark)' }}>Invalid Link</h2>
          <p style={{ color: 'var(--gray)' }}>This password reset link is invalid or incomplete.</p>
          <Link to="/forgot-password" className="btn-submit" style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            Request a New Link
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email, password });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
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
            <ShieldCheck size={40} />
          </div>
          <h2>Set New Password</h2>
          <p>Choose a strong password for <strong style={{ color: 'var(--primary)' }}>{email}</strong></p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="forgot-success"
          >
            <CheckCircle size={48} className="forgot-success-icon" />
            <h3>Password Reset!</h3>
            <p>Your password has been changed successfully. Redirecting you to login…</p>
            <Link to="/login" className="btn-submit" style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
              Go to Login
            </Link>
          </motion.div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label><Lock size={16} /> New Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter new password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label><Lock size={16} /> Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password match indicator */}
              {confirmPassword && (
                <p style={{
                  fontSize: '0.82rem',
                  margin: '-0.8rem 0 1rem',
                  color: password === confirmPassword ? 'var(--success)' : 'var(--danger)'
                }}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
