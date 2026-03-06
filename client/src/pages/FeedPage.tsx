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
import { Loader2, Image as ImageIcon, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
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
          title: "File too small",
          description: "Image must be at least 3MB.",
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
              
              {previewUrl && (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg border border-white/10"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
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
                    variant="outline" 
                    size="sm"
                    className="bg-white/5 border-white/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image (min 3MB)
                  </Button>
                </div>
                <Button disabled={postMutation.isPending || (!form.watch("content") && !selectedImage)}>
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
            {posts?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet. Be the first to share!
              </div>
            ) : (
              posts?.map((post) => (
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
                      {post.content && (
                        <p className="text-white/90 whitespace-pre-wrap mb-4">{post.content}</p>
                      )}
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
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
