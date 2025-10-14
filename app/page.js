"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
    const [word, setWord] = useState("loading...");
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isRunning, setIsRunning] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [wordCount, setWordCount] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [avatarState, setAvatarState] = useState("neutral");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatIndex, setChatIndex] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [idleTime, setIdleTime] = useState(0);
    const [endMessage, setEndMessage] = useState("");
    const [typedChars, setTypedChars] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);

    const timerRef = useRef(null);

    const playSfx = (name) => {
        const audio = new Audio(`/sfx/${name}.mp3`);
        audio.volume = 0.6;
        audio.play().catch(() => {});
    };

    const levelChats = [
        [
            { sender: "m", text: "Wahh hebat juga kamu~ 🎉" },
            { sender: "y", text: "Haha, lumayan lah!" },
            { sender: "m", text: "Kita lanjut ke ronde berikutnya, siap?" },
        ],
        [
            { sender: "m", text: "Keren banget, kamu masih lanjut?" },
            { sender: "y", text: "Tentu aja, aku belum mau kalah!" },
            { sender: "m", text: "Hehehe~ semangat ya 💪" },
        ],
        [
            { sender: "m", text: "Aku gak nyangka kamu sejauh ini!" },
            { sender: "y", text: "Karena ada kamu yang nyemangatin 😏" },
            { sender: "m", text: "Huh, dasar kamu! >///<" },
        ],
    ];

    const getWord = async () => {
        const res = await fetch(`https://random-word-api.herokuapp.com/word?number=${wordCount}`);
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
        setTypedChars((prev) => prev + 1);
        if (!startTime && value.length > 0) setStartTime(Date.now());

        if (!isRunning && score === 0 && value.length > 0) {
            setIsRunning(true);
            setAvatarState("neutral");
        }

        if (value.trim() === word.trim()) {
            const newScore = score + 15;
            const maxTime = getMaxTime(newScore);

            setInput("");
            setScore(newScore);
            playSfx("shine");
            setAvatarState("happy");
            setTimeout(() => setAvatarState("neutral"), 500);

            if (newScore % 300 === 0) {
                setShowLevelUp(true);
                setIsRunning(false);
                clearInterval(timerRef.current);
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
        if (isRunning) {
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
                        if (score > savedHighScore) {
                            setEndMessage("😏 Boleh juga ngalahin highscore... tapi tetep aja MATI 💀");
                            localStorage.setItem("highscore", score);
                        } else {
                            setEndMessage("😜 CUPU! highscore aja kagak bisa dikalahin!");
                        }
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setIdleTime((prev) => (input === "" ? prev + 0.1 : 0));
        }, 150);
        return () => clearInterval(interval);
    }, [isRunning, input]);

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
        setChatMessages([]);
        setChatIndex(0);
        setCurrentLevel((prev) => (prev + 1) % levelChats.length);
    };

    const renderAvatar = () => {
        switch (avatarState) {
            case "happy":
                return <img className='h-[85%] object-contain' src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/7.webp' />;
            case "dead":
                return <img className='h-[85%] object-contain' src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/4.webp' />;
            default:
                return <img className='h-[85%] object-contain' src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/1.webp' />;
        }
    };

    useEffect(() => {
        if (showLevelUp && chatIndex < levelChats[currentLevel].length) {
            const timer = setTimeout(() => {
                setChatMessages((prev) => [...prev, levelChats[currentLevel][chatIndex]]);
                setChatIndex((prev) => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [chatIndex, showLevelUp]);

    useEffect(() => {
        const savedHighScore = parseInt(localStorage.getItem("highscore") || "0");
        setHighScore(savedHighScore);
    }, []);

    return (
        <>
            <div
                className='min-h-screen bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 flex flex-col items-center justify-center p-6 font-sans text-gray-800 transition-all'
                style={{
                    filter: `brightness(${1 - Math.min(idleTime / 10, 0.3)})`,
                }}>
                <div
                    className='absolute inset-0 transition-all duration-500 pointer-events-none'
                    style={{
                        backgroundColor: `rgba(255, 0, 0, ${Math.min(idleTime / 8, 0.4)})`,
                        mixBlendMode: "multiply",
                    }}></div>

                <div className='fixed top-0 left-0 w-full h-[6px] sm:h-[8px] bg-gray-700'>
                    <div className='h-full bg-gradient-to-r from-pink-400 to-yellow-300 transition-all duration-100' style={{ width: `${progressWidth}%` }} />
                </div>

                <main className='w-full max-w-[500px] flex flex-col gap-4 items-center text-center'>
                    <h1 className='text-4xl font-bold mb-0'>Paperline</h1>
                    <h3 className='text-2xl font-bold'>Score: {score}</h3>
                    <div className='flex justify-between w-full text-sm sm:text-base opacity-70'>
                        <p>Highscore: {highScore}</p>
                        <p>Mood Level: {wordCount}</p>

                    </div>

                    <div className='w-full aspect-video bg-white flex items-center justify-center text-black text-xl rounded-lg border'>{renderAvatar()}</div>

                    <div className='flex items-start gap-3 bg-transparent w-full'>
                        <img
                            src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp'
                            alt='Mahiru'
                            className='w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-1 bg-white shadow-md'
                        />
                        <div className='flex flex-col items-start'>
                            <span className='text-xs sm:text-sm text-gray-600 font-semibold mb-0'>Mahiru</span>
                            <div className='bg-white text-black border px-4 py-2 sm:px-5 sm:py-3 rounded-2xl rounded-tl-none shadow-sm max-w-[100%] text-base sm:text-xl font-bold whitespace-pre-wrap'>
                                {word}
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col items-end w-full'>
                        <span className='text-xs sm:text-sm text-gray-900 font-semibold mb-1'>You :3</span>
                        <input
                            placeholder={timeLeft === 0 ? "Game Over..." : "Ketik balasanmu di sini..."}
                            value={input}
                            onChange={handleValue}
                            disabled={timeLeft === 0 || showLevelUp}
                            className='w-full border-1 bg-green-200 placeholder:text-gray-500 text-black text-lg sm:text-2xl px-4 sm:px-5 py-2 sm:py-3 rounded-2xl rounded-tr-none shadow-sm focus:outline-none'
                        />
                    </div>
                </main>

                {showLevelUp && (
                    <div className='absolute inset-0 bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 bg-opacity-80 flex flex-col items-center justify-center text-center px-3'>
                        <div className='bg-[#f7f5fe] text-black w-full max-w-[500px] p-5 border'>
                            <div className='flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto'>
                                {chatMessages.map((chat, idx) => (
                                    <div key={idx} className={`flex ${chat.sender === "m" ? "items-start" : "items-end justify-end"}`}>
                                        {chat.sender === "m" && (
                                            <img
                                                src='https://cdn.cdnstep.com/5dLoh8BM9UMZAC8rc0tY/29.webp'
                                                alt='Mahiru'
                                                className='border bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2'
                                            />
                                        )}
                                        <div
                                            className={`px-3 sm:px-4 py-2 rounded-2xl border shadow-sm text-sm sm:text-lg max-w-full ${
                                                chat.sender === "m" ? "bg-gray-100 text-black rounded-tl-none" : "bg-green-300 rounded-tr-none"
                                            }`}>
                                            {chat.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {chatIndex >= levelChats[currentLevel].length && (
                                <button
                                    onClick={handleNextLevel}
                                    className='mt-3 px-5 sm:px-6 py-2 sm:py-3 bg-green-300 border hover:bg-green-600 rounded-lg font-bold w-full'>
                                    Lanjutkan Cerita
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {timeLeft === 0 && (
                    <>
                        <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#2c0101]/80 text-center font-minecraft text-white select-none'>
                            <h2 className='text-6xl sm:text-7xl font-bold text-[#ff5555] drop-shadow-[0_0_10px_#ff0000] mb-3 animate-pulse'>YOU DIED</h2>
                            <p className='text-xl sm:text-2xl mb-4 text-gray-200'>{endMessage}</p>

                            <div className='text-lg font-bold space-y-1 mb-6'>
                                <p>
                                    Skor kamu: <span className='text-yellow-400'>{score}</span>
                                </p>
                                <p>
                                    Highscore: <span className='text-green-400'>{highScore}</span>
                                </p>
                                <p>
                                    WPM: <span className='text-blue-400'>{wpm}</span>
                                </p>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4'>
                                <button
                                    onClick={() => window.location.reload()}
                                    className='bg-[#7a3d3d] hover:bg-[#9e4d4d] active:bg-[#5c2c2c] text-white px-8 py-3 rounded-md border-4 border-[#3c1c1c] font-bold shadow-[0_4px_0_#3c1c1c] transition-all duration-200 hover:scale-105'>
                                    Respawn
                                </button>
                                <button
                                    onClick={() => open("https://www.youtube.com/watch?v=l5ZYKdul6dI")}
                                    className='bg-gray-500 hover:bg-gray-400 active:bg-[#5c2c2c] text-white px-8 py-3 rounded-md border-4 border-[#3c1c1c] font-bold shadow-[0_4px_0_#3c1c1c] transition-all duration-200 hover:scale-105'>
                                    Quit
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div
                className='w-full bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 border-t inset-0 z-50 flex flex-col items-center justify-center 
    px-6 py-10 text-gray-800 overflow-y-auto animate-fadein'>
                {/* Title */}
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 drop-shadow'>Multiverse {">"} Paperline: Fantastic Four</h2>

                {/* Team Photo */}
                <div className='flex justify-center w-full mb-8'>
                    <img src='/tim.png' alt='Our Team' className='w-full max-w-[700px] transition-transform duration-500 hover:scale-105 hover:rotate-1' />
                </div>

                {/* Team Members */}
                <div className='text-base sm:text-lg md:text-xl space-y-3 bg-white/70 backdrop-blur-md px-6 py-6 rounded-2xl shadow-lg max-w-[700px] w-full'>
                    <p>
                        <strong className='text-pink-600'>Aqila Raya Syifa</strong> — 🎨 <span className='font-medium'>Illustrator</span>
                    </p>
                    <p>
                        <strong className='text-pink-600'>Afwa Cantika</strong> — 🎵 <span className='font-medium'>Music Composer</span>
                    </p>
                    <p>
                        <strong className='text-pink-600'>Cinta Elona Gabena Nainggolan</strong> — ✍️ <span className='font-medium'>Story Writer</span>
                    </p>
                    <hr className='border-gray-300' />
                    <p>
                        <strong className='text-green-600'>M. Fathin Halim</strong> — 💻 <span className='font-medium'>Programmer</span>
                    </p>
                </div>

                {/* School Info */}
                <p className='my-6 text-gray-600 italic text-sm sm:text-base'>SMAN 1 Rejang Lebong — Angkatan 28</p>

                {/* Synopsis */}
                <div className='max-w-[700px] bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 sm:p-8 text-left'>
                    <h3 className='text-xl sm:text-2xl font-bold text-pink-600 mb-3'>🌸 Synopsis</h3>
                    <p className='text-gray-700 leading-relaxed text-base sm:text-lg'>
                        You play as a boy born into a wealthy family — the son of a world-famous fashion designer. After your mother’s passing, your life has been nothing but
                        rules, schedules, and the spotlight. You’ve never gone to a normal school, never had real friends — until now.
                    </p>
                    <p className='text-gray-700 leading-relaxed mt-3 text-base sm:text-lg'>
                        At 15, after a heated argument with your father, you finally earn permission to attend a public high school. But there’s a catch — you must still obey
                        all his wishes and maintain your image as a “perfect model.”
                    </p>
                    <p className='text-gray-700 leading-relaxed mt-3 text-base sm:text-lg'>
                        At first, school life feels strange and distant. Yet slowly, you begin to feel warmth you’ve never known before: laughter, friendship, and a girl named{" "}
                        <strong>Mahiru</strong>, who sees you for who you truly are — not the designer’s son, but <em>you</em>.
                    </p>
                </div>

                {/* How to Play */}
                <div className='max-w-[700px] mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 sm:p-8 text-left'>
                    <h3 className='text-xl sm:text-2xl font-bold text-pink-600 mb-3'>🕹️ How to Play</h3>
                    <ul className='list-disc list-inside text-gray-700 leading-relaxed text-base sm:text-lg space-y-2'>
                        <li>
                            Tulis kata pertama yang diucap <strong>Mahiru</strong> untuk memulai permainan.
                        </li>
                        <li>Ketik kata yang muncul di layar secepat mungkin untuk mendapatkan skor.</li>
                        <li>Setiap kata benar akan menambah skor dan mengganti kata baru.</li>
                        <li>Waktu terbatas! Ketika timer habis, permainan berakhir.</li>
                        <li>
                            Setiap kelipatan skor <strong>300</strong> akan memunculkan lore ceritanya dan pilihan untuk lanjut ke level berikutnya dengan lebih banyak kata!
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
