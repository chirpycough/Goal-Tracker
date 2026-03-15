import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, User, Trophy, Search, ChevronRight, Check, Loader2 } from "lucide-react";

type Role = "player" | "coach" | "scout";

const NATIONALITIES = [
  "Nigerian", "Ghanaian", "Kenyan", "South African", "Egyptian", "Senegalese",
  "Ivorian", "Cameroonian", "Moroccan", "Algerian", "Tunisian", "Malian",
  "English", "French", "Spanish", "German", "Italian", "Portuguese",
  "Brazilian", "Argentinian", "Colombian", "American", "Mexican",
  "Japanese", "South Korean", "Chinese", "Indian", "Other"
];

export default function SetupProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");

  // Player fields
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

  // Coach fields
  const [coachAge, setCoachAge] = useState("");
  const [coachingLicense, setCoachingLicense] = useState("");
  const [yearsOfCoaching, setYearsOfCoaching] = useState("");
  const [currentTeam, setCurrentTeam] = useState("");
  const [previousTeams, setPreviousTeams] = useState("");
  const [coachingLevel, setCoachingLevel] = useState("");
  const [trophiesWon, setTrophiesWon] = useState("");
  const [promotions, setPromotions] = useState("");
  const [championships, setChampionships] = useState("");

  // Scout fields
  const [organization, setOrganization] = useState("");
  const [currentClubAgency, setCurrentClubAgency] = useState("");
  const [yearsOfScouting, setYearsOfScouting] = useState("");
  const [scoutingRegions, setScoutingRegions] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [positionsFocus, setPositionsFocus] = useState<string[]>([]);
  const [authorityLevel, setAuthorityLevel] = useState("");
  const [workEmail, setWorkEmail] = useState("");

  // Seed shared fields from user data when available
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setNationality(user.country || "");
    }
  }, [user]);

  // Redirect logic after hooks
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (!authLoading && user?.userType) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const toggleMultiSelect = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setIsSaving(true);

    try {
      const basePayload: Record<string, any> = {
        fullName,
        country: nationality,
        userType: role,
      };

      if (role === "player") {
        Object.assign(basePayload, {
          currentClub,
          playerPosition: primaryPosition,
          bio: JSON.stringify({
            dateOfBirth, height, weight, preferredFoot,
            previousClubs, teamLevel, yearsExperience,
            goals, assists, matchesPlayed,
            lookingForClub: lookingForClub === "yes",
            willingToRelocate: willingToRelocate === "yes",
          }),
        });
      } else if (role === "coach") {
        Object.assign(basePayload, {
          currentClub: currentTeam,
          bio: JSON.stringify({
            age: coachAge, coachingLicense, yearsOfCoaching,
            previousTeams, coachingLevel, trophiesWon, promotions, championships,
          }),
        });
      } else if (role === "scout") {
        Object.assign(basePayload, {
          email: workEmail,
          bio: JSON.stringify({
            organization, currentClubAgency, yearsOfScouting,
            scoutingRegions, ageGroups, positionsFocus, authorityLevel,
          }),
        });
      }

      const res = await apiRequest("PATCH", "/api/user", basePayload);
      const updated = await res.json();
      queryClient.setQueryData(["/api/user"], updated);

      toast({ title: "Profile saved!", description: "Welcome to PitchVision." });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const roles = [
    {
      id: "player" as Role,
      icon: <User className="w-8 h-8" />,
      title: "Player",
      desc: "Upload match footage and receive AI-powered performance analysis",
    },
    {
      id: "coach" as Role,
      icon: <Trophy className="w-8 h-8" />,
      title: "Coach",
      desc: "Manage your squad, scout talent and track player development",
    },
    {
      id: "scout" as Role,
      icon: <Search className="w-8 h-8" />,
      title: "Scout",
      desc: "Discover and evaluate exceptional football talent globally",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="text-white font-bold text-lg">PitchVision</span>
        <span className="text-white/20 mx-2">·</span>
        <span className="text-muted-foreground text-sm">Profile Setup</span>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === "role" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
              {step === "form" ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={`h-0.5 flex-1 transition-all ${step === "form" ? "bg-primary" : "bg-white/10"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === "form" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/30"}`}>
              2
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-display font-bold text-white mb-2">Who are you?</h1>
                <p className="text-muted-foreground mb-8">Choose your role. This shapes your experience on PitchVision.</p>

                <div className="space-y-4">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      data-testid={`role-${r.id}`}
                      onClick={() => setRole(r.id)}
                      className={`w-full p-6 rounded-2xl border text-left transition-all group flex items-start gap-5 ${
                        role === r.id
                          ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/10"
                          : "bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20"
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${role === r.id ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 group-hover:text-white/60"}`}>
                        {r.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-bold transition-colors ${role === r.id ? "text-primary" : "text-white"}`}>{r.title}</h3>
                          {role === r.id && <Check className="w-5 h-5 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full mt-8 gap-2"
                  size="lg"
                  disabled={!role}
                  data-testid="button-continue"
                  onClick={() => setStep("form")}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === "form" && role && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-sm text-muted-foreground hover:text-white transition-colors mb-6 inline-flex items-center gap-2"
                >
                  ← Back
                </button>

                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  {role === "player" ? "Player Profile" : role === "coach" ? "Coach Profile" : "Scout Profile"}
                </h1>
                <p className="text-muted-foreground mb-8">Complete your profile. You can always update this later.</p>

                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* ─── PLAYER FORM ─── */}
                  {role === "player" && (
                    <>
                      <Section title="Personal Information">
                        <Row>
                          <Field label="Full Name">
                            <Input data-testid="input-fullname" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Kylian Mbappe" required />
                          </Field>
                          <Field label="Date of Birth">
                            <Input data-testid="input-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                          </Field>
                          <Field label="Nationality">
                            <SelectField value={nationality} onChange={setNationality} options={NATIONALITIES} />
                          </Field>
                          <Field label="Height (cm)">
                            <Input data-testid="input-height" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
                          </Field>
                          <Field label="Weight (kg)">
                            <Input data-testid="input-weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
                          </Field>
                          <Field label="Preferred Foot">
                            <SelectField value={preferredFoot} onChange={setPreferredFoot} options={["Right", "Left", "Both"]} />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Football Experience">
                        <Row>
                          <Field label="Current Club">
                            <Input data-testid="input-club" value={currentClub} onChange={e => setCurrentClub(e.target.value)} placeholder="e.g. FC Barcelona" />
                          </Field>
                          <Field label="Primary Position">
                            <SelectField value={primaryPosition} onChange={setPrimaryPosition} options={["Goalkeeper", "Defender", "Midfielder", "Winger", "Striker"]} />
                          </Field>
                          <Field label="Present Team Level">
                            <SelectField value={teamLevel} onChange={setTeamLevel} options={["Street / Casual", "School Team", "Local Club", "Football Academy", "Semi-Professional League", "Professional League", "Top Division / National Team"]} />
                          </Field>
                          <Field label="Years of Competitive Experience">
                            <SelectField value={yearsExperience} onChange={setYearsExperience} options={["Less than 1 year", "1 – 3 years", "3 – 6 years", "6 – 10 years", "10+ years"]} />
                          </Field>
                        </Row>
                        <Field label="Previous Clubs">
                          <Textarea data-testid="input-previous-clubs" value={previousClubs} onChange={e => setPreviousClubs(e.target.value)} placeholder="List previous clubs, one per line..." className="resize-none" />
                        </Field>
                      </Section>

                      <Section title="Player Statistics">
                        <Row cols={3}>
                          <Field label="Goals">
                            <Input data-testid="input-goals" type="number" value={goals} onChange={e => setGoals(e.target.value)} placeholder="0" />
                          </Field>
                          <Field label="Assists">
                            <Input data-testid="input-assists" type="number" value={assists} onChange={e => setAssists(e.target.value)} placeholder="0" />
                          </Field>
                          <Field label="Matches Played">
                            <Input data-testid="input-matches" type="number" value={matchesPlayed} onChange={e => setMatchesPlayed(e.target.value)} placeholder="0" />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Player Availability">
                        <Row>
                          <Field label="Looking for a club?">
                            <SelectField value={lookingForClub} onChange={setLookingForClub} options={["Yes", "No"]} />
                          </Field>
                          <Field label="Willing to relocate?">
                            <SelectField value={willingToRelocate} onChange={setWillingToRelocate} options={["Yes", "No"]} />
                          </Field>
                        </Row>
                      </Section>
                    </>
                  )}

                  {/* ─── COACH FORM ─── */}
                  {role === "coach" && (
                    <>
                      <Section title="Personal Information">
                        <Row>
                          <Field label="Full Name">
                            <Input data-testid="input-fullname" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Pep Guardiola" required />
                          </Field>
                          <Field label="Age">
                            <Input data-testid="input-age" type="number" value={coachAge} onChange={e => setCoachAge(e.target.value)} placeholder="35" />
                          </Field>
                          <Field label="Nationality">
                            <SelectField value={nationality} onChange={setNationality} options={NATIONALITIES} />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Coaching Credentials">
                        <Row>
                          <Field label="Coaching License">
                            <SelectField value={coachingLicense} onChange={setCoachingLicense} options={["UEFA A", "UEFA B", "CAF License", "FA License", "None"]} />
                          </Field>
                          <Field label="Coaching Level">
                            <SelectField value={coachingLevel} onChange={setCoachingLevel} options={["Youth", "Professional", "Goalkeeper"]} />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Coaching Experience">
                        <Row>
                          <Field label="Years of Coaching">
                            <Input data-testid="input-years" type="number" value={yearsOfCoaching} onChange={e => setYearsOfCoaching(e.target.value)} placeholder="5" />
                          </Field>
                          <Field label="Current Team">
                            <Input data-testid="input-team" value={currentTeam} onChange={e => setCurrentTeam(e.target.value)} placeholder="e.g. Manchester City" />
                          </Field>
                        </Row>
                        <Field label="Previous Teams">
                          <Textarea data-testid="input-prev-teams" value={previousTeams} onChange={e => setPreviousTeams(e.target.value)} placeholder="List previous teams, one per line..." className="resize-none" />
                        </Field>
                      </Section>

                      <Section title="Achievements">
                        <Row cols={3}>
                          <Field label="Trophies Won">
                            <Input data-testid="input-trophies" type="number" value={trophiesWon} onChange={e => setTrophiesWon(e.target.value)} placeholder="0" />
                          </Field>
                          <Field label="Promotions">
                            <Input data-testid="input-promotions" type="number" value={promotions} onChange={e => setPromotions(e.target.value)} placeholder="0" />
                          </Field>
                          <Field label="Championships">
                            <Input data-testid="input-championships" type="number" value={championships} onChange={e => setChampionships(e.target.value)} placeholder="0" />
                          </Field>
                        </Row>
                      </Section>
                    </>
                  )}

                  {/* ─── SCOUT FORM ─── */}
                  {role === "scout" && (
                    <>
                      <Section title="Personal Information">
                        <Row>
                          <Field label="Full Name">
                            <Input data-testid="input-fullname" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Smith" required />
                          </Field>
                          <Field label="Nationality">
                            <SelectField value={nationality} onChange={setNationality} options={NATIONALITIES} />
                          </Field>
                          <Field label="Organization">
                            <Input data-testid="input-org" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="e.g. FIFA Scouting Division" />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Professional Information">
                        <Row>
                          <Field label="Current Club / Agency">
                            <Input data-testid="input-agency" value={currentClubAgency} onChange={e => setCurrentClubAgency(e.target.value)} placeholder="e.g. Real Madrid CF" />
                          </Field>
                          <Field label="Years of Scouting">
                            <Input data-testid="input-years" type="number" value={yearsOfScouting} onChange={e => setYearsOfScouting(e.target.value)} placeholder="3" />
                          </Field>
                          <Field label="Authority Level">
                            <SelectField value={authorityLevel} onChange={setAuthorityLevel} options={["Independent Scout", "Club Scout", "Agency Scout"]} />
                          </Field>
                          <Field label="Work Email (Club Email)">
                            <Input data-testid="input-work-email" type="email" value={workEmail} onChange={e => setWorkEmail(e.target.value)} placeholder="scout@clubname.com" />
                          </Field>
                        </Row>
                      </Section>

                      <Section title="Player Focus">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Region of Scouting</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Africa", "Europe", "South America", "Asia", "North America"].map(r => (
                                <ToggleChip key={r} label={r} selected={scoutingRegions.includes(r)} onClick={() => toggleMultiSelect(scoutingRegions, setScoutingRegions, r)} />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Age Groups</Label>
                            <div className="flex flex-wrap gap-2">
                              {["U13", "U17", "U21", "Senior"].map(a => (
                                <ToggleChip key={a} label={a} selected={ageGroups.includes(a)} onClick={() => toggleMultiSelect(ageGroups, setAgeGroups, a)} />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Positions They Look For</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Forward", "Midfielder", "Defender", "Goalkeeper"].map(p => (
                                <ToggleChip key={p} label={p} selected={positionsFocus.includes(p)} onClick={() => toggleMultiSelect(positionsFocus, setPositionsFocus, p)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Section>
                    </>
                  )}

                  <div className="flex gap-4 pt-2 pb-8">
                    <Button type="button" variant="outline" className="flex-1" data-testid="button-skip" onClick={() => navigate("/")}>
                      Skip for now
                    </Button>
                    <Button type="submit" className="flex-1 gap-2" data-testid="button-save" disabled={isSaving}>
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Profile</>}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-primary uppercase tracking-[0.15em]">{title}</h3>
      <div className="space-y-4 p-5 bg-white/3 rounded-2xl border border-white/8">
        {children}
      </div>
    </div>
  );
}

function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-white/70 text-sm">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/5 border-white/10">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? "bg-primary/20 border-primary/50 text-primary"
          : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
      }`}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  );
}
