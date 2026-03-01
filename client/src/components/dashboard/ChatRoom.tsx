import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type MessageWithUser = Message & { user: User };

export function ChatRoom() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", { content });
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
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

  return (
    <Card className="glass-panel border-white/5 h-[600px] flex flex-col">
      <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <CardTitle className="text-xl font-display">Global Chatroom</CardTitle>
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
                    msg.userId === user?.id ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {msg.user.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                      msg.userId === user?.id
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white/10 text-white rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )).reverse()
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
  );
}
