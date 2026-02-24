import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  delay?: number;
  highlight?: boolean;
}

export function StatCard({ title, value, subtitle, icon, delay = 0, highlight = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        highlight 
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30" 
          : "glass-panel"
      } group hover:-translate-y-1 transition-all duration-300`}
    >
      {highlight && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/70'}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className={`font-display text-4xl font-bold ${highlight ? 'text-primary text-glow' : 'text-white'}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
