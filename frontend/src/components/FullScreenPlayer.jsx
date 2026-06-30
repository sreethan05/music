import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Headphones, Sparkles, Clock, Trash2, ListMusic, Music } from "lucide-react";

// Real-time timed lyrics repository
const getLyricsForSong = (songName) => {
  const nameLower = (songName || "").toLowerCase();
  
  if (nameLower.includes("kesariya")) {
    return [
      { time: 0, text: "(Instrumental intro)" },
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
      { time: 0, text: "(Marimba intro)" },
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
      { time: 0, text: "(Soulful acoustic guitar)" },
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
    { time: 0, text: "(Intro) Let the sounds wash over you..." },
    { time: 7, text: "Close your eyes and let the rhythm guide your mind." },
    { time: 14, text: "Feel the soft warmth of the frequencies." },
    { time: 21, text: "Every chord plays a story in the quiet." },
    { time: 28, text: "We drift away under the neon lights." },
    { time: 35, text: "Listening to the soundtrack of this heartbeat." },
    { time: 42, text: "No more noise, just the sound of the harmony." },
    { time: 49, text: "(Building up to the chorus)" },
    { time: 55, text: "Let this vibe flow right through your soul!" },
    { time: 62, text: "We are one with the music tonight." },
    { time: 69, text: "In this moment, let everything go..." },
    { time: 76, text: "(Instrumental bridge)" }
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
    toggleLoop,
    eqPreset,
    eqGains,
    applyEqPreset,
    changeEqGain,
    analyserRef,
    spatialPreset,
    applySpatialPreset,
    karaokeEnabled,
    toggleKaraoke,
    crossfade,
    setCrossfade,
    customLyrics,
    saveCustomLyrics,
    currentQueue,
    removeFromQueue,
    clearQueue,
    playTrackDirectly,
    sleepTimer,
    startSleepTimer
  } = useContext(PlayerContext);

  const canvasRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const animationRef = useRef(null);
  const [currentProgressTime, setCurrentProgressTime] = useState(0);
  const [activeRightTab, setActiveRightTab] = useState("lyrics"); // "lyrics", "equalizer", "queue", "dsp", "editor"

  // Lyrics Sync Editor States
  const [editorText, setEditorText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editorLines, setEditorLines] = useState([]);
  const [syncedLinesList, setSyncedLinesList] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  // Keyboard spacebar listener for stamping lyrics in sync editor mode
  useEffect(() => {
    if (!isSyncing) return;
    const handleKeyDown = (e) => {
      if (e.code === "Space" && activeRightTab === "editor") {
        e.preventDefault();
        // Stamp current line
        if (currentLineIdx < editorLines.length && audioRef.current) {
          const stampTime = audioRef.current.currentTime;
          const newLine = { time: Math.floor(stampTime), text: editorLines[currentLineIdx] };
          setSyncedLinesList(prev => [...prev, newLine]);
          setCurrentLineIdx(idx => idx + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSyncing, currentLineIdx, editorLines, activeRightTab, audioRef]);

  // Read custom lyrics if available, otherwise fall back to timed lyrics repository
  const lyrics = (customLyrics && customLyrics[currentSong?._id]) || getLyricsForSong(currentSong?.name);

  // Synchronize canvas visualizer and lyrics highlight via high-frequency requestAnimationFrame
  useEffect(() => {
    if (!isFullScreen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 140);

    // Setup background ambient particles
    const particles = [];
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 1.2,
        speedX: (Math.random() * 0.4 - 0.2),
        speedY: -(Math.random() * 0.4 + 0.15),
        alpha: Math.random() * 0.45 + 0.15
      });
    }

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 140;
      // Re-normalize particle positions on window resize
      particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    };
    window.addEventListener("resize", handleResize);

    // Setup audio analyser buffer
    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 0;
    const dataArray = bufferLength ? new Uint8Array(bufferLength) : null;

    // Wave parameters
    let waveOffset = 0;
    const waves = [
      { speed: 0.08, amplitude: 22, frequency: 0.015 },
      { speed: 0.06, amplitude: 16, frequency: 0.022 },
      { speed: 0.04, amplitude: 12, frequency: 0.012 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Track playback time safely
      if (audioRef.current) {
        setCurrentProgressTime(audioRef.current.currentTime || 0);
      }

      // Get real-time audio frequency data if available
      let averageVolume = 0;
      let bassVolume = 0;
      let trebleVolume = 0;

      if (analyserRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let bassSum = 0;
        let trebleSum = 0;
        let bassCount = 0;
        let trebleCount = 0;

        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          sum += value;

          if (i < bufferLength * 0.2) {
            bassSum += value;
            bassCount++;
          } else if (i > bufferLength * 0.7) {
            trebleSum += value;
            trebleCount++;
          }
        }

        averageVolume = sum / bufferLength;
        bassVolume = bassCount > 0 ? bassSum / bassCount : 0;
        trebleVolume = trebleCount > 0 ? trebleSum / trebleCount : 0;
      }

      const normAvg = averageVolume / 255;
      const normBass = bassVolume / 255;
      const normTreble = trebleVolume / 255;

      // Extract current song theme color or use default blue
      const activeThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--song-theme-color').trim() || "0, 136, 255";

      // Render ambient reactive background particles
      particles.forEach(p => {
        // Bass volume increases size and speed dynamically
        const activeRadius = p.radius * (1.0 + normBass * 1.5);
        const activeSpeedY = p.speedY * (1.0 + normBass * 2.2);

        p.x += p.speedX;
        p.y += activeSpeedY;

        // Reset if particles go off top or sides
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) {
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        const activeAlpha = Math.min(1.0, p.alpha * (0.8 + normBass * 0.4));
        ctx.fillStyle = `rgba(${activeThemeColor}, ${activeAlpha})`;
        ctx.arc(p.x, p.y, activeRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dynamically compute wave colors based on the theme color and volume
      const waveColors = [
        `rgba(${activeThemeColor}, ${0.45 + normBass * 0.3})`,
        `rgba(139, 92, 246, ${0.35 + normAvg * 0.3})`,
        `rgba(6, 182, 212, ${0.25 + normTreble * 0.3})`
      ];

      // If playing, advance waves, otherwise slowly settle them down to rest
      if (playStatus) {
        waveOffset += 0.05 + normAvg * 0.15;
        
        const osc1 = Math.sin(waveOffset * 0.5) * 6;
        const osc2 = Math.cos(waveOffset * 0.4) * 5;
        const osc3 = Math.sin(waveOffset * 0.6) * 4;

        waves[0].amplitude = (18 + osc1) + normBass * 45;
        waves[1].amplitude = (14 + osc2) + normAvg * 35;
        waves[2].amplitude = (10 + osc3) + normTreble * 25;

        waves[0].frequency = 0.015 + normBass * 0.01;
        waves[1].frequency = 0.022 + normAvg * 0.01;
        waves[2].frequency = 0.012 + normTreble * 0.01;
      } else {
        // Slowly damp waves when paused
        waves.forEach(w => {
          w.amplitude = Math.max(0.2, w.amplitude * 0.95);
        });
      }

      // Draw each overlapping wave
      waves.forEach((wave, idx) => {
        ctx.beginPath();
        const color = waveColors[idx];
        ctx.strokeStyle = color;
        ctx.lineWidth = wave === waves[0] ? (3.5 + normBass * 3) : (2 + normAvg * 2);
        ctx.shadowBlur = wave === waves[0] ? (8 + normBass * 15) : 0;
        ctx.shadowColor = color;

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
  }, [isFullScreen, playStatus, audioRef, analyserRef]);

  // Optimized binary search for active lyric index
  let activeLyricIdx = -1;
  if (lyrics && lyrics.length > 0) {
    let low = 0;
    let high = lyrics.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lyrics[mid].time <= currentProgressTime) {
        activeLyricIdx = mid;
        low = mid + 1; // Try to find a later match
      } else {
        high = mid - 1;
      }
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
      {/* Blurred cover backdrop */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden scale-105">
        <img 
          src={currentSong.image} 
          alt={currentSong.name} 
          className="absolute inset-0 w-full h-full object-cover filter blur-[80px] opacity-[0.26] scale-110 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,9,11,0.92),rgba(9,9,11,0.72)_45%,rgba(9,9,11,0.94))]" />
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

        {/* Right Column: Scrollable Synced Lyrics, Equalizer, Queue, Enhancer, & Editor */}
        <div className="flex flex-col h-full overflow-hidden w-full lg:pl-6 max-h-[55vh] lg:max-h-[72vh] rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md p-6 relative">
          
          {/* Tab Selector Header */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-3.5 border-b border-white/5 mb-3.5 select-none relative z-10">
            {[
              { id: "lyrics", name: "Lyrics" },
              { id: "equalizer", name: "Equalizer" },
              { id: "queue", name: "Queue" },
              { id: "dsp", name: "Enhancer" },
              { id: "editor", name: "Sync" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveRightTab(t.id)}
                className={`text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeRightTab === t.id
                    ? "text-black bg-cyan-400 font-extrabold shadow-md shadow-cyan-400/20"
                    : "text-zinc-400 bg-white/[0.02] border border-white/5 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {activeRightTab === "lyrics" && (
            lyrics.length === 0 || lyrics[0]?.text.includes("Let the sounds wash") ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8 relative z-10">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">No timed lyrics loaded for this track</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[240px] mx-auto">Be the first to create synced lyrics with our real-time editor!</p>
                </div>
                <button
                  onClick={() => setActiveRightTab("editor")}
                  className="px-4 py-2 bg-cyan-400 text-black font-extrabold text-xs rounded-xl shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Open Sync Editor
                </button>
              </div>
            ) : (
              <div 
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto no-scrollbar py-[200px] flex flex-col gap-6 scroll-smooth relative z-10"
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
            )
          )}

          {activeRightTab === "equalizer" && (
            <div className="flex-1 flex flex-col justify-between py-2 overflow-y-auto no-scrollbar relative z-10">
              {/* Sliders Container */}
              <div className="flex justify-around items-center py-6 px-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                {[
                  { label: "60Hz", name: "Bass" },
                  { label: "230Hz", name: "Low-Mid" },
                  { label: "910Hz", name: "Mid" },
                  { label: "4kHz", name: "High-Mid" },
                  { label: "14kHz", name: "Treble" }
                ].map((band, idx) => {
                  const gainValue = eqGains[idx] !== undefined ? eqGains[idx] : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3">
                      <span className="text-[10px] text-zinc-400 font-extrabold bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 min-w-[32px] text-center font-mono">
                        {gainValue > 0 ? `+${gainValue}` : gainValue}
                      </span>
                      <div className="h-36 flex items-center justify-center relative">
                        {/* Vertical track line for style */}
                        <div className="absolute top-0 bottom-0 w-[2px] bg-zinc-800 rounded-full pointer-events-none" />
                        <input 
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={gainValue}
                          onChange={(e) => changeEqGain(idx, e.target.value)}
                          style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                          className="h-32 w-4 relative z-10 bg-transparent appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-white font-extrabold">{band.label}</span>
                        <span className="text-[9px] text-zinc-500 font-semibold">{band.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Presets Grid */}
              <div className="mt-5">
                <h5 className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-3">Equalizer Presets</h5>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "flat", name: "Flat" },
                    { id: "bassBoost", name: "Bass Boost" },
                    { id: "vocalBoost", name: "Vocal Boost" },
                    { id: "trebleBoost", name: "Treble Boost" },
                    { id: "electronic", name: "Electronic" },
                    { id: "classical", name: "Classical" }
                  ].map((preset) => {
                    const isActive = eqPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyEqPreset(preset.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer text-center ${
                          isActive
                            ? "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20 font-black"
                            : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === "queue" && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar py-2 relative z-10">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Tracks in Queue ({currentQueue?.length || 0})</span>
                {currentQueue?.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-[9px] uppercase font-black tracking-widest text-rose-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {(!currentQueue || currentQueue.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-3">
                  <ListMusic className="w-10 h-10 text-zinc-600 animate-pulse" />
                  <p className="text-xs font-bold">Queue is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar flex-1 max-h-[42vh]">
                  {currentQueue.map((song, idx) => {
                    const isCurrent = currentSong?._id === song._id;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? "bg-cyan-500/10 border-cyan-500/30"
                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div
                          onClick={() => playTrackDirectly(song, currentQueue)}
                          className="flex items-center gap-3 flex-1 cursor-pointer truncate"
                        >
                          <img src={song.image} className="w-9 h-9 rounded-lg object-cover" />
                          <div className="truncate">
                            <p className={`text-xs font-bold truncate ${isCurrent ? "text-cyan-400 font-black" : "text-white"}`}>{song.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{song.desc || "Unknown Artist"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-bold font-mono">{song.duration || "3:00"}</span>
                          <button
                            onClick={() => removeFromQueue(song._id)}
                            className="p-1 hover:text-rose-500 transition-colors text-zinc-600 cursor-pointer"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeRightTab === "dsp" && (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar py-2 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Audio Enhancer Settings</span>
              
              {/* Karaoke Toggle */}
              <div className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Karaoke Vocal Remover</span>
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Cancels center-mixed lead vocals in real-time</p>
                </div>
                <button
                  onClick={toggleKaraoke}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                    karaokeEnabled
                      ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20 font-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {karaokeEnabled ? "On" : "Off"}
                </button>
              </div>

              {/* Spatial Audio Presets */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Acoustic Environments</span>
                </span>
                <p className="text-[9px] text-zinc-500 mb-1">Synthesizes convolutional space acoustics</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "none", name: "Studio" },
                    { id: "concert", name: "Concert Hall" },
                    { id: "cathedral", name: "Cathedral" },
                    { id: "cave", name: "Cave" },
                    { id: "club", name: "Dance Club" },
                    { id: "bathroom", name: "Bathroom" }
                  ].map((env) => {
                    const isActive = spatialPreset === env.id;
                    return (
                      <button
                        key={env.id}
                        onClick={() => applySpatialPreset(env.id)}
                        className={`py-2 px-1 text-[9px] font-bold rounded-xl border text-center transition-all cursor-pointer truncate ${
                          isActive
                            ? "bg-cyan-500 border-cyan-400 text-black font-black shadow"
                            : "bg-white/[0.01] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        {env.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crossfade Slider */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Crossfade Transition</span>
                  </span>
                  <span className="text-xs text-cyan-400 font-extrabold font-mono">{crossfade}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={crossfade}
                  onChange={(e) => setCrossfade(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:bg-zinc-700 transition-all"
                />
                <span className="text-[8px] text-zinc-500">Crossfade overlap duration between song changes</span>
              </div>

              {/* Sleep Timer Preset */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sleep Timer Dials</span>
                  </span>
                  {sleepTimer !== null && (
                    <span className="text-[11px] text-rose-500 font-black animate-pulse font-mono">
                      {Math.floor(sleepTimer / 60)}:{(sleepTimer % 60).toString().padStart(2, '0')} left
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1 mt-1">
                  {[
                    { val: 0, label: "Off" },
                    { val: 5, label: "5m" },
                    { val: 15, label: "15m" },
                    { val: 30, label: "30m" },
                    { val: 45, label: "45m" },
                    { val: 60, label: "60m" }
                  ].map((t) => {
                    const isActive = t.val === 0 ? sleepTimer === null : (sleepTimer !== null && Math.ceil(sleepTimer / 60) === t.val);
                    return (
                      <button
                        key={t.val}
                        onClick={() => startSleepTimer(t.val === 0 ? null : t.val)}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-rose-500 border-rose-400 text-white font-extrabold shadow shadow-rose-500/20"
                            : "bg-white/[0.01] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === "editor" && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar py-2 relative z-10">
              {!isSyncing ? (
                <div className="flex-1 flex flex-col gap-2.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Lyrics Sync Editor</span>
                  <p className="text-[9px] text-zinc-400">Paste raw lyrics below. Play the song, then stamp the timing of each line in real-time.</p>
                  <textarea
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    placeholder="Paste lyrics line by line here...&#10;First line of the song&#10;Second line of the song"
                    className="flex-1 min-h-[140px] p-3 rounded-2xl bg-zinc-950/80 border border-white/5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-cyan-400 resize-none font-medium"
                  />
                  <button
                    onClick={() => {
                      const lines = editorText.split("\n").map(l => l.trim()).filter(l => l !== "");
                      if (lines.length === 0) return;
                      setEditorLines(lines);
                      setSyncedLinesList([]);
                      setCurrentLineIdx(0);
                      setIsSyncing(true);
                    }}
                    disabled={editorText.trim() === ""}
                    className="w-full py-2.5 bg-cyan-400 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Start Synchronizing
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">Syncing: {currentLineIdx} / {editorLines.length} lines</span>
                    <button
                      onClick={() => setIsSyncing(false)}
                      className="text-[9px] font-black uppercase text-zinc-500 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {currentLineIdx < editorLines.length ? (
                    <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col gap-3 items-center text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Next Line to Stamp:</span>
                      <p className="text-sm font-black text-white px-2 leading-relaxed">"{editorLines[currentLineIdx]}"</p>
                      
                      <div className="flex flex-col w-full gap-2 mt-2">
                        <button
                          onClick={() => {
                            const stampTime = audioRef.current ? audioRef.current.currentTime : 0;
                            const newLine = { time: Math.floor(stampTime), text: editorLines[currentLineIdx] };
                            setSyncedLinesList(prev => [...prev, newLine]);
                            setCurrentLineIdx(idx => idx + 1);
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-sky-500 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                        >
                          Stamp Now (Spacebar)
                        </button>
                        <span className="text-[8px] text-zinc-500">Stamps current time: {Math.floor(currentProgressTime)}s</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-2 items-center text-center">
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
                      <p className="text-xs font-black text-white">All lines successfully stamped!</p>
                      <p className="text-[9px] text-zinc-500">Ready to save and inject into the player.</p>
                    </div>
                  )}

                  {/* Sync List Scrollable */}
                  <div className="flex-1 overflow-y-auto max-h-[16vh] bg-zinc-950/60 rounded-xl p-2.5 border border-white/5 flex flex-col gap-1.5 no-scrollbar">
                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-1">Stamped Timeline</span>
                    {syncedLinesList.length === 0 ? (
                      <span className="text-[9px] text-zinc-600 font-bold italic py-2 text-center">No lines stamped yet</span>
                    ) : (
                      syncedLinesList.map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] bg-white/[0.01] px-2 py-1 rounded border border-white/5 font-semibold">
                          <span className="text-zinc-300 truncate pr-2">"{line.text}"</span>
                          <span className="text-cyan-400 font-extrabold shrink-0 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900/30 font-mono">
                            {Math.floor(line.time / 60)}:{(line.time % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => {
                        if (syncedLinesList.length > 0) {
                          saveCustomLyrics(currentSong._id, syncedLinesList);
                          setIsSyncing(false);
                          setActiveRightTab("lyrics");
                        }
                      }}
                      disabled={syncedLinesList.length === 0}
                      className="flex-1 py-2.5 bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Save & Apply Lyrics
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-5 border border-white/10 rounded-t-2xl bg-zinc-950/90 backdrop-blur-2xl flex flex-col gap-4.5 select-none shadow-[0_-15px_45px_rgba(0,0,0,0.8)] pb-7">
        
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

