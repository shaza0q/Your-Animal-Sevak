import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Shield, CalendarDays } from "lucide-react";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const titleCase = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

const Profile = () => {
  const user = useAuth();
  useBreadcrumbs([{ label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]);

  const rows = [
    { icon: Mail, label: "Email", value: user.email ?? "—" },
    { icon: Phone, label: "Mobile", value: user.mobile ?? "—" },
    { icon: Shield, label: "Role", value: titleCase(user.role) },
    {
      icon: CalendarDays,
      label: "Member since",
      value: user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "—",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                {user.role && (
                  <Badge variant="secondary">{titleCase(user.role)}</Badge>
                )}
                {user.isActive === false && (
                  <Badge variant="outline" className="text-destructive border-destructive/40">
                    Inactive
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <r.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className="truncate font-medium">{r.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
