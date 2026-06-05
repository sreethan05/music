import { useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { Clock, Play, Pause } from "lucide-react";

const AlbumDetail = () => {
  const { id } = useParams();
  const { songsData, albumsData, currentSong, playStatus, playWithId, togglePlay } = useContext(PlayerContext);

  const album = albumsData.find((a) => a._id === id);
  if (!album) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-theme-zinc bg-theme-bg transition-colors duration-300">
        Album not found.
      </div>
    );
  }

  // Filter songs that belong to this album (support dynamic custom tracks lists)
  const albumSongs = album.tracks || songsData.filter((song) => song.album === album.name);


  const handleRowClick = (songId) => {
    if (currentSong && currentSong._id === songId) {
      togglePlay();
    } else {
      playWithId(songId, albumSongs);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-36 md:pb-28 bg-theme-bg no-scrollbar relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient backgrounds */}
      <div className="ambient-glow top-0 left-1/4 opacity-40" />

      {/* Album Header Banner with dynamic background color */}
      <div 
        className="px-6 pt-6 pb-10 flex flex-col md:flex-row items-end gap-8 select-none relative z-10"
        style={{
          background: `linear-gradient(to bottom, ${album.bgColour}22 0%, #09090b 100%)`
        }}
      >
        <div className="relative group cursor-pointer shadow-2xl rounded-lg overflow-hidden border border-white/15 hover:border-white/20 transition-all duration-300">
          <img 
            src={album.image} 
            alt={album.name} 
            className="w-48 h-48 md:w-56 md:h-56 object-cover group-hover:scale-103 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="flex flex-col gap-2 text-white pb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-spotify-green bg-spotify-green/10 px-2.5 py-1 rounded-full w-fit border border-spotify-green/20">Playlist</span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 glow-text">{album.name}</h1>
          <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-2xl mt-2">{album.desc}</p>
          <div className="flex items-center gap-2 text-xs font-semibold mt-3 text-zinc-300">
            <span className="hover:text-white cursor-pointer transition-colors">Music Vibe</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{albumSongs.length} {albumSongs.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Album Songs List */}
      <div className="px-6 py-6 select-none relative z-10">
        {albumSongs.length === 0 ? (
          <div className="text-zinc-500 text-sm py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01] glass-panel-light">
            <p className="font-semibold text-zinc-400">No songs in this album yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Upload songs and select this album in the Admin panel!</p>
          </div>
        ) : (
          <table className="w-full text-left text-zinc-400 border-collapse">
            <thead>
              <tr className="border-b border-theme-border text-[11px] uppercase tracking-widest font-extrabold text-theme-zinc">
                <th className="py-3.5 w-12 text-center">#</th>
                <th className="py-3.5 pl-2">Title</th>
                <th className="py-3.5 hidden sm:table-cell">Album</th>
                <th className="py-3.5 w-16 text-center">
                  <Clock className="w-4 h-4 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="before:block before:h-2">
              {albumSongs.map((item, index) => {
                const isActive = currentSong && currentSong._id === item._id;
                const isPlaying = isActive && playStatus;

                return (
                  <tr 
                    key={item._id}
                    onClick={() => handleRowClick(item._id)}
                    className={`rounded-lg hover:bg-theme-border transition-all duration-350 group cursor-pointer ${isActive ? 'bg-theme-card' : ''}`}
                  >
                    {/* Index or Play Button */}
                    <td className="py-3 text-center text-sm font-semibold rounded-l-lg">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span className="group-hover:opacity-0 opacity-100 flex items-center justify-center">
                          {isPlaying ? (
                            /* Equalizer bars animation */
                            <div className="flex items-end gap-[3px] h-4">
                              <span className="playing-bar"></span>
                              <span className="playing-bar"></span>
                              <span className="playing-bar"></span>
                            </div>
                          ) : (
                            <span className={isActive ? "text-spotify-green" : "text-theme-zinc"}>{index + 1}</span>
                          )}
                        </span>
                        <span className="absolute opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-theme-text fill-current stroke-0" />
                          ) : (
                            <Play className="w-4 h-4 text-theme-text fill-current stroke-0 ml-0.5" />
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Track Info */}
                    <td className="py-3 flex items-center gap-3.5 pl-2">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-10.5 h-10.5 rounded object-cover shadow-md border border-theme-border" 
                      />
                      <div className="flex flex-col overflow-hidden max-w-[200px] md:max-w-[400px]">
                        <span className={`text-sm font-semibold truncate ${isActive ? "text-spotify-green glow-text" : "text-theme-text"}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-theme-zinc truncate mt-0.5 font-medium">
                          {item.desc}
                        </span>
                      </div>
                    </td>

                    {/* Album Name */}
                    <td className="py-3 text-sm hidden sm:table-cell truncate max-w-[150px] font-medium text-zinc-400">
                      {item.album}
                    </td>

                    {/* Duration */}
                    <td className="py-3 text-sm text-center font-semibold text-zinc-400 rounded-r-lg tabular-nums">
                      {item.duration || "3:00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;
