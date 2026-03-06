import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Image as ImageIcon, Send, X, Heart, MessageSquare, Share2, TrendingUp, Users, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Interaction State (Mocked for premium feel)
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());

  const { data: posts, isLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts"],
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema.extend({
      content: insertPostSchema.shape.content.optional(),
    })),
    defaultValues: {
      content: "",
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: { content?: string }) => {
      const formData = new FormData();
      if (data.content) formData.append("content", data.content);
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      toast({
        title: "Insight Shared",
        description: "Your scouting update is now live for the network.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size < 3 * 1024 * 1024) {
        toast({
          title: "Resolution too low",
          description: "For professional analysis, images must be at least 3MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Stats/Trends */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Market Trends</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Top Target</span>
                <span className="font-mono text-primary">€42.5M</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Active Scouts</span>
                <span className="font-mono">1,204</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Top Scouts</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {i}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold">Scout_Pro_{i}</div>
                    <div className="text-muted-foreground">12 Active Reports</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <main className="lg:col-span-6 space-y-8">
          <Card className="bg-white/5 border-white/10 shadow-2xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <form
                onSubmit={form.handleSubmit((data) => postMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="Share a scouting insight, transfer rumor, or tactical breakdown..."
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none min-h-[80px] text-lg placeholder:text-muted-foreground/50"
                    {...form.register("content")}
                  />
                </div>
                
                <AnimatePresence>
                  {previewUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative rounded-2xl overflow-hidden border border-white/10"
                    >
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full object-cover max-h-[300px]"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80">
                        HQ ANALYTICS READY
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Media
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                    >
                      <Award className="w-5 h-5 mr-2" />
                      Report
                    </Button>
                  </div>
                  <Button 
                    disabled={postMutation.isPending || (!form.watch("content") && !selectedImage)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 rounded-full font-bold shadow-lg shadow-primary/20"
                  >
                    {postMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="ml-2">Share Insight</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {posts?.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <div className="text-muted-foreground mb-2 text-lg">No scouting data available.</div>
                  <div className="text-sm text-muted-foreground/60">Be the first to analyze the next superstar.</div>
                </div>
              ) : (
                posts?.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-primary/30 transition-all duration-300 group shadow-lg">
                      <CardHeader className="flex flex-row items-start gap-4 py-4 px-6">
                        <Avatar className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={post.user.playerPhoto || undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {post.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-white hover:text-primary transition-colors cursor-pointer">
                              {post.user.fullName || post.user.username}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(post.createdAt), "h:mm a")}
                            </div>
                          </div>
                          <div className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">Verified Scout</div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-0 space-y-4">
                        {post.content && (
                          <p className="text-white/90 text-md leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}
                        {post.imageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                            <img
                              src={post.imageUrl}
                              alt="Scouting Data"
                              className="w-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-700 cursor-pointer"
                            />
                          </div>
                        )}
                        
                        {/* Interactive Footer */}
                        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-2 transition-all ${likedPosts.has(post.id) ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'}`}
                          >
                            <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">{likedPosts.has(post.id) ? '1' : 'Like'}</span>
                          </button>
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group/btn">
                            <div className="p-2 rounded-full group-hover/btn:bg-white/5">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold">Comment</span>
                          </button>
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group/btn">
                            <div className="p-2 rounded-full group-hover/btn:bg-white/5">
                              <Share2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold">Insights</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar - Activity/Suggestions */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Scouting Network</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">Live Match: Utd vs Liv</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">12:30</div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-xs">View Global Map</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
