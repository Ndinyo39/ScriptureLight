import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PWAInstallBanner.css';

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Check if user has already dismissed it this session
            const isDismissed = sessionStorage.getItem('pwa-banner-dismissed');
            if (!isDismissed) {
                setShowBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowBanner(false);
            console.log('PWA was installed');
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        sessionStorage.setItem('pwa-banner-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="pwa-banner"
                >
                    <div className="container pwa-banner-container">
                        <div className="pwa-content">
                            <div className="pwa-icon-box">
                                <Smartphone size={20} />
                            </div>
                            <div className="pwa-text">
                                <strong>Install ScriptureLight App</strong>
                                <span>Get a faster, better experience by installing the app on your home screen.</span>
                            </div>
                        </div>
                        <div className="pwa-actions">
                            <button onClick={handleInstall} className="btn-install">
                                <Download size={18} /> Install Now
                            </button>
                            <button onClick={handleDismiss} className="btn-close-banner">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAInstallBanner;
