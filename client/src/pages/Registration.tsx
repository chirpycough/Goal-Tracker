import { useState } from "react";
import { useLocation } from "wouter";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Registration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"player" | "coach" | "scout" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Player fields
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [preferredFoot, setPreferredFoot] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [previousClubs, setPreviousClubs] = useState("");
  const [teamLevel, setTeamLevel] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [matchesPlayed, setMatchesPlayed] = useState("");
  const [lookingForClub, setLookingForClub] = useState(false);
  const [willingToRelocate, setWillingToRelocate] = useState(false);

  // Coach fields
  const [age, setAge] = useState("");
  const [coachingLicense, setCoachingLicense] = useState("");
  const [yearsOfCoaching, setYearsOfCoaching] = useState("");
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
  const [ageGroupsFocus, setAgeGroupsFocus] = useState<string[]>([]);
  const [positionsFocus, setPositionsFocus] = useState<string[]>([]);
  const [authorityLevel, setAuthorityLevel] = useState("");
  const [workEmail, setWorkEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      toast({ title: "Error", description: "Please select a user type", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          fullName,
          username,
          password,
          email,
          country,
          contactNumber,
          ...(userType === "player" && {
            dateOfBirth,
            height: height ? parseInt(height) : null,
            weight: weight ? parseInt(weight) : null,
            preferredFoot,
            currentClub,
            previousClubs,
            teamLevel,
            playerPosition,
            yearsOfExperience,
            goals: goals ? parseInt(goals) : null,
            assists: assists ? parseInt(assists) : null,
            matchesPlayed: matchesPlayed ? parseInt(matchesPlayed) : null,
            lookingForClub,
            willingToRelocate,
          }),
          ...(userType === "coach" && {
            age: age ? parseInt(age) : null,
            coachingLicense,
            yearsOfCoaching: yearsOfCoaching ? parseInt(yearsOfCoaching) : null,
            previousTeams,
            coachingLevel,
            trophiesWon: trophiesWon ? parseInt(trophiesWon) : null,
            promotions: promotions ? parseInt(promotions) : null,
            championships: championships ? parseInt(championships) : null,
          }),
          ...(userType === "scout" && {
            organization,
            currentClubAgency,
            yearsOfScouting: yearsOfScouting ? parseInt(yearsOfScouting) : null,
            scoutingRegions: scoutingRegions.join(","),
            ageGroupsFocus: ageGroupsFocus.join(","),
            positionsFocus: positionsFocus.join(","),
            authorityLevel,
            workEmail,
          }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast({ title: "Success", description: "Registration completed. Redirecting to login..." });
      setTimeout(() => navigate("/auth"), 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-white mb-3">Join PitchVision</h1>
            <p className="text-muted-foreground">Choose your role to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: "player" as const, title: "Player", desc: "Upload match footage and get AI analysis" },
              { type: "coach" as const, title: "Coach", desc: "Scout talent and build your team" },
              { type: "scout" as const, title: "Scout", desc: "Find exceptional talent globally" },
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => setUserType(option.type)}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => setUserType(null)}
          className="mb-6 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          ← Back to role selection
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            {userType === "player" ? "Player Registration" : userType === "coach" ? "Coach Registration" : "Scout Registration"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Complete your profile to get started</p>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Player Form */}
            {userType === "player" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Football Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Foot</Label>
                    <Select value={preferredFoot} onValueChange={setPreferredFoot}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Club</Label>
                    <Input value={currentClub} onChange={(e) => setCurrentClub(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Position</Label>
                    <Select value={playerPosition} onValueChange={setPlayerPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                        <SelectItem value="defender">Defender</SelectItem>
                        <SelectItem value="midfielder">Midfielder</SelectItem>
                        <SelectItem value="winger">Winger</SelectItem>
                        <SelectItem value="striker">Striker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Level</Label>
                    <Select value={teamLevel} onValueChange={setTeamLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="street">Street/Casual</SelectItem>
                        <SelectItem value="school">School Team</SelectItem>
                        <SelectItem value="local_club">Local Club</SelectItem>
                        <SelectItem value="academy">Football Academy</SelectItem>
                        <SelectItem value="semi_professional">Semi-Professional</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="top_division">Top Division/National Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Competitive Experience</Label>
                    <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                        <SelectItem value="1_3">1-3 years</SelectItem>
                        <SelectItem value="3_6">3-6 years</SelectItem>
                        <SelectItem value="6_10">6-10 years</SelectItem>
                        <SelectItem value="10_plus">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Previous Clubs</Label>
                  <Textarea value={previousClubs} onChange={(e) => setPreviousClubs(e.target.value)} />
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Goals</Label>
                    <Input type="number" value={goals} onChange={(e) => setGoals(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Assists</Label>
                    <Input type="number" value={assists} onChange={(e) => setAssists(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Matches Played</Label>
                    <Input type="number" value={matchesPlayed} onChange={(e) => setMatchesPlayed(e.target.value)} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">Availability</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={lookingForClub} onChange={(e) => setLookingForClub(e.target.checked)} />
                    <span className="text-sm text-white">Looking for a club?</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={willingToRelocate} onChange={(e) => setWillingToRelocate(e.target.checked)} />
                    <span className="text-sm text-white">Willing to relocate?</span>
                  </label>
                </div>
              </div>
            )}

            {/* Coach Form */}
            {userType === "coach" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Coaching Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Coaching License</Label>
                    <Select value={coachingLicense} onValueChange={setCoachingLicense}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uefa_a">UEFA A</SelectItem>
                        <SelectItem value="uefa_b">UEFA B</SelectItem>
                        <SelectItem value="caf">CAF License</SelectItem>
                        <SelectItem value="fa">FA License</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Coaching</Label>
                    <Input type="number" value={yearsOfCoaching} onChange={(e) => setYearsOfCoaching(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Coaching Level</Label>
                    <Select value={coachingLevel} onValueChange={setCoachingLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trophies Won</Label>
                    <Input type="number" value={trophiesWon} onChange={(e) => setTrophiesWon(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Promotions</Label>
                    <Input type="number" value={promotions} onChange={(e) => setPromotions(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Championships</Label>
                    <Input type="number" value={championships} onChange={(e) => setChampionships(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Team</Label>
                    <Input value={currentClub} onChange={(e) => setCurrentClub(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Previous Teams</Label>
                  <Textarea value={previousTeams} onChange={(e) => setPreviousTeams(e.target.value)} />
                </div>
              </div>
            )}

            {/* Scout Form */}
            {userType === "scout" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scouting Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input value={organization} onChange={(e) => setOrganization(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Club/Agency</Label>
                    <Input value={currentClubAgency} onChange={(e) => setCurrentClubAgency(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Scouting</Label>
                    <Input type="number" value={yearsOfScouting} onChange={(e) => setYearsOfScouting(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Authority Level</Label>
                    <Select value={authorityLevel} onValueChange={setAuthorityLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Independent Scout</SelectItem>
                        <SelectItem value="club_scout">Club Scout</SelectItem>
                        <SelectItem value="agency_scout">Agency Scout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Work Email</Label>
                    <Input type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">Specialization</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Scouting Regions (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Africa", "Europe", "South America", "Asia", "North America"].map((region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() =>
                            setScoutingRegions((prev) =>
                              prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
                            )
                          }
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            scoutingRegions.includes(region)
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Age Groups Focus (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {["U13", "U17", "U21", "Senior"].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() =>
                            setAgeGroupsFocus((prev) =>
                              prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
                            )
                          }
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            ageGroupsFocus.includes(age)
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Positions Focus (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Forward", "Midfielder", "Defender", "Goalkeeper"].map((position) => (
                        <button
                          key={position}
                          type="button"
                          onClick={() =>
                            setPositionsFocus((prev) =>
                              prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]
                            )
                          }
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            positionsFocus.includes(position)
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
