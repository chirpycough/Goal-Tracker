import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as SelectUser, Post } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  User, Mail, Globe, Phone, MessageSquare, Camera, Loader2,
  Shield, Target, Trophy, Search, MapPin, CheckCircle2, FileText
} from "lucide-react";

const NATIONALITIES = [
  "Nigerian", "Ghanaian", "Kenyan", "South African", "Egyptian", "Senegalese",
  "Ivorian", "Cameroonian", "Moroccan", "Algerian", "Tunisian", "Malian",
  "English", "French", "Spanish", "German", "Italian", "Portuguese",
  "Brazilian", "Argentinian", "Colombian", "American", "Mexican",
  "Japanese", "South Korean", "Chinese", "Indian", "Other"
];

function parseBio(bio: string | null | undefined): Record<string, any> {
  if (!bio) return {};
  try { return JSON.parse(bio); } catch { return { text: bio }; }
}

function buildBioJson(fields: Record<string, any>): string {
  return JSON.stringify(fields);
}

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOtherUser = !!(id && id !== currentUser?.id?.toString());

  const { data: otherUser, isLoading: isLoadingUser } = useQuery<SelectUser>({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => { const r = await apiRequest("GET", `/api/users/${id}`); return r.json(); },
    enabled: !!isOtherUser,
  });

  type PostWithUser = Post & { user: SelectUser };
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery<PostWithUser[]>({
    queryKey: ["/api/users", id, "posts"],
    queryFn: async () => { const r = await apiRequest("GET", `/api/users/${id}/posts`); return r.json(); },
    enabled: !!isOtherUser && !!id,
  });

  const displayUser = isOtherUser ? otherUser : currentUser;
  const userRole = displayUser?.userType as "player" | "coach" | "scout" | null | undefined;

  // ─── Core fields ───
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [bioText, setBioText] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [profilePicBase64, setProfilePicBase64] = useState<string | null>(null);

  // ─── Player-specific ───
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [preferredFoot, setPreferredFoot] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [previousClubs, setPreviousClubs] = useState("");
  const [teamLevel, setTeamLevel] = useState("");
  const [primaryPosition, setPrimaryPosition] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [matchesPlayed, setMatchesPlayed] = useState("");
  const [lookingForClub, setLookingForClub] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState("");

  // ─── Coach-specific ───
  const [coachAge, setCoachAge] = useState("");
  const [coachingLicense, setCoachingLicense] = useState("");
  const [yearsOfCoaching, setYearsOfCoaching] = useState("");
  const [currentTeam, setCurrentTeam] = useState("");
  const [previousTeams, setPreviousTeams] = useState("");
  const [coachingLevel, setCoachingLevel] = useState("");
  const [trophiesWon, setTrophiesWon] = useState("");
  const [promotions, setPromotions] = useState("");
  const [championships, setChampionships] = useState("");

  // ─── Scout-specific ───
  const [organization, setOrganization] = useState("");
  const [currentClubAgency, setCurrentClubAgency] = useState("");
  const [yearsOfScouting, setYearsOfScouting] = useState("");
  const [scoutingRegions, setScoutingRegions] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [positionsFocus, setPositionsFocus] = useState<string[]>([]);
  const [authorityLevel, setAuthorityLevel] = useState("");
  const [workEmail, setWorkEmail] = useState("");

  // Seed all fields when user data loads
  useEffect(() => {
    if (!displayUser) return;
    setFullName(displayUser.fullName || "");
    setEmail(displayUser.email || "");
    setCountry(displayUser.country || "");
    setContactNumber(displayUser.contactNumber || "");
    setWhatsAppNumber(displayUser.whatsAppNumber || "");
    setProfilePicPreview(displayUser.profilePicture || null);

    const bio = parseBio(displayUser.bio);
    setBioText(bio.text || "");

    // Player fields
    setDateOfBirth(bio.dateOfBirth || "");
    setHeight(bio.height || "");
    setWeight(bio.weight || "");
    setPreferredFoot(bio.preferredFoot || "");
    setCurrentClub(displayUser.currentClub || bio.currentClub || "");
    setPreviousClubs(bio.previousClubs || "");
    setTeamLevel(bio.teamLevel || "");
    setPrimaryPosition(displayUser.playerPosition || bio.primaryPosition || "");
    setYearsExperience(bio.yearsExperience || "");
    setGoals(bio.goals || "");
    setAssists(bio.assists || "");
    setMatchesPlayed(bio.matchesPlayed || "");
    setLookingForClub(bio.lookingForClub === true ? "Yes" : bio.lookingForClub === false ? "No" : bio.lookingForClub || "");
    setWillingToRelocate(bio.willingToRelocate === true ? "Yes" : bio.willingToRelocate === false ? "No" : bio.willingToRelocate || "");

    // Coach fields
    setCoachAge(bio.age || "");
    setCoachingLicense(bio.coachingLicense || "");
    setYearsOfCoaching(bio.yearsOfCoaching || "");
    setCurrentTeam(displayUser.currentClub || bio.currentTeam || "");
    setPreviousTeams(bio.previousTeams || "");
    setCoachingLevel(bio.coachingLevel || "");
    setTrophiesWon(bio.trophiesWon || "");
    setPromotions(bio.promotions || "");
    setChampionships(bio.championships || "");

    // Scout fields
    setOrganization(bio.organization || "");
    setCurrentClubAgency(bio.currentClubAgency || "");
    setYearsOfScouting(bio.yearsOfScouting || "");
    setScoutingRegions(bio.scoutingRegions || []);
    setAgeGroups(bio.ageGroups || []);
    setPositionsFocus(bio.positionsFocus || []);
    setAuthorityLevel(bio.authorityLevel || "");
    setWorkEmail(bio.workEmail || displayUser.email || "");
  }, [displayUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please choose an image under 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setProfilePicPreview(result);
      setProfilePicBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const res = await apiRequest("PATCH", "/api/user", payload);
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/user"], updated);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const bioFields: Record<string, any> = { text: bioText };
    const payload: Record<string, any> = {
      fullName, email, country, contactNumber, whatsAppNumber,
    };

    if (profilePicBase64) payload.profilePicture = profilePicBase64;

    if (userRole === "player") {
      Object.assign(bioFields, {
        dateOfBirth, height, weight, preferredFoot, previousClubs,
        teamLevel, yearsExperience, goals, assists, matchesPlayed,
        lookingForClub, willingToRelocate,
      });
      payload.currentClub = currentClub;
      payload.playerPosition = primaryPosition;
    } else if (userRole === "coach") {
      Object.assign(bioFields, {
        age: coachAge, coachingLicense, yearsOfCoaching, previousTeams,
        coachingLevel, trophiesWon, promotions, championships,
      });
      payload.currentClub = currentTeam;
    } else if (userRole === "scout") {
      Object.assign(bioFields, {
        organization, currentClubAgency, yearsOfScouting, scoutingRegions,
        ageGroups, positionsFocus, authorityLevel, workEmail,
      });
    }

    payload.bio = buildBioJson(bioFields);
    updateProfileMutation.mutate(payload);
  };

  if (isOtherUser && isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const roleLabel = userRole === "player" ? "Player" : userRole === "coach" ? "Coach" : userRole === "scout" ? "Scout" : null;
  const roleIcon = userRole === "player" ? <Target className="w-3 h-3" /> : userRole === "coach" ? <Trophy className="w-3 h-3" /> : <Search className="w-3 h-3" />;
  const roleColor = userRole === "player" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : userRole === "coach" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30";

  return (
    <div className="min-h-screen bg-background text-white font-body">
      <TopNav />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ─── Header / Avatar ─── */}
          <div className="flex items-center gap-6 mb-10 p-6 bg-white/3 rounded-2xl border border-white/8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary/50" />
                )}
              </div>
              {!isOtherUser && (
                <>
                  <button
                    type="button"
                    data-testid="button-change-photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-profile-pic"
                  />
                </>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                {isOtherUser ? `${displayUser?.username}'s Profile` : "My Profile"}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">@{displayUser?.username}</p>
              {roleLabel && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mt-2 ${roleColor}`}>
                  {roleIcon} {roleLabel}
                </span>
              )}
            </div>
            {!isOtherUser && (
              <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Hover photo to change</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-8">

            {/* ─── Core Info (Everyone) ─── */}
            <ProfileSection title="Core Information" icon={<User className="w-4 h-4" />}>
              <Grid>
                <Field label="Full Name *">
                  <PrefixInput icon={<User className="w-4 h-4" />}>
                    <Input data-testid="input-fullname" value={fullName} onChange={e => setFullName(e.target.value)} readOnly={isOtherUser} placeholder="Your full name" required className="pl-10 bg-white/5 border-white/10" />
                  </PrefixInput>
                </Field>
                <Field label="Email Address *">
                  <PrefixInput icon={<Mail className="w-4 h-4" />}>
                    <Input data-testid="input-email" type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly={isOtherUser} placeholder="your@email.com" required className="pl-10 bg-white/5 border-white/10" />
                  </PrefixInput>
                </Field>
                <Field label="Country *">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    {isOtherUser ? (
                      <Input value={country} readOnly className="pl-10 bg-white/5 border-white/10" />
                    ) : (
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger data-testid="select-country" className="pl-10 bg-white/5 border-white/10">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </Field>
                <Field label="Contact Number *">
                  <PrefixInput icon={<Phone className="w-4 h-4" />}>
                    <Input data-testid="input-contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} readOnly={isOtherUser} placeholder="+234 801 234 5678" required className="pl-10 bg-white/5 border-white/10" />
                  </PrefixInput>
                </Field>
                <Field label="WhatsApp Number (Optional)" className="md:col-span-2">
                  <PrefixInput icon={<MessageSquare className="w-4 h-4" />}>
                    <Input data-testid="input-whatsapp" value={whatsAppNumber} onChange={e => setWhatsAppNumber(e.target.value)} readOnly={isOtherUser} placeholder="+234 801 234 5678" className="pl-10 bg-white/5 border-white/10" />
                  </PrefixInput>
                </Field>
                <Field label="Bio" className="md:col-span-2">
                  <Textarea
                    data-testid="input-bio"
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    readOnly={isOtherUser}
                    placeholder="Tell us about yourself and your football journey..."
                    className="bg-white/5 border-white/10 min-h-[100px] resize-none"
                  />
                </Field>
                {!isOtherUser && (
                  <Field label="Profile Picture" className="md:col-span-2">
                    <button
                      type="button"
                      data-testid="button-upload-photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-white group"
                    >
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">
                          {profilePicBase64 ? "Photo selected — click to change" : "Choose photo from device"}
                        </div>
                        <div className="text-xs">JPG, PNG or WebP · Max 5MB</div>
                      </div>
                      {profilePicBase64 && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                    </button>
                  </Field>
                )}
              </Grid>
            </ProfileSection>

            {/* ─── PLAYER SECTION ─── */}
            {userRole === "player" && (
              <>
                <ProfileSection title="Personal Details" icon={<User className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Date of Birth">
                      <Input data-testid="input-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} readOnly={isOtherUser} className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Height (cm)">
                      <Input data-testid="input-height" type="number" value={height} onChange={e => setHeight(e.target.value)} readOnly={isOtherUser} placeholder="175" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Weight (kg)">
                      <Input data-testid="input-weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} readOnly={isOtherUser} placeholder="70" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Preferred Foot">
                      <SField value={preferredFoot} onChange={setPreferredFoot} disabled={isOtherUser} options={["Right", "Left", "Both"]} />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Football Experience" icon={<Target className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Current Club">
                      <Input data-testid="input-club" value={currentClub} onChange={e => setCurrentClub(e.target.value)} readOnly={isOtherUser} placeholder="e.g. FC Barcelona" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Primary Position">
                      <SField value={primaryPosition} onChange={setPrimaryPosition} disabled={isOtherUser} options={["Goalkeeper", "Defender", "Midfielder", "Winger", "Striker"]} />
                    </Field>
                    <Field label="Present Team Level">
                      <SField value={teamLevel} onChange={setTeamLevel} disabled={isOtherUser} options={["Street / Casual", "School Team", "Local Club", "Football Academy", "Semi-Professional League", "Professional League", "Top Division / National Team"]} />
                    </Field>
                    <Field label="Years of Competitive Experience">
                      <SField value={yearsExperience} onChange={setYearsExperience} disabled={isOtherUser} options={["Less than 1 year", "1 – 3 years", "3 – 6 years", "6 – 10 years", "10+ years"]} />
                    </Field>
                    <Field label="Previous Clubs" className="md:col-span-2">
                      <Textarea data-testid="input-prev-clubs" value={previousClubs} onChange={e => setPreviousClubs(e.target.value)} readOnly={isOtherUser} placeholder="List previous clubs, one per line..." className="bg-white/5 border-white/10 resize-none" />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Player Statistics" icon={<Shield className="w-4 h-4" />}>
                  <Grid cols={3}>
                    <Field label="Goals">
                      <Input data-testid="input-goals" type="number" value={goals} onChange={e => setGoals(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Assists">
                      <Input data-testid="input-assists" type="number" value={assists} onChange={e => setAssists(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Matches Played">
                      <Input data-testid="input-matches" type="number" value={matchesPlayed} onChange={e => setMatchesPlayed(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Availability" icon={<MapPin className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Looking for a club?">
                      <SField value={lookingForClub} onChange={setLookingForClub} disabled={isOtherUser} options={["Yes", "No"]} />
                    </Field>
                    <Field label="Willing to relocate?">
                      <SField value={willingToRelocate} onChange={setWillingToRelocate} disabled={isOtherUser} options={["Yes", "No"]} />
                    </Field>
                  </Grid>
                </ProfileSection>
              </>
            )}

            {/* ─── COACH SECTION ─── */}
            {userRole === "coach" && (
              <>
                <ProfileSection title="Personal Details" icon={<User className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Age">
                      <Input data-testid="input-age" type="number" value={coachAge} onChange={e => setCoachAge(e.target.value)} readOnly={isOtherUser} placeholder="35" className="bg-white/5 border-white/10" />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Coaching Credentials" icon={<Trophy className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Coaching License">
                      <SField value={coachingLicense} onChange={setCoachingLicense} disabled={isOtherUser} options={["UEFA A", "UEFA B", "CAF License", "FA License", "None"]} />
                    </Field>
                    <Field label="Coaching Level">
                      <SField value={coachingLevel} onChange={setCoachingLevel} disabled={isOtherUser} options={["Youth", "Professional", "Goalkeeper"]} />
                    </Field>
                    <Field label="Years of Coaching">
                      <Input data-testid="input-years-coaching" type="number" value={yearsOfCoaching} onChange={e => setYearsOfCoaching(e.target.value)} readOnly={isOtherUser} placeholder="5" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Current Team">
                      <Input data-testid="input-current-team" value={currentTeam} onChange={e => setCurrentTeam(e.target.value)} readOnly={isOtherUser} placeholder="e.g. Manchester City" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Previous Teams" className="md:col-span-2">
                      <Textarea data-testid="input-prev-teams" value={previousTeams} onChange={e => setPreviousTeams(e.target.value)} readOnly={isOtherUser} placeholder="List previous teams, one per line..." className="bg-white/5 border-white/10 resize-none" />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Achievements" icon={<Shield className="w-4 h-4" />}>
                  <Grid cols={3}>
                    <Field label="Trophies Won">
                      <Input data-testid="input-trophies" type="number" value={trophiesWon} onChange={e => setTrophiesWon(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Promotions">
                      <Input data-testid="input-promotions" type="number" value={promotions} onChange={e => setPromotions(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Championships">
                      <Input data-testid="input-championships" type="number" value={championships} onChange={e => setChampionships(e.target.value)} readOnly={isOtherUser} placeholder="0" className="bg-white/5 border-white/10" />
                    </Field>
                  </Grid>
                </ProfileSection>
              </>
            )}

            {/* ─── SCOUT SECTION ─── */}
            {userRole === "scout" && (
              <>
                <ProfileSection title="Professional Information" icon={<Search className="w-4 h-4" />}>
                  <Grid>
                    <Field label="Organization">
                      <Input data-testid="input-org" value={organization} onChange={e => setOrganization(e.target.value)} readOnly={isOtherUser} placeholder="e.g. FIFA Scouting Division" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Current Club / Agency">
                      <Input data-testid="input-agency" value={currentClubAgency} onChange={e => setCurrentClubAgency(e.target.value)} readOnly={isOtherUser} placeholder="e.g. Real Madrid CF" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Years of Scouting">
                      <Input data-testid="input-years-scouting" type="number" value={yearsOfScouting} onChange={e => setYearsOfScouting(e.target.value)} readOnly={isOtherUser} placeholder="3" className="bg-white/5 border-white/10" />
                    </Field>
                    <Field label="Authority Level">
                      <SField value={authorityLevel} onChange={setAuthorityLevel} disabled={isOtherUser} options={["Independent Scout", "Club Scout", "Agency Scout"]} />
                    </Field>
                    <Field label="Work Email" className="md:col-span-2">
                      <Input data-testid="input-work-email" type="email" value={workEmail} onChange={e => setWorkEmail(e.target.value)} readOnly={isOtherUser} placeholder="scout@clubname.com" className="bg-white/5 border-white/10" />
                    </Field>
                  </Grid>
                </ProfileSection>

                <ProfileSection title="Player Focus" icon={<Target className="w-4 h-4" />}>
                  <div className="space-y-5">
                    <ChipGroup label="Region of Scouting" options={["Africa", "Europe", "South America", "Asia", "North America"]} selected={scoutingRegions} onToggle={isOtherUser ? () => {} : (v) => toggleChip(scoutingRegions, setScoutingRegions, v)} />
                    <ChipGroup label="Age Groups" options={["U13", "U17", "U21", "Senior"]} selected={ageGroups} onToggle={isOtherUser ? () => {} : (v) => toggleChip(ageGroups, setAgeGroups, v)} />
                    <ChipGroup label="Positions They Look For" options={["Forward", "Midfielder", "Defender", "Goalkeeper"]} selected={positionsFocus} onToggle={isOtherUser ? () => {} : (v) => toggleChip(positionsFocus, setPositionsFocus, v)} />
                  </div>
                </ProfileSection>
              </>
            )}

            {!isOtherUser && (
              <div className="flex justify-end gap-4 pt-2 pb-8">
                <Button type="button" variant="outline" onClick={() => setLocation("/")} className="min-w-[120px]">
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="min-w-[180px]" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                  {updateProfileMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
                </Button>
              </div>
            )}
          </form>

          {/* ─── User Posts Section (only when viewing another user) ─── */}
          {isOtherUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 space-y-5"
            >
              <div className="flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em]">Latest Posts</h2>
              </div>

              {isLoadingPosts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !userPosts || userPosts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm text-white/40">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4 pb-10">
                  <AnimatePresence initial={false}>
                    {userPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                      >
                        {post.content && (
                          <div className="px-4 py-4">
                            <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>
                        )}
                        {post.imageUrl && (
                          <div className="border-t border-white/5">
                            <img
                              src={post.imageUrl}
                              alt="Post"
                              className="w-full object-cover max-h-[240px]"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }}
                            />
                          </div>
                        )}
                        <div className="px-4 py-2 border-t border-white/5">
                          <span className="text-xs text-white/35">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// ─── Sub-components ───

function ProfileSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h2 className="text-xs font-bold uppercase tracking-[0.15em]">{title}</h2>
      </div>
      <div className="p-5 bg-white/3 rounded-2xl border border-white/8 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-white/70 text-sm">{label}</Label>
      {children}
    </div>
  );
}

function PrefixInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</div>
      {children}
    </div>
  );
}

function SField({ value, onChange, options, disabled }: { value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
  if (disabled) {
    return <Input value={value} readOnly className="bg-white/5 border-white/10" />;
  }
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/5 border-white/10">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function ChipGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs uppercase tracking-wider">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected.includes(opt)
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {selected.includes(opt) && <span className="mr-1">✓</span>}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
