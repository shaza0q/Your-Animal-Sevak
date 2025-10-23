import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-primary">
              Animal Management System
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline animal care, health tracking, and management in one place
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🐾</div>
                <h3 className="text-lg font-semibold mb-2">Track Health</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor animal health records and vaccination schedules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Get insights into animal care and facility management
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Coordinate with vets, staff, and caretakers efficiently
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
