import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Play, Volume2, SearchX } from "lucide-react";

const Home = () => {
  const { songsData, currentSong, playStatus, playWithId, searchQuery } = useContext(PlayerContext);

  // Filter songs based on global searchQuery from Navbar
  const filteredSongs = songsData.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.name.toLowerCase().includes(query) ||
      (song.desc && song.desc.toLowerCase().includes(query)) ||
      (song.album && song.album.toLowerCase().includes(query))
    );
  });

  // Featured track for Trending Banner (default to first song in library)
  const featuredSong = songsData[0] || null;

  // Format index helper
  const formatIndex = (idx) => {
    const num = idx + 1;
    return num < 10 ? `0${num}` : num;
  };

  return (
    <div className="flex-1 h-full select-none bg-transparent flex flex-col gap-6">
      
      {/* Trending / Featured Banner (Matches Mockup Banner) */}
      {featuredSong && (
        <div className="w-full">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5">What's hot 🔥</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight pl-1 mb-4">Trending</h1>
          
          <div className="w-full h-[220px] rounded-[28px] overflow-hidden relative border border-slate-200/50 shadow-[0_15px_35px_rgba(0,0,0,0.015)] group">
            {/* Ambient Background Banner Image (Blurred/Opacity cover) */}
            <img 
              src={featuredSong.image} 
              alt={featuredSong.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 dark:from-white dark:via-white/95 dark:to-white/35 z-0" />
            
            {/* Banner Content Details */}
            <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-10 z-10 select-none">
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">Featured Track</span>
              
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2 max-w-sm md:max-w-md truncate">
                {featuredSong.name}
              </h2>
              <p className="text-xs text-slate-400 font-extrabold mt-1 max-w-[250px] truncate">
                {featuredSong.desc || "Unknown Artist"}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button 
                  onClick={() => playWithId(featuredSong._id, songsData)}
                  className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[10.5px] tracking-wider uppercase px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow shadow-slate-900/10 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-0" />
                  <span>Play</span>
                </button>
                <button 
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-[10.5px] tracking-wider uppercase px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Follow
                </button>
              </div>

              {/* Monthly Listener Indicator */}
              <div className="absolute bottom-6 right-8 text-right hidden md:block">
                <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Monthly Listeners</span>
                <p className="text-sm font-black text-slate-800 tracking-tight">32,092</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Playlist Table (Matches Mockup Central Table Layout) */}
      <div className="flex-1 flex flex-col mt-2">
        <div className="flex items-center justify-between mb-4 pl-1">
          <h3 className="text-sm font-black text-slate-800 tracking-tight">My Playlist</h3>
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase hover:text-slate-600 transition-colors cursor-pointer">Show All</span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="w-full py-16 bg-white border border-slate-200/50 rounded-[28px] shadow-sm flex flex-col items-center justify-center text-center">
            <SearchX className="w-9 h-9 text-slate-300 mb-3" />
            <h4 className="text-xs font-extrabold text-slate-800">No tracks match your search</h4>
            <p className="text-[10px] text-slate-400 mt-1">Try typing a different artist or song name.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-1.5 pb-20">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black tracking-widest text-slate-400 uppercase select-none border-b border-slate-200/20 mb-2">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-4">Title</span>
              <span className="col-span-3">Artist</span>
              <span className="col-span-2 text-center">Time</span>
              <span className="col-span-2">Album</span>
            </div>

            {/* Song rows loop */}
            {filteredSongs.slice(0, 100).map((song, idx) => {
              const isPlaying = currentSong && currentSong._id === song._id;
              
              return (
                <div 
                  key={song._id}
                  onClick={() => playWithId(song._id, filteredSongs.slice(0, 100))}
                  className={`grid grid-cols-12 px-6 py-3.5 items-center text-xs transition-all duration-200 cursor-pointer ${
                    isPlaying 
                      ? "bg-white border border-slate-100 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.015)] text-slate-800 font-extrabold" 
                      : "text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:scale-[1.002]"
                  }`}
                >
                  {/* Speaker indicator or number index */}
                  <div className="col-span-1 flex items-center justify-center">
                    {isPlaying ? (
                      <Volume2 className={`w-4 h-4 text-amber-500 ${playStatus ? "animate-bounce" : ""}`} />
                    ) : (
                      <span className="font-bold text-[11px] text-slate-400">{formatIndex(idx)}</span>
                    )}
                  </div>

                  {/* Artwork & Title */}
                  <div className="col-span-4 flex items-center gap-3 pr-2 overflow-hidden">
                    <img 
                      src={song.image} 
                      alt={song.name} 
                      className="w-8 h-8 rounded object-cover shadow-sm border border-slate-200/40"
                    />
                    <p className={`truncate text-slate-800 ${isPlaying ? "font-black" : "font-extrabold"}`}>{song.name}</p>
                  </div>

                  {/* Artist */}
                  <span className="col-span-3 truncate pr-2 font-bold">{song.desc || "Unknown Artist"}</span>

                  {/* Duration */}
                  <span className="col-span-2 text-center font-bold tabular-nums">{song.duration || "3:10"}</span>

                  {/* Album */}
                  <span className="col-span-2 truncate font-bold text-slate-400">{song.album || "Single"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
