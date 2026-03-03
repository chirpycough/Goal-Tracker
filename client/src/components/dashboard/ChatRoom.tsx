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
      return res.json();
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
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      <Circle className="w-3 h-3 text-primary fill-primary absolute -bottom-0.5 -right-0.5 border-2 border-background rounded-full" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-white truncate group-hover:text-primary transition-colors">
                        {u.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Online
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
