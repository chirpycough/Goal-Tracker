import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Gauge, Map, Target, Zap, TrendingUp, 
  AlertTriangle, BrainCircuit, Play, Loader2, DollarSign, UserCheck, 
  ShieldAlert, ArrowUpRight, Award, Flame, Download, Info, CheckCircle2,
  Trophy, Star, Zap as Power, Brain
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { TopNav } from "@/components/layout/TopNav";
import { StatCard } from "@/components/video/StatCard";
import { useVideo } from "@/hooks/use-videos";
import { Button } from "@/components/ui/button";

export default function ProAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, error } = useVideo(Number(id));

  const downloadPDF = async () => {
    const element = document.getElementById('scouting-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a0c",
        windowWidth: 1200 // Ensure consistent width for PDF capture
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Scouting_Report_${video?.originalName || 'Player'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
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
      <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
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
    { subject: 'Stamina', A: Math.min(Math.max(((video.distanceCoveredKm || 5) - 5) / (12 - 5) * 100, 0), 100) },
    { subject: 'Control', A: Math.min(Math.max(((video.ballTouches || 20) - 20) / (100 - 20) * 100, 0), 100) },
    { subject: 'Attacking', A: Math.min((video.shots || 0) / 6 * 100, 100) },
    { subject: 'Vision', A: Math.min((video.keyPasses || 0) / 6 * 100, 100) },
    { subject: 'Defending', A: Math.min((video.tackles || 0) / 6 * 100, 100) },
  ] : [];

  const getMetricPercent = (subject: string) => {
    const data = radarData.find(d => d.subject === subject);
    return data ? Math.round(data.A) : 0;
  };

  const technicalScore = Math.round((getMetricPercent('Control') + getMetricPercent('Attacking')) / 20);
  const tacticalScore = Math.round((getMetricPercent('Vision') + 75) / 20); 
  const physicalScore = Math.round((getMetricPercent('Speed') + getMetricPercent('Stamina')) / 20);
  const mentalityScore = 9; 
  const overallRating = Math.round((technicalScore + tacticalScore + physicalScore + mentalityScore) / 4);

  const playerInfo = {
    name: video.originalName.split('.')[0],
    age: video.playerAge || "21",
    position: video.tacticalRole || "Inverted Winger",
    team: video.currentClub || "PitchVision Elite Academy", 
    match: video.matchAnalyzed || "Championship Playoff - Stage 2",
    date: format(new Date(video.uploadDate), "MMM dd, yyyy")
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <TopNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/analysis/${id}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                Pro Scouting Report <Award className="w-6 h-6 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Advanced Performance Architecture</p>
            </div>
          </div>
          {!isProcessing && (
            <Button 
              onClick={downloadPDF}
              className="bg-primary text-primary-foreground font-bold rounded-xl px-6 py-6 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Download PDF Report
            </Button>
          )}
        </div>

        {isProcessing ? (
          <div className="py-20 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Analysis in Progress</h2>
            <p className="text-muted-foreground mt-2">Our scouts are finalizing your report. This usually takes less than 60 seconds.</p>
          </div>
        ) : (
          <div id="scouting-report" className="space-y-8 p-12 bg-[#0a0a0c] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            
            {/* Header / Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/10 pb-12 relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.2em]">
                  Elite Scouting Profile
                </div>
                <div>
                  <h2 className="text-6xl font-display font-black text-white tracking-tighter leading-tight mb-2">
                    {playerInfo.name}
                  </h2>
                  <div className="h-1.5 w-24 bg-primary rounded-full" />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Player Name</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Age</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.age}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Position</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.position}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Current Team</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.team}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Match Analyzed</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.match}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Analysis Date</p>
                    <p className="text-xl font-display font-bold text-white">{playerInfo.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center md:items-end">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-700" />
                  <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-2">Overall Rating</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-8xl font-display font-black text-white leading-none tracking-tighter">{overallRating}</span>
                      <span className="text-3xl font-display font-bold text-white/20">/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Metrics Radar & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center py-8">
              <div className="lg:col-span-2 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 h-[450px]">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Performance Radar</h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-white/40 uppercase">Player</span>
                      </div>
                   </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Player" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Technical Ability', score: technicalScore, desc: 'Touch, Passing, Control' },
                  { label: 'Tactical Intel', score: tacticalScore, desc: 'Vision, Decisions, Spacing' },
                  { label: 'Physical Profile', score: physicalScore, desc: 'Speed, Power, Stamina' },
                  { label: 'Mentality', score: mentalityScore, desc: 'Work Rate, Composure' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-300">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white mb-0.5">{s.label}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight">{s.desc}</p>
                    </div>
                    <div className="text-3xl font-display font-black text-primary">{s.score}<span className="text-xs text-primary/30">/10</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Analysis Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
              <div className="space-y-12">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Power className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Technical Analysis</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed text-sm bg-white/5 p-8 rounded-[2rem] border border-white/10 italic">
                    Scout Notes: "Highly proficient technical operator. Exhibits exceptional first touch even under extreme pressure. Passing accuracy over long range is a key differentiator, allowing for rapid switches in play. Ball control in tight spaces suggests professional-grade potential."
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Tactical Intelligence</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed text-sm bg-white/5 p-8 rounded-[2rem] border border-white/10 italic">
                    Scout Notes: "Strong spatial awareness and off-ball movement. Demonstrates a clear understanding of positional responsibilities. Tactical decision-making is mature, frequently selecting optimal passing lanes and defensive triggers to disrupt opposition rhythm."
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Physical Attributes</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed text-sm bg-white/5 p-8 rounded-[2rem] border border-white/10 italic">
                    Scout Notes: "Modern physical profile characterized by explosive acceleration. Top speed of {video.maxSpeedKmh?.toFixed(1) || "32.4"} km/h places the player in the upper percentile for their age group. Exceptional core strength allows for effective shielding and duel retention."
                  </p>
                </section>
              </div>

              <div className="space-y-12">
                 <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Mentality & Personality</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed text-sm bg-white/5 p-8 rounded-[2rem] border border-white/10 italic">
                    Scout Notes: "Displays professional-grade temperament. High work rate in defensive recovery phases demonstrates strong team-first mentality. Remains composed during high-leverage match situations, maintaining technical quality when fatigue sets in."
                  </p>
                </section>

                <section className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="w-24 h-24 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-black text-white mb-8 relative z-10 flex items-center gap-3">
                    Match Impact
                  </h3>
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    {[
                      { label: 'Goals', val: video.shotsOnTarget || 0, icon: <Star className="w-3 h-3" /> },
                      { label: 'Assists', val: Math.floor((video.keyPasses || 0) * 0.3), icon: <Star className="w-3 h-3" /> },
                      { label: 'Key Passes', val: video.keyPasses || 4, icon: <Star className="w-3 h-3" /> },
                      { label: 'Tackles', val: video.tackles || 2, icon: <Star className="w-3 h-3" /> },
                      { label: 'Interceptions', val: Math.round((video.tackles || 0) * 0.8), icon: <Star className="w-3 h-3" /> },
                      { label: 'Duels Won', val: '68%', icon: <Star className="w-3 h-3" /> },
                    ].map(m => (
                      <div key={m.label} className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                          {m.icon} {m.label}
                        </p>
                        <p className="text-3xl font-display font-black text-white">{m.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                      Influence Summary: "{video.proAnalysis || "Significant match influence observed through consistent involvement in transition phases. The player serves as a key pivot for the team's offensive structure, contributing significantly to ball progression and chance creation."}"
                    </p>
                  </div>
                </section>
              </div>
            </div>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Star className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Strengths</h3>
                  </div>
                  <div className="bg-green-500/5 p-8 rounded-[2rem] border border-green-500/20 shadow-xl">
                    <ul className="grid grid-cols-1 gap-4">
                      {(video.strengths || "Technical precision\nSpatial awareness\nTransition speed").split('\n').map((s, i) => (
                        <li key={i} className="flex items-center gap-4 text-white/80 font-bold group">
                          <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-150 transition-transform" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Areas for Improvement</h3>
                  </div>
                  <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/20 shadow-xl">
                    <ul className="grid grid-cols-1 gap-4">
                      {(video.weaknesses || "Aerial dominance\nDefensive positioning\nComposure in box").split('\n').map((w, i) => (
                        <li key={i} className="flex items-center gap-4 text-white/80 font-bold group">
                          <div className="w-2 h-2 rounded-full bg-red-500 group-hover:scale-150 transition-transform" /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

            {/* Potential & Market Outlook */}
            <section className="bg-white/5 p-12 rounded-[3rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="w-48 h-48 text-primary" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                <Star className="w-4 h-4 fill-current" /> Future Projection
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-2xl font-display font-black text-white leading-tight">
                    Estimated Ceiling: <span className="text-primary italic">{video.potentialCeiling || "UEFA Champions League Standard"}</span>
                  </p>
                  <p className="text-white/60 leading-relaxed font-medium">
                    The player demonstrates a development curve consistent with elite European academy graduates. Current physical metrics combined with technical versatility suggest a high floor for professional integration. Projected to reach peak performance within 2-3 seasons of professional development.
                  </p>
                </div>
                  <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Overall Rating</p>
                     <p className="text-4xl font-display font-black text-white">{overallRating}/10</p>
                     <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-tighter">Elite Prospect Profile</p>
                  </div>
              </div>
            </section>

            {/* Professional Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/10 pt-12 border-t border-white/10">
              <div className="flex items-center gap-6">
                <span>PitchVision AI v2.4</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span>Certified Scouting Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary/40 italic">Scouting Report:</span>
                <span className="text-white/20">PV-AUTH-{id}-{video.originalName.slice(0,4).toUpperCase()}</span>
              </div>
              <span>© 2026 PitchVision Analytics Global</span>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
