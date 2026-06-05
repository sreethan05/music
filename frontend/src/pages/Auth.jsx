import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { Music, Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { loginUser, registerUser, token, user } = useContext(PlayerContext);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Role-based redirect if already authenticated
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    let result;
    if (isLogin) {
      result = await loginUser(email, password);
    } else {
      result = await registerUser(name, email, password);
    }
    setLoading(false);

    if (result.success) {
      const isAdmin = email.toLowerCase().includes('admin@');
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message || "Authentication failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-tr from-[#f0f4ff] via-[#faf8ff] to-[#fefeff] relative overflow-hidden select-none flex items-center justify-center p-6 no-scrollbar">
      
      {/* Decorative Wavy Lines (Vector ribbon effect matching the mockup image) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#818cf8" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#a78bfa" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Left side wave ribbon */}
        <path d="M -100 480 C 150 430, 80 230, 350 330 S 280 630, 550 530" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M -100 500 C 130 450, 100 250, 330 350 S 300 610, 570 510" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M -100 520 C 110 470, 120 270, 310 370 S 320 590, 590 490" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M -100 460 C 170 410, 60 210, 370 310 S 260 650, 530 550" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M -100 440 C 190 390, 40 190, 390 290 S 240 670, 510 570" stroke="url(#wave-gradient)" strokeWidth="1.2" />

        {/* Right side wave ribbon */}
        <path d="M 850 330 C 1120 430, 1010 630, 1280 530 S 1180 230, 1550 280" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M 830 350 C 1100 410, 1030 650, 1260 550 S 1200 250, 1570 260" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M 870 310 C 1140 450, 990 610, 1300 510 S 1160 210, 1530 300" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M 810 370 C 1080 390, 1050 670, 1240 570 S 1220 270, 1590 240" stroke="url(#wave-gradient)" strokeWidth="1.2" />
        <path d="M 890 290 C 1160 470, 970 590, 1320 490 S 1140 190, 1510 320" stroke="url(#wave-gradient)" strokeWidth="1.2" />
      </svg>

      {/* Decorative Blurred Spheres */}
      <div className="absolute top-[10%] left-[8%] w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] right-[5%] w-80 h-80 bg-purple-400/12 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-[440px] flex flex-col items-center relative z-10">
        
        {/* Header Logo & Title */}
        <div className="w-full px-6 pb-6 select-none flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-650 flex items-center justify-center text-white mb-4 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:scale-105 transition-all duration-300 cursor-pointer">
            <Music className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center">
            Music <span className="text-indigo-600">Vibe</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 text-center font-bold tracking-wide">
            Unleash your playlists.
          </p>
        </div>

        {/* Form panel card */}
        <div className="w-full bg-white border border-slate-100 rounded-[32px] px-8 py-9 shadow-[0_15px_45px_rgba(0,0,0,0.04)] relative z-10">
          
          {/* Card Title Tab */}
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {isLogin ? "Sign In" : "Sign Up"}
            </h3>
            <div className="h-[3px] w-8 bg-gradient-to-r from-blue-600 to-purple-650 rounded-full mt-2" />
          </div>

          {error && (
            <div className="w-full bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-2xl mb-5 font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4.5">
            {/* Name Field (Only on Sign Up) */}
            {!isLogin && (
              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase block mb-1.5 pl-1.5">Full Name</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors w-4.5 h-4.5" />
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs pl-11 pr-4 py-3.5 rounded-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase block mb-1.5 pl-1.5">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors w-4.5 h-4.5" />
                <input 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs pl-11 pr-4 py-3.5 rounded-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              {!isLogin && (
                <span className="text-[9px] text-slate-400 mt-1.5 pl-1.5 block leading-relaxed">
                  Tip: Emails containing <strong className="text-indigo-600">admin@</strong> receive administrator roles.
                </span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase block mb-1.5 pl-1.5">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors w-4.5 h-4.5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs pl-11 pr-11 py-3.5 rounded-[14px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-[16px] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Toggle Control */}
        <div className="text-center mt-6 text-xs text-slate-500 select-none">
          <span>{isLogin ? "New here? " : "Already have an account? "}</span>
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            {isLogin ? "Create an account" : "Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Auth;
