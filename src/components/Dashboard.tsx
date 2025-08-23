import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Moon, 
  Smile, 
  Target, 
  PenTool, 
  Calendar,
  TrendingUp,
  Sun
} from "lucide-react";
import wellnessHero from "@/assets/wellness-hero.jpg";

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

const quickStats = [
  { label: "Mood Average", value: "Good", icon: Smile, color: "mood-good" },
  { label: "Sleep Last Night", value: "7.5h", icon: Moon, color: "primary" },
  { label: "Habits Complete", value: "3/5", icon: Target, color: "secondary" },
  { label: "Journal Entries", value: "12", icon: PenTool, color: "accent" },
];

const quickActions = [
  { id: "mood", label: "Log Mood", icon: Smile, description: "How are you feeling today?" },
  { id: "sleep", label: "Sleep Log", icon: Moon, description: "Track your rest" },
  { id: "journal", label: "Write Entry", icon: PenTool, description: "Reflect on your day" },
  { id: "habits", label: "Check Habits", icon: Target, description: "Mark your progress" },
];

export function Dashboard({ onSectionChange }: DashboardProps) {
  return (
    <div className="space-y-8 wellness-enter">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden">
        <img 
          src={wellnessHero} 
          alt="Peaceful wellness illustration" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center">
          <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome to Peace Pulse</h1>
            <p className="text-lg opacity-90">Your journey to wellness starts here</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="mood-card">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Sun className="h-5 w-5 mr-2 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id} 
                className="mood-card cursor-pointer group"
                onClick={() => onSectionChange(action.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Progress */}
      <Card className="wellness-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Today's Progress
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("calendar")}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            View Calendar
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/90">Morning mood check</span>
            <span className="text-white font-medium">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Meditation (10 min)</span>
            <span className="text-white font-medium">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Journal entry</span>
            <span className="text-white/70">Pending</span>
          </div>
        </div>
      </Card>
    </div>
  );
}