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
Untuk membuat stiker dari gambar yang telah dikirim
Cara menggunakan : kirimkan sebuah gambar dan tulis di caption #stiker atau #sticker

4️⃣ *#download* <tautan_postingan_atau_video>
Untuk mendownload postingan atau video dari media sosial
Contoh : #download https://www.facebook.com/blablabla
Support : facebook, instagram, twitter, tiktok
* NB : untuk youtube masiih dalam proses pengembangan
* Bonus : BEBAS WATERMARK 😎

5️⃣ *#* <perintah_ai_(prompt)>
Untuk menggunakan fitur chat AI
Contoh : #buatkan resep nasi goreng

6️⃣ *#shortlink <tautan>*
Untuk memperpendek link
Contoh : #shortlink https://www.facebook.com/blablabla
* NB : Hanya tersedia tinyurl

7️⃣ *#report* <pesan>
Laporan bug/error dan kritik/saran
Contoh : #report ada error nih gan

8️⃣ *#donasi*
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