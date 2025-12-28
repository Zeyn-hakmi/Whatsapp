import { ReactNode } from "react";
import { useTeamAccess, Permission } from "@/hooks/useTeamAccess";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  showLocked?: boolean;
}

export function PermissionGate({ 
  permission, 
  children, 
  fallback,
  showLocked = true 
}: PermissionGateProps) {
  const { hasPermission, isLoading } = useTeamAccess();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    if (fallback) return <>{fallback}</>;
    if (showLocked) {
      return (
        <Card className="p-6 bg-muted/30 border-dashed">
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <Lock className="w-6 h-6" />
            <p className="text-sm">You don't have permission to access this feature</p>
          </div>
        </Card>
      );
    }
    return null;
  }

  return <>{children}</>;
}
