import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Circle } from "lucide-react";
import { Link } from "wouter";

export function ChatRoom() {
  const { user: currentUser } = useAuth();
  
  const { data: allUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      const users = await res.json();
      // Fetch unread counts for each user
      const unreadPromises = users.map(async (u: User) => {
        const mRes = await apiRequest("GET", `/api/messages/${u.id}`);
        const msgs = await mRes.json();
        const unreadCount = msgs.filter((m: any) => m.receiverId === currentUser?.id && !m.isRead).length;
        return { userId: u.id, unreadCount };
      });
      const unreadData = await Promise.all(unreadPromises);
      return users.map((u: User) => ({
        ...u,
        unreadCount: unreadData.find(d => d.userId === u.id)?.unreadCount || 0
      }));
    },
    refetchInterval: 5000,
  });

  const onlineUsers = allUsers?.filter(u => {
    if (u.id === currentUser?.id) return false;
    const lastSeen = new Date(u.lastSeen).getTime();
    const now = new Date().getTime();
    // Online if seen in last 5 minutes to be even more lenient
    return (now - lastSeen) < 300000; 
  }) || [];

  return (
    <Card className="glass-panel border-white/5 h-[600px] flex flex-col">
      <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <CardTitle className="text-xl font-display">Members Online</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : onlineUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No members online</p>
              </div>
            ) : (
              onlineUsers.map((u) => (
                <Link key={u.id} href={`/chat/${u.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/10 group shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-inner text-lg group-hover:scale-105 transition-transform">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary border-4 border-[#0a0a0a] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-display text-base text-white truncate group-hover:text-primary transition-colors">
                          {u.username}
                        </p>
                        <div className="flex items-center gap-2">
                          {u.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                              {u.unreadCount}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Chat</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/60 truncate flex items-center gap-1.5 font-medium uppercase tracking-tighter">
                        Active in field
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
