
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function randomId() {
  return Math.floor(Math.random() * 999999);
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

    const text = `💌 *CONFESS BARU*

🆔 ID: ${confessId}
👤 Nama: ${nama}

💬 Pesan:
${pesan}

↩️ Balas confess:
${process.env.DOMAIN_URL || 'https://your-domain.vercel.app'}/reply`;

    await axios.post('https://api.fonnte.com/send', {
      target: nomor,
      message: text
    }, {
      headers: {
        Authorization: process.env.FONNTE_TOKEN
      }
    });

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.OWNER_TELEGRAM_ID,
        text: `📩 CONFESS BARU

ID: ${confessId}
Nama: ${nama}
Tujuan: ${nomor}

Pesan:
${pesan}`
      }
    );

    res.json({
      status: true,
      id: confessId
    });

  } catch (err) {
    console.log(err.response?.data || err.message);

    res.json({
      status: false,
      message: 'Gagal mengirim confess'
    });
  }
});

app.post('/reply-confess', async (req, res) => {
  try {
    const { id, nama, pesan } = req.body;

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.OWNER_TELEGRAM_ID,
        text: `💬 BALASAN CONFESS

ID: ${id}
Nama: ${nama}

Pesan:
${pesan}`
      }
    );

    res.json({
      status: true
    });

  } catch (err) {
    console.log(err.response?.data || err.message);

    res.json({
      status: false,
      message: 'Gagal mengirim balasan'
    });
  }
});

module.exports = app;
