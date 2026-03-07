import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser, User as SelectUser } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TopNav } from "@/components/layout/TopNav";
import { User, Mail, Globe, Phone, MessageSquare, Shield, Target, MapPin, Video, Search, Camera, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isOtherUser = id && id !== currentUser?.id?.toString();

  const { data: otherUser, isLoading: isLoadingUser } = useQuery<SelectUser>({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${id}`);
      return res.json();
    },
    enabled: !!isOtherUser,
  });

  const displayUser = isOtherUser ? otherUser : currentUser;

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: displayUser?.username || "",
      password: "", 
      fullName: displayUser?.fullName || "",
      email: displayUser?.email || "",
      country: displayUser?.country || "",
      contactNumber: displayUser?.contactNumber || "",
      whatsAppNumber: displayUser?.whatsAppNumber || "",
      currentClub: displayUser?.currentClub || "",
      playerPosition: displayUser?.playerPosition || "",
      state: displayUser?.state || "",
      matchVideosCount: displayUser?.matchVideosCount || "",
      videoLink: displayUser?.videoLink || "",
      howFoundUs: displayUser?.howFoundUs || "",
      bio: displayUser?.bio || "",
      profilePicture: displayUser?.profilePicture || "",
    },
  });

  React.useEffect(() => {
    if (displayUser) {
      form.reset({
        username: displayUser.username || "",
        password: "",
        fullName: displayUser.fullName || "",
        email: displayUser.email || "",
        country: displayUser.country || "",
        contactNumber: displayUser.contactNumber || "",
        whatsAppNumber: displayUser.whatsAppNumber || "",
        currentClub: displayUser.currentClub || "",
        playerPosition: displayUser.playerPosition || "",
        state: displayUser.state || "",
        matchVideosCount: displayUser.matchVideosCount || "",
        videoLink: displayUser.videoLink || "",
        howFoundUs: displayUser.howFoundUs || "",
        bio: displayUser.bio || "",
        profilePicture: displayUser.profilePicture || "",
      });
    }
  }, [displayUser, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({ title: "Profile updated successfully" });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertUser) => {
    const { password, ...updates } = data;
    updateProfileMutation.mutate(updates);
  };

  if (isOtherUser && isLoadingUser) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white font-body">
      <TopNav />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8">
            {isOtherUser ? `${displayUser?.username}'s Profile` : "My Profile"}
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Details */}
              <Card className="glass-panel border-white/5">
                <CardHeader className="border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <User className="w-5 h-5" />
                    <span>Personal Details</span>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Enter your full name" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Enter your email" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isOtherUser}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Select your country" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Enter your phone number" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="whatsAppNumber" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>WhatsApp Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Enter your WhatsApp number" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      {!isOtherUser && <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +2348012345678)</p>}
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Football Details */}
              <Card className="glass-panel border-white/5">
                <CardHeader className="border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Target className="w-5 h-5" />
                    <span>Football Details</span>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <FormField control={form.control} name="currentClub" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Club</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Enter your current club" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="playerPosition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Position *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isOtherUser}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Select Position" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Forward">Forward</SelectItem>
                          <SelectItem value="Midfielder">Midfielder</SelectItem>
                          <SelectItem value="Defender">Defender</SelectItem>
                          <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which State? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isOtherUser}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Select State" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lagos">Lagos</SelectItem>
                          <SelectItem value="London">London</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="matchVideosCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many full match videos? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isOtherUser}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Select number" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-5">1-5</SelectItem>
                          <SelectItem value="6-10">6-10</SelectItem>
                          <SelectItem value="10+">10+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="glass-panel border-white/5">
                <CardHeader className="border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Shield className="w-5 h-5" />
                    <span>Additional Information</span>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 pt-6">
                  <FormField control={form.control} name="videoLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Link (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Paste link to your video (YouTube, Google Drive, etc.)" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      {!isOtherUser && <p className="text-xs text-muted-foreground mt-1">Link to any highlight reel or match video</p>}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="howFoundUs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you find us?</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="e.g. Instagram, friend, Google" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Textarea {...field} readOnly={isOtherUser} placeholder="Tell us about your football journey..." className="pl-10 bg-white/5 border-white/10 min-h-[100px]" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="profilePicture" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} readOnly={isOtherUser} placeholder="Paste an image URL" className="pl-10 bg-white/5 border-white/10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {!isOtherUser && (
                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="min-w-[200px]" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}
