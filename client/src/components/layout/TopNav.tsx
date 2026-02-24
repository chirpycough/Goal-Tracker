import { Link } from "wouter";
import { Activity, PlaySquare } from "lucide-react";

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors duration-300">
              Pitch<span className="text-primary">Vision</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm font-medium text-white/80 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <PlaySquare className="w-4 h-4 text-primary" />
              <span>Pro Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
