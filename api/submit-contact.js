const nodemailer = require('nodemailer');
const multer = require('multer');

module.exports = async (req, res) => {
    console.log('Request received:', req.method, req.headers.origin);

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Use multer to parse form-data
    const upload = multer().none();
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            return res.status(400).json({ message: `Form parsing error: ${err.message}` });
        }

        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            console.warn('Missing fields:', { name, email, message });
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('Invalid email:', email);
            return res.status(400).json({ message: 'Invalid email format!' });
        }

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: '📩 New Contact Message from Portfolio',
            text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        // Send email
        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully');
            res.status(200).json({ message: 'Message sent successfully!' });
        } catch (error) {
            console.error('❌ Nodemailer error:', error.message);
            res.status(500).json({ message: `Error sending email: ${error.message}` });
        }
    });
};