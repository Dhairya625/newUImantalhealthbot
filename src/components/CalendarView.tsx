import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Circle } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";

interface DayData {
  date: number;
  mood?: string;
  hasJournal?: boolean;
  sleepHours?: number;
  habitsCompleted?: number;
  totalHabits?: number;
  habits?: Array<{ id: string; name: string; completed: boolean; category: string }>;
}

const moodEmojis = {
  excellent: "😊",
  good: "🙂", 
  okay: "😐",
  poor: "🙁",
  awful: "😢"
};

// No hardcoded data - will use real data from context

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { journalEntries, habits } = useWellness();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const journalByDay = useMemo(() => {
    const map: Record<number, { id: string; title: string; content: string }[]> = {};
    journalEntries.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push({ id: e.id, title: e.title, content: e.content });
      }
    });
    return map;
  }, [journalEntries, year, month]);

  const getDayData = (day: number): DayData => {
    const hasJournal = Boolean(journalByDay[day]?.length);
    
    // Get habits for the specific date
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayHabits = habits.filter(h => h.dateCompleted === dateString);
    const totalHabits = habits.length;
    const habitsCompleted = dayHabits.length;
    
    return { 
      date: day, 
      hasJournal,
      totalHabits,
      habitsCompleted,
      habits: dayHabits.map(h => ({ id: h.id, name: h.name, completed: h.completed, category: h.category }))
    };
  };

  const renderCalendarGrid = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const isToday = day === today && month === currentMonth && year === currentYear;
      const hasMood = dayData.mood;
      const hasJournal = dayData.hasJournal;

      const isSelected = selectedDay === day;
      const entries = journalByDay[day] || [];
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDay((prev) => (prev === day ? null : day))}
          className={`
            relative p-2 ${isSelected ? 'h-auto' : 'h-16'} rounded-lg border border-border transition-all duration-300 ease-in-out
            hover:border-primary/50 hover:bg-primary/5
            ${isToday ? 'border-primary bg-primary/10' : ''}
            ${hasMood ? 'bg-secondary/10' : ''}
          `}
        >
          <div className="text-sm font-medium">{day}</div>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {hasMood && (
              <span className="text-xs">{moodEmojis[dayData.mood as keyof typeof moodEmojis]}</span>
            )}
            {(hasJournal || entries.length > 0) && (
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            )}
            {dayData.totalHabits > 0 && (
              <div className={`text-xs px-1 rounded ${
                dayData.habitsCompleted === dayData.totalHabits 
                  ? 'bg-green-100 text-green-800' 
                  : dayData.habitsCompleted > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {dayData.habitsCompleted}/{dayData.totalHabits}
              </div>
            )}
          </div>

          <div
            className={`mt-2 text-left text-xs leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
              isSelected ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Journal Entries */}
            {entries.length > 0 && (
              <div className="space-y-1 mb-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">Journal Entries:</div>
                {entries.slice(0, 2).map((e) => (
                  <div key={e.id} className="p-2 rounded-md bg-muted/40 border border-border/60">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-muted-foreground line-clamp-2">{e.content}</div>
                  </div>
                ))}
                {entries.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">+{entries.length - 2} more</div>
                )}
              </div>
            )}
            
            {/* Habits */}
            {dayData.habits && dayData.habits.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">Habits:</div>
                {dayData.habits.map((habit) => (
                  <div key={habit.id} className="flex items-center space-x-2 p-2 rounded-md bg-muted/40 border border-border/60">
                    {habit.completed ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={`text-xs ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {habit.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {habit.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {entries.length === 0 && (!dayData.habits || dayData.habits.length === 0) && (
              <div className="text-muted-foreground">No entries for this day</div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6 wellness-enter">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendar Overview</h1>
        <p className="text-muted-foreground">Track your wellness journey over time</p>
      </div>

      {/* Calendar Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-primary" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex space-x-2">
            <Button onClick={goToPreviousMonth} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToNextMonth} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarGrid()}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Legend:</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span>😊</span>
              <span>Mood logged</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Journal entry</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="text-xs px-1 bg-secondary text-secondary-foreground rounded">3/5</div>
              <span>Habits completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Habit completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span>Habit pending</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Inline expansion on each date now shows details with animations */}
    </div>
  );
}