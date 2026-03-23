import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, Menu, X, LayoutDashboard, LogOut,
  Users, Home, BookMarked, Heart, HeadphonesIcon,
  ShieldCheck, Settings, ChevronRight, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const userRole = (user?.role || '').toString().toLowerCase().trim();
  const isAdmin = isLoggedIn && userRole === 'admin';

  const navLinks = [
    { name: 'Home',        path: '/',           icon: Home },
    { name: 'Study Plans', path: '/study-plans', icon: BookMarked },
    { name: 'Read Bible',  path: '/bible',       icon: BookOpen },
    { name: 'Community',   path: '/community',   icon: Users },
    { name: 'Testimonies', path: '/testimonies', icon: Heart },
    ...(isLoggedIn ? [{ name: 'Support', path: '/support', icon: HeadphonesIcon }] : []),
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldCheck }] : []),
  ];

  const avatarInitial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} ref={menuRef}>
      <div className="container navbar-container">

        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={() => setIsOpen(false)}>
          <img src="/Logo.png" alt="ScriptureLight Logo" style={{ height: '44px', width: 'auto' }} />
          <h1>ScriptureLight</h1>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
              >
                <Icon size={15} strokeWidth={2} />
                {link.name}
              </Link>
            );
          })}

          <div className="auth-btns">
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/profile" className="nav-user-profile">
                  <div className="user-avatar-sm">
                    {user?.profilePicture
                      ? <img src={getImageUrl(user.profilePicture)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : avatarInitial}
                  </div>
                  <span className="user-name">{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex' }}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* User profile card inside menu */}
            {isLoggedIn && (
              <Link
                to="/profile"
                className="mobile-user-card"
                onClick={() => setIsOpen(false)}
              >
                <div className="mobile-user-avatar">
                  {user?.profilePicture
                    ? <img src={getImageUrl(user.profilePicture)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : avatarInitial}
                </div>
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{user?.name}</span>
                  <span className="mobile-user-email">{user?.email}</span>
                </div>
                <ChevronRight size={18} className="mobile-user-chevron" />
              </Link>
            )}

            {/* Nav links */}
            <div className="mobile-nav-links">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      to={link.path}
                      className={`mobile-nav-link${isActive ? ' active' : ''}${link.name === 'Admin Panel' ? ' admin-link' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mobile-nav-icon">
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </span>
                      <span className="mobile-nav-label">{link.name}</span>
                      {isActive && <span className="mobile-nav-active-dot" />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="mobile-menu-footer">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="mobile-action-btn primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button className="mobile-action-btn outline" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-action-btn outline" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="mobile-action-btn primary" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
