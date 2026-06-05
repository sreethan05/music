import { useContext } from "react";
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
  Maximize2 
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
    toggleShuffle
  } = useContext(PlayerContext);

  if (!currentSong) return null;

  // Format second to display with leading zero
  const formatTime = (timeObj) => {
    if (!timeObj) return "00";
    return timeObj.second < 10 ? `0${timeObj.second}` : timeObj.second;
  };

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-[24px] px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.02)] flex items-center justify-between text-slate-800 select-none relative z-10 mt-auto">
      
      {/* Left Column Controls: Like, Add, Shuffle */}
      <div className="flex items-center gap-4.5 w-[25%] shrink-0">
        <button 
          className="text-slate-400 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Add to Favorites"
        >
          <Heart className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
        <button 
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

      {/* Right Column Controls: Volume and Expand */}
      <div className="flex items-center gap-3 w-[25%] shrink-0 justify-end text-slate-400">
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

        <button className="hover:text-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer hidden sm:block" title="Full Screen">
          <Maximize2 className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>

    </div>
  );
};

export default Player;
