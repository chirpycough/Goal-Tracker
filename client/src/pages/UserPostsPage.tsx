import * as React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import { TopNav } from "@/components/layout/TopNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ArrowLeft, Target, Trophy, Search } from "lucide-react";
import { Link } from "wouter";

type PostWithUser = Post & { user: User };

export default function UserPostsPage() {
  const { id } = useParams();

  const { data: profileUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => { const r = await apiRequest("GET", `/api/users/${id}`); return r.json(); },
    staleTime: 0,
    enabled: !!id,
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery<PostWithUser[]>({
    queryKey: ["/api/users", id, "posts"],
    queryFn: async () => { const r = await apiRequest("GET", `/api/users/${id}/posts`); return r.json(); },
    staleTime: 0,
    enabled: !!id,
  });

  const userRole = profileUser?.userType as "player" | "coach" | "scout" | null | undefined;
  const roleLabel = userRole === "player" ? "Player" : userRole === "coach" ? "Coach" : userRole === "scout" ? "Scout" : null;
  const roleIcon = userRole === "player" ? <Target className="w-3 h-3" /> : userRole === "coach" ? <Trophy className="w-3 h-3" /> : <Search className="w-3 h-3" />;
  const roleColor = userRole === "player"
    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
    : userRole === "coach"
    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-purple-500/20 text-purple-400 border-purple-500/30";

  const isLoading = isLoadingUser || isLoadingPosts;

  return (
    <div className="min-h-screen bg-background text-white font-body">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Back button */}
        <Link href={`/profile/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2 gap-2 text-white/60 hover:text-white"
            data-testid="button-back-to-profile"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </Link>

        {/* User header */}
        {isLoadingUser ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : profileUser ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl"
          >
            <Avatar className="w-14 h-14 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src={profileUser.profilePicture || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {(profileUser.fullName || profileUser.username)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl font-display font-bold text-white truncate">
                {profileUser.fullName || profileUser.username}
              </h1>
              <p className="text-sm text-white/40">@{profileUser.username}</p>
              {roleLabel && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 ${roleColor}`}>
                  {roleIcon} {roleLabel}
                </span>
              )}
            </div>
            <div className="ml-auto shrink-0 text-right">
              <div className="text-2xl font-bold text-primary">{posts?.length ?? "—"}</div>
              <div className="text-xs text-white/40">posts</div>
            </div>
          </motion.div>
        ) : null}

        {/* Posts */}
        {isLoadingPosts ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-white/10 rounded-2xl"
          >
            <div className="text-5xl mb-3">📭</div>
            <p className="text-white/50 font-medium">No posts yet</p>
            <p className="text-white/25 text-sm mt-1">This user hasn't posted anything</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`user-post-${post.id}`}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-colors"
                >
                  {/* Post text */}
                  {post.content && (
                    <div className="px-5 py-4">
                      <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Post image */}
                  {post.imageUrl && (
                    <PostImage src={post.imageUrl} hasText={!!post.content} />
                  )}

                  {/* Timestamp */}
                  <div className="px-5 py-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/30">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function PostImage({ src, hasText }: { src: string; hasText: boolean }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return null;
  return (
    <div className={hasText ? "border-t border-white/5" : ""}>
      <img
        src={src}
        alt=""
        className="w-full object-cover max-h-[400px]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
