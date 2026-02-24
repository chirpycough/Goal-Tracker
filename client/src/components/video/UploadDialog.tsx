import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, FileVideo, Palette, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUploadVideo } from "@/hooks/use-videos";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLAYER_COLORS = [
  { id: "red", hex: "#EF4444", name: "Red Team" },
  { id: "blue", hex: "#3B82F6", name: "Blue Team" },
  { id: "white", hex: "#FFFFFF", name: "White Team" },
  { id: "black", hex: "#1F2937", name: "Black Team" },
  { id: "yellow", hex: "#EAB308", name: "Yellow Team" },
  { id: "green", hex: "#10B981", name: "Green Team" },
];

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState<string>("");
  
  const uploadMutation = useUploadVideo();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
  });

  const handleSubmit = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("video", file);
    if (color) {
      formData.append("playerColor", color);
    }
    
    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setFile(null);
        setColor("");
        onClose();
      }
    });
  };

  const resetAndClose = () => {
    setFile(null);
    setColor("");
    if (!uploadMutation.isPending) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={resetAndClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-panel bg-card/95 rounded-3xl overflow-hidden pointer-events-auto shadow-2xl shadow-black/50 border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">New Match Analysis</h2>
                  <p className="text-sm text-muted-foreground mt-1">Upload a video to track player performance.</p>
                </div>
                <button 
                  onClick={resetAndClose}
                  disabled={uploadMutation.isPending}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Upload Area */}
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-primary" />
                    Select Video
                  </h3>
                  
                  {!file ? (
                    <div 
                      {...getRootProps()} 
                      className={`
                        border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-white font-medium text-lg">
                        {isDragActive ? "Drop video here" : "Drag & drop match video"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Supports MP4, MOV, AVI up to 500MB
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <FileVideo className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFile(null)}
                        disabled={uploadMutation.isPending}
                        className="p-2 text-white/50 hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tracking Configuration */}
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Player Tracking Color (Optional)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PLAYER_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setColor(color === c.id ? "" : c.id)}
                        className={`
                          relative aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                          ${color === c.id ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}
                        `}
                      >
                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.hex }} />
                        <span className="text-[10px] font-medium text-white/70">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Select the dominant jersey color of the player you want to analyze to improve tracking accuracy.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                <button
                  onClick={resetAndClose}
                  disabled={uploadMutation.isPending}
                  className="px-5 py-2.5 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!file || uploadMutation.isPending}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Start Analysis"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
