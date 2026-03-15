import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import ProAnalysis from "@/pages/ProAnalysis";
import AuthPage from "@/pages/AuthPage";
import SetupProfile from "@/pages/SetupProfile";
import Profile from "@/pages/Profile";
import ChatPage from "@/pages/ChatPage";
import FeedPage from "@/pages/FeedPage";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/analysis/:id" component={Analysis} />
      <ProtectedRoute path="/pro-analysis/:id" component={ProAnalysis} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/profile/:id" component={Profile} />
      <ProtectedRoute path="/chat/:id" component={ChatPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/setup-profile" component={SetupProfile} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
