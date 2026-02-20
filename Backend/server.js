const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cors = require('cors');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

app.use(express.static(path.join(__dirname, '../Frontend')));

function cleanHeaderValue(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  if (/[\r\n]/.test(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
    if (!transporter) {
      console.warn(
        '[mail] Not configured. Create Backend/.env with SMTP_HOST, SMTP_USER, SMTP_PASS (see Backend/.env.example).',
      );
    }
    if (transporter) {
      transporter.verify()
        .then(() => console.log("SMTP connection verified."))
        .catch(err => console.error("SMTP verification failed:", err));
    }
  }
  return transporter;
}

app.post('/submit-feedback', async (req, res) => {
  const { name, email, message, rating } = req.body ?? {};

  const cleanName = cleanHeaderValue(name);
  const cleanEmail = cleanHeaderValue(email);
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  const cleanRating = cleanHeaderValue(rating);
  const ratingLabel = cleanRating && cleanRating !== '0' ? cleanRating : 'N/A';

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({
      status: 'error',
      error: 'Name, email and message are required.',
    });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({
      status: 'error',
      error: 'Please provide a valid email address.',
    });
  }

  if (cleanMessage.length > 5000) {
    return res.status(400).json({
      status: 'error',
      error: 'Message is too long.',
    });
  }

  const mailTo = process.env.MAIL_TO || process.env.SMTP_USER;
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  const transport = getTransporter();

  if (!transport || !mailTo || !mailFrom) {
    return res.status(500).json({
      status: 'error',
      error: 'Email is not configured on the server.',
    });
  }

  try {
    await transport.sendMail({
      from: { name: 'Portfolio Contact', address: mailFrom },
      to: mailTo,
      replyTo: { name: cleanName, address: cleanEmail },
      subject: `New message from ${cleanName}`,
      text: [
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Rating: ${ratingLabel}`,
        '',
        cleanMessage,
      ].join('\n'),
      html: `
        <h3>New Feedback Received</h3>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Rating:</strong> ${ratingLabel}</p>
        <p><strong>Message:</strong><br>${cleanMessage}</p>
      `
    });

    return res.json({ status: 'success', message: 'Feedback sent successfully!' });
  } catch (err) {
    console.error('Failed to send email:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to send message.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
