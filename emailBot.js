const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware for å parse JSON
app.use(express.json());

// Konfigurer nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'din.email@gmail.com', // Endre til din e-post
    pass: 'ditt-passord' // Endre til ditt passord
  }
});

// Generer en tilfeldig verifikasjonskode
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endepunkt for å sende verifikasjonskode
app.post('/send-code', async (req, res) => {
  const { email, name } = req.body;
  const code = generateVerificationCode();

  const mailOptions = {
    from: '"Nyskolen Posten" <din.email@gmail.com>',
    to: email,
    subject: 'Din verifiseringskode',
    text: `Hei ${name},

Din verifiseringskode er: ${code}

Med vennlig hilsen,
Nyskolen Posten`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-post sendt til:', email);
    res.status(200).json({ success: true, message: 'Verifiseringskode sendt!', code });
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    res.status(500).json({ success: false, message: 'Kunne ikke sende e-post' });
  }
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
}); 