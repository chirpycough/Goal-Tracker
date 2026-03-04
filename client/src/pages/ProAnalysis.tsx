import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Gauge, Map, Target, Zap, TrendingUp, 
  AlertTriangle, BrainCircuit, Play, Loader2, DollarSign, UserCheck, 
  ShieldAlert, ArrowUpRight, Award, Flame
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

import { TopNav } from "@/components/layout/TopNav";
import { StatCard } from "@/components/video/StatCard";
import { useVideo } from "@/hooks/use-videos";

export default function ProAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, error } = useVideo(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading premium scouting report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Analysis Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested video could not be found.</p>
            <Link href="/" className="text-primary hover:underline font-medium">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = video.status === 'pending' || video.status === 'processing';
  const radarData = video.status === 'completed' ? [
    { subject: 'Speed', A: Math.min(Math.max(((video.maxSpeedKmh || 25) - 25) / (35 - 25) * 100, 0), 100) },
    { subject: 'Stamina', A: Math.min(Math.max(((video.distanceCoveredKm || 8) - 8) / (12 - 8) * 100, 0), 100) },
    { subject: 'Control', A: Math.min(Math.max(((video.ballTouches || 20) - 20) / (100 - 20) * 100, 0), 100) },
    { subject: 'Attacking', A: Math.min((video.shots || 0) / 6 * 100, 100) },
    { subject: 'Vision', A: Math.min((video.keyPasses || 0) / 6 * 100, 100) },
    { subject: 'Defending', A: Math.min((video.tackles || 0) / 6 * 100, 100) },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/analysis/${id}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">Pro Analysis Report</h1>
            <p className="text-sm text-muted-foreground mt-1">{video.originalName}</p>
          </div>
        </div>

        {isProcessing ? (
          <div className="py-20 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Analysis in Progress</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Market Value</p>
                  <p className="text-3xl font-display font-bold text-white">{video.marketValue || "N/A"}</p>
               </div>
               <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Pro Comparison</p>
                  <p className="text-2xl font-display font-bold text-white">{video.similarProPlayer || "N/A"}</p>
               </div>
               <div className="glass-panel p-6 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Potential Ceiling</p>
                  <p className="text-2xl font-display font-bold text-white">{video.potentialCeiling || "N/A"}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-6">Tactical Breakdown</h3>
                <div className="text-white/90 leading-relaxed text-lg bg-black/30 p-8 rounded-2xl border border-white/10">
                  {video.proAnalysis}
                </div>
              </div>
              <div className="glass-panel rounded-3xl p-8 border border-yellow-500/30 bg-yellow-500/5">
                <h3 className="text-xl font-display font-bold text-white mb-6">Scout Verdict</h3>
                <div className="text-yellow-100/80 italic border-l-4 border-yellow-500/40 pl-6 py-2 text-lg">
                  {video.scoutRecommendation}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-white/5">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="w-full md:w-1/2 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                      <Radar name="Player" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                 </div>
                 <div className="w-full md:w-1/2 space-y-4">
                   <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-white/60">Tactical Role</span>
                     <span className="text-white font-bold">{video.tacticalRole}</span>
                   </div>
                   <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-white/60">Work Rate</span>
                     <span className="text-white font-bold">{video.workRate}</span>
                   </div>
                   <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-white/60">Injury Risk</span>
                     <span className="text-white font-bold">{video.injuryRisk}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
