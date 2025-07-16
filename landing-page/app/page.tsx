import {
  FiBookOpen,
  FiZap,
  FiMessageCircle,
  FiCalendar,
  FiBox,
  FiUsers,
  FiDownload,
} from "react-icons/fi";
import FeatureCard from "@/components/FeatureCard";

export default function Home() {
  return (
    <div className="bg-main text-white overflow-x-hidden">
      <section className="h-screen pt-32 flex flex-col justify-center items-center text-center px-4 -mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 animate-fade-in-up">
            Client Bot WhatsApp
          </h1>
          <h2
            className="text-4xl md:text-6xl font-bold text-teal-400 mb-6 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Multifungsi & Simple
          </h2>
          <p
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            Botnya-zahran adalah client bot WhatsApp serbaguna yang dirancang
            untuk menyederhanakan tugas harian Anda, mulai dari pengingat,
            perintah khusus, hingga permainan interaktif.
          </p>
          <div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <a href="https://github.com/aran8276/botnya-zahran">
              <button
                type="button"
                className="flex  cursor-pointer items-center justify-center gap-2 py-3 px-8 text-lg bg-green-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 transform"
              >
                <FiDownload />
                Download
              </button>
            </a>
            <a href="#how-to-use">
              <button
                type="button"
                className="flex cursor-pointer items-center justify-center gap-2 py-3 px-8 text-lg border-2 border-gray-400 rounded-lg font-semibold text-white transition-all duration-300 hover:bg-gray-700 hover:border-gray-700"
              >
                <FiBookOpen />
                Petunjuk Penggunaan
              </button>
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32 bg-features-gradient">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Fitur Unggulan
          </h2>
          <p className="max-w-3xl mx-auto text-gray-300 text-lg mb-16">
            Jelajahi berbagai kemampuan yang membuat Botnya-zahran menjadi
            asisten WhatsApp terbaik untuk Anda.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiZap size={32} className="text-teal-400" />}
              title="Custom Commands"
              description="Buat perintah kustom Anda sendiri untuk membuat shortcut catatan custom."
            />
            <FeatureCard
              icon={<FiCalendar size={32} className="text-teal-400" />}
              title="Manajemen Jadwal"
              description="Atur jadwal piket, pengingat acara, dan agenda penting lainnya langsung dari WhatsApp."
            />
            <FeatureCard
              icon={<FiMessageCircle size={32} className="text-teal-400" />}
              title="Auto-Reply & AI"
              description="Konfigurasi balasan otomatis cerdas untuk menjawab pesan saat Anda sibuk."
            />
            <FeatureCard
              icon={<FiBox size={32} className="text-teal-400" />}
              title="Permainan Interaktif"
              description="Mainkan permainan kartu meja dan mini-game seru seperti UNO dan Blackjack lainnya bersama teman di grup Anda."
            />
            <FeatureCard
              icon={<FiUsers size={32} className="text-teal-400" />}
              title="Mention Everyone"
              description="Fitur mention semua orang di dalam group dengan mudah ketika Anda ingin menyampaikan pesan penting."
            />
            <FeatureCard
              icon={<FiBookOpen size={32} className="text-teal-400" />}
              title="Simple & Ringan"
              description="Didesain agar mudah digunakan dan tidak membebani perangkat Anda."
            />
          </div>
        </div>
      </section>

      <section
        id="how-to-use"
        className="py-20 md:py-32 bg-how-to-use-gradient"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mulai Dalam 4 Langkah Mudah
            </h2>
            <p className="max-w-3xl mx-auto text-gray-300 text-lg">
              Ikuti panduan ini untuk mengaktifkan dan menjalankan bot Anda.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="flex flex-col items-center text-center p-6 max-w-sm">
              <div className="bg-gray-800 rounded-full p-5 mb-4 border-2 border-teal-500">
                <span className="text-3xl font-bold text-teal-400">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Download</h3>
              <p className="text-gray-400">
                Unduh file bot dari tautan yang disediakan dari repository
                GitHub.
              </p>
            </div>
            <div className="hidden md:block text-gray-600 text-4xl">→</div>
            <div className="flex flex-col items-center text-center p-6 max-w-sm">
              <div className="bg-gray-800 rounded-full p-5 mb-4 border-2 border-teal-500">
                <span className="text-3xl font-bold text-teal-400">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Jalankan melalui Docker
              </h3>
              <p className="text-gray-400">
                Disediakan docker-compose Anda dapat menjalankannya melalui
                docker-compose up -d.
              </p>
            </div>
            <div className="hidden md:block text-gray-600 text-4xl">→</div>
            <div className="flex flex-col items-center text-center p-6 max-w-sm">
              <div className="bg-gray-800 rounded-full p-5 mb-4 border-2 border-teal-500">
                <span className="text-3xl font-bold text-teal-400">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Scan QR</h3>
              <p className="text-gray-400">
                Scan kode QR di terminal anda untuk menge-link WhatsApp web anda
                ke bot ini.
              </p>
            </div>
            <div className="hidden md:block text-gray-600 text-4xl">→</div>
            <div className="flex flex-col items-center text-center p-6 max-w-sm">
              <div className="bg-gray-800 rounded-full p-5 mb-4 border-2 border-teal-500">
                <span className="text-3xl font-bold text-teal-400">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Nikmati Bot Anda</h3>
              <p className="text-gray-400">
                Selamat! Bot Anda sekarang aktif dan siap menerima perintah.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 text-center bg-main">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Siap untuk Memulai?
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg mb-10">
            Tingkatkan pengalaman WhatsApp Anda hari ini. Unduh bot sekarang dan
            rasakan kemudahannya.
          </p>
          <a href="https://github.com/aran8276/botnya-zahran">
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 py-4 px-10 mx-auto text-xl bg-green-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 transform"
            >
              <FiDownload />
              Download Sekarang
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
