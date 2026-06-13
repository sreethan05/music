import { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { 
  Heart, 
  ListMusic, 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Sliders,
  Timer,
  X,
  Check
} from "lucide-react";

const Player = () => {
  const {
    seekBarRef,
    currentSong,
    playStatus,
    volume,
    isMuted,
    isLoop,
    isShuffle,
    progress,
    time,
    togglePlay,
    next,
    previous,
    seek,
    changeVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    setIsFullScreen,
    openPlaylistModal,
    eqPreset,
    applyEqPreset,
    sleepTimer,
    startSleepTimer,
    likedSongs,
    toggleLikeSong
  } = useContext(PlayerContext);

  const [eqPopoverOpen, setEqPopoverOpen] = useState(false);
  const [timerPopoverOpen, setTimerPopoverOpen] = useState(false);

  if (!currentSong) return null;

  // Format second to display with leading zero
  const formatTime = (timeObj) => {
    if (!timeObj) return "00";
    return timeObj.second < 10 ? `0${timeObj.second}` : timeObj.second;
  };

  const formatRemainingTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  const getPresetGains = (preset) => {
    const eqPresets = {
      flat: [0, 0, 0, 0, 0],
      bassBoost: [6, 4, 0, 0, -2],
      vocalBoost: [-2, 0, 4, 3, 0],
      trebleBoost: [-3, -1, 0, 4, 6],
      electronic: [5, 2, -1, 2, 4],
      classical: [3, 2, 0, -1, -3]
    };
    return eqPresets[preset] || eqPresets.flat;
  };

  const isLiked = currentSong && likedSongs.includes(currentSong._id);

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-[24px] px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] flex items-center justify-between text-slate-800 select-none relative z-10 mt-auto">
      
      {/* Left Column Controls: Like, Add, Shuffle */}
      <div className="flex items-center gap-4.5 w-[25%] shrink-0">
        <button 
          onClick={() => toggleLikeSong(currentSong._id)}
          className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
          }`}
          title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart className={`w-4.5 h-4.5 stroke-[2.2] ${isLiked ? "fill-current" : ""}`} />
        </button>
        <button 
          onClick={() => openPlaylistModal(currentSong)}
          className="text-slate-400 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Add to Playlist"
        >
          <ListMusic className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
        <button 
          onClick={toggleShuffle}
          className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            isShuffle ? "text-amber-500" : "text-slate-400 hover:text-slate-700"
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Middle Column Controls: Prev, Play/Pause, Next, Loop, Progress Timeline */}
      <div className="flex flex-col items-center gap-2.5 flex-1 max-w-[500px] px-4">
        {/* Trigger buttons row */}
        <div className="flex items-center gap-5">
          <button 
            onClick={previous} 
            className="text-slate-400 hover:text-slate-800 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
            title="Previous"
          >
            <SkipBack className="w-4.5 h-4.5 fill-current stroke-0" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-md relative"
            title={playStatus ? "Pause" : "Play"}
          >
            {playStatus ? (
              <Pause className="w-4 h-4 fill-current stroke-0" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5 stroke-0" />
            )}
          </button>
          
          <button 
            onClick={next} 
            className="text-slate-400 hover:text-slate-800 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
            title="Next"
          >
            <SkipForward className="w-4.5 h-4.5 fill-current stroke-0" />
          </button>
          
          <button 
            onClick={toggleLoop} 
            className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isLoop ? "text-amber-500" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Repeat"
          >
            <Repeat className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>

        {/* Seek timeline row */}
        <div className="w-full flex items-center gap-3 text-[10px] font-bold tracking-tight text-slate-400 select-none">
          <span className="w-7 text-right tabular-nums">{time.currentTime.minute}:{formatTime(time.currentTime)}</span>
          <div 
            ref={seekBarRef}
            onClick={seek}
            className="flex-1 h-[3px] bg-slate-100 hover:bg-slate-200/80 rounded-full cursor-pointer relative group transition-all"
          >
            <div 
              className="h-full bg-slate-900 rounded-full relative" 
              style={{ width: `${progress}%` }}
            >
              {/* Slider thumb handle */}
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 shadow transition-opacity duration-200" />
            </div>
          </div>
          <span className="w-7 text-left tabular-nums">{time.totalTime.minute}:{formatTime(time.totalTime)}</span>
        </div>
      </div>

      {/* Right Column Controls: Volume, EQ, Sleep Timer, and Expand */}
      <div className="flex items-center gap-3.5 w-[25%] shrink-0 justify-end text-slate-400 relative">
        <button 
          onClick={toggleMute} 
          className="hover:text-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4.5 h-4.5 text-rose-500" />
          ) : (
            <Volume2 className="w-4.5 h-4.5 stroke-[2.2]" />
          )}
        </button>

        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume} 
          onChange={(e) => changeVolume(e.target.value)}
          className="w-16 md:w-20 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-800" 
          title="Volume"
        />

        {/* EQ Popover Button */}
        <button 
          onClick={() => {
            setEqPopoverOpen(!eqPopoverOpen);
            setTimerPopoverOpen(false);
          }}
          className={`hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            eqPopoverOpen ? "text-amber-500" : "hover:text-slate-850"
          }`}
          title="Equalizer Presets"
        >
          <Sliders className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {/* Sleep Timer Button */}
        <button 
          onClick={() => {
            setTimerPopoverOpen(!timerPopoverOpen);
            setEqPopoverOpen(false);
          }}
          className={`hover:scale-105 active:scale-95 transition-all cursor-pointer relative ${
            sleepTimer !== null || timerPopoverOpen ? "text-amber-500" : "hover:text-slate-850"
          }`}
          title="Sleep Timer"
        >
          <Timer className="w-4.5 h-4.5 stroke-[2.2]" />
          {sleepTimer !== null && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button 
          onClick={() => setIsFullScreen(true)}
          className="hover:text-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer hidden sm:block" 
          title="Full Screen"
        >
          <Maximize2 className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {/* EQ Popover Menu */}
        {eqPopoverOpen && (
          <div className="absolute bottom-16 right-16 w-52 p-4 rounded-2xl bg-slate-900/95 border border-white/10 text-white shadow-xl z-50 flex flex-col gap-3 animate-fade-in text-xs select-none backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-extrabold text-[10px] tracking-widest uppercase text-amber-500">EQ Presets</span>
              <button 
                onClick={() => setEqPopoverOpen(false)} 
                className="text-zinc-405 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Sparkline gains chart */}
            <div className="flex items-end justify-between h-14 px-3 py-1 bg-white/[0.03] rounded-xl border border-white/5 mt-0.5">
              {getPresetGains(eqPreset).map((gain, i) => {
                const heightPercent = Math.max(12, Math.min(100, ((gain + 6) / 12) * 100));
                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div 
                      className="w-2 rounded-t bg-amber-500 transition-all duration-300 shadow shadow-amber-500/20" 
                      style={{ height: `${heightPercent}%` }} 
                    />
                    <span className="text-[7px] text-zinc-550 mt-1 font-bold">
                      {["60", "230", "910", "4K", "14K"][i]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-1 mt-1 max-h-[180px] overflow-y-auto no-scrollbar">
              {[
                { id: "flat", name: "Flat" },
                { id: "bassBoost", name: "Bass Boost" },
                { id: "vocalBoost", name: "Vocal Boost" },
                { id: "trebleBoost", name: "Treble Boost" },
                { id: "electronic", name: "Electronic" },
                { id: "classical", name: "Classical" }
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyEqPreset(preset.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold transition-all cursor-pointer ${
                    eqPreset === preset.id
                      ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                      : "hover:bg-white/5 text-zinc-300 hover:text-white"
                  }`}
                >
                  <span>{preset.name}</span>
                  {eqPreset === preset.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sleep Timer Popover Menu */}
        {timerPopoverOpen && (
          <div className="absolute bottom-16 right-8 w-48 p-4 rounded-2xl bg-slate-900/95 border border-white/10 text-white shadow-xl z-50 flex flex-col gap-3 animate-fade-in text-xs select-none backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-extrabold text-[10px] tracking-widest uppercase text-amber-500">Sleep Timer</span>
              <button 
                onClick={() => setTimerPopoverOpen(false)} 
                className="text-zinc-405 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {sleepTimer !== null && (
              <div className="text-center py-2 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold rounded-xl text-[10px] tracking-tight">
                Pauses in: {formatRemainingTime(sleepTimer)}
              </div>
            )}

            <div className="flex flex-col gap-1.5 mt-0.5">
              {[
                { val: 0, label: "Turn Off" },
                { val: 0.1, label: "6 Seconds (Test)" },
                { val: 15, label: "15 Minutes" },
                { val: 30, label: "30 Minutes" },
                { val: 45, label: "45 Minutes" },
                { val: 60, label: "60 Minutes" }
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    startSleepTimer(opt.val);
                    setTimerPopoverOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white font-bold text-left transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Player;
