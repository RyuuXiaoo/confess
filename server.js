
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function randomId(){
return Math.floor(100000 + Math.random() * 900000);
}

app.get('/', (req,res)=>{
res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/reply', (req,res)=>{
res.sendFile(path.join(__dirname, 'public/reply.html'));
});

app.post('/send-confess', async(req,res)=>{

try{

const { nama, nomor, pesan } = req.body;

if(!process.env.FONNTE_TOKEN){
return res.json({
status:false,
message:'FONNTE_TOKEN belum di setting'
});
}

const confessId = randomId();

const message = `💌 *CONFESS ANONYMOUS*

🆔 ID: ${confessId}
👤 Dari: ${nama}

💬 Pesan:
${pesan}

🌐 Balas:
${process.env.DOMAIN_URL}/reply`;

const fonnte = await axios({
method:'POST',
url:'https://api.fonnte.com/send',
headers:{
Authorization: process.env.FONNTE_TOKEN
},
data:{
target: nomor,
message: message
}
});

console.log('Fonnte:', fonnte.data);

if(process.env.TELEGRAM_BOT_TOKEN && process.env.OWNER_TELEGRAM_ID){

await axios.post(
`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
{
chat_id: process.env.OWNER_TELEGRAM_ID,
text:`📩 CONFESS BARU

ID: ${confessId}
Nama: ${nama}
Tujuan: ${nomor}

Pesan:
${pesan}`
}
);

}

return res.json({
status:true,
id:confessId
});

}catch(err){

console.log('ERROR:', err.response?.data || err.message);

return res.json({
status:false,
message: err.response?.data?.reason || err.message || 'Terjadi error'
});

}

});

app.post('/reply-confess', async(req,res)=>{

try{

const { id, nama, pesan } = req.body;

if(!process.env.TELEGRAM_BOT_TOKEN){
return res.json({
status:false,
message:'Telegram bot token belum di setting'
});
}

await axios.post(
`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
{
chat_id: process.env.OWNER_TELEGRAM_ID,
text:`💬 BALASAN CONFESS

ID: ${id}
Nama: ${nama}

Pesan:
${pesan}`
}
);

return res.json({
status:true
});

}catch(err){

console.log(err.response?.data || err.message);

return res.json({
status:false,
message: err.response?.data?.description || err.message
});

}

});

module.exports = app;
