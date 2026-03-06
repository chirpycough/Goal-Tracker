import { Link } from "wouter";
import { Activity, PlaySquare, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TopNav() {
  const { user, logoutMutation } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
    refetchInterval: 5000,
  });

  const [lastUserCount, setLastUserCount] = useState<number | null>(null);

  useEffect(() => {
    if (users) {
      if (lastUserCount !== null && users.length > lastUserCount) {
        const newUser = users[users.length - 1];
        setNotification(`New scout joined: ${newUser.username}!`);
        setTimeout(() => setNotification(null), 5000);
      }
      setLastUserCount(users.length);
    }
  }, [users, lastUserCount]);

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/20 border-b border-primary/30 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-primary font-display font-bold text-sm">
              <Bell className="w-4 h-4 animate-bounce" />
              {notification}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors duration-300">
              Pitch<span className="text-primary">Vision</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/feed" 
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              Feed
            </Link>
            <div className="h-8 w-px bg-white/10" />
            {user && (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                  {user.username}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive p-2"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-medium text-white/80 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <PlaySquare className="w-4 h-4 text-primary" />
              <span>Pro Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
