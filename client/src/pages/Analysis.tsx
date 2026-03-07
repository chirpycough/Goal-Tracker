import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Gauge, Map, Target, Zap, TrendingUp, 
  AlertTriangle, BrainCircuit, Play, Loader2
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

import { TopNav } from "@/components/layout/TopNav";
import { StatCard } from "@/components/video/StatCard";
import { useVideo } from "@/hooks/use-videos";

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, error } = useVideo(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading match data...</p>
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
  const isFailed = video.status === 'failed';

  const radarData = video.status === 'completed' ? [
    { subject: 'Speed', A: Math.min(Math.max(((video.maxSpeedKmh || 25) - 25) / (35 - 25) * 100, 0), 100) },
    { subject: 'Stamina', A: Math.min(Math.max(((video.distanceCoveredKm || 8) - 8) / (12 - 8) * 100, 0), 100) },
    { subject: 'Control', A: Math.min(Math.max(((video.ballTouches || 20) - 20) / (100 - 20) * 100, 0), 100) },
    { subject: 'Attacking', A: Math.min((video.shots || 0) / 6 * 100, 100) },
    { subject: 'Vision', A: Math.min((video.keyPasses || 0) / 6 * 100, 100) },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">{video.originalName}</h1>
              <p className="text-sm text-muted-foreground mt-1">Uploaded {format(new Date(video.uploadDate), "MMMM d, yyyy")}</p>
            </div>
          </div>
          {!isProcessing && !isFailed && (
            <Link href={`/pro-analysis/${id}`} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <Zap className="w-4 h-4" /> Pro Analysis
            </Link>
          )}
        </div>

        {isFailed ? (
           <div className="p-8 glass-panel rounded-3xl border border-destructive/30 bg-destructive/5 text-center">
             <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
             <h2 className="text-xl font-bold text-white mb-2">Processing Failed</h2>
           </div>
        ) : isProcessing ? (
          <div className="py-20 text-center flex flex-col items-center">
             <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-4" />
             <h2 className="text-3xl font-display font-bold text-white mb-4">AI Analysis in Progress</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Distance" value={`${video.distanceCoveredKm?.toFixed(2) || 0} km`} icon={<Activity className="w-5 h-5" />} highlight />
              <StatCard title="Max Speed" value={`${video.maxSpeedKmh?.toFixed(1) || 0} km/h`} icon={<Zap className="w-5 h-5" />} />
              <StatCard title="Touches" value={video.ballTouches || 0} icon={<Target className="w-5 h-5" />} />
              <StatCard title="Rating" value={(video.performanceRating || 0).toFixed(1)} icon={<Gauge className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <Map className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-white">Movement Heatmap</h3>
                </div>
                <div className="aspect-video w-full rounded-2xl bg-[#2D4A22] overflow-hidden relative border border-white/10">
                  {video.heatmapImageUrl && <img src={video.heatmapImageUrl} className="w-full h-full object-cover mix-blend-screen" />}
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-white">Player Profile</h3>
                </div>
                <div className="flex flex-col gap-4 mb-6 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground uppercase tracking-widest font-bold flex-shrink-0">Player:</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{video.originalName.split('.')[0]}</span>
                  </div>
                  {video.playerAge && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground uppercase tracking-widest font-bold flex-shrink-0">Age:</span>
                      <span className="text-white font-medium">{video.playerAge}</span>
                    </div>
                  )}
                  {video.tacticalRole && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground uppercase tracking-widest font-bold flex-shrink-0">Role:</span>
                      <span className="text-white font-medium truncate max-w-[180px]">{video.tacticalRole}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                      <Radar name="Player" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-4">Key Strengths</h3>
                <div className="text-white/80 leading-relaxed">{video.strengths}</div>
              </div>
              <div className="glass-panel rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-4">Areas for Improvement</h3>
                <div className="text-white/60 leading-relaxed">{video.weaknesses}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
