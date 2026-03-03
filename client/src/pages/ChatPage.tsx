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

  const renderStatus = () => {
    if (!otherUser) return null;
    const lastSeen = new Date(otherUser.lastSeen).getTime();
    const now = new Date().getTime();
    const isOnline = (now - lastSeen) < 300000;
    
    return (
      <div>
        <CardTitle className="text-xl font-display">{otherUser.username}</CardTitle>
        <p className={`text-xs flex items-center gap-1 ${isOnline ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    );
  };

  if (!otherUser) return null;

  return (
    <div className="min-h-screen bg-background text-white font-body flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col">
        <Card className="glass-panel border-white/5 flex-1 flex flex-col overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-white/10 flex flex-row items-center gap-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/30 shadow-inner text-lg">
                {otherUser.username[0].toUpperCase()}
              </div>
              {renderStatus()}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative bg-black/20">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs uppercase tracking-widest font-display">Loading encryption...</span>
                  </div>
                ) : messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-sm font-display uppercase tracking-widest">No conversation history</p>
                    <p className="text-xs">Start the match talk now</p>
                  </div>
                ) : (
                  messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.senderId === currentUser?.id ? "items-end" : "items-start"
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] shadow-lg ${
                          msg.senderId === currentUser?.id
                            ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                            : "bg-white/10 text-white rounded-tl-none border border-white/5 backdrop-blur-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 mt-1.5 px-1 font-display uppercase tracking-tighter">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-white/5 bg-white/10 backdrop-blur-xl flex gap-3"
            >
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Message securely..."
                className="bg-white/5 border-white/10 focus-visible:ring-primary h-12 text-sm placeholder:text-white/20"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                disabled={!content.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
