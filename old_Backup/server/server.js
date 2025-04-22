const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Konfigurer nodemailer med SMTP-detaljer
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'redaksjonenyskolenposten@nionett.no',
    pass: process.env.EMAIL_PASSWORD || 'dittPassord',
  },
});

// Endepunkt for å sende verifiseringskode
app.post('/send-verification', async (req, res) => {
  const { email, name, purpose } = req.body;
  
  // Generer en tilfeldig 6-sifret kode
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Emnet er likt for alle verifiseringer
  const subject = 'Bekreft din e-post for Nyskolen Posten';
  
  // HTML-versjon av e-posten med kopieringsknapp
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">Bekreft din e-post for Nyskolen Posten</h2>
      <p>Hei 👋</p>
      <p>Du har fått en verifiserings kode. Koden er:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; position: relative;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</span>
        <button onclick="navigator.clipboard.writeText('${code}')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background-color: #4285f4; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer;">
          Kopier
        </button>
      </div>
      <p>Hilsen Nyskolen Posten</p>
    </div>
  `;
  
  // Tekstversjon for e-postklienter som ikke støtter HTML
  const textContent = `Hei 👋\n\nDu har fått en verifiserings kode. Koden er: ${code}\n\nHilsen Nyskolen Posten`;
  
  try {
    // Send e-posten
    await transporter.sendMail({
      from: '"Nyskolen Posten" <redaksjonenyskolenposten@nionett.no>',
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    // Lagre koden i en database eller midlertidig lager
    // (her ville du brukt en database som MongoDB eller Redis)
    
    res.status(200).json({ 
      success: true, 
      message: 'Verifiseringskode sendt',
      // Koden under bør ikke sendes i produksjon, men er nyttig under utvikling
      code: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kunne ikke sende verifiseringskode'
    });
  }
});

// Andre e-postrelaterte endepunkter...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`E-postserver kjører på port ${PORT}`);
}); 