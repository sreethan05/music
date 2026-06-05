import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

const AlbumItem = ({ image, name, desc, id }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/album/${id}`)}
      className="min-w-[180px] max-w-[200px] p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.05] border border-white/0 hover:border-white/5 cursor-pointer transition-all duration-400 group select-none flex flex-col gap-3.5 card-zoom"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md group-hover:shadow-2xl border border-white/5 transition-all duration-400">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {/* Play button overlay */}
        <div className="absolute right-3 bottom-3 w-11 h-11 bg-spotify-green hover:bg-green-400 text-black rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(29,185,84,0.4)] opacity-0 translate-y-3 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 hover:scale-105 active:scale-95">
          <Play className="w-5 h-5 fill-black text-black ml-0.5 stroke-0" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-0.5">
        <p className="font-bold text-sm text-white truncate tracking-tight">{name}</p>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
};

export default AlbumItem;
