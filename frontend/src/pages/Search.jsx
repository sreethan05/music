import { useContext, useState, useEffect, useRef } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Search as SearchIcon, X, Clock, Play, Pause, ListMusic, Check, Loader2 } from "lucide-react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000"; 

const Search = () => {
  const { currentSong, playStatus, playTrackDirectly, togglePlay, createPlaylist, searchQuery, setSearchQuery } = useContext(PlayerContext);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Importer states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStage, setImportStage] = useState(1); // 1 = Input, 2 = Progress, 3 = Results
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, query: "" });
  const [resolvedTracks, setResolvedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Imported Playlist");
  
  const searchCancelRef = useRef(false);

  // Trigger search on local Express backend which proxies and decrypts JioSaavn
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setLoading(true);
        try {
          const res = await axios.get(`${BACKEND_URL}/api/saavn/search?query=${encodeURIComponent(searchQuery)}`);
          if (res.data.success) {
            setSearchResults(res.data.data || []);
          }
        } catch (err) {
          console.error("Local Saavn proxy search failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleRowClick = (song) => {
    const mappedResults = searchResults.map(s => ({
      _id: s.id,
      ...s
    }));

    const playSong = mappedResults.find(s => s._id === song.id) || {
      _id: song.id,
      ...song
    };

    if (currentSong && currentSong._id === song.id) {
      togglePlay();
    } else {
      playTrackDirectly(playSong, mappedResults);
    }
  };

  const parseImportedText = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedTracks = [];
    
    // Check if the pasted text matches Spotify Web Player copy format:
    // Pattern: 
    // Row 1: number (e.g., 1)
    // Row 2: Title
    // Row 3: Artist, Album
    // Row 4: duration (e.g. 3:54)
    // Row 5: number (e.g., 2) ...
    let isSpotifyTable = false;
    if (lines.length >= 4) {
      const line1IsNumber = /^\d+$/.test(lines[0]);
      const line4IsDuration = /^\d+:\d+$/.test(lines[3]);
      if (line1IsNumber && line4IsDuration) {
        isSpotifyTable = true;
      }
    }

    if (isSpotifyTable) {
      for (let i = 0; i < lines.length; i += 4) {
        if (i + 2 < lines.length) {
          const name = lines[i + 1];
          const artistAndAlbum = lines[i + 2];
          const artist = artistAndAlbum.split(',')[0].trim();
          parsedTracks.push({ name, artist });
        }
      }
    } else {
      // Plain text list: e.g. "Song Name - Artist", "Song Name by Artist", or just "Song Name"
      for (const line of lines) {
        // Strip out leading numbers (e.g. "1. Song" or "1 Song")
        let cleanLine = line.replace(/^\d+[\s.\-)]+/, "").trim();
        
        if (cleanLine.includes(" - ")) {
          const parts = cleanLine.split(" - ");
          const name = parts[0].trim();
          const artist = parts.slice(1).join(" - ").trim();
          parsedTracks.push({ name, artist });
        } else if (cleanLine.includes(" by ")) {
          const parts = cleanLine.split(" by ");
          const name = parts[0].trim();
          const artist = parts.slice(1).join(" by ").trim();
          parsedTracks.push({ name, artist });
        } else {
          parsedTracks.push({ name: cleanLine, artist: "" });
        }
      }
    }
    return parsedTracks;
  };

  const handleImportStart = async () => {
    if (!importText.trim()) return;
    
    const parsed = parseImportedText(importText);
    if (parsed.length === 0) {
      alert("No songs parsed. Please enter at least one song.");
      return;
    }

    setImportStage(2);
    searchCancelRef.current = false;
    setImportProgress({ current: 0, total: parsed.length, query: "" });
    const resolved = [];

    for (let i = 0; i < parsed.length; i++) {
      if (searchCancelRef.current) break;

      const track = parsed[i];
      const queryStr = track.artist ? `${track.name} ${track.artist}` : track.name;
      setImportProgress(prev => ({ ...prev, current: i + 1, query: queryStr }));

      try {
        const res = await axios.get(`${BACKEND_URL}/api/saavn/search?query=${encodeURIComponent(queryStr)}`);
        if (res.data.success && res.data.data.length > 0) {
          resolved.push({
            checked: true,
            trackInfo: res.data.data[0]
          });
        }
      } catch (err) {
        console.error("Failed to match track:", queryStr, err);
      }
    }

    if (searchCancelRef.current) {
      setImportStage(1);
      return;
    }

    setResolvedTracks(resolved);
    setImportStage(3);
  };

  const handleSavePlaylist = async () => {
    const selectedTracks = resolvedTracks
      .filter(t => t.checked)
      .map(t => t.trackInfo);
      
    if (selectedTracks.length === 0) {
      alert("Please select at least one song to import.");
      return;
    }

    const res = await createPlaylist(playlistName, selectedTracks);
    if (res.success) {
      setImportModalOpen(false);
      setImportText("");
      setImportStage(1);
      setPlaylistName("My Imported Playlist");
      setResolvedTracks([]);
      alert(`Successfully created playlist "${playlistName}" with ${selectedTracks.length} tracks! Check the Library sidebar to play it.`);
    } else {
      alert(res.message || "Failed to create playlist.");
    }
  };

  const browseCategories = [
    { title: "Telugu Melodies", color: "from-sky-500/80 to-blue-600/80 border-sky-400/20" },
    { title: "Bollywood Hits", color: "from-red-500/80 to-rose-600/80 border-rose-400/20" },
    { title: "English Pop", color: "from-teal-500/80 to-emerald-600/80 border-emerald-400/20" },
    { title: "Romantic Vibes", color: "from-pink-500/80 to-purple-600/80 border-purple-400/20" },
    { title: "Workout Hits", color: "from-orange-500/80 to-amber-600/80 border-amber-400/20" },
    { title: "Lo-Fi Beats", color: "from-violet-500/80 to-indigo-600/80 border-indigo-400/20" },
    { title: "Rock Classics", color: "from-zinc-700/85 to-neutral-800/85 border-zinc-650/20" },
    { title: "Focus / Study", color: "from-green-600/80 to-teal-700/80 border-teal-500/20" }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto pb-36 md:pb-28 bg-transparent px-6 no-scrollbar select-none relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glows */}
      <div className="ambient-glow top-0 right-1/4 opacity-30" />
      <div className="ambient-glow-purple bottom-10 left-10 opacity-30" />

      {/* Integrated Search & Importer Bar */}
      <div className="flex flex-col gap-4 py-2 relative z-10">
        
        {/* Integrated Search & Importer Bar */}
        <div className="flex flex-wrap items-center gap-3.5 mt-2">
          <div className="relative flex-1 max-w-[460px] group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-zinc w-4.5 h-4.5 group-focus-within:text-spotify-green transition-colors" />
            <input 
              type="text"
              placeholder="Search all Telugu, Hindi & English songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-theme-card border border-theme-border hover:border-theme-border-hover text-sm text-theme-text pl-12 pr-11 py-3.5 rounded-full focus:outline-none focus:border-spotify-green focus:bg-theme-card focus:shadow-[0_0_20px_rgba(29,185,84,0.15)] transition-all duration-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-zinc hover:text-theme-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button 
            onClick={() => setImportModalOpen(true)}
            className="px-5 py-3 bg-zinc-250/30 dark:bg-zinc-900/50 hover:bg-zinc-300/40 dark:hover:bg-zinc-800/80 text-theme-text text-xs font-extrabold rounded-full border border-theme-border hover:border-theme-border-hover transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <ListMusic className="w-4 h-4 text-spotify-green" />
            <span>Import Playlist</span>
          </button>
        </div>
      </div>

      {/* RESULTS LIST SECTION */}
      <div className="relative z-10">
        {searchQuery.trim() ? (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Songs</h2>
            {loading ? (
              <div className="text-zinc-400 text-sm py-16 flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold">Searching music library...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-zinc-500 text-sm py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01] glass-panel-light">
                <p className="font-semibold text-zinc-400">No results found for "{searchQuery}"</p>
                <p className="text-xs text-zinc-500 mt-1">Please check your spelling or try another keyword.</p>
              </div>
            ) : (
              <table className="w-full text-left text-zinc-400 border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-widest font-extrabold text-zinc-500">
                    <th className="py-3.5 w-12 text-center">#</th>
                    <th className="py-3.5 pl-2">Title</th>
                    <th className="py-3.5 hidden sm:table-cell">Album</th>
                    <th className="py-3.5 w-16 text-center">
                      <Clock className="w-4 h-4 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody className="before:block before:h-2">
                  {searchResults.map((item, index) => {
                    const isActive = currentSong && currentSong._id === item.id;
                    const isPlaying = isActive && playStatus;

                    return (
                      <tr 
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className={`rounded-lg hover:bg-white/[0.04] transition-all duration-355 group cursor-pointer ${isActive ? 'bg-white/[0.02]' : ''}`}
                      >
                        {/* Index / Play Icon */}
                        <td className="py-3 text-center text-sm font-semibold rounded-l-lg">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <span className="group-hover:opacity-0 opacity-100 flex items-center justify-center">
                              {isPlaying ? (
                                <div className="flex items-end gap-[3px] h-4">
                                  <span className="playing-bar"></span>
                                  <span className="playing-bar"></span>
                                  <span className="playing-bar"></span>
                                </div>
                              ) : (
                                <span className={isActive ? "text-spotify-green" : "text-zinc-500"}>{index + 1}</span>
                              )}
                            </span>
                            <span className="absolute opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                              {isPlaying ? (
                                <Pause className="w-4 h-4 text-white fill-current stroke-0" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-current stroke-0 ml-0.5" />
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Song Details */}
                        <td className="py-3 flex items-center gap-3.5 pl-2">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10.5 h-10.5 rounded object-cover shadow-md border border-white/5" 
                          />
                          <div className="flex flex-col overflow-hidden max-w-[200px] md:max-w-[400px]">
                            <span className={`text-sm font-semibold truncate ${isActive ? "text-spotify-green glow-text" : "text-white"}`}>{item.name}</span>
                            <span className="text-xs text-zinc-400 truncate mt-0.5 font-medium">{item.desc}</span>
                          </div>
                        </td>

                        {/* Album Link */}
                        <td className="py-3 text-sm hidden sm:table-cell truncate max-w-[150px] font-medium text-zinc-400">{item.album}</td>

                        {/* Track Duration */}
                        <td className="py-3 text-sm text-center font-semibold text-zinc-400 rounded-r-lg tabular-nums">
                          {item.duration}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* BROWSE ALL SECTION (Displays if search box is empty) */
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-5 tracking-tight">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {browseCategories.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => setSearchQuery(item.title)}
                  className={`bg-gradient-to-br ${item.color} aspect-square rounded-2xl p-5 border cursor-pointer relative hover:scale-[1.03] hover:rotate-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 shadow-md group overflow-hidden`}
                >
                  <span className="font-extrabold text-white text-base md:text-lg tracking-tight break-words relative z-10 leading-tight">
                    {item.title}
                  </span>
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-black/10 border border-white/5 group-hover:bg-black/20 group-hover:scale-115 rounded-full transition-all duration-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GORGEOUS GLASSMORPHIC IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-50 p-4 animate-fade-in select-none">
          <div className="w-full max-w-[480px] glass-panel border border-white/10 p-6 rounded-2xl flex flex-col max-h-[80vh] shadow-2xl relative">
            
            {/* Modal Exit */}
            <button 
              onClick={() => { searchCancelRef.current = true; setImportModalOpen(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-white tracking-tight">Import Custom Playlist</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed font-semibold">
                Import music from Spotify, YouTube, or Apple Music by copying and pasting your track list.
              </p>
            </div>

            {/* STAGE 1: TEXT AREA INPUT */}
            {importStage === 1 && (
              <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                <textarea 
                  placeholder="Paste songs list here. Examples:&#10;Shape of You - Ed Sheeran&#10;Kesariya by Arijit Singh&#10;Naa Madhi&#10;&#10;Or directly copy-paste track rows from Spotify Web Player grid!"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-48 bg-[#18181b]/50 border border-white/5 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-spotify-green focus:bg-zinc-950/80 resize-none transition-all duration-300 font-mono"
                />
                
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed max-w-[60%]">
                    Tip: Formatting tracks with "Title - Artist" delivers the most accurate audio match.
                  </span>
                  
                  <button 
                    onClick={handleImportStart}
                    disabled={!importText.trim()}
                    className="px-5 py-3 bg-white text-black text-xs font-extrabold rounded-xl hover:scale-103 active:scale-97 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer shadow-md whitespace-nowrap"
                  >
                    Match & Preview
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: LOADING PROGRESS */}
            {importStage === 2 && (
              <div className="flex flex-col items-center justify-center py-12 gap-5 flex-1 select-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-spotify-green animate-spin" />
                  <Loader2 className="w-6 h-6 text-spotify-green absolute animate-pulse" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-white">Resolving Audio Links</h3>
                  <p className="text-xs text-spotify-green font-bold mt-1.5 animate-pulse truncate max-w-[340px]">
                    Matching: "{importProgress.query}"
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">
                    Track {importProgress.current} of {importProgress.total}
                  </p>
                </div>

                <button 
                  onClick={() => { searchCancelRef.current = true; setImportStage(1); }}
                  className="mt-4 px-5 py-2 bg-white/5 border border-white/5 hover:border-white/10 text-rose-400 hover:bg-rose-500/5 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel Import
                </button>
              </div>
            )}

            {/* STAGE 3: RESOLVED PREVIEW & SAVE */}
            {importStage === 3 && (
              <div className="flex flex-col flex-1 overflow-hidden">
                
                {/* Playlist Name Input */}
                <div className="mb-3.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 block mb-1">Playlist Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Summer Mix"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full bg-[#18181b]/50 border border-white/5 focus:border-spotify-green focus:bg-zinc-950/80 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Scoped Song Checklist List */}
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">Preview Matched Songs ({resolvedTracks.filter(t=>t.checked).length})</p>
                <div className="flex-1 overflow-y-auto no-scrollbar border border-white/5 bg-[#18181b]/20 rounded-xl p-2 flex flex-col gap-1.5 mb-4 max-h-[35vh]">
                  {resolvedTracks.length === 0 ? (
                    <div className="text-center py-10 text-xs text-zinc-500 font-semibold">
                      Could not match any tracks. Please go back and modify keywords.
                    </div>
                  ) : (
                    resolvedTracks.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          const updated = [...resolvedTracks];
                          updated[idx].checked = !updated[idx].checked;
                          setResolvedTracks(updated);
                        }}
                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                      >
                        {/* Selector check box */}
                        <div className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all ${item.checked ? 'bg-spotify-green text-black scale-102 shadow-md shadow-spotify-green/20' : 'border border-zinc-650 text-transparent'}`}>
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        
                        <img 
                          src={item.trackInfo.image} 
                          alt={item.trackInfo.name} 
                          className="w-8.5 h-8.5 rounded object-cover shadow border border-white/5"
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate">{item.trackInfo.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.trackInfo.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3.5">
                  <button 
                    onClick={() => setImportStage(1)}
                    className="px-4.5 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all"
                  >
                    Back / Edit
                  </button>

                  <button 
                    onClick={handleSavePlaylist}
                    disabled={resolvedTracks.filter(t=>t.checked).length === 0}
                    className="px-5 py-2.5 bg-spotify-green text-black text-xs font-extrabold rounded-xl hover:scale-103 active:scale-97 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer shadow-lg shadow-spotify-green/10"
                  >
                    Save Playlist
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
