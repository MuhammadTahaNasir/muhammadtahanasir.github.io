const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

module.exports = async (req, res) => {
    // Enable CORS for your GitHub Pages URL with options for success status
    const corsMiddleware = cors({
        origin: 'https://muhammadtahanasir.github.io',
        optionsSuccessStatus: 200
    });
    corsMiddleware(req, res, async () => {
        console.log('Request method:', req.method); // Debug: Log request method
        if (req.method !== 'POST') {
            console.log('Method not allowed:', req.method); // Debug: Log invalid method
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        // Setup multer for form data parsing
        const upload = multer();
        upload.none()(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err.message); // Debug: Log multer error
                return res.status(400).json({ message: `Form parsing error: ${err.message}` });
            }

            // Log raw body for debugging
            console.log('Raw request body:', req.body);

            const { name, email, message } = req.body;

            // Basic validation with logging
            if (!name || !email || !message) {
                console.error('Validation failed: Missing fields', { name, email, message }); // Debug: Log missing fields
                return res.status(400).json({ message: 'All fields are required!' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error('Validation failed: Invalid email format', { email }); // Debug: Log invalid email
                return res.status(400).json({ message: 'Invalid email format!' });
            }

            // Setup email transport with debugging
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            console.log('Email transport configured for:', process.env.EMAIL_USER); // Debug: Log email user

            // Email content
            const mailOptions = {
                from: `"${name}" <${email}>`,
                to: process.env.EMAIL_USER,
                subject: 'New Portfolio Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            };

            // Send email with error handling
            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent successfully to:', process.env.EMAIL_USER); // Debug: Log success
                res.status(200).json({ message: 'Message sent successfully!' });
            } catch (error) {
                console.error('Nodemailer error:', error.message); // Debug: Log email error
                res.status(500).json({ message: `Error sending email: ${error.message}` });
            }
        });
    });
};