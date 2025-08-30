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
  Sun,
  AlertTriangle
} from "lucide-react";
import wellnessHero from "@/assets/wellness-hero.jpg";

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

const quickStats = [
  { label: "Stress Level", value: "Moderate", icon: AlertTriangle, color: "stress-moderate" },
  { label: "Sleep Last Night", value: "7.5h", icon: Moon, color: "primary" },
  { label: "Habits Complete", value: "3/5", icon: Target, color: "secondary" },
  { label: "Journal Entries", value: "12", icon: PenTool, color: "accent" },
];

const quickActions = [
  { id: "stress", label: "Log Stress", icon: AlertTriangle, description: "How stressed are you feeling?" },
  { id: "sleep", label: "Sleep Log", icon: Moon, description: "Track your rest" },
  { id: "journal", label: "Write Entry", icon: PenTool, description: "Reflect on your day" },
  { id: "habits", label: "Check Habits", icon: Target, description: "Mark your progress" },
];

export function Dashboard({ onSectionChange }: DashboardProps) {
  return (
    <div className="section-spacing wellness-enter layout-container">
      {/* Enhanced Hero Section */}
      <div className="relative rounded-3xl overflow-hidden group">
        <img 
          src={wellnessHero} 
          alt="Peaceful wellness illustration" 
          className="w-full h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-secondary/50 to-accent/60 flex items-center">
          <div className="p-8 md:p-12 text-white">
            <h1 className="text-hero mb-4 drop-shadow-lg">
              Welcome to <span className="gradient-text bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Peace Pulse</span>
            </h1>
            <p className="text-body-large opacity-95 drop-shadow-md font-light mb-8">Your journey to wellness starts here</p>
            <div className="flex flex-wrap gap-4">
              <div className="glass-card px-6 py-3 backdrop-blur-lg">
                <span className="text-sm font-medium">🌟 Track Progress</span>
              </div>
              <div className="glass-card px-6 py-3 backdrop-blur-lg">
                <span className="text-sm font-medium">💚 Build Habits</span>
              </div>
              <div className="glass-card px-6 py-3 backdrop-blur-lg">
                <span className="text-sm font-medium">🧘 Find Peace</span>
              </div>
            </div>
          </div>
        </div>
        {/* Floating elements for visual interest */}
        <div className="absolute top-8 right-8 w-4 h-4 bg-white/30 rounded-full float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-16 right-20 w-2 h-2 bg-white/20 rounded-full float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-12 w-3 h-3 bg-white/25 rounded-full float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="card-grid-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="wellness-card group hover:scale-105 transition-all duration-300 interactive-card">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 text-${stat.color} drop-shadow-sm`} />
                </div>
                <div>
                  <p className="text-caption mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
              {/* Hover shimmer effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="content-spacing">
        <div className="section-header">
          <h2 className="section-heading flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mr-4">
              <Sun className="h-6 w-6 text-primary" />
            </div>
            Quick Actions
          </h2>
        </div>
        <div className="card-grid-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const gradients = [
              'from-primary/10 to-primary-soft/20',
              'from-secondary/10 to-secondary-soft/20', 
              'from-accent/10 to-accent-soft/20',
              'from-tertiary/10 to-tertiary-soft/20'
            ];
            return (
              <Card 
                key={action.id} 
                className={`glass-card-intense cursor-pointer group hover:scale-105 transition-all duration-300 p-8 bg-gradient-to-br ${gradients[index]} border-0 interactive-card`}
                onClick={() => onSectionChange(action.id)}
              >
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Icon className="h-10 w-10 text-primary drop-shadow-sm" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-subheading text-foreground group-hover:text-primary transition-colors duration-200">{action.label}</h3>
                    <p className="text-body text-muted-foreground font-medium">{action.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-12 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Today's Progress */}
      <Card className="wellness-card bg-gradient-to-br from-gradient-wellness via-primary-lighter/30 to-secondary-lighter/30 border-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Today's Progress
          </h2>
          <Button 
            onClick={() => onSectionChange("calendar")}
            className="btn-primary hover:scale-105 transition-transform duration-200"
            size="sm"
          >
            View Calendar
          </Button>
        </div>
        <div className="space-y-4">
          {[
            { task: "Morning stress check", completed: true, icon: "✨" },
            { task: "Meditation (10 min)", completed: true, icon: "🧘" },
            { task: "Journal entry", completed: false, icon: "📝" }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-white/10 group hover:scale-[1.02] transition-all duration-200">
              <div className="flex items-center space-x-4">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-body font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.task}
                </span>
              </div>
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full font-medium text-sm ${item.completed 
                  ? 'bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border border-secondary/20' 
                  : 'bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border border-muted/20'
                }`}>
                {item.completed ? (
                  <>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span>Complete</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                    <span>Pending</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress visualization */}
        <div className="mt-8 p-6 rounded-xl bg-card/30 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
            <span>Daily Progress</span>
            <span>2/3 Complete</span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-4">
            <div className="bg-gradient-to-r from-secondary to-primary h-4 rounded-full transition-all duration-500" style={{width: '66.7%'}}></div>
          </div>
        </div>
      </Card>
    </div>
  );
}