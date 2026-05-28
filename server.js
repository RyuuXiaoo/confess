const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================= CONFIG =================
const FONNTE_TOKEN = 'EFLkpC9QVhgBSHNcNwZX';

const TELEGRAM_BOT_TOKEN = '7679348177:AAFymI3itCrCrhTDVX3pDp5tNwJV0jBsEQ4';
const OWNER_TELEGRAM_ID = '7058216834';

const DOMAIN_URL = 'https://confess-gou3.vercel.app';
// ==========================================

function randomId() {
  return Math.floor(100000 + Math.random() * 900000);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/reply', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/reply.html'));
});

app.post('/send-confess', async (req, res) => {

  try {

    const { nama, nomor, pesan } = req.body;

    const confessId = randomId();

    const text = `💌 *CONFESS ANONYMOUS*

🆔 ID: ${confessId}
👤 Dari: ${nama}

💬 Pesan:
${pesan}

🌐 Balas:
${DOMAIN_URL}/reply`;

    const result = await axios({
      method: 'POST',
      url: 'https://api.fonnte.com/send',
      headers: {
        Authorization: FONNTE_TOKEN
      },
      data: {
        target: nomor,
        message: text
      }
    });

    console.log(result.data);

    // notif telegram
    if (TELEGRAM_BOT_TOKEN && OWNER_TELEGRAM_ID) {

      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: OWNER_TELEGRAM_ID,
          text: `📩 CONFESS BARU

ID: ${confessId}
Nama: ${nama}
Tujuan: ${nomor}

Pesan:
${pesan}`
        }
      );

    }

    return res.json({
      status: true,
      id: confessId
    });

  } catch (err) {

    console.log(err.response?.data || err.message);

    return res.json({
      status: false,
      message: JSON.stringify(err.response?.data || err.message)
    });

  }

});

app.post('/reply-confess', async (req, res) => {

  try {

    const { id, nama, pesan } = req.body;

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: OWNER_TELEGRAM_ID,
        text: `💬 BALASAN CONFESS

ID: ${id}
Nama: ${nama}

Pesan:
${pesan}`
      }
    );

    return res.json({
      status: true
    });

  } catch (err) {

    console.log(err.response?.data || err.message);

    return res.json({
      status: false,
      message: err.message
    });

  }

});

module.exports = app;
