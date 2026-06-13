import { useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Navbar from "./components/Navbar";
import RightPanel from "./components/RightPanel";
import MobileNavBar from "./components/MobileNavBar";
import Home from "./pages/Home";
import AlbumDetail from "./pages/AlbumDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import { PlayerContext } from "./context/PlayerContext";
import { ShieldAlert } from "lucide-react";
import FullScreenPlayer from "./components/FullScreenPlayer";
import PlaylistSelectorModal from "./components/PlaylistSelectorModal";

// Admin Protection Wrapper Component
const AdminGuard = ({ children }) => {
  const { user } = useContext(PlayerContext);
  const navigate = useNavigate();

  if (user && user.role === 'admin') {
    return children;
  }

  return (
    <div className="flex-1 h-full overflow-y-auto pb-24 bg-white flex items-center justify-center px-6 relative select-none">
      <div className="w-full max-w-[420px] bg-slate-50 p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-5">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-black text-slate-800 tracking-tight text-center">
          Admin Access Denied
        </h2>
        <p className="text-xs text-slate-400 mt-2 text-center font-bold leading-relaxed">
          Your account does not have administrator privileges. Please log in with an administrator email (e.g., containing <strong className="text-amber-500">admin@</strong>) to manage songs and albums.
        </p>

        <div className="flex flex-col gap-3 w-full mt-6">
          <button 
            onClick={() => navigate("/auth")}
            className="w-full py-3.5 bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl hover:scale-101 active:scale-99 transition-all cursor-pointer shadow-md"
          >
            Log In as Admin
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs tracking-wider uppercase rounded-2xl hover:scale-101 active:scale-99 transition-all cursor-pointer hover:bg-slate-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { token, user } = useContext(PlayerContext);

  if (!token || !user) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen bg-[#f3f4f6] text-slate-800 flex overflow-hidden font-sans select-none transition-colors duration-300">
      
      {/* Left Column: Sidebar (Desktop only) */}
      <Sidebar />

      {/* Center Column: Navigation + Content + Embed Player */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 pt-3 pb-6 relative z-10">
        
        {/* Top Navbar search & actions header */}
        <Navbar />

        {/* Scrollable central content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/album/:id" element={<AlbumDetail />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/profile" element={<UserDashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>

        {/* Compact bottom player bar */}
        <Player />
      </div>

      {/* Right Column: Shortcuts, Fav artists & Playing artwork (Desktop only) */}
      <RightPanel />

      {/* Mobile Bottom Navigation Bar (Mobile only) */}
      <MobileNavBar />

      {/* Full-screen player, lyrics and visualizer overlay */}
      <FullScreenPlayer />

      {/* Playlist Selector Modal overlay */}
      <PlaylistSelectorModal />
    </div>
  );
}

export default App;
