import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Gauge, Map, Target, Zap, TrendingUp, 
  AlertTriangle, BrainCircuit, Play, Loader2
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
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

  // Format data for Recharts (Normalize to 0-100 scales for radar)
  const radarData = video.status === 'completed' ? [
    { subject: 'Speed', A: Math.min(Math.max(((video.maxSpeedKmh || 25) - 25) / (35 - 25) * 100, 0), 100) },
    { subject: 'Stamina', A: Math.min(Math.max(((video.distanceCoveredKm || 8) - 8) / (12 - 8) * 100, 0), 100) },
    { subject: 'Control', A: Math.min(Math.max(((video.ballTouches || 20) - 20) / (100 - 20) * 100, 0), 100) },
    { subject: 'Attacking', A: Math.min((video.shots || 0) / 6 * 100, 100) },
    { subject: 'Vision', A: Math.min((video.keyPasses || 0) / 6 * 100, 100) },
  ] : [];

  const barData = video.status === 'completed' ? [
    { name: 'Touches', count: video.ballTouches || 0 },
    { name: 'Passes', count: video.passes || 0 },
    { name: 'Dribbles', count: video.dribbles || 0 },
    { name: 'Shots', count: video.shots || 0 },
    { name: 'Key Passes', count: video.keyPasses || 0 },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              {video.originalName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              Uploaded {format(new Date(video.uploadDate), "MMMM d, yyyy")}
              {video.playerColor && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  Tracking Color: <span className="capitalize text-white/80">{video.playerColor}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {isFailed ? (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-8 glass-panel rounded-3xl border border-destructive/30 bg-destructive/5 text-center">
             <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
             <h2 className="text-xl font-bold text-white mb-2">Processing Failed</h2>
             <p className="text-muted-foreground">We encountered an error analyzing this footage. Please try uploading the video again.</p>
           </motion.div>
        ) : isProcessing ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-20 text-center flex flex-col items-center">
             <div className="relative mb-8">
               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full w-32 h-32 animate-pulse-fast" />
               <div className="w-24 h-24 bg-card rounded-2xl border border-primary/30 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                 <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
               </div>
             </div>
             <h2 className="text-3xl font-display font-bold text-white mb-4">AI Analysis in Progress</h2>
             <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
               Our computer vision models are tracking player movement, detecting ball touches, and mapping field positions.
             </p>
             <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-1/2 animate-[progress_2s_ease-in-out_infinite]" style={{ transformOrigin: 'left' }} />
             </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Distance Covered" 
                value={`${video.distanceCoveredKm?.toFixed(2) || 0} km`} 
                icon={<Activity className="w-5 h-5" />} 
                delay={0.1}
                highlight
              />
              <StatCard 
                title="Max Speed" 
                value={`${video.maxSpeedKmh?.toFixed(1) || 0} km/h`} 
                subtitle={`Avg: ${video.averageSpeedKmh?.toFixed(1) || 0} km/h`}
                icon={<Zap className="w-5 h-5" />} 
                delay={0.2}
              />
              <StatCard 
                title="Ball Touches" 
                value={video.ballTouches || 0} 
                icon={<Target className="w-5 h-5" />} 
                delay={0.3}
              />
              <StatCard 
                title="Performance Rating" 
                value={(video.performanceRating || 0).toFixed(1)} 
                subtitle="Out of 10.0"
                icon={<Gauge className="w-5 h-5" />} 
                delay={0.4}
              />
            </div>

            {/* Extended Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Passes</p>
                <p className="text-xl font-display font-bold text-white">{video.passes || 0}</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.min((video.passes || 0) / 80 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Dribbles</p>
                <p className="text-xl font-display font-bold text-white">{video.dribbles || 0}</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.min((video.dribbles || 0) / 10 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Shots (OT)</p>
                <p className="text-xl font-display font-bold text-white">{video.shots || 0} ({video.shotsOnTarget || 0})</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.min((video.shots || 0) / 6 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tackles</p>
                <p className="text-xl font-display font-bold text-white">{video.tackles || 0}</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.min((video.tackles || 0) / 10 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Fouls Drawn</p>
                <p className="text-xl font-display font-bold text-white">{video.foulsDrawn || 0}</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${Math.min((video.foulsDrawn || 0) / 5 * 100, 100)}%` }} />
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Offsides</p>
                <p className="text-xl font-display font-bold text-white">{video.offsides || 0}</p>
                <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-destructive/60" style={{ width: `${Math.min((video.offsides || 0) / 5 * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Heatmap */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Map className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-white">Movement Heatmap</h3>
                </div>
                <div className="aspect-video w-full rounded-2xl bg-[#2D4A22] overflow-hidden relative border border-white/10">
                  {video.heatmapImageUrl ? (
                    <img src={video.heatmapImageUrl} alt="Player Heatmap" className="w-full h-full object-cover mix-blend-screen" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                      <Map className="w-12 h-12 mb-3 opacity-50" />
                      <p>Heatmap generated overlay</p>
                    </div>
                  )}
                  
                  {/* Field lines decorative overlay */}
                  <div className="absolute inset-0 border-2 border-white/20 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20 pointer-events-none" />
                </div>
              </motion.div>

              {/* Right Column: Charts & Profile */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-white">Player Profile</h3>
                </div>
                
                <div className="flex-1 min-h-[250px] -mx-4 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                      <Radar name="Player" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-48 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* AI Summary Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="glass-panel rounded-3xl p-8 border border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary/20 text-primary"><BrainCircuit className="w-5 h-5" /></span>
                  Key Strengths
                </h3>
                <div className="text-white/80 leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap">
                  {video.strengths || "AI analysis of strengths is currently unavailable."}
                </div>
              </div>
              
              <div className="glass-panel rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-white/10 text-muted-foreground"><Target className="w-5 h-5" /></span>
                  Areas for Improvement
                </h3>
                <div className="text-muted-foreground leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap">
                  {video.weaknesses || "AI analysis of weaknesses is currently unavailable."}
                </div>
              </div>
            </motion.div>

            {/* Pro Analysis & Scout Recommendation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-primary/30 bg-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Gauge className="w-24 h-24" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  Pro Tactical Analysis
                </h3>
                <div className="text-white/90 leading-relaxed text-lg font-medium bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                  {video.proAnalysis || "Detailed tactical analysis for coaching staff will appear here."}
                </div>
                <div className="mt-6 flex items-center gap-4 text-xs font-display uppercase tracking-widest text-primary/60">
                  <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Positional Heatmap Verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> AI Generated Insights</span>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-8 border border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 opacity-10">
                  <Target className="w-32 h-32 text-yellow-500" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                  </div>
                  Scout Recommendation
                </h3>
                <div className="text-yellow-100/80 leading-relaxed italic border-l-4 border-yellow-500/50 pl-4 py-2">
                  {video.scoutRecommendation || "Professional scouting notes and recruitment level assessment."}
                </div>
                <button className="w-full mt-8 py-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-display font-bold uppercase tracking-widest text-xs border border-yellow-500/30 transition-all active:scale-95">
                  Export Scout Report (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      
      {/* Global CSS for progress animation in loading state */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: scaleX(0); opacity: 0.5; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0); opacity: 0.5; transform-origin: right; }
        }
      `}} />
    </div>
  );
}
