import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Gauge, Map, Target, Zap, TrendingUp, 
  AlertTriangle, BrainCircuit, Play, Loader2, DollarSign, UserCheck, 
  ShieldAlert, ArrowUpRight, Award, Flame
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
  const isFailed = video.status === 'failed';

  // Format data for Recharts (Normalize to 0-100 scales for radar)
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
        {/* Header navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Premium Report</span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                  {video.originalName}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Analyzed {format(new Date(video.uploadDate), "MMMM d, yyyy")}
                {video.playerColor && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    Tracking Color: <span className="capitalize text-white/80">{video.playerColor}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all flex items-center gap-2">
               Download PDF
             </button>
             <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
               Share Report
             </button>
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
             <h2 className="text-3xl font-display font-bold text-white mb-4">AI Deep Analysis in Progress</h2>
             <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
               Our neural networks are evaluating positioning, calculating market value, and generating tactical comparisons.
             </p>
             <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-1/2 animate-[progress_2s_ease-in-out_infinite]" style={{ transformOrigin: 'left' }} />
             </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Market & Identity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Estimated Market Value</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-1">{video.marketValue || "Analyzing..."}</p>
                  <p className="text-xs text-muted-foreground">Based on performance metrics & potential</p>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/10 text-white/80">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pro Player Comparison</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">{video.similarProPlayer || "Calculating..."}</p>
                  <p className="text-xs text-muted-foreground">Similarity based on movement & style</p>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/10 text-white/80">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Potential Ceiling</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">{video.potentialCeiling || "Assessing..."}</p>
                  <p className="text-xs text-muted-foreground">Projected peak performance level</p>
               </motion.div>
            </div>

            {/* Main Metrics and Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
                  {/* Performance Radar & Details */}
                  <div className="glass-panel rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Activity className="w-48 h-48 text-primary" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                       <div className="w-full md:w-1/2 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }} />
                            <Radar name="Player" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                       </div>
                       <div className="w-full md:w-1/2 space-y-6">
                          <div>
                             <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Elite Attributes</h3>
                             <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                 <span className="text-white/70 text-sm">Tactical Role</span>
                                 <span className="text-white font-bold">{video.tacticalRole || "Balanced"}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-white/70 text-sm">Work Rate</span>
                                 <span className="text-white font-bold">{video.workRate || "High/Medium"}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-white/70 text-sm">Injury Risk</span>
                                 <span className={`font-bold ${video.injuryRisk === 'Low' ? 'text-primary' : 'text-yellow-500'}`}>{video.injuryRisk || "Low"}</span>
                               </div>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-4xl font-display font-bold text-white">{(video.performanceRating || 0).toFixed(1)}</span>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Overall Rating</p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className={`w-3 h-1 rounded-full ${s <= Math.round((video.performanceRating || 0) / 2) ? 'bg-primary' : 'bg-white/10'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Heatmap Overlay */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-display font-bold text-white">Positional Heatmap</h3>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Verified Positional Tracking</span>
                    </div>
                    <div className="aspect-video w-full rounded-2xl bg-[#1a2f14] overflow-hidden relative border border-white/10 group">
                      {video.heatmapImageUrl ? (
                        <img src={video.heatmapImageUrl} alt="Player Heatmap" className="w-full h-full object-cover mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                          <Map className="w-10 h-10 mb-2 opacity-50" />
                          <p className="text-sm">Heatmap analysis overlaying match footage</p>
                        </div>
                      )}
                      {/* Decorative field markings */}
                      <div className="absolute inset-0 border-2 border-white/10 pointer-events-none m-4" />
                      <div className="absolute top-4 bottom-4 left-1/2 w-px bg-white/10 pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/10 pointer-events-none" />
                    </div>
                  </div>
               </motion.div>

               {/* Stats Column */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <StatCard 
                    title="Distance" 
                    value={`${video.distanceCoveredKm?.toFixed(2) || 0}km`} 
                    icon={<Activity className="w-5 h-5" />} 
                    highlight
                  />
                  <StatCard 
                    title="Max Speed" 
                    value={`${video.maxSpeedKmh?.toFixed(1) || 0}km/h`} 
                    subtitle={`Avg Speed: ${video.averageSpeedKmh?.toFixed(1) || 0}km/h`}
                    icon={<Zap className="w-5 h-5" />} 
                  />
                  <StatCard 
                    title="Ball Touches" 
                    value={video.ballTouches || 0} 
                    icon={<Target className="w-5 h-5" />} 
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                     {[
                       { label: 'Passes', val: video.passes, icon: <TrendingUp className="w-3 h-3"/> },
                       { label: 'Dribbles', val: video.dribbles, icon: <Flame className="w-3 h-3"/> },
                       { label: 'Shots (OT)', val: `${video.shots}(${video.shotsOnTarget})`, icon: <Target className="w-3 h-3"/> },
                       { label: 'Tackles', val: video.tackles, icon: <ShieldAlert className="w-3 h-3"/> }
                     ].map((s, i) => (
                       <div key={i} className="glass-panel p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1 opacity-40">
                             {s.icon}
                             <span className="text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
                          </div>
                          <p className="text-xl font-display font-bold text-white">{s.val || 0}</p>
                       </div>
                     ))}
                  </div>
                  
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Metric Distribution</h4>
                     <div className="space-y-4">
                        {[
                          { l: 'Consistency', p: 85 },
                          { l: 'Efficiency', p: 72 },
                          { l: 'Discipline', p: 94 }
                        ].map((m, i) => (
                          <div key={i}>
                             <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                               <span className="text-white/60">{m.l}</span>
                               <span className="text-primary">{m.p}%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${m.p}%` }} transition={{ delay: 0.8 + (i*0.1) }} className="h-full bg-primary/60" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* AI Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-panel rounded-3xl p-8 border border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Award className="w-5 h-5" />
                  </div>
                  Technical Strengths
                </h3>
                <div className="text-white/80 leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap font-medium">
                  {video.strengths || "Detailed strengths report is being compiled by our AI scouts."}
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-panel rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-muted-foreground">
                    <Target className="w-5 h-5" />
                  </div>
                  Strategic Opportunities
                </h3>
                <div className="text-muted-foreground leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap">
                  {video.weaknesses || "Growth analysis will highlight areas for focused training."}
                </div>
              </motion.div>
            </div>

            {/* Pro Analysis & Scout Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="lg:col-span-2 glass-panel rounded-3xl p-10 border border-primary/30 bg-primary/5 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <BrainCircuit className="w-48 h-48" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white">Advanced Tactical Breakdown</h3>
                </div>
                <div className="text-white/90 leading-relaxed text-lg font-medium bg-black/30 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative z-10">
                  {video.proAnalysis || "Comprehensive tactical breakdown providing elite coaching insights."}
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                   <div className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> AI Trajectory Verified</div>
                   <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Professional Tier Assessment</div>
                   <div className="flex items-center gap-2 text-white/40"><Play className="w-4 h-4" /> Based on Match Logic v2.4</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="glass-panel rounded-3xl p-8 border border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden flex flex-col"
              >
                <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
                  <TrendingUp className="w-48 h-48 text-yellow-500" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <UserCheck className="w-7 h-7 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">Scout Final Verdict</h3>
                </div>
                <div className="flex-1 text-yellow-100/80 leading-relaxed italic border-l-4 border-yellow-500/40 pl-6 py-2 text-lg">
                  {video.scoutRecommendation || "Official recruitment assessment and recommendation status."}
                </div>
                <button className="w-full mt-10 py-4 rounded-2xl bg-yellow-500 text-yellow-950 font-display font-bold uppercase tracking-widest text-sm shadow-lg shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Generate PDF Scout Card
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </main>
      
      {/* Global CSS for progress animation */}
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
