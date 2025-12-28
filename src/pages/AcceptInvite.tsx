import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";

interface InviteDetails {
  id: string;
  owner_id: string;
  member_email: string;
  role: string;
  status: string;
  ownerName?: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInviteDetails();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && invite && invite.status === "pending") {
      // User is logged in, check if email matches
      if (user.email?.toLowerCase() === invite.member_email.toLowerCase()) {
        // Auto-accept if logged in with matching email
      } else {
        setError(`This invitation was sent to ${invite.member_email}. Please log in with that email address.`);
      }
    }
  }, [user, invite]);

  const fetchInviteDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("team_members")
        .select("*")
        .eq("id", token)
        .single();

      if (fetchError || !data) {
        setError("Invitation not found or has expired");
        setLoading(false);
        return;
      }

      if (data.status === "active") {
        setError("This invitation has already been accepted");
        setLoading(false);
        return;
      }

      if (data.status === "inactive") {
        setError("This invitation has been cancelled");
        setLoading(false);
        return;
      }

      // Fetch owner name
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("user_id", data.owner_id)
        .single();

      setInvite({
        ...data,
        ownerName: ownerProfile?.full_name || ownerProfile?.company_name || "Team Owner",
      });

      setEmail(data.member_email);

      if (!user) {
        setNeedsAuth(true);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching invite:", err);
      setError("Failed to load invitation details");
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/accept-invite?token=${token}`,
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now accept the invitation.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      setNeedsAuth(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;

    setAccepting(true);
    try {
      // Update team member record
      const { error: updateError } = await supabase
        .from("team_members")
        .update({
          status: "active",
          member_user_id: user.id,
          joined_at: new Date().toISOString(),
        })
        .eq("id", invite.id);

      if (updateError) throw updateError;

      // Update seats_used in subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("seats_used")
        .eq("user_id", invite.owner_id)
        .single();

      if (subscription) {
        await supabase
          .from("subscriptions")
          .update({ seats_used: (subscription.seats_used || 0) + 1 })
          .eq("user_id", invite.owner_id);
      }

      toast.success("You've successfully joined the team!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error accepting invite:", err);
      toast.error("Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsAuth && invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Join {invite.ownerName}'s Team</CardTitle>
            <CardDescription>
              {authMode === "login" 
                ? "Sign in to accept your invitation" 
                : "Create an account to join the team"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authMode === "login"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {authMode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-sm text-primary hover:underline"
              >
                {authMode === "login" 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite && user) {
    const emailMatch = user.email?.toLowerCase() === invite.member_email.toLowerCase();

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Accept Team Invitation</CardTitle>
            <CardDescription>
              You've been invited to join <strong>{invite.ownerName}'s</strong> team as a <strong>{invite.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!emailMatch ? (
              <div className="text-sm text-destructive text-center">
                This invitation was sent to {invite.member_email}. 
                Please log in with that email address.
              </div>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    By accepting, you'll have access to the team's shared resources based on your role.
                  </p>
                </div>
                <Button 
                  onClick={handleAcceptInvite} 
                  className="w-full" 
                  disabled={accepting}
                >
                  {accepting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Accept Invitation
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
