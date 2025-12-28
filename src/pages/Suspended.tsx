import { useAuth } from "@/contexts/AuthContext";
import { useSuspensionCheck } from "@/hooks/useSuspensionCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogOut, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Suspended() {
  const { user, signOut } = useAuth();
  const { isSuspended, suspendedReason, isLoading } = useSuspensionCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isSuspended && user) {
      navigate("/dashboard");
    }
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, isSuspended, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been suspended and you cannot access the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {suspendedReason && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Reason:</p>
              <p className="text-sm">{suspendedReason}</p>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>If you believe this is a mistake, please contact our support team.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@example.com">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
