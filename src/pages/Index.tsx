import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { StressTracker } from "@/components/StressTracker";
import { SleepTracker } from "@/components/SleepTracker";
import { HabitTracker } from "@/components/HabitTracker";
import { Journal } from "@/components/Journal";
import { CalendarView } from "@/components/CalendarView";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  const [activeSection, setActiveSection] = useState("chat");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard onSectionChange={setActiveSection} />;
      case "stress":
        return <StressTracker />;
      case "sleep":
        return <SleepTracker />;
      case "habits":
        return <HabitTracker />;
      case "journal":
        return <Journal />;
      case "calendar":
        return <CalendarView />;
      case "chat":
        return <ChatBot />;
      default:
        return <ChatBot />;
    }
  };

  return (
    <div className="min-h-screen gradient-background noise-texture">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="p-4 md:p-6 lg:p-12 pb-32 md:pb-24">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
