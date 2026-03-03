import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopNav } from "@/components/layout/TopNav";
import { Send, Loader2, MessageSquare, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: otherUser } = useQuery<User>({
    queryKey: [`/api/users`],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json();
    },
    select: (users: User[]) => users.find(u => u.id === Number(id)),
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/messages/${id}`);
      return res.json();
    },
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", { 
        receiverId: Number(id),
        content 
      });
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${id}`] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(content);
  };

  if (!otherUser) return null;

  return (
    <div className="min-h-screen bg-background text-white font-body flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col">
        <Card className="glass-panel border-white/5 flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                {otherUser.username[0].toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-xl font-display">{otherUser.username}</CardTitle>
                <p className="text-xs text-primary flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Online
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.senderId === currentUser?.id ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                          msg.senderId === currentUser?.id
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white/10 text-white rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-white/5 bg-white/5 flex gap-2"
            >
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                className="bg-white/5 border-white/10 focus-visible:ring-primary"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!content.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
