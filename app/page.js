"use client";
import { useState, useEffect, useRef } from "react";
function showHitEffect(type) {
  const effect = document.createElement("div");
  effect.className = `hit-effect ${type}`; // misal: "sick", "good", "bad"
  effect.textContent = type.toUpperCase() + "!!";
  effect.style.left = `${50 + (Math.random() * 20 - 10)}%`;
  effect.style.top = `${40 + (Math.random() * 10 - 5)}%`;
  document.body.appendChild(effect);

  setTimeout(() => effect.remove(), 700);
}
function ChatUI({
  chatMessages,
  chatIndex,
  currentLevel,
  levelChats,
  handleNextLevel,
  handleSkip,
}) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  return (
    <div className="absolute inset-0 z-10 bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 bg-opacity-80 flex flex-col justify-center items-center">
      <div className="flex flex-col justify-between text-black w-full sm:max-w-[500px] md:max-h-[85%] sm:rounded-lg sm:border sm:my-6 h-full sm:h-auto">
        <div
          ref={chatContainerRef}
          className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto"
        >
          {chatMessages.map((chat, idx) => {
            if (chat.sender === "n") {
              return (
                <div
                  key={idx}
                  className="text-center text-gray-700 italic text-sm sm:text-base px-2"
                >
                  {chat.text}
                </div>
              );
            }

            const isArhan = chat.sender === "a";
            const profileImg =
              chat.sender === "r"
                ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtU35icM-Tqf_VWoC_EE_YHWwOBsImJ6FmRQ&s"
                : chat.sender === "m"
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx70H_HZYnQ1FgF1yuwGutKym0YGYg-U6dsA&s"
                  : "";

            return (
              <div
                key={idx}
                className={`flex ${
                  isArhan
                    ? "justify-end items-end"
                    : "justify-start items-start"
                }`}
              >
                {!isArhan && profileImg && (
                  <img
                    src={profileImg}
                    alt={chat.sender}
                    className="bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2"
                  />
                )}

                <div
                  className={`px-3 sm:px-4 py-2 rounded-2xl shadow-sm text-sm sm:text-lg max-w-[80%] ${
                    isArhan
                      ? "bg-green-200 rounded-tr-none"
                      : "bg-gray-100 text-black rounded-tl-none"
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t rounded-b-2xl bg-white flex gap-2">
          <button
            onClick={handleNextLevel}
            className="flex-1 px-5 py-3 bg-green-300 border hover:bg-green-500 rounded-lg font-bold transition-all"
          >
            Lanjutkan Gamenya
          </button>

          {/* 🟣 2. Tombol Skip */}
          <button
            onClick={handleSkip}
            className="px-5 py-3 bg-gray-200 border hover:bg-gray-300 rounded-lg font-bold transition-all"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  const [word, setWord] = useState("loading...");
  const [input, setInput] = useState("");
  const score = useRef(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [wordCount, setWordCount] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [avatarState, setAvatarState] = useState("neutral");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatIndex, setChatIndex] = useState(0);
  const [storyLevels, setStoryLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  const getStory = async () => {
    try {
      const res = await fetch("/story.json");
      const data = await res.json();
      setStoryLevels(data.levels || []);
    } catch (err) {
      console.error("Gagal ambil story.json:", err);
    }
  };
  const [idleTime, setIdleTime] = useState(0);
  const [endMessage, setEndMessage] = useState("");
  const [typedChars, setTypedChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const bgmRef = useRef(null);
  const storyBgmRef = useRef(null);
  const [isStoryMusicPlaying, setIsStoryMusicPlaying] = useState(true);

  const timerRef = useRef(null);

  const playSfx = (name) => {
    const audio = new Audio(`/sfx/${name}.mp3`);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  const getWord = async () => {
    try {
      const res = await fetch("/words.json");
      const words = await res.json();

      const count = wordCount || 1;

      const randomWords = [];
      for (let i = 0; i < count; i++) {
        const random = words[Math.floor(Math.random() * words.length)];
        randomWords.push(random);
      }

      setWord(randomWords.join(" "));
    } catch (err) {
      console.error("Gagal ambil kata:", err);
      setWord("error");
    }
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
    setTypedChars((prev) => prev + 1);
    if (!startTime && value.length > 0) setStartTime(Date.now());

    if (!isRunning && score.current === 0 && value.length > 0) {
      if (!bgmRef.current) {
        bgmRef.current = new Audio("/sfx/bg.mp3");
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.4;
        bgmRef.current.play().catch(() => {});
      }

      setIsRunning(true);
      setAvatarState("neutral");
    }

    if (value.trim() === word.trim()) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const newMultiplier = 1 + Math.floor(newCombo / 10);
      setMultiplier(newMultiplier);

      if (newCombo % 10 === 0) {
        const comboEl = document.createElement("div");
        comboEl.className = "combo-effect";
        comboEl.textContent = `COMBO ${newCombo}x! 🔥`;
        document.body.appendChild(comboEl);
        setTimeout(() => comboEl.remove(), 800);
      }
      const newScore = score.current + 15;
      const maxTime = getMaxTime(newScore);

      setInput("");
      score.current = newScore;
      showHitEffect("sick");
      document.body.style.animation = "shake 0.2s";
      setTimeout(() => (document.body.style.animation = ""), 200);
      playSfx("shine");
      setAvatarState("happy");
      setTimeout(() => setAvatarState("neutral"), 500);

      if (newScore % 300 === 0) {
        setShowLevelUp(true);
        setIsRunning(false);
        clearInterval(timerRef.current);
        if (bgmRef.current) {
          bgmRef.current.pause();
          bgmRef.current.currentTime = 0;
        }

        if (!storyBgmRef.current) {
          storyBgmRef.current = new Audio("/sfx/bgstory.mp3");
          storyBgmRef.current.loop = true;
          storyBgmRef.current.volume = 0.5;
        }
        storyBgmRef.current.play().catch(() => {});
        setIsStoryMusicPlaying(true);
      } else {
        getWord();
      }

      setTimeLeft((prev) => {
        const newTime = prev + 3;
        return newTime > maxTime ? maxTime : newTime;
      });
    }
  };
  useEffect(() => {
    getStory();

    const savedLevel = parseInt(localStorage.getItem("currentLevel") || "0");
    const maxLevel = storyLevels.length - 1;

    if (savedLevel > maxLevel) {
      setCurrentLevel(0);
      localStorage.setItem("currentLevel", "0");
    } else {
      setCurrentLevel(savedLevel);
    }

    const savedHighScore = parseInt(localStorage.getItem("highscore") || "0");
    setHighScore(savedHighScore);
  }, []);

  useEffect(() => {
    if (isRunning) {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setAvatarState("dead");
            playSfx("sad");

            if (startTime) {
              const timeElapsed = (Date.now() - startTime) / 60000;
              const wordsTyped = typedChars / 5;
              setWpm(Math.round(wordsTyped / timeElapsed));
            }

            const savedHighScore = localStorage.getItem("highscore") || 0;
            console.log("Final Score:", score.current);
            if (parseInt(score.current) >= parseInt(savedHighScore)) {
              console.log("wtf");
              setEndMessage(
                "😏 Boleh juga ngalahin highscore... tapi tetep aja MATI 💀",
              );
              localStorage.setItem("highscore", parseInt(score.current));
            } else {
              setEndMessage("😜 CUPU! highscore aja kagak bisa dikalahin!");
            }
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRunning, startTime, typedChars]);

  useEffect(() => {
    if (!isRunning) return;

    const handleTyping = () => setIdleTime(0);

    window.addEventListener("keydown", handleTyping);
    const interval = setInterval(() => setIdleTime((prev) => prev + 0.1), 150);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleTyping);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!startTime || !isRunning) return;
    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000;
      const wordsTyped = typedChars / 5;
      setWpm(Math.round(wordsTyped / timeElapsed));
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, typedChars, isRunning]);

  useEffect(() => {
    getWord();
  }, [wordCount]);

  const progressWidth = (timeLeft / getMaxTime(score.current)) * 100;

  const handleNextLevel = () => {
    if (storyBgmRef.current) {
      storyBgmRef.current.pause();
      storyBgmRef.current.currentTime = 0;
    }

    if (bgmRef.current) {
      bgmRef.current.play().catch(() => {});
    }

    setShowLevelUp(false);
    setWordCount((prev) => prev + 1);
    setTimeLeft(10);
    setIsRunning(true);
    setAvatarState("neutral");
    getWord();
    setChatMessages([]);
    setChatIndex(0);

    setCurrentLevel((prev) => {
      const next = storyLevels.length
        ? (prev + 1) % storyLevels.length
        : prev + 1;
      localStorage.setItem("currentLevel", next); // simpan progress level
      return next;
    });
  };

  const renderAvatar = () => {
    switch (avatarState) {
      case "happy":
        return (
          <img
            className="w-full h-full rounded-lg object-contain"
            src="/terkejut.jpg"
          />
        );
      case "dead":
        return (
          <img
            className="w-full h-full rounded-lg object-contain"
            src="https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/4.webp"
          />
        );
      default:
        return (
          <img
            className="w-full h-full rounded-lg object-contain"
            src="/happy.jpeg"
          />
        );
    }
  };

  useEffect(() => {
    if (!storyLevels.length) return;
    const currentChats = storyLevels[currentLevel]?.chats || [];

    if (showLevelUp && chatIndex < currentChats.length) {
      const timer = setTimeout(() => {
        setChatMessages((prev) => [...prev, currentChats[chatIndex]]);
        setChatIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [chatIndex, showLevelUp, storyLevels, currentLevel]);

  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem("highscore") || "0");
    setHighScore(savedHighScore);
  }, []);

  const handleSkip = () => {
    const allChats = storyLevels[currentLevel]?.chats || [];
    setChatMessages(allChats); // langsung tampil semua chat
    setChatIndex(allChats.length); // update index biar lanjut bisa muncul
  };

  return (
    <>
      <div className="hidden relative md:flex bg-gradient-to-br from-pink-50 via-purple-100 to-purple-50 text-black backdrop-blur-sm p-3 justify-between items-center w-full">
        <div className="flex items-center gap-3 px-2">
          <div>
            <h4 className="text-3xl font-bold mb-0 text-left">Paperline</h4>
          </div>
        </div>
      </div>
      <div
        className="relative bg-gradient-to-br from-pink-200 via-purple-100 to-purple-50
        font-sans text-gray-800 overflow-hidden
        min-h-screen md:pb-30 md:pt-20 md:flex md:justify-center md:p-6"
        style={{
          filter: `brightness(${1 - Math.min(idleTime / 10, 0.3)})`,
        }}
      >
        {/* Overlay efek idle */}
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: `rgba(255, 0, 0, ${Math.min(idleTime / 8, 0.4)})`,
            mixBlendMode: "multiply",
          }}
        ></div>

        {/* Progress bar */}
        <div className="fixed z-10 top-0 left-0 w-full h-[6px] sm:h-[8px] bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-yellow-300 transition-all duration-100"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* MAIN CONTAINER */}
        <main
          className="relative z-10 flex flex-col text-center gap-1 sm:gap-3 md:gap-2
          rounded-none md:rounded-xl overflow-hidden shadow-gray-400/35 shadow-xl
          w-full h-screen md:h-fit md:max-w-[500px]"
        >
          {/* Background hanya di dalam container */}
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-100 to-purple-50 opacity-80"></div>

          {/* Header (disembunyikan di mobile) */}
          <div className="relative hidden md:flex bg-white/60 backdrop-blur-sm p-3 pr-4 justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx70H_HZYnQ1FgF1yuwGutKym0YGYg-U6dsA&s"
                alt="Mira"
                className="w-13 h-13 rounded-full object-cover bg-white"
              />
              <div>
                <h4 className="text-xl font-bold mb-0 text-left">
                  Mira {"<3"}
                </h4>
                <h4 className="text-left mb-0">Online</h4>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-0">Score: {score.current}</h3>
          </div>

          {/* Header versi mobile (fix ke atas, WA style) */}
          <div className="md:hidden sticky top-0 z-20 bg-white/70 backdrop-blur-sm flex items-center gap-3 px-4 py-3 shadow-sm">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx70H_HZYnQ1FgF1yuwGutKym0YGYg-U6dsA&s"
              alt="Mira"
              className="w-10 h-10 rounded-full bg-white"
            />
            <div className="flex-1 text-left">
              <h4 className="text-lg font-bold leading-tight">Mira {"<3"}</h4>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <p className="text-sm font-semibold text-gray-600">
              Score: {score.current}
            </p>
          </div>

          {/* Konten utama */}
          <div className="relative w-full px-4 flex-1 overflow-y-auto">
            <div className="flex justify-between mb-8 mt-3 w-full text-sm sm:text-base opacity-70">
              <p>Mood Level: {wordCount}</p>
              <p>Best: {highScore}</p>
            </div>

            {/* Avatar */}
            <div className="flex items-start gap-3 mb-2 bg-transparent w-full">
              <div className="flex flex-col items-start w-full">
                <div className="relative shadow-xs flex items-center w-90 justify-center">
                  {renderAvatar()}
                </div>
              </div>
            </div>

            {/* Kata target */}
            <div className="flex items-start gap-3 bg-transparent w-full mb-3">
              <div className="flex flex-col items-start">
                <div className="bg-white/80 text-black shadow-xs px-4 py-2 sm:px-5 sm:py-3 rounded-2xl rounded-tl-none max-w-[100%] text-base sm:text-2xl whitespace-pre-wrap">
                  {word}
                </div>
              </div>
            </div>

            {/* Input echo */}
            <div className="flex flex-col items-end w-full">
              <div className="shadow-xs bg-green-200 placeholder:text-gray-500 text-black text-lg sm:text-2xl px-4 sm:px-5 py-2 sm:py-3 rounded-2xl rounded-tr-none focus:outline-none">
                {input || "your response"}{" "}
              </div>
            </div>
          </div>

          {/* Input utama */}
          <div className="w-full z-10 p-3 backdrop-blur-sm">
            <input
              type="text"
              value={input}
              onChange={handleValue}
              disabled={timeLeft === 0 || showLevelUp}
              placeholder={timeLeft === 0 ? "Game Over..." : "Your Response"}
              className="w-full bg-white px-6 placeholder:text-gray-500 text-black text-lg sm:text-2xl py-2 sm:py-3 rounded-full shadow-sm focus:outline-none focus:inset-shadow-xs transition-all"
            />
          </div>
        </main>

        {showLevelUp && (
          <ChatUI
            chatMessages={chatMessages}
            chatIndex={chatIndex}
            currentLevel={currentLevel}
            levelChats={storyLevels}
            handleNextLevel={handleNextLevel}
            handleSkip={handleSkip}
          />
        )}
        {timeLeft === 0 && (
          <>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#2c0101]/80 text-center font-minecraft text-white select-none">
              <h2 className="text-6xl sm:text-7xl font-bold text-[#ff5555] drop-shadow-[0_0_10px_#ff0000] mb-3 animate-pulse">
                YOU DIED
              </h2>
              <p className="text-xl sm:text-3xl mb-4 text-gray-200">
                {endMessage}
              </p>

              <div className="text-lg font-bold space-y-1 mb-6">
                <p>
                  Skor kamu:{" "}
                  <span className="text-yellow-400">{score.current}</span>
                </p>
                <p>
                  Highscore: <span className="text-green-400">{highScore}</span>
                </p>
                <p>
                  WPM: <span className="text-blue-400">{wpm}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#7a3d3d] hover:bg-[#9e4d4d] active:bg-[#5c2c2c] text-white px-8 py-3 rounded-md border-4 border-[#3c1c1c] font-bold shadow-[0_4px_0_#3c1c1c] transition-all duration-200 hover:scale-105"
                >
                  Respawn
                </button>
                <button
                  onClick={() =>
                    open("https://www.youtube.com/watch?v=l5ZYKdul6dI")
                  }
                  className="bg-gray-500 hover:bg-gray-400 active:bg-[#5c2c2c] text-white px-8 py-3 rounded-md border-4 border-[#3c1c1c] font-bold shadow-[0_4px_0_#3c1c1c] transition-all duration-200 hover:scale-105"
                >
                  Quit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="w-full bg-white border-t z-20 border-black py-10 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          Try{" "}
          <a
            href="/training"
            className="inline-block bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 hover:scale-105 active:scale-95 transition-transform duration-200 shadow-sm"
          >
            Training Mode
          </a>
        </h1>

        <p className="text-gray-500 mt-3 text-base sm:text-lg">
          Latih refleks dan kecepatanmu sebelum melawan dunia nyata 💪
        </p>
      </div>
      <div
        className="w-full bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 border-t inset-0 z-50 flex flex-col items-center justify-center
    px-6 py-10 text-gray-800 overflow-y-auto animate-fadein"
      >
        <div className="max-w-[700px] bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 sm:p-8 text-left">
          <h3 className="text-xl sm:text-3xl font-bold text-pink-600 mb-3">
            🌸 Synopsis
          </h3>
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
            You play as a boy born into a wealthy family — the son of a
            world-famous fashion designer. After your mother’s passing, your
            life has been nothing but rules, schedules, and the spotlight.
            You’ve never gone to a normal school, never had real friends — until
            now.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3 text-base sm:text-lg">
            At 15, after a heated argument with your father, you finally earn
            permission to attend a public high school. But there’s a catch — you
            must still obey all his wishes and maintain your image as a “perfect
            model.”
          </p>
          <p className="text-gray-700 leading-relaxed mt-3 text-base sm:text-lg">
            At first, school life feels strange and distant. Yet slowly, you
            begin to feel warmth you’ve never known before: laughter,
            friendship, and a girl named <strong>Mira</strong>, who sees you for
            who you truly are — not the designer’s son, but <em>you</em>.
          </p>
        </div>

        <div className="max-w-[700px] mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 sm:p-8 text-left">
          <h3 className="text-xl sm:text-3xl font-bold text-pink-600 mb-3">
            🕹️ How to Play
          </h3>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed text-base sm:text-lg space-y-2">
            <li>
              Tulis kata pertama yang diucap <strong>Mahiru</strong> untuk
              memulai permainan.
            </li>
            <li>
              Ketik kata yang muncul di layar secepat mungkin untuk mendapatkan
              skor.
            </li>
            <li>
              Setiap kata benar akan menambah skor dan mengganti kata baru.
            </li>
            <li>Waktu terbatas! Ketika timer habis, permainan berakhir.</li>
            <li>
              Setiap kelipatan skor <strong>300</strong> akan memunculkan lore
              ceritanya dan pilihan untuk lanjut ke level berikutnya dengan
              lebih banyak kata!
            </li>
          </ul>
        </div>
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-extrabold my-6 drop-shadow">
          Multiverse {">"} Paperline: Fantastic Four
        </h2>

        {/* Team Photo */}
        <div className="flex justify-center w-full mb-8 z-10 group">
          <img
            src="/tim.png"
            alt="Our Team"
            className="w-full max-w-[700px] rounded-xl transition-all duration-700 ease-in-out blur-lg group-hover:blur-none group-hover:scale-105 group-hover:rotate-1"
          />
        </div>

        {/* Team Members */}
        <div className="text-base sm:text-lg md:text-xl space-y-3 bg-white/70 backdrop-blur-md px-6 py-6 rounded-2xl shadow-lg max-w-[700px] w-full">
          <p>
            <strong className="text-pink-600">Aqila Raya Syifa</strong> — 🎨{" "}
            <span className="font-medium">Illustrator</span>
          </p>
          <p>
            <strong className="text-pink-600">Afwa Cantika</strong> — 🎵{" "}
            <span className="font-medium">Music Composer</span>
          </p>
          <p>
            <strong className="text-pink-600">
              Cinta Elona Gabena Nainggolan
            </strong>{" "}
            — ✍️ <span className="font-medium">Story Writer</span>
          </p>
          <hr className="border-gray-300" />
          <p>
            <strong className="text-green-600">M. Fathin Halim</strong> — 💻{" "}
            <span className="font-medium">Programmer</span>
          </p>
        </div>

        <p className="my-6 text-gray-600 italic text-sm sm:text-base">
          SMAN 1 Rejang Lebong — Angkatan 28
        </p>
      </div>
    </>
  );
}
