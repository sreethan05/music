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
    toggleShuffle,
    setIsFullScreen,
    openPlaylistModal,
    likedSongs,
    toggleLikeSong
  } = useContext(PlayerContext);

  if (!currentSong) return null;

  // Format second to display with leading zero
  const formatTime = (timeObj) => {
    if (!timeObj) return "00";
    return timeObj.second < 10 ? `0${timeObj.second}` : timeObj.second;
  };

  const isLiked = currentSong && likedSongs.includes(currentSong._id);

  return (
    <div className="w-full mb-[76px] md:mb-0 bg-spotify-light/92 backdrop-blur-xl border border-theme-border rounded-2xl px-3 sm:px-4 md:px-5 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.12)] grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(280px,500px)_minmax(170px,1fr)] gap-3 md:gap-4 items-center text-theme-text select-none relative z-10 mt-auto transition-colors duration-300 surface-ring">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsFullScreen(true)}
          className="relative w-12 h-12 rounded-xl overflow-hidden border border-theme-border shrink-0 group cursor-pointer"
          title="Open full screen player"
        >
          <img src={currentSong.image} alt={currentSong.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-black text-theme-text truncate">{currentSong.name}</p>
          <p className="text-[11px] font-semibold text-theme-zinc truncate mt-0.5">
            {currentSong.desc || "Unknown Artist"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            onClick={() => toggleLikeSong(currentSong._id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isLiked ? "text-rose-500 bg-rose-500/10" : "text-theme-zinc hover:text-rose-500 hover:bg-theme-card"
            }`}
            title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={`w-4 h-4 stroke-[2.2] ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={() => openPlaylistModal(currentSong)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-theme-zinc hover:text-theme-text hover:bg-theme-card hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Add to Playlist"
          >
            <ListMusic className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`hidden sm:flex hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isShuffle ? "text-sky-400" : "text-theme-zinc hover:text-theme-text"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
          <button
            onClick={previous}
            className="text-theme-zinc hover:text-theme-text hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
            title="Previous"
          >
            <SkipBack className="w-4.5 h-4.5 fill-current stroke-0" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-md relative"
            title={playStatus ? "Pause" : "Play"}
          >
            {playStatus ? (
              <Pause className="w-4.5 h-4.5 fill-current stroke-0" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-current ml-0.5 stroke-0" />
            )}
          </button>
          <button
            onClick={next}
            className="text-theme-zinc hover:text-theme-text hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
            title="Next"
          >
            <SkipForward className="w-4.5 h-4.5 fill-current stroke-0" />
          </button>
          <button
            onClick={toggleLoop}
            className={`hidden sm:flex hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isLoop ? "text-sky-400" : "text-theme-zinc hover:text-theme-text"
            }`}
            title="Repeat"
          >
            <Repeat className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-[10px] font-bold tracking-tight text-theme-zinc select-none">
          <span className="w-8 text-right tabular-nums">{time.currentTime.minute}:{formatTime(time.currentTime)}</span>
          <div
            ref={seekBarRef}
            onClick={seek}
            className="flex-1 h-1 bg-theme-border hover:bg-theme-border-hover rounded-full cursor-pointer relative group transition-all"
          >
            <div
              className="h-full bg-sky-400 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="w-2.5 h-2.5 bg-sky-400 rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 shadow transition-opacity duration-200" />
            </div>
          </div>
          <span className="w-8 text-left tabular-nums">{time.totalTime.minute}:{formatTime(time.totalTime)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3.5 justify-end text-theme-zinc relative min-w-0">
        <button
          onClick={toggleMute}
          className="hover:text-theme-text hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
          className="w-20 h-1 bg-theme-border rounded-full appearance-none cursor-pointer accent-sky-400"
          title="Volume"
        />

        <button
          onClick={() => setIsFullScreen(true)}
          className="hover:text-theme-text hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Full Screen"
        >
          <Maximize2 className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};

export default Player;
