import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, Video, Activity, Clock, AlertCircle, BarChart3, ChevronRight, Trash2 } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { UploadDialog } from "@/components/video/UploadDialog";
import { useVideos, useDeleteVideo } from "@/hooks/use-videos";
import { ChatRoom } from "@/components/dashboard/ChatRoom";

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: videos, isLoading } = useVideos();
  const deleteMutation = useDeleteVideo();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
              <div>
                <h1 className="text-5xl font-display font-bold text-white mb-3">My Analyses</h1>
                <p className="text-muted-foreground text-xl">Manage and review your processed match footage.</p>
              </div>
              
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Analysis
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : !videos || videos.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden glass-panel border border-white/10"
              >
                <div className="relative z-10 p-12 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Video className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-3">No footage analyzed yet</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                    Upload your first match video to extract professional-grade player statistics.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video: any, index: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={video.id}
                    className="group relative glass-panel rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="p-6 flex-1 border-b border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                          <Video className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if(confirm("Delete this analysis?")) deleteMutation.mutate(video.id);
                          }}
                          className="p-2 text-white/30 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-display font-bold text-2xl text-white mb-2 truncate" title={video.originalName}>
                        {video.originalName}
                      </h3>
                      <p className="text-base text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {format(new Date(video.uploadDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {video.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                            Analyzed
                          </span>
                        )}
                        {(video.status === 'processing' || video.status === 'pending') && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20">
                            Processing
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/analysis/${video.id}`}
                        className="flex items-center gap-1 text-base font-semibold text-white/70 hover:text-white transition-colors"
                      >
                        View Report
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ChatRoom />
          </div>
        </div>
      </main>

      <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
