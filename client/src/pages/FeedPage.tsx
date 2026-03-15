import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2, Image as ImageIcon, Send, X, Heart, MoreHorizontal,
  Pencil, Trash2, Check
} from "lucide-react";

type PostWithUser = Post & { user: User };

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (openMenuId === null) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [openMenuId]);

  // ─── Fetch posts with polling for real-time updates ───
  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
    refetchInterval: 10000, // refresh every 10s
    refetchIntervalInBackground: false,
  });

  // ─── Create post ───
  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (selectedImage) formData.append("image", selectedImage);
      const res = await fetch("/api/posts", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to post"); }
      return res.json();
    },
    onSuccess: (newPost) => {
      queryClient.setQueryData<PostWithUser[]>(["/api/posts"], old =>
        old ? [newPost, ...old] : [newPost]
      );
      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);
      toast({ title: "Posted!", description: "Your post is live for everyone to see." });
    },
    onError: (e: Error) => toast({ title: "Failed to post", description: e.message, variant: "destructive" }),
  });

  // ─── Edit post ───
  const editMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await apiRequest("PATCH", `/api/posts/${id}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingId(null);
      toast({ title: "Post updated" });
    },
    onError: () => toast({ title: "Failed to update post", variant: "destructive" }),
  });

  // ─── Delete post ───
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<PostWithUser[]>(["/api/posts"], old =>
        old ? old.filter(p => p.id !== id) : []
      );
      setDeletingId(null);
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canPost = (content.trim().length > 0 || selectedImage) && !createMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-white">
      <TopNav />
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* ─── Compose Box ─── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src={user?.profilePicture || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share something with the network..."
              data-testid="input-post-content"
              className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none min-h-[72px] text-base placeholder:text-white/30 p-0"
            />
          </div>

          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 relative rounded-xl overflow-hidden border border-white/10"
              >
                <img src={previewUrl} alt="Preview" className="w-full object-cover max-h-[200px]" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/8">
            <div className="flex items-center gap-1">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              <button
                type="button"
                data-testid="button-add-image"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/50 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo</span>
              </button>
            </div>
            <Button
              data-testid="button-post"
              onClick={() => createMutation.mutate()}
              disabled={!canPost}
              className="rounded-full px-5 h-9 font-semibold gap-2 shadow-lg shadow-primary/20"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </Button>
          </div>
        </div>

        {/* ─── Feed ─── */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <div className="text-4xl mb-3">⚽</div>
            <p className="text-muted-foreground">No posts yet — be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts?.map((post) => {
                const isOwner = post.userId === user?.id;
                const isEditing = editingId === post.id;
                const isDeleting = deletingId === post.id;
                const liked = likedPosts.has(post.id);
                const roleLabel = post.user.userType
                  ? post.user.userType.charAt(0).toUpperCase() + post.user.userType.slice(1)
                  : null;

                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    data-testid={`post-card-${post.id}`}
                  >
                    <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-colors">
                      {/* Post Header */}
                      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                        <Avatar className="w-9 h-9 ring-1 ring-white/10 shrink-0">
                          <AvatarImage src={post.user.profilePicture || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {post.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">
                              {post.user.fullName || post.user.username}
                            </span>
                            {roleLabel && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                                {roleLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-white/35">@{post.user.username}</span>
                            <span className="text-white/20 text-xs">·</span>
                            <span className="text-xs text-white/35">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Owner menu */}
                        {isOwner && !isEditing && (
                          <div className="relative">
                            <button
                              data-testid={`button-post-menu-${post.id}`}
                              onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                              className="p-1.5 rounded-full text-white/30 hover:text-white hover:bg-white/8 transition-all"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenuId === post.id && (
                              <div className="absolute right-0 top-8 z-50 min-w-[140px] rounded-xl border border-white/10 bg-[#0f1923] shadow-2xl py-1">
                                <button
                                  data-testid={`button-edit-post-${post.id}`}
                                  onClick={() => { setEditingId(post.id); setEditContent(post.content || ""); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Edit post
                                </button>
                                <button
                                  data-testid={`button-delete-post-${post.id}`}
                                  onClick={() => { setDeletingId(post.id); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              data-testid={`input-edit-post-${post.id}`}
                              className="bg-white/5 border-white/10 resize-none min-h-[80px] text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                className="h-8 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                data-testid={`button-save-edit-${post.id}`}
                                onClick={() => editMutation.mutate({ id: post.id, content: editContent })}
                                disabled={editMutation.isPending || !editContent.trim()}
                                className="h-8 text-xs gap-1"
                              >
                                {editMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          post.content && (
                            <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                              {post.content}
                            </p>
                          )
                        )}
                      </div>

                      {/* Post Image — compact */}
                      {post.imageUrl && !isEditing && (
                        <div className="overflow-hidden border-t border-white/5">
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full object-cover max-h-[260px] hover:opacity-95 transition-opacity cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Delete confirmation */}
                      <AnimatePresence>
                        {isDeleting && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 py-3 bg-red-500/8 border-t border-red-500/20"
                          >
                            <p className="text-sm text-red-400 mb-2">Delete this post? This cannot be undone.</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)} className="h-7 text-xs">
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                data-testid={`button-confirm-delete-${post.id}`}
                                onClick={() => deleteMutation.mutate(post.id)}
                                disabled={deleteMutation.isPending}
                                className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white gap-1"
                              >
                                {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Delete
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer actions */}
                      {!isEditing && !isDeleting && (
                        <div className="flex items-center gap-1 px-4 py-2.5 border-t border-white/5">
                          <button
                            data-testid={`button-like-${post.id}`}
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              liked
                                ? "text-primary bg-primary/10"
                                : "text-white/40 hover:text-primary hover:bg-primary/8"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                            <span>{liked ? "Liked" : "Like"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
