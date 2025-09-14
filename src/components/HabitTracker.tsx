import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2, Calendar, Flame, Trophy, Pin, PinOff } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  category: string;
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

const categoryColors = {
  mindfulness: "accent",
  health: "primary",
  reflection: "secondary",
  exercise: "stress-low",
  learning: "stress-very-low",
};

export function HabitTracker() {
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { habits, addHabit, toggleHabit, deleteHabit, getDailyHabitCompletions, tasks, toggleTask, deleteTask, pinnedTasks, pinTask, unpinTask } = useWellness();

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim(), "health");
      setNewHabitName("");
      setShowAddForm(false);
    }
  };

  const completedCount = (habits?.filter(h => h.completed) || []).length;
  const totalHabits = habits?.length || 0;
  const completionPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6 wellness-enter">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Habit Tracker</h1>
        <p className="text-muted-foreground">Build healthy habits, one day at a time</p>
      </div>

      {/* Progress Overview */}
      <Card className="wellness-card">
        <div className="flex items-center justify-between text-card-foreground">
          <div>
            <h2 className="text-xl font-semibold mb-2">Today's Progress</h2>
            <p className="text-card-foreground/90">{completedCount} of {totalHabits} habits completed</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <div className="text-card-foreground/90">Complete</div>
          </div>
        </div>
        <div className="mt-4 bg-card-foreground/20 rounded-full h-2">
          <div 
            className="bg-card-foreground rounded-full h-2 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Pinned Tasks */}
      <Card className="p-6 border-2 border-yellow-400">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <Target className="h-5 w-5 mr-2 text-yellow-600" />
          Pinned Tasks
        </h2>
        {(!pinnedTasks || pinnedTasks.length === 0) && (
          <p className="text-muted-foreground">No pinned tasks.</p>
        )}
        <div className="space-y-4">
          {(pinnedTasks || []).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md bg-yellow-50 shadow-sm">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="w-5 h-5"
              />
              <span className={`flex-1 mx-3 font-bold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.name}
              </span>
              <Button
                onClick={() => unpinTask(task.id)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary h-6 w-6 p-0"
              >
                <PinOff className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Tasks */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Today's Tasks
        </h2>
        {(!tasks || tasks.length === 0) && (
          <p className="text-muted-foreground">No tasks for today.</p>
        )}
        <div className="space-y-4">
          {(tasks || []).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="w-5 h-5"
              />
              <span className={`flex-1 mx-3 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.name}
              </span>
              <Button
                onClick={() => pinTask(task.id)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary h-6 w-6 p-0"
              >
                <Pin className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
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
          {(habits || []).map((habit) => (
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

      {/* Streak Bar - Daily Habit Completion */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Habit Streak
          </h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Current Streak Info */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(habits && habits.length > 0) ? Math.max(...habits.map(h => h.streak)) : 0} days
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-lg font-semibold text-orange-600">
                {(habits && habits.length > 0) ? Math.max(...habits.map(h => h.streak)) : 0} days
              </p>
            </div>
          </div>

          {/* Streak Grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
            {getDailyHabitCompletions(30).map((day, index) => {
              const completionRate = day.totalHabits > 0 ? day.habitIds.length / day.totalHabits : 0;
              const isToday = index === 29;
              
              let bgColor = "bg-gray-100";
              if (completionRate === 1) bgColor = "bg-green-500"; // All habits completed
              else if (completionRate >= 0.5) bgColor = "bg-green-300"; // Most habits completed
              else if (completionRate > 0) bgColor = "bg-green-200"; // Some habits completed
              else if (isToday) bgColor = "bg-blue-200"; // Today (no habits yet)
              
              return (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${bgColor} hover:scale-125 transition-transform cursor-pointer relative group`}
                  title={`${day.date}: ${day.habitIds.length}/${day.totalHabits} habits completed`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {day.date}: {day.habitIds.length}/{day.totalHabits} habits
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <span>No habits</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <span>Some habits</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <span>Most habits</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>All habits</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}