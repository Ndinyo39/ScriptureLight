const express = require('express');
const router = express.Router();
const { Transaction } = require('../models');
const auth = require('../middleware/auth');

const genToken = async () => {
    try {
        const key = process.env.MPESA_CONSUMER_KEY;
        const secret = process.env.MPESA_CONSUMER_SECRET;
        const authString = Buffer.from(`${key}:${secret}`).toString('base64');

        const res = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { 'Authorization': `Basic ${authString}` }
        });
        if (!res.ok) {
            const errBody = await res.text().catch(() => 'No error body');
            throw new Error(`Failed to get M-Pesa token: ${res.status} | ${errBody}`);
        }
        const data = await res.json();
        return data.access_token;
    } catch (err) {
        if (err.name === 'TypeError' && err.message === 'fetch failed') {
            throw new Error(`M-Pesa Token Fetch Failed (Check Connectivity/DNS): ${err.cause?.message || err.message}`);
        }
        throw err;
    }
};

// Initiate STK Push (auth required — prevents anonymous triggering of payments)
router.post('/stkpush', auth, async (req, res) => {
    try {
        let { phone, amount } = req.body;
        const userId = req.user.id; // Always use the authenticated user's id
        
        // Basic formatting for Safaricom phone numbers e.g 2547XXXXXXXX
        if (phone.startsWith('0')) {
            phone = '254' + phone.slice(1);
        } else if (phone.startsWith('+')) {
            phone = phone.slice(1);
        }

        const passkey = process.env.MPESA_PASSKEY;
        const shortcode = process.env.MPESA_SHORTCODE;
        
        // If missing env vars, simulate success for demo
        if (!passkey || !shortcode || !process.env.MPESA_CONSUMER_KEY) {
            console.warn("M-Pesa credentials missing. Simulating STK push success.");
            // Create pending transaction
            const tx = await Transaction.create({
                userId: userId || null,
                amount,
                phone,
                provider: 'mpesa',
                status: 'pending',
                merchantRequestId: 'MOCK_MERCHANT_' + Date.now(),
                checkoutRequestId: 'MOCK_CHECKOUT_' + Date.now()
            });

            return res.json({ message: 'Mock STK push initiated successfully.', simulated: true, transactionId: tx.id });
        }

        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHmmss
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const token = await genToken();
        
        const webhookSecret = process.env.MPESA_WEBHOOK_SECRET || 'default_insecure_secret';
        let callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://my-domain.com/api/mpesa/callback';
        
        if (!callbackUrl.includes('?token=')) {
            callbackUrl += (callbackUrl.includes('?') ? '&' : '?') + `token=${webhookSecret}`;
        }

        const stkPayload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: parseInt(amount), // Daraja expects integers
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: callbackUrl,
            AccountReference: 'ScriptureLight',
            TransactionDesc: 'Donation to Web Bible'
        };

        console.log('Initiating STK Push for:', phone);
        let stkRes;
        try {
            stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stkPayload)
            });
        } catch (fetchErr) {
            console.error("STK Push fetch failed:", fetchErr);
            throw new Error(`M-Pesa STK Push Network Error: ${fetchErr.cause?.message || fetchErr.message}`);
        }

        const stkData = await stkRes.json();
        if (stkData.ResponseCode !== '0') {
            return res.status(400).json({ message: 'M-Pesa validation failed', details: stkData });
        }

        // Store transaction
        await Transaction.create({
            userId: userId || null,
            amount,
            phone,
            provider: 'mpesa',
            status: 'pending',
            merchantRequestId: stkData.MerchantRequestID,
            checkoutRequestId: stkData.CheckoutRequestID
        });

        res.json({ message: 'Check your phone to complete payment.', data: stkData });
    } catch (err) {
        console.error("STK Push error name:", err.name);
        console.error("STK Push error message:", err.message);
        console.error("STK Push error cause:", err.cause?.message, '| code:', err.cause?.code);
        console.error("STK Push full error:", err);
        res.status(500).json({ message: err.message, cause: err.cause?.message, code: err.cause?.code });
    }
});

router.post('/callback', async (req, res) => {
    try {
        const webhookSecret = process.env.MPESA_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('FATAL: MPESA_WEBHOOK_SECRET is not configured. Callback rejected.');
            return res.status(500).send('Server misconfiguration');
        }
        if (req.query.token !== webhookSecret) {
            console.warn('Unauthorized M-Pesa webhook attempt from IP:', req.ip);
            return res.status(401).send('Unauthorized');
        }
        const body = req.body;
        console.log("M-Pesa callback:", JSON.stringify(body, null, 2));

        if (!body.Body || !body.Body.stkCallback) return res.send('ok');

        const callback = body.Body.stkCallback;
        const checkoutRequestId = callback.CheckoutRequestID;
        const resultCode = callback.ResultCode; // 0 is success

        const tx = await Transaction.findOne({ where: { checkoutRequestId } });
        if (!tx) {
            console.log('Transaction not found for checkoutRequestId:', checkoutRequestId);
            return res.send('ok');
        }

        if (resultCode !== 0) {
            tx.status = 'failed';
            await tx.save();
            return res.send('ok');
        }

        // Successful transaction
        // Parse metadata
        const metadata = callback.CallbackMetadata.Item;
        let receiptNumber = '';
        if (metadata && Array.isArray(metadata)) {
            metadata.forEach(item => {
                if (item.Name === 'MpesaReceiptNumber') receiptNumber = item.Value;
            });
        }

        tx.status = 'completed';
        tx.reference = receiptNumber;
        await tx.save();

        res.send('ok');
    } catch (err) {
        console.error("Callback processing error:", err);
        res.send('ok'); // Send 200 OK so Safaricom doesn't keep retrying unnecessarily on code errors
    }
});

module.exports = router;
