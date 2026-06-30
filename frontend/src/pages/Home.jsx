import { useContext, useMemo, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AlertCircle, Music, Play, SearchX, Sparkles, Volume2, Plus, WifiOff, RefreshCw } from "lucide-react";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=70";

const Home = () => {
  const {
    songsData,
    albumsData,
    currentSong,
    playStatus,
    playWithId,
    searchQuery,
    isLibraryLoading,
    libraryError,
    recentlyPlayed,
    openPlaylistModal,
    refreshLibrary
  } = useContext(PlayerContext);
  const [visibleCount, setVisibleCount] = useState(60);

  const filteredSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return songsData;

    return songsData.filter((song) => {
      const nameMatch = song.name ? song.name.toLowerCase().includes(query) : false;
      const descMatch = song.desc ? song.desc.toLowerCase().includes(query) : false;
      const albumMatch = song.album ? song.album.toLowerCase().includes(query) : false;
      return nameMatch || descMatch || albumMatch;
    });
  }, [songsData, searchQuery]);

  const featuredSong = songsData[0] || null;
  const visibleSongs = filteredSongs.slice(0, visibleCount);
  const hasMoreSongs = filteredSongs.length > visibleSongs.length;

  const formatIndex = (idx) => {
    const num = idx + 1;
    return num < 10 ? `0${num}` : num;
  };

  const handleImageError = (event) => {
    event.currentTarget.src = FALLBACK_COVER;
  };

  return (
    <div className="flex-1 h-full select-none bg-transparent flex flex-col gap-6">
      {libraryError && songsData.length > 0 && (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-bold">{libraryError}</p>
        </div>
      )}

      {libraryError && songsData.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-[22px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-sm animate-pulse">
            <WifiOff className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Backend Connection Failed</h2>
          <p className="text-xs text-slate-400 font-bold max-w-sm mt-2 leading-relaxed">
            We are unable to connect to the Music Vibe API. Please make sure the backend server is running locally or check your network connection.
          </p>
          <button
            onClick={refreshLibrary}
            className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {isLibraryLoading && songsData.length === 0 && (
        <div className="flex flex-col gap-6">
          <div className="h-[220px] rounded-[28px] bg-white border border-slate-200/60 shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 shimmer-bg" />
            <div className="absolute left-8 top-12 w-24 h-3 rounded-full bg-slate-100" />
            <div className="absolute left-8 top-20 w-72 max-w-[70%] h-9 rounded-full bg-slate-100" />
            <div className="absolute left-8 top-34 w-44 max-w-[55%] h-3 rounded-full bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 rounded-2xl bg-white border border-slate-200/60 shimmer-bg" />
            ))}
          </div>
        </div>
      )}

      {!isLibraryLoading && featuredSong && (
        <div className="w-full">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Featured now</p>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pl-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Trending</h1>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{songsData.length.toLocaleString()} tracks ready</span>
            </div>
          </div>

          <div className="w-full h-[220px] rounded-[28px] overflow-hidden relative border border-theme-border shadow-sm group">
            <img
              src={featuredSong.image}
              alt={featuredSong.name}
              onError={handleImageError}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-theme-bg via-theme-bg/95 to-theme-bg/35 z-0" />

            <div className="absolute inset-0 flex flex-col justify-center items-start px-7 md:px-10 z-10 select-none">
              <span className="text-[10px] font-extrabold tracking-widest text-theme-zinc uppercase">Featured Track</span>

              <h2 className="text-2xl md:text-3xl font-black text-theme-text tracking-tight leading-none mt-2 max-w-sm md:max-w-md truncate">
                {featuredSong.name}
              </h2>
              <p className="text-xs text-theme-muted font-extrabold mt-1 max-w-[280px] truncate">
                {featuredSong.desc || "Unknown Artist"}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={() => playWithId(featuredSong._id, songsData)}
                  className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-950 dark:hover:bg-white text-white dark:text-zinc-950 font-extrabold text-[10.5px] tracking-wider uppercase px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-0" />
                  <span>Play</span>
                </button>
                <div className="border border-theme-border bg-theme-card text-theme-text font-extrabold text-[10.5px] tracking-wider uppercase px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-amber-500" />
                  <span>{albumsData.length.toLocaleString()} collections</span>
                </div>
              </div>

              <div className="absolute bottom-6 right-8 text-right hidden md:block">
                <span className="text-[9px] font-extrabold tracking-wider text-theme-zinc uppercase">Library Size</span>
                <p className="text-sm font-black text-theme-text tracking-tight">{songsData.length.toLocaleString()} songs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Played Section */}
      {!isLibraryLoading && recentlyPlayed && recentlyPlayed.length > 0 && (
        <div className="w-full select-none mt-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Recently Played</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pr-2 scroll-smooth">
            {recentlyPlayed.map((song) => (
              <div 
                key={`recent_${song._id}`}
                onClick={() => playWithId(song._id, songsData)}
                className="flex items-center gap-3.5 p-3 min-w-[200px] max-w-[240px] bg-white border border-slate-200/55 dark:bg-zinc-900/40 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:scale-[1.01] transition-all duration-300 shadow-sm shrink-0 group relative overflow-hidden"
              >
                <img 
                  src={song.image} 
                  alt={song.name} 
                  onError={handleImageError}
                  className="w-10 h-10 rounded-lg object-cover shadow border border-slate-200/40"
                />
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate group-hover:text-amber-500 transition-colors">{song.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{song.desc || "Unknown Artist"}</p>
                </div>
                {/* Play icon overlay on hover */}
                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 shadow shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current stroke-0 ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col mt-4">
        <div className="flex items-center justify-between mb-4 pl-1">
          <div>
            <h3 className="text-sm font-black text-theme-text tracking-tight">
              {searchQuery ? "Search Results" : "My Playlist"}
            </h3>
            <p className="text-[10px] text-theme-zinc font-bold mt-1">
              Showing {visibleSongs.length.toLocaleString()} of {filteredSongs.length.toLocaleString()} tracks
            </p>
          </div>
          {hasMoreSongs && (
            <button
              onClick={() => setVisibleCount((count) => Math.min(count + 60, filteredSongs.length))}
              className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase hover:text-slate-800 transition-colors cursor-pointer"
            >
              Show More
            </button>
          )}
        </div>

        {!isLibraryLoading && filteredSongs.length === 0 ? (
          <div className="w-full py-16 bg-white border border-slate-200/50 rounded-[28px] shadow-sm flex flex-col items-center justify-center text-center">
            <SearchX className="w-9 h-9 text-slate-300 mb-3" />
            <h4 className="text-xs font-extrabold text-slate-800">No tracks match your search</h4>
            <p className="text-[10px] text-slate-400 mt-1">Try typing a different artist or song name.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-1.5 pb-20">
            {visibleSongs.length > 0 && (
              <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black tracking-widest text-theme-zinc uppercase select-none border-b border-theme-border mb-2">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-5 md:col-span-4">Title</span>
                <span className="hidden md:block md:col-span-3">Artist</span>
                <span className="col-span-2 text-center">Time</span>
                <span className="col-span-4 md:col-span-2">Album</span>
              </div>
            )}

            {visibleSongs.map((song, idx) => {
              const isPlaying = currentSong && currentSong._id === song._id;

              return (
                <div
                  key={song._id}
                  onClick={() => playWithId(song._id, filteredSongs)}
                  className={`grid grid-cols-12 px-4 md:px-6 py-3.5 items-center text-xs transition-all duration-200 cursor-pointer group ${
                    isPlaying
                      ? "bg-theme-card border border-theme-border rounded-2xl shadow-sm text-theme-text font-extrabold"
                      : "text-theme-zinc hover:bg-theme-card/60 hover:text-theme-text hover:scale-[1.002]"
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    {isPlaying ? (
                      <Volume2 className={`w-4 h-4 text-amber-500 ${playStatus ? "animate-bounce" : ""}`} />
                    ) : (
                      <span className="font-bold text-[11px] text-theme-zinc">{formatIndex(idx)}</span>
                    )}
                  </div>

                  <div className="col-span-5 md:col-span-4 flex items-center gap-3 pr-2 overflow-hidden">
                    <img
                      src={song.image}
                      alt={song.name}
                      onError={handleImageError}
                      className="w-8 h-8 rounded object-cover shadow-sm border border-theme-border"
                    />
                    <p className={`truncate text-theme-text ${isPlaying ? "font-black" : "font-extrabold"}`}>{song.name}</p>
                  </div>

                  <span className="hidden md:block md:col-span-3 truncate pr-2 font-bold">{song.desc || "Unknown Artist"}</span>
                  <div className="col-span-2 text-center font-bold tabular-nums flex items-center justify-center gap-2">
                    <span>{song.duration || "3:10"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlaylistModal(song);
                      }}
                      className="opacity-100 md:opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-theme-border hover:bg-theme-border-hover flex items-center justify-center text-theme-text transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0"
                      title="Add to Playlist"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                  <span className="col-span-4 md:col-span-2 truncate font-bold text-theme-zinc">{song.album || "Single"}</span>
                </div>
              );
            })}

            {hasMoreSongs && (
              <button
                onClick={() => setVisibleCount((count) => Math.min(count + 60, filteredSongs.length))}
                className="mt-4 w-full py-3.5 bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.99] cursor-pointer"
              >
                Load 60 More Tracks
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
