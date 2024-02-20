exports.textMenu = (name) => {
    return `
🚀 *BOT BERMANFAAT* 🚀

Hi *${name}*, 👋️
Berikut adalah beberapa fitur yang ada pada bot ini! ✨

1️⃣ *#start*
Untuk memulai percakapan

2️⃣ *#menu* atau *#help*
Untuk menampilkan daftar menu bot

3️⃣ *#sticker* atau *#stiker*
Untuk membuat stiker dari gambar, GIF, atau video yang telah dikirim
Cara menggunakan : kirimkan sebuah gambar, GIF, atau video lalu tulis di caption #stiker atau #sticker
* NB : GIF atau Video hanya akan diambil durasi selama 5 detik

4️⃣ *#stickerit* atau *#stikerit*
Untuk membuat stiker dari gambar, GIF, atau video dari pesan terdahulu
Cara menggunakan : balas/reply pesan yang terdapat media (gambar, GIF, atau video)
* NB : GIF atau Video hanya akan diambil durasi selama 5 detik

5️⃣ *#download* \`tautan_video\`
Untuk mendownload video dari media sosial
Contoh : #download https://www.facebook.com/blablabla
Support : youtube, facebook, instagram, twitter, tiktok
* Bonus : BEBAS WATERMARK 😎

6️⃣ *#* \`perintah_ai_(prompt)\`
Untuk menggunakan fitur chat AI (teks, gambar, dan PDF)
Cara menggunakan : kirimkan teks, gambar, atau file PDF dengan perintah yang diawali dengan #

7️⃣ *#shortlink* \`tautan>\`
Untuk memperpendek link
Contoh : #shortlink https://www.facebook.com/blablabla
* NB : Hanya tersedia tinyurl

8️⃣ *#report* \`pesan\`
Laporan bug/error dan kritik/saran
Contoh : #report ada error nih gan

9️⃣ *#donasi*
Untuk menampilkan informasi donasi wkwk

Beberapa fitur masih dalam proses pengembangan
Terimakasih ✨✨
    `
}

exports.textDonasi = () => {
    return `
Hai, terimakasih telah menggunakan bot ini, untuk mendukung bot ini Anda dapat membantu dengan berdonasi melalui nomor e-wallet berikut:
1. Gopay : +628885686961
2. Dana  : +628885686961 

Donasi akan digunakan untuk pengembangan dan pengoperasian bot ini.

Terimakasih. ☺️☺️
    `
}

exports.reportText = (report) => {
    return `
❕ *REPORT !!* ❕

Laporan Anda : ${report}

Terimakasih atas, laporan, kritik, dan saran yang telah Anda berikan ☺️
    `
}