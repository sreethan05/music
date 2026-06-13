import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from "lucide-react";

// Real-time timed lyrics repository
const getLyricsForSong = (songName) => {
  const nameLower = (songName || "").toLowerCase();
  
  if (nameLower.includes("kesariya")) {
    return [
      { time: 0, text: "🎵 (Instrumental Intro) 🎵" },
      { time: 6, text: "Mujhko itna bataaye koi" },
      { time: 11, text: "Kaise tujhse dil na lagaaye koi" },
      { time: 16, text: "Rabba ne tujhko banaane mein" },
      { time: 20, text: "Kardi hai husn ki khaali tijoriyaan" },
      { time: 25, text: "Kajal ki siyaahi se likhi hai tune" },
      { time: 30, text: "Jaane kitno ki taqdeerein" },
      { time: 34, text: "Kesariya tera ishq hai piya" },
      { time: 39, text: "Rang jaaun jo main haath lagaaun" },
      { time: 43, text: "Din beete saara teri fikr mein" },
      { time: 48, text: "Rain saari teri khair manaaye" },
      { time: 52, text: "Kesariya tera ishq hai piya..." }
    ];
  }
  
  if (nameLower.includes("shape of you")) {
    return [
      { time: 0, text: "🎵 (Marimba intro playing) 🎵" },
      { time: 5, text: "The club isn't the best place to find a lover" },
      { time: 9, text: "So the bar is where I go" },
      { time: 12, text: "Me and my friends at the table doing shots" },
      { time: 15, text: "Drinking fast and then we talk slow" },
      { time: 19, text: "Come over and start up a conversation with just me" },
      { time: 22, text: "And trust me I'll give it a chance" },
      { time: 25, text: "Grab on my waist, put that body on me" },
      { time: 28, text: "Come on now, follow my lead" },
      { time: 30, text: "I'm in love with the shape of you" },
      { time: 34, text: "We push and pull like a magnet do" },
      { time: 38, text: "Although my heart is falling too" },
      { time: 41, text: "I'm in love with your body" },
      { time: 45, text: "Last night you were in my room" },
      { time: 49, text: "And now my bedsheets smell like you" },
      { time: 52, text: "Every day discovering something brand new" }
    ];
  }
  
  if (nameLower.includes("naa madhi")) {
    return [
      { time: 0, text: "🎵 (Soulful acoustic guitar) 🎵" },
      { time: 8, text: "Naa madhi ninnu pilichina sangathi" },
      { time: 12, text: "Theliyadhuga neeku nela thalli maata" },
      { time: 16, text: "Alalapai rase snehamidhi" },
      { time: 20, text: "Karigiponi rangu bommidhi" },
      { time: 25, text: "Nuvvu nenu kalisi unte chaalu" },
      { time: 29, text: "Lokamantha manadhe anipisthundhi" },
      { time: 34, text: "Naa chitti gunde ninnu chusi nundi" },
      { time: 38, text: "Ettago undhi eppudu lenidhi..." }
    ];
  }
  
  // Default Procedural Lyrics
  return [
    { time: 0, text: "🎵 (Intro) Let the sounds wash over you... 🎵" },
    { time: 7, text: "Close your eyes and let the rhythm guide your mind." },
    { time: 14, text: "Feel the soft warmth of the frequencies." },
    { time: 21, text: "Every chord plays a story in the quiet." },
    { time: 28, text: "We drift away under the neon lights." },
    { time: 35, text: "Listening to the soundtrack of this heartbeat." },
    { time: 42, text: "No more noise, just the sound of the harmony." },
    { time: 49, text: "✨ (Building up to the chorus) ✨" },
    { time: 55, text: "Let this vibe flow right through your soul!" },
    { time: 62, text: "We are one with the music tonight." },
    { time: 69, text: "In this moment, let everything go..." },
    { time: 76, text: "🎵 (Instrumental Bridge) 🎵" }
  ];
};

const FullScreenPlayer = () => {
  const {
    audioRef,
    currentSong,
    playStatus,
    togglePlay,
    next,
    previous,
    isFullScreen,
    setIsFullScreen,
    volume,
    isMuted,
    changeVolume,
    toggleMute,
    isShuffle,
    isLoop,
    toggleShuffle,
    toggleLoop
  } = useContext(PlayerContext);

  const canvasRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const animationRef = useRef(null);
  const [currentProgressTime, setCurrentProgressTime] = useState(0);

  const lyrics = getLyricsForSong(currentSong?.name);

  // Synchronize canvas visualizer and lyrics highlight via high-frequency requestAnimationFrame
  useEffect(() => {
    if (!isFullScreen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 140);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 140;
    };
    window.addEventListener("resize", handleResize);

    // Wave parameters
    let waveOffset = 0;
    const waves = [
      { speed: 0.08, amplitude: 22, frequency: 0.015, color: "rgba(0, 136, 255, 0.45)" }, // Blue
      { speed: 0.06, amplitude: 16, frequency: 0.022, color: "rgba(139, 92, 246, 0.35)" }, // Purple
      { speed: 0.04, amplitude: 12, frequency: 0.012, color: "rgba(0, 210, 255, 0.25)" }  // Cyan
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Track playback time safely
      if (audioRef.current) {
        setCurrentProgressTime(audioRef.current.currentTime || 0);
      }

      // If playing, advance waves, otherwise slowly settle them down to rest
      if (playStatus) {
        waveOffset += 0.05;
        waves[0].amplitude = Math.sin(waveOffset * 0.5) * 6 + 18;
        waves[1].amplitude = Math.cos(waveOffset * 0.4) * 5 + 14;
        waves[2].amplitude = Math.sin(waveOffset * 0.6) * 4 + 10;
      } else {
        // Slowly damp waves when paused
        waves.forEach(w => {
          w.amplitude = Math.max(0.2, w.amplitude * 0.95);
        });
      }

      // Draw each overlapping wave
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave === waves[0] ? 3.5 : 2;
        ctx.shadowBlur = wave === waves[0] ? 8 : 0;
        ctx.shadowColor = wave.color;

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin(x * wave.frequency + waveOffset * wave.speed) *
              wave.amplitude *
              Math.sin((x / width) * Math.PI); // Pin the edges of the wave to the sides
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFullScreen, playStatus, audioRef]);

  // Find active lyric index
  let activeLyricIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentProgressTime >= lyrics[i].time) {
      activeLyricIdx = i;
    } else {
      break;
    }
  }

  // Smoothly center the active lyric line in the container
  useEffect(() => {
    if (lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector(
        `[data-lyric-idx="${activeLyricIdx}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }
    }
  }, [activeLyricIdx]);

  if (!isFullScreen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#09090b] text-white animate-fade-in select-none overflow-hidden">
      {/* Blurred Ambient Cover Backdrop */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none scale-110">
        <img 
          src={currentSong.image} 
          alt={currentSong.name} 
          className="w-full h-full object-cover filter blur-[80px] opacity-[0.25]"
        />
        <div className="absolute inset-0 bg-[#09090b]/80" />
      </div>

      {/* Top Header Panel */}
      <div className="relative z-10 w-full flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-[11px] shadow">
            {currentSong.name[0].toUpperCase()}
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide">Playing from Library</h4>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{currentSong.album || "Single"}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsFullScreen(false)}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 hover:border-white/10 transition-all active:scale-95 cursor-pointer shadow-inner"
        >
          <X className="w-4.5 h-4.5 text-zinc-300" />
        </button>
      </div>

      {/* Central Screen Grid */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-8 lg:px-12 py-6 overflow-hidden">
        
        {/* Left Column: spinning vinyl & audio visualizer */}
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full gap-7 lg:pr-6">
          {/* Glowing spinning vinyl cover */}
          <div className="relative group select-none">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 opacity-20 filter blur-3xl group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
            
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[10px] border-zinc-900 bg-zinc-950 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden ring-1 ring-white/10">
              <div 
                className={`w-full h-full rounded-full transition-transform ease-linear duration-1000 ${
                  playStatus ? "animate-[spin_20s_linear_infinite]" : "rotate-0"
                }`}
                style={{
                  backgroundImage: `url(${currentSong.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />
              {/* Central Vinyl Hole label */}
              <div className="absolute w-12 h-12 rounded-full bg-zinc-950 border-[4px] border-zinc-900 shadow-inner flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-black/60 shadow" />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-center select-none w-full max-w-sm mt-3.5">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white line-clamp-1 glow-text">
              {currentSong.name}
            </h2>
            <p className="text-xs text-amber-500 font-extrabold tracking-wide mt-1 truncate">
              {currentSong.desc || "Unknown Artist"}
            </p>
          </div>

          {/* Audio Visualizer Canvas */}
          <div className="w-full relative mt-1 border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden backdrop-blur-sm">
            <canvas ref={canvasRef} className="w-full h-[140px] block" />
            <div className="absolute top-3 left-4 text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${playStatus ? "bg-cyan-400 animate-pulse" : "bg-zinc-600"}`} />
              <span>Real-Time Waveform</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Synced Lyrics */}
        <div className="flex flex-col h-full overflow-hidden w-full lg:pl-6 max-h-[55vh] lg:max-h-[72vh] rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md p-6 relative">
          <div className="absolute top-4 left-6 text-[10px] uppercase font-black tracking-widest text-zinc-400 select-none flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-zinc-800 border border-white/10 flex items-center justify-center font-extrabold text-[8px] text-spotify-green">L</span>
            <span>Lyrics Synced</span>
          </div>

          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar py-[220px] flex flex-col gap-6 scroll-smooth"
          >
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIdx;
              
              return (
                <p 
                  key={idx}
                  data-lyric-idx={idx}
                  className={`text-base md:text-lg lg:text-xl font-bold tracking-tight text-left transition-all duration-300 ${
                    isActive 
                      ? "text-cyan-400 scale-102 font-black drop-shadow-[0_0_12px_rgba(34,211,238,0.4)] opacity-100" 
                      : "text-zinc-500/80 hover:text-zinc-300 opacity-60"
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-5 border border-white/10 rounded-t-[32px] bg-zinc-950/90 backdrop-blur-2xl flex flex-col gap-4.5 select-none shadow-[0_-15px_45px_rgba(0,0,0,0.8)] pb-7">
        
        {/* Playback Controls Row */}
        <div className="flex items-center justify-between px-4">
          {/* Shuffle */}
          <button 
            onClick={toggleShuffle}
            className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isShuffle ? "text-cyan-400" : "text-zinc-500 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4.5 h-4.5" />
          </button>

          {/* Prev, Play/Pause, Next */}
          <div className="flex items-center gap-6.5">
            <button 
              onClick={previous}
              className="text-zinc-400 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-5.5 h-5.5 fill-current stroke-0" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-white/10"
              title={playStatus ? "Pause" : "Play"}
            >
              {playStatus ? (
                <Pause className="w-5 h-5 fill-current stroke-0" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5 stroke-0" />
              )}
            </button>
            <button 
              onClick={next}
              className="text-zinc-400 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-5.5 h-5.5 fill-current stroke-0" />
            </button>
          </div>

          {/* Repeat */}
          <button 
            onClick={toggleLoop}
            className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isLoop ? "text-cyan-400" : "text-zinc-500 hover:text-white"
            }`}
            title="Repeat"
          >
            <Repeat className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Volume Row */}
        <div className="flex items-center gap-4 px-4 text-zinc-500 w-full">
          <button 
            onClick={toggleMute}
            className="hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4.5 h-4.5 text-rose-500" />
            ) : (
              <Volume2 className="w-4.5 h-4.5" />
            )}
          </button>
          
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(e.target.value)}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
