const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

module.exports = async (req, res) => {
    // Enable CORS for your GitHub Pages URL
    const corsMiddleware = cors({ origin: 'https://<username>.github.io/<repo>' }); // Replace with your GitHub Pages URL
    corsMiddleware(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        // Setup multer for form data
        const upload = multer();
        upload.none()(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err.message);
                return res.status(400).json({ message: `Form parsing error: ${err.message}` });
            }

            const { name, email, message } = req.body;

            // Basic validation
            if (!name || !email || !message) {
                console.error('Validation failed: Missing fields');
                return res.status(400).json({ message: 'All fields are required!' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error('Validation failed: Invalid email format');
                return res.status(400).json({ message: 'Invalid email format!' });
            }

            // Setup email transport
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Email content
            const mailOptions = {
                from: `"${name}" <${email}>`,
                to: process.env.EMAIL_USER,
                subject: 'New Portfolio Contact Form Submission',
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            };

            // Send email
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