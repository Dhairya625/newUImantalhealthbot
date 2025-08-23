import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Moon, 
  Smile, 
  Target, 
  PenTool, 
  Calendar,
  MessageCircle,
  Menu,
  Settings
} from "lucide-react";
import { Settings as SettingsPanel } from "./Settings";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "dashboard", label: "Dashboard", icon: Heart },
  { id: "mood", label: "Mood", icon: Smile },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "habits", label: "Habits", icon: Target },
  { id: "journal", label: "Journal", icon: PenTool },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button - now positioned at top right for mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-soft md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Settings Button - Top right corner */}
      <div className="fixed top-4 right-4 z-50 md:block">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-card/20 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 ease-out hover:scale-110 active:scale-95"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
        </button>
      </div>

      {/* macOS Dock-style Navigation */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 md:block">
        <div className="flex items-center space-x-2 px-4 py-3 bg-card/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ease-out",
                  "hover:scale-110 active:scale-95",
                  isActive 
                    ? "bg-primary/20 text-primary shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
                title={item.label}
              >
                {/* Active indicator ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-pulse" />
                )}
                
                {/* Icon */}
                <Icon className={cn(
                  "h-7 w-7 transition-all duration-300",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )} />
                
                {/* Label tooltip */}
                <span className={cn(
                  "absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100",
                  "bg-black/80 text-white backdrop-blur-sm"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation - Full screen overlay */}
      {isMenuOpen && (
        <nav className="fixed inset-0 z-30 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur-xl border-t border-border/50">
            <div className="grid grid-cols-4 gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200",
                      isActive 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-6 w-6 mb-2", isActive && "text-primary")} />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}