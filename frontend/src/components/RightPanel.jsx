import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Music, Plus, MoreHorizontal } from "lucide-react";

const RightPanel = () => {
  const { currentSong, openPlaylistModal } = useContext(PlayerContext);

  // Static tags for Shortcuts
  const shortcuts = [
    { name: "Chill Hits", emoji: "⚡" },
    { name: "Hop", emoji: "⭐" },
    { name: "Acoustic", emoji: "🎸" },
    { name: "Indie Pop", emoji: "🎵" },
    { name: "Piano Blues", emoji: "🎹" },
    { name: "Jazz", emoji: "🎷" }
  ];

  // Static artists for Fav Artist
  const favArtists = [
    {
      name: "Taylor Swift",
      tracks: "196 songs in library",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
    },
    {
      name: "Kanye West",
      tracks: "124 songs in library",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
    },
    {
      name: "Drake",
      tracks: "50 songs in library",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
    },
    {
      name: "Billie Eilish",
      tracks: "15 songs in library",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    }
  ];

  return (
    <div className="w-[310px] h-full bg-[#f3f4f6] p-6 flex flex-col gap-7 overflow-y-auto no-scrollbar border-l border-slate-200/60 select-none hidden xl:flex">
      
      {/* Shortcuts section */}
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">Shortcuts</h3>
        <div className="flex flex-wrap gap-2.5">
          {shortcuts.map((tag, idx) => (
            <button 
              key={idx}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/50 rounded-full hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold text-slate-700 cursor-pointer"
            >
              <span className="text-[10px]">{tag.emoji}</span>
              <span>{tag.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fav Artist section */}
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4">Fav Artist</h3>
        <div className="flex flex-col gap-3.5">
          {favArtists.map((artist, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <img 
                  src={artist.avatar} 
                  alt={artist.name} 
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200/50"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">{artist.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{artist.tracks}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active playing song card */}
      <div className="mt-auto">
        {currentSong ? (
          <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-200/40 relative group overflow-hidden flex flex-col gap-4.5">
            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md relative">
              <img 
                src={currentSong.image} 
                alt={currentSong.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="overflow-hidden pr-2">
                <h4 className="text-xs font-black text-slate-800 truncate" title={currentSong.name}>
                  {currentSong.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-extrabold truncate mt-0.5">
                  {currentSong.artist || currentSong.album || "Unknown Artist"}
                </p>
              </div>
              
              <button 
                onClick={() => openPlaylistModal(currentSong)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-indigo-650 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                title="Add to Playlist"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-3xl p-8 border border-slate-200/40 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-400 mb-3.5">
              <Music className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">No song playing</h4>
            <p className="text-[10px] text-slate-400 mt-1">Select a track to start listening.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default RightPanel;
