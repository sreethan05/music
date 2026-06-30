import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { Music, Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

const PREVIEW_COVERS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=75"
];

const Auth = () => {
  const navigate = useNavigate();
  const { loginUser, registerUser, token, user } = useContext(PlayerContext);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token && user) {
      navigate(user.role === "admin" ? "/admin" : "/");
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
    const result = isLogin
      ? await loginUser(email, password)
      : await registerUser(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate(result.user?.role === "admin" ? "/admin" : "/");
      return;
    }

    setError(result.message || "Authentication failed. Please try again.");
  };

  return (
    <div className="w-full h-screen overflow-y-auto app-shell relative select-none flex items-center justify-center p-4 sm:p-6 no-scrollbar transition-colors duration-300">
      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-center">
        <div className="hidden lg:flex min-h-[600px] rounded-2xl overflow-hidden border border-theme-border bg-theme-card surface-ring relative">
          <img
            src={PREVIEW_COVERS[0]}
            alt="Live music"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/10" />

          <div className="relative z-10 mt-auto w-full p-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PREVIEW_COVERS.map((cover) => (
                <img
                  key={cover}
                  src={cover}
                  alt=""
                  className="aspect-square rounded-xl object-cover border border-white/10 shadow-lg"
                />
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-sky-300" />
                <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-sky-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <div className="w-full px-6 pb-6 select-none flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-[0_8px_20px_rgba(14,165,233,0.25)] hover:scale-105 transition-all duration-300">
              <Music className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight text-center">
              Music <span className="text-sky-500">Vibe</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 text-center font-bold tracking-wide">
              Sign in to continue.
            </p>
          </div>

          <div className="w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl px-7 sm:px-8 py-8 shadow-[0_15px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.2)] relative z-10 transition-all duration-300">
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {isLogin ? "Sign In" : "Sign Up"}
              </h3>
              <div className="h-[3px] w-8 bg-gradient-to-r from-sky-500 to-amber-400 rounded-full mt-2" />
            </div>

            {error && (
              <div className="w-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl mb-5 font-semibold text-center leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-extrabold tracking-widest text-slate-500 dark:text-zinc-400 uppercase block mb-1.5 pl-1.5">Full Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-sky-500 transition-colors w-4.5 h-4.5" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-500 dark:text-zinc-400 uppercase block mb-1.5 pl-1.5">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-sky-500 transition-colors w-4.5 h-4.5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
                {!isLogin && (
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1.5 pl-1.5 block leading-relaxed">
                    Administrator access is granted only to allowlisted emails.
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-extrabold tracking-widest text-slate-500 dark:text-zinc-400 uppercase block mb-1.5 pl-1.5">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-sky-500 transition-colors w-4.5 h-4.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs pl-11 pr-11 py-3.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
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

          <div className="text-center mt-6 text-xs text-slate-500 dark:text-zinc-400 select-none">
            <span>{isLogin ? "New here? " : "Already have an account? "}</span>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
            >
              {isLogin ? "Create an account" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
