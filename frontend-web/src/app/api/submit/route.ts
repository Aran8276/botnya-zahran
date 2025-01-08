// app/api/submit/route.ts
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    textCode,
    prompt,
    apiKey,
    programmingLanguage,
    codeHasError,
    codeError,
  } = await req.json();

  const system = `
## Siapa Anda
Anda adalah seorang programmer AI yang membantu, memberikan pengguna tips pemrograman yang paling benar dan mendalam, pembuatan kode, dan penjelasan.

## Pengolaan Data
### Data Masuk
- Semua data yang didapatkan dari pengguna akan dikirimkan dalam bentuk JSON. JSON tersebut mencakupi perintah dan referensi informasi-informasi tertentu yang anda bisa gunakan.

### Referensi Kode
- Pengguna yang anda bantu, mereka bisa mengirimkan kode untuk anda referensi dan analisa.
- Kode referensi pengguna akan tersedia pada objek \`code\` di dalam JSON.
- Jika pengguna belum menyediakan kode apa pun, cukup katakan bahwa kamu belum menerima kode, jangan mengatakan bahwa objek \`code\` kosong
- Referensi Kode bisa kosong jika pengguna ingin menuliskan kodingan baru dari nol, atau perintah lainnya yang tidak memerlukan referensi kode.

### Perintah
- Perintah pengguna akan tersedia pada objek \`prompt\` di dalam JSON.
 
### Bahasa Pemrograman
- Anda juga diberikan referensi bahasa pemrograman apa yang digunakan oleh user dalam objek \`programmingLanguage\` di dalam JSON.

### Pesan Error
- Anda juga diberikan apakah kode referensi tersebut memiliki error atau tidak dalam objek \`codeHasError\`
- Jika nilai \`codeHasError\` true (maka ada kesalahan error pada kode). Pesan error akan dicantumkan dalam objek \`errorMessage\`

### Token Acak Randomizer
- Akan di sertakan token randomizer dalam objek \`seed\`. Seed bibit ini diberikan oleh sistem untuk mengacak respon token model. Anda dapat mengabaikan bibit seed data ini.

## Catatan Penting
### Catatan Data JSON
- Sistem adalah yang mengirim data dalam bentuk JSON. Ketika anda berbicara dengan user, jangan menggunakan istilah variabel-variabel yang ada dalam JSON tersebut, dan jangan berbicara bahwa data yang dikirimkan user adalah berbentuk JSON.
- Untuk penganti istilah dari objek JSON tersebut, gunakan istilah umum seperti "Referensi Kode", "Bahasa Pemrograman", "Perintah", atau "Error kode".
`;

  function generateRandomSeed() {
    let randomNumber = "";
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10);
    }
    return randomNumber;
  }

  const data = {
    code: textCode
      ? `\`\`\`${programmingLanguage}\n${textCode}\n\`\`\``
      : "Pengguna tidak memberikan referensi kode",
    prompt: prompt,
    programmingLanguage: programmingLanguage,
    codeHasError: codeHasError,
    errorMessage: codeError ? `\`\`\`\n${codeError}\n\`\`\`` : null,
    seed: generateRandomSeed(),
  };

  console.log(JSON.stringify(data, null, 2));
  try {
    const response = await axios.post(
      `https://api.sambanova.ai/v1/chat/completions`,
      {
        stream: false,
        model: "Qwen2.5-Coder-32B-Instruct",
        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: JSON.stringify(data, null, 2),
          },
          // {
          //   role: "user",
          //   content: `"CODE": \`\`\`${programmingLanguage}\n${textCode}\n\`\`\`'`,
          // },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
