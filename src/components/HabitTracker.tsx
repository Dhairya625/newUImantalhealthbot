import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2, Calendar } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  category: string;
}

const categoryColors = {
  mindfulness: "accent",
  health: "primary",
  reflection: "secondary",
  exercise: "mood-good",
  learning: "mood-excellent",
};

export function HabitTracker() {
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { habits, addHabit, toggleHabit, deleteHabit } = useWellness();

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim(), "health");
      setNewHabitName("");
      setShowAddForm(false);
    }
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6 wellness-enter">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Habit Tracker</h1>
        <p className="text-muted-foreground">Build healthy habits, one day at a time</p>
      </div>

      {/* Progress Overview */}
      <Card className="wellness-card">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-semibold mb-2">Today's Progress</h2>
            <p className="text-white/90">{completedCount} of {totalHabits} habits completed</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <div className="text-white/90">Complete</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Habits List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Today's Habits
          </h2>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Habit</span>
          </Button>
        </div>

        {/* Add Habit Form */}
        {showAddForm && (
          <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex space-x-2">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter new habit..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
              />
              <Button onClick={handleAddHabit} size="sm">Add</Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <Card key={habit.id} className="p-4 hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col h-full">
                {/* Header with checkbox and delete */}
                <div className="flex items-start justify-between mb-3">
                  <Checkbox
                    checked={habit.completed}
                    onCheckedChange={() => toggleHabit(habit.id)}
                    className="w-5 h-5"
                  />
                  <Button
                    onClick={() => deleteHabit(habit.id)}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Habit name */}
                <div className={`font-medium text-lg mb-2 ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {habit.name}
                </div>
                
                {/* Category and streak info */}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryColors[habit.category as keyof typeof categoryColors]}/20 text-${categoryColors[habit.category as keyof typeof categoryColors]}`}>
                      {habit.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{habit.streak} day streak</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}