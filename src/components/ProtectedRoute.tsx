import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSuspensionCheck } from "@/hooks/useSuspensionCheck";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isSuspended, isLoading: suspensionLoading } = useSuspensionCheck();

  if (authLoading || (user && suspensionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isSuspended) {
    return <Navigate to="/suspended" replace />;
  }

  return <>{children}</>;
}
