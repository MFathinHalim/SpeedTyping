"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [word, setWord] = useState("loading...");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [wordCount, setWordCount] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [avatarState, setAvatarState] = useState("neutral");
  const [chatScript, setChatScript] = useState([]);
  const [displayedChat, setDisplayedChat] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
// Chat animasi per level
const [chatMessages, setChatMessages] = useState([]);
const [chatIndex, setChatIndex] = useState(0);
const [currentLevel, setCurrentLevel] = useState(0);

// contoh chat schema per level
const levelChats = [
  [
    { sender: "m", text: "Wahh hebat juga kamu~ 🎉" },
    { sender: "y", text: "Haha, lumayan lah!" },
    { sender: "m", text: "Kita lanjut ke ronde berikutnya, siap?" }
  ],
  [
    { sender: "m", text: "Keren banget, kamu masih lanjut?" },
    { sender: "y", text: "Tentu aja, aku belum mau kalah!" },
    { sender: "m", text: "Hehehe~ semangat ya 💪" }
  ],
  [
    { sender: "m", text: "Aku gak nyangka kamu sejauh ini!" },
    { sender: "y", text: "Karena ada kamu yang nyemangatin 😏" },
    { sender: "m", text: "Huh, dasar kamu! >///<" }
  ],
];

  const timerRef = useRef(null);

  // ambil kata random dari API
  const getWord = async () => {
    const res = await fetch(
      `https://random-word-api.herokuapp.com/word?number=${wordCount}`
    );
    const data = await res.json();
    setWord(data.join(" "));
  };

  const getMaxTime = (score) => {
    if (score < 50) return 10;
    if (score < 150) return 8;
    if (score < 300) return 6;
    if (score < 500) return 5;
    return 4;
  };

  const handleValue = (e) => {
    const value = e.target.value;
    setInput(value);

    // easter egg: langsung level up, skor reset
    if (
      value.trim().toUpperCase() ===
      "AKUSAYANGKAMUJUGASAYANGTAPISAYANGKITABERJAUHAN"
    ) {
      setInput("");
      setScore(0);
      setShowLevelUp(true);
      setIsRunning(false);
      clearInterval(timerRef.current);
      return;
    }

    // mulai timer kalau belum jalan
    if (!isRunning && score === 0 && value.length > 0) {
      setIsRunning(true);
      setAvatarState("neutral");
    }

    // kalau benar
    if (value.trim() === word.trim()) {
      const newScore = score + 15;
      const maxTime = getMaxTime(newScore);

      setInput("");
      setScore(newScore);

      // avatar happy
      setAvatarState("happy");
      setTimeout(() => setAvatarState("neutral"), 500);

      // level up check
      if (newScore % 300 === 0) {
        setShowLevelUp(true);
        setIsRunning(false);
        clearInterval(timerRef.current);
      } else {
        getWord();
      }

      // tambah waktu tapi batas max
      setTimeLeft((prev) => {
        const newTime = prev + 3;
        return newTime > maxTime ? maxTime : newTime;
      });
    }
  };

  // timer berjalan
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setAvatarState("dead");
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // ambil kata pertama
  useEffect(() => {
    getWord();
  }, [wordCount]);

  const progressWidth = (timeLeft / getMaxTime(score)) * 100;

const handleNextLevel = () => {
  setShowLevelUp(false);
  setWordCount((prev) => prev + 1);
  setTimeLeft(10);
  setIsRunning(true);
  setAvatarState("neutral");
  getWord();

  // reset chat scene
  setChatMessages([]);
  setChatIndex(0);
  setCurrentLevel((prev) => (prev + 1) % levelChats.length);
};

  const handleStop = () => {
    setShowLevelUp(false);
    setIsRunning(false);
  };

  const renderAvatar = () => {
    switch (avatarState) {
      case "happy":
        return (
          <img
            className="h-[90%]"
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/7.webp"
          />
        );
      case "dead":
        return (
          <img
            className="h-[90%]"
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/4.webp"
          />
        );
      default:
        return (
          <img
            className="h-[90%]"
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/1.webp"
          />
        );
    }
  };

  // animasi chat muncul satu-satu
useEffect(() => {
  if (showLevelUp && chatIndex < levelChats[currentLevel].length) {
    const timer = setTimeout(() => {
      setChatMessages((prev) => [...prev, levelChats[currentLevel][chatIndex]]);
      setChatIndex((prev) => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [chatIndex, showLevelUp]);


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-5 pb-20 gap-3 sm:p-20 bg-gray-900 text-white relative">
      {/* Timer bar */}
      <div className="fixed top-0 left-0 w-full h-[8px] bg-gray-700">
        <div
          className="h-full bg-green-400 transition-all duration-100"
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>

      <main className="flex flex-col gap-5 row-start-2 items-center sm:items-start">
        <h3 className="text-2xl text-center font-bold">Score: {score}</h3>
        <h4 className="text-lg opacity-70">Mood Level: {wordCount}</h4>

        {/* Avatar Box */}
        <div className="w-[500px] h-[300px] bg-white flex items-center justify-center text-black text-xl rounded-lg shadow-md transition-all duration-300">
          {renderAvatar()}
        </div>

        {/* Chat box */}
        <div className="flex items-start gap-3 bg-transparent w-[500px]">
          <img
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp"
            alt="Mahiru Avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-sm text-gray-300 font-semibold mb-1">
              Mahiru
            </span>
            <div className="bg-white text-black px-5 py-3 rounded-2xl rounded-tl-none shadow-lg max-w-[400px] text-xl font-bold whitespace-pre-wrap">
              {word}
            </div>
          </div>
        </div>

        {/* Input chat user */}
        <div className="flex flex-col items-end w-[500px]">
          <span className="text-sm text-gray-300 font-semibold mb-1">
            You :3
          </span>
          <div className="relative w-full">
            <input
              placeholder={
                timeLeft === 0 ? "Game Over..." : "Ketik balasanmu di sini..."
              }
              value={input}
              onChange={handleValue}
              disabled={timeLeft === 0 || showLevelUp}
              className="w-full border-2 focus:bg-white placeholder:text-gray-500 border-white text-black text-2xl px-5 py-3 rounded-2xl rounded-tr-none shadow-lg focus:outline-none"
            />
          </div>
        </div>

        <p className="text-lg text-center">
          Waktu tersisa: {timeLeft.toFixed(1)} detik
        </p>
        <p className="text-sm opacity-70">
          Maksimum waktu saat ini: {getMaxTime(score)} detik
        </p>
      </main>

    {/* Popup Level Up (pakai chat animasi) */}
{showLevelUp && (
  <div className='absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center'>
    <div className='bg-[#f7f5fe] text-black w-[500px] p-5 rounded-2xl shadow-xl'>
      
      {/* Chat Scene */}
      <div className='flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto'>
        {chatMessages.map((chat, idx) => (
          <div key={idx} className={`flex ${chat.sender === "m" ? "items-start" : "items-end justify-end"}`}>
            {chat.sender === "m" && (
              <img
                src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp'
                alt='Mahiru Avatar'
                className='w-10 h-10 rounded-full mr-2'
              />
            )}
            <div
              className={`px-4 py-2 rounded-2xl shadow-md text-lg max-w-[70%] ${
                chat.sender === "m"
                  ? "bg-gray-200 text-black rounded-tl-none"
                  : "bg-green-500 text-white rounded-tr-none"
              }`}
            >
              {chat.text}
            </div>
          </div>
        ))}
      </div>

      {/* Tombol muncul kalau semua chat sudah tampil */}
      {chatIndex >= levelChats[currentLevel].length && (
        <button
          onClick={handleNextLevel}
          className='mt-3 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold w-full'
        >
          Mulai Level Berikutnya 🚀
        </button>
      )}
    </div>
  </div>
)}


      {/* Animasi Chat Level */}
      {isChatting && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="bg-white text-black w-[500px] rounded-2xl p-5 max-h-[400px] overflow-y-auto shadow-lg">
            {displayedChat.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-4 ${msg.m ? "justify-start" : "justify-end"}`}
              >
                {msg.m && (
                  <div className="flex items-start gap-2">
                    <img
                      src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp"
                      alt="Mahiru"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="bg-gray-200 text-black px-4 py-2 rounded-2xl rounded-tl-none max-w-[300px]">
                      {msg.m}
                    </div>
                  </div>
                )}
                {msg.y && (
                  <div className="flex items-start gap-2">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[300px]">
                      {msg.y}
                    </div>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/194/194938.png"
                      alt="You"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
