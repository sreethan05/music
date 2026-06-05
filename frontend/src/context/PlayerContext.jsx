import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const API_URL = "http://localhost:5000";

const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const imgData = ctx.getImageData(0, 0, 1, 1).data;
        const [r, g, b] = imgData;
        
        let adjustedR = r;
        let adjustedG = g;
        let adjustedB = b;
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 40) {
          adjustedR = Math.min(255, r + 60);
          adjustedG = Math.min(255, g + 60);
          adjustedB = Math.min(255, b + 60);
        } else if (brightness > 220) {
          adjustedR = Math.max(0, r - 60);
          adjustedG = Math.max(0, g - 60);
          adjustedB = Math.max(0, b - 60);
        }

        resolve(`${adjustedR}, ${adjustedG}, ${adjustedB}`);
      } catch {
        resolve("0, 136, 255"); // Fallback to Electric Blue
      }
    };
    img.onerror = () => {
      resolve("0, 136, 255"); // Fallback
    };
  });
};

const PlayerContextProvider = (props) => {
  const audioRef = useRef(new Audio());
  const seekBarRef = useRef(null);

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [currentSong, setCurrentSong] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 }
  });


  // Theme states
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to write theme to localStorage:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth states
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleLikeSong = (songId) => {
    let updated;
    if (likedSongs.includes(songId)) {
      updated = likedSongs.filter(id => id !== songId);
    } else {
      updated = [...likedSongs, songId];
    }
    setLikedSongs(updated);
    localStorage.setItem('liked_songs', JSON.stringify(updated));
  };

  // Queue states
  const [currentQueue, setCurrentQueue] = useState([]);
  const currentQueueRef = useRef([]);

  // Track playback state in local variables to avoid closure issues in event listeners
  const currentSongRef = useRef(null);
  const songsDataRef = useRef([]);
  const isShuffleRef = useRef(false);

  useEffect(() => {
    currentSongRef.current = currentSong;
    if (currentSong && currentSong.image) {
      extractDominantColor(currentSong.image).then((colorStr) => {
        document.documentElement.style.setProperty('--song-theme-color', colorStr);
      });
    }
  }, [currentSong]);

  useEffect(() => {
    songsDataRef.current = songsData;
    if (songsData.length > 0 && currentQueue.length === 0) {
      const timer = setTimeout(() => {
        setCurrentQueue(songsData);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [songsData, currentQueue]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    currentQueueRef.current = currentQueue;
  }, [currentQueue]);

  // Fetch initial songs and albums
  const fetchData = async () => {
    try {
      const albumsRes = await axios.get(`${API_URL}/api/album/list`);
      const songsRes = await axios.get(`${API_URL}/api/song/list`);
      
      setAlbumsData(albumsRes.data.albums || []);
      setSongsData(songsRes.data.songs || []);

      if (songsRes.data.songs && songsRes.data.songs.length > 0) {
        // Set the first song as active but paused initially
        setCurrentSong(songsRes.data.songs[0]);
        audioRef.current.src = songsRes.data.songs[0].file;
      }
    } catch (error) {
      console.error("Error loading library data from backend:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync active token & verify session
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          } else {
            logoutUser();
          }
        } catch (err) {
          console.error("Session verification failed, logging out:", err);
          logoutUser();
        }
      }
    };
    verifySession();
  }, [token]);

  // Auth Handlers
  const loginUser = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Login failed." };
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Registration failed." };
    }
  };

  function logoutUser() {
    setToken('');
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error("Failed to clear auth from localStorage:", e);
    }
  }

  const createPlaylist = async (name, tracks) => {
    if (!tracks || tracks.length === 0) return { success: false, message: "No tracks to add." };
    
    let dominantColor = "0, 136, 255";
    if (tracks[0] && tracks[0].image) {
      const colorStr = await extractDominantColor(tracks[0].image);
      dominantColor = colorStr;
    }

    const newPlaylist = {
      _id: `custom_playlist_${Date.now()}`,
      name: name || "Imported Playlist",
      desc: `Imported playlist containing ${tracks.length} tracks.`,
      image: tracks[0]?.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
      bgColour: dominantColor.includes(",") ? `rgb(${dominantColor})` : dominantColor,
      tracks: tracks.map((t, idx) => ({
        _id: t._id || t.id || `custom_song_${Date.now()}_${idx}`,
        ...t,
        album: name || "Imported Playlist"
      }))
    };

    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem('custom_playlists', JSON.stringify(updated));
    return { success: true, playlist: newPlaylist };
  };


  // Update volume on HTML5 Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Initialize Audio events
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const curTime = audio.currentTime || 0;
        const durTime = audio.duration || 0;
        setProgress((curTime / durTime) * 100);

        setTime({
          currentTime: {
            second: Math.floor(curTime % 60),
            minute: Math.floor(curTime / 60)
          },
          totalTime: {
            second: Math.floor(durTime % 60),
            minute: Math.floor(durTime / 60)
          }
        });
      }
    };

    const handleEnded = () => {
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Playback restart failed:", err));
      } else {
        next();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isLoop]);

  const play = () => {
    if (audioRef.current.src) {
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Failed to start audio playback:", err));
    }
  };

  const pause = () => {
    audioRef.current.pause();
    setPlayStatus(false);
  };

  const togglePlay = () => {
    if (playStatus) {
      pause();
    } else {
      play();
    }
  };

  const playWithId = async (id, customQueue = null) => {
    const queueToUse = customQueue || songsData;
    const song = queueToUse.find(s => s._id === id);
    if (song) {
      setCurrentQueue(queueToUse);
      setCurrentSong(song);
      audioRef.current.src = song.file;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Playback failed for song:", id, err));
    }
  };

  const playTrackDirectly = (song, customQueue = null) => {
    if (customQueue) {
      setCurrentQueue(customQueue);
    }
    setCurrentSong(song);
    audioRef.current.src = song.file;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => setPlayStatus(true))
      .catch(err => console.error("Playback failed for live track:", err));
  };

  function next() {
    const activeSongs = currentQueueRef.current;
    const activeSong = currentSongRef.current;

    if (activeSongs.length === 0 || !activeSong) return;

    if (isShuffleRef.current) {
      const randomIndex = Math.floor(Math.random() * activeSongs.length);
      const nextSong = activeSongs[randomIndex];
      setCurrentSong(nextSong);
      audioRef.current.src = nextSong.file;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Shuffle playback failed:", err));
      return;
    }

    const currentIndex = activeSongs.findIndex(s => s._id === activeSong._id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % activeSongs.length;
      const nextSong = activeSongs[nextIndex];
      setCurrentSong(nextSong);
      audioRef.current.src = nextSong.file;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Next playback failed:", err));
    }
  }

  const previous = () => {
    const activeSongs = currentQueueRef.current;
    const activeSong = currentSongRef.current;

    if (activeSongs.length === 0 || !activeSong) return;

    const currentIndex = activeSongs.findIndex(s => s._id === activeSong._id);
    if (currentIndex !== -1) {
      const prevIndex = currentIndex === 0 ? activeSongs.length - 1 : currentIndex - 1;
      const prevSong = activeSongs[prevIndex];
      setCurrentSong(prevSong);
      audioRef.current.src = prevSong.file;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Prev playback failed:", err));
    }
  };

  const seek = (e) => {
    if (seekBarRef.current && audioRef.current.duration) {
      const rect = seekBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newPercentage = Math.max(0, Math.min(1, clickX / width));
      
      audioRef.current.currentTime = newPercentage * audioRef.current.duration;
      setProgress(newPercentage * 100);
    }
  };

  const changeVolume = (val) => {
    const newVol = parseFloat(val);
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const contextValue = {
    audioRef,
    seekBarRef,
    songsData,
    albumsData: [...albumsData, ...customPlaylists],
    currentSong,
    setCurrentSong,
    playStatus,
    setPlayStatus,
    volume,
    isMuted,
    isLoop,
    isShuffle,
    progress,
    time,
    token,
    user,
    currentQueue,
    loginUser,
    registerUser,
    logoutUser,
    createPlaylist,
    customPlaylists,
    play,
    pause,
    togglePlay,
    playWithId,
    playTrackDirectly,
    next,
    previous,
    seek,
    changeVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    theme,
    setTheme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    likedSongs,
    toggleLikeSong,
    refreshLibrary: fetchData
  };


  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
