import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavButton from "@/components/navbutton";
import { FiGithub } from "react-icons/fi";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Botnya-Zahran - Client Bot WhatsApp Multifungsi",
  description:
    "Botnya-zahran adalah sebuah client bot WhatsApp serbaguna yang dapat melakukan hal seperti reminder, custom commands, permainan card table, jadwal piket, dll.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${poppins.className} antialiased`}>
        <header className="fixed w-full top-0 z-50 bg-main/80 backdrop-blur-md shadow-md">
          <div className="container mx-auto flex items-center justify-between px-6 py-3">
            <figure className="flex items-center space-x-3">
              <img
                src="./logo.png"
                className="size-12"
                alt="Botnya-Zahran Logo"
              />
              <h2 className="font-bold text-xl text-white">botnya-zahran</h2>
            </figure>
            <nav className="hidden md:flex items-center space-x-2">
              <NavButton href="#features">Fitur</NavButton>
              <NavButton href="#how-to-use">Cara Pakai</NavButton>
              <NavButton
                href="https://github.com/aran8276/botnya-zahran"
                external
              >
                <FiGithub />
                GitHub
              </NavButton>
            </nav>
            <div className="hidden md:block">
              <a href="https://github.com/aran8276/botnya-zahran">
                <button className="py-2 px-5 bg-teal-500 text-white rounded-full cursor-pointer font-semibold text-center shadow-sm transition-all duration-300 hover:bg-teal-600">
                  Download
                </button>
              </a>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-[#1e2124] py-8">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Botnya-Zahran. All rights reserved.
            </p>
            <p className="text-sm mt-2">Dibuat dengan ❤️ oleh Zahran</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
