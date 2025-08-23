import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

const moodOptions = [
  { id: "excellent", label: "Excellent", emoji: "😊", color: "mood-excellent" },
  { id: "good", label: "Good", emoji: "🙂", color: "mood-good" },
  { id: "okay", label: "Okay", emoji: "😐", color: "mood-okay" },
  { id: "poor", label: "Poor", emoji: "🙁", color: "mood-poor" },
  { id: "awful", label: "Awful", emoji: "😢", color: "mood-awful" },
];

const recentMoods = [
  { date: "Today", mood: "good", note: "Had a productive day at work" },
  { date: "Yesterday", mood: "excellent", note: "Great time with friends" },
  { date: "2 days ago", mood: "okay", note: "Feeling a bit tired" },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const { addMoodEntry, moodHistory } = useWellness();

  const handleSubmit = () => {
    if (selectedMood) {
      addMoodEntry(selectedMood as any, note);
      setSelectedMood("");
      setNote("");
    }
  };

  return (
    <div className="space-y-6 wellness-enter">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">How are you feeling?</h1>
        <p className="text-muted-foreground">Track your mood to understand patterns</p>
      </div>

      {/* Mood Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Mood</h2>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`
                p-4 rounded-2xl text-center border-2 transition-all duration-200
                ${selectedMood === mood.id 
                  ? `border-${mood.color} bg-${mood.color}/10 scale-105` 
                  : "border-border hover:border-muted-foreground/30 hover:scale-105"
                }
              `}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium">{mood.label}</div>
            </button>
          ))}
        </div>

        {/* Note Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Add a note (optional)</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? How was your day?"
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full mt-4"
        >
          Save Mood Entry
        </Button>
      </Card>

      {/* Recent Moods */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Moods</h2>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {(moodHistory.length ? moodHistory : recentMoods).slice(0, 5).map((entry: any, index: number) => {
            const moodData = moodOptions.find(m => m.id === entry.mood);
            return (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-muted/30">
                <div className="text-2xl">{moodData?.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{new Date(entry.date).toLocaleString()}</span>
                    <span className={`text-sm px-2 py-1 rounded-full bg-${moodData?.color}/20 text-${moodData?.color}`}>
                      {moodData?.label}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}