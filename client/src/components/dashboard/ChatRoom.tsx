import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User, UserWithUnread } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Circle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export function ChatRoom() {
  const { user: currentUser } = useAuth();
  
  const { data: allUsers, isLoading } = useQuery<UserWithUnread[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const processedUsers = allUsers?.filter(u => u.id !== currentUser?.id)
    .map(u => {
      const lastSeen = new Date(u.lastSeen).getTime();
      const now = new Date().getTime();
      const isOnline = (now - lastSeen) < 120000;
      return { ...u, isOnline };
    })
    .sort((a, b) => {
      if (a.isOnline === b.isOnline) return 0;
      return a.isOnline ? -1 : 1;
    }) || [];

  return (
    <Card className="glass-panel border-white/5 h-[600px] flex flex-col shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="text-xl font-display tracking-tight text-white">Match Members</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative bg-black/20">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-[10px] uppercase tracking-widest font-display">Syncing locker room...</span>
              </div>
            ) : processedUsers.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-display uppercase tracking-widest">No other players found</p>
                <p className="text-[10px] mt-1">Recruit more members to start the talk</p>
              </div>
            ) : (
              processedUsers.map((u) => (
                <Link key={u.id} href={`/chat/${u.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/10 group shadow-lg hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 transition-all duration-500" />
                    <div className="relative z-10">
                      <Link href={`/profile/${u.id}`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-inner text-lg group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300 cursor-pointer">
                          {u.username[0].toUpperCase()}
                        </div>
                      </Link>
                      {u.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary border-4 border-[#0a0a0a] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden relative z-10">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-display text-base text-white truncate group-hover:text-primary transition-colors">
                          {u.username}
                        </p>
                        <div className="flex items-center gap-2">
                          {u.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-primary/40">
                              {u.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[10px] flex items-center gap-1.5 font-display uppercase tracking-widest ${u.isOnline ? "text-primary font-bold" : "text-muted-foreground/40"}`}>
                          {u.isOnline ? "Active in field" : "Off field"}
                        </p>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">Message</span>
                      </div>
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
