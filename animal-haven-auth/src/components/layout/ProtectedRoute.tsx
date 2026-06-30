import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
// getUserData is an untyped JS helper; it resolves to the authenticated user object.
import { getUserData } from "@/api/getUserData";

export interface AuthUser {
  id?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

const AuthContext = createContext<AuthUser | null>(null);

/** Access the authenticated user. Only valid inside a ProtectedRoute subtree. */
export function useAuth(): AuthUser {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("useAuth must be used within a ProtectedRoute.");
  }
  return user;
}

/**
 * Route guard for all authenticated pages. Runs the auth check once, redirects to
 * /signin on failure, and exposes the user via useAuth() so pages no longer need to
 * duplicate the getUserData()/redirect dance in their own effects.
 */
export function ProtectedRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getUserData()
      .then((data: AuthUser) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) navigate("/signin", { replace: true });
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <AuthContext.Provider value={user}>
      <Outlet />
    </AuthContext.Provider>
  );
}
