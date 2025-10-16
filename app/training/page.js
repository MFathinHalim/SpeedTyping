"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Training() {
  const [word, setWord] = useState("loading...");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);

  const playSfx = (name) => {
    const audio = new Audio(`/sfx/${name}.mp3`);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

const getWord = async () => {
  try {
    const res = await fetch("/words.json");
    const words = await res.json();

    const randomSentences = [];
    for (let i = 0; i < 3; i++) {
      const random = words[Math.floor(Math.random() * words.length)];
      randomSentences.push(random);
    }

    setWord(randomSentences.join(" "));
  } catch (err) {
    console.error("Gagal ambil kata:", err);
    setWord("error");
  }
};


  useEffect(() => {
    getWord();
  }, []);

  const handleValue = (e) => {
    const value = e.target.value;
    setInput(value);
    setTypedChars((prev) => prev + 1);
    if (!startTime && value.length > 0) setStartTime(Date.now());

    if (value.trim() === word.trim()) {
      setInput("");
      setScore((prev) => prev + 10);
      playSfx("shine");
      getWord();
    }
  };

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000;
      const wordsTyped = typedChars / 5;
      setWpm(Math.round(wordsTyped / timeElapsed));
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, typedChars]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-100 to-blue-100 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-2">Training Mode 🧠</h1>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        Latihan mengetik tanpa batas waktu. Fokus ke kecepatan dan akurasi.
      </p>

      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[500px] text-center">
        <h3 className="text-2xl mb-2">Score: {score}</h3>
        <p className="text-gray-600 mb-4 text-lg">WPM: {wpm}</p>

        <div className="flex items-start gap-3 bg-transparent w-full mb-4">
          <img
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp"
            alt="Mahiru"
            className="w-10 h-10 rounded-full border-1 bg-white"
          />
          <div className="bg-gray-100 text-black border px-4 py-2 rounded-2xl rounded-tl-none shadow-sm text-xl font-bold flex-1 text-left">
            {word}
          </div>
        </div>

        <input
          placeholder="Ketik balasanmu di sini..."
          value={input}
          onChange={handleValue}
          className="w-full border-1 bg-green-200 placeholder:text-gray-500 text-black text-lg px-4 py-2 rounded-2xl rounded-tr-none shadow-sm focus:outline-none"
        />
      </div>

      <Link href="/" className="mt-6">
        <button className="px-8 py-3 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-full shadow-md transition-transform duration-200 hover:scale-105">
          ⬅️ Kembali ke Menu
        </button>
      </Link>
    </div>
  );
}
