const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

module.exports = async (req, res) => {
    const corsMiddleware = cors({
        origin: 'https://muhammadtahanasir.github.io',
        optionsSuccessStatus: 200,
        credentials: true
    });
    corsMiddleware(req, res, async () => {
        console.log('Request method:', req.method);
        if (req.method !== 'POST') {
            console.log('Method not allowed:', req.method);
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        const upload = multer();
        upload.none()(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err.message);
                return res.status(400).json({ message: `Form parsing error: ${err.message}` });
            }

            console.log('Raw request body:', req.body);
            const { name, email, message } = req.body;

            if (!name || !email || !message) {
                console.error('Validation failed: Missing fields', { name, email, message });
                return res.status(400).json({ message: 'All fields are required!' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error('Validation failed: Invalid email format', { email });
                return res.status(400).json({ message: 'Invalid email format!' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            console.log('Email transport configured for:', process.env.EMAIL_USER);

            const mailOptions = {
                from: `"${name}" <${email}>`,
                to: process.env.EMAIL_USER,
                subject: 'New Portfolio Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent successfully to:', process.env.EMAIL_USER);
                res.status(200).json({ message: 'Message sent successfully!' });
            } catch (error) {
                console.error('Nodemailer error:', error.message);
                res.status(500).json({ message: `Error sending email: ${error.message}` });
            }
        });
    });
};