import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Image as ImageIcon, Send } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: posts, isLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts"],
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      toast({
        title: "Post created",
        description: "Your update has been shared with other scouts.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="glass-panel mb-8 border-white/5 bg-white/5">
          <CardContent className="pt-6">
            <form
              onSubmit={form.handleSubmit((data) => postMutation.mutate(data))}
              className="space-y-4"
            >
              <Textarea
                placeholder="Share your scouting insights or match updates..."
                className="bg-white/5 border-white/10 min-h-[100px]"
                {...form.register("content")}
              />
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Image URL (optional)"
                    className="pl-10 bg-white/5 border-white/10"
                    {...form.register("imageUrl")}
                  />
                </div>
                <Button disabled={postMutation.isPending}>
                  {postMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="ml-2">Post</span>
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
            {posts?.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-panel border-white/5 bg-white/5 overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 py-4 px-6 border-b border-white/5">
                    <Avatar>
                      <AvatarImage src={post.user.playerPhoto || undefined} />
                      <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold text-white">{post.user.fullName || post.user.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(post.createdAt), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-white/90 whitespace-pre-wrap mb-4">{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post attachment"
                        className="rounded-xl w-full object-cover max-h-[400px] border border-white/10"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
