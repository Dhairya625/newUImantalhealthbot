import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Circle,
  BookText, // New icon for journal
  PlusCircle // New icon for adding entries
} from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames

// NOTE: You would need to add a 'cn' utility function if you don't have one.
// It's standard in shadcn/ui projects. Example:
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"
// export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

interface JournalEntry {
  id: string;
  title: string;
  content: string;
}

interface HabitLog {
  id: string;
  name:string;
  completed: boolean;
  category: string;
}

interface DayData {
  date: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  journalEntries: JournalEntry[];
  habits: HabitLog[];
  habitsCompleted: number;
  totalHabitsForDay: number; // Assuming habits can be different per day
}

const stressEmojis = {
  "very-low": "😌",
  "low": "🙂", 
  "moderate": "😐",
  "high": "😰",
  "very-high": "😱"
};

// --- New Component: Day Details Sidebar ---
const DayDetailsSidebar = ({ dayData, monthName, year }: { dayData: DayData | null; monthName: string; year: number }) => {
  if (!dayData) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-6 text-center">
        <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">Select a day</h3>
        <p className="text-sm text-muted-foreground">Click on a date in the calendar to see its details.</p>
      </Card>
    );
  }

  const { date, journalEntries, habits, habitsCompleted, totalHabitsForDay } = dayData;
  const hasData = journalEntries.length > 0 || habits.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold">
          {monthName} {date}, {year}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalHabitsForDay > 0 ? `${habitsCompleted} of ${totalHabitsForDay} habits completed` : "No habits tracked for this day."}
        </p>
      </CardHeader>
      <CardContent className="p-6 flex-grow overflow-y-auto">
        {hasData ? (
          <div className="space-y-6">
            {/* Journal Entries Section */}
            {journalEntries.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-semibold tracking-tight flex items-center">
                  <BookText className="h-4 w-4 mr-2" />
                  Journal Entries
                </h4>
                <div className="space-y-3">
                  {journalEntries.map(entry => (
                    <div key={entry.id} className="p-3 rounded-lg border bg-background/50">
                      <p className="font-medium text-sm truncate">{entry.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Habits Section */}
            {habits.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-semibold tracking-tight flex items-center">
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Habits
                </h4>
                <div className="space-y-2">
                  {habits.map(habit => (
                    <div key={habit.id} className="flex items-center space-x-3 p-2 text-sm rounded-md border bg-background/50">
                      {habit.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={cn("flex-grow", habit.completed && 'line-through text-muted-foreground')}>
                        {habit.name}
                      </span>
                       <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                        {habit.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center h-full flex flex-col justify-center items-center">
            <BookText className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-md font-medium">No Entries</h3>
            <p className="text-sm text-muted-foreground mb-4">You have no journal or habit entries for this day.</p>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// --- Main CalendarView Component ---
export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const { journalEntries, habits } = useWellness();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };
  
  // Set selected date to today on initial mount
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const calendarData = useMemo(() => {
    const data: Map<number, DayData> = new Map();
    
    // In a real app, you might fetch habits relevant for this month.
    // For this example, we'll assume `habits` from context contains all habit definitions.
    const totalHabitDefinitions = habits.length;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayJournalEntries = journalEntries.filter(e => e.date.startsWith(dateString));
      
      // This logic needs to be adapted based on how your habits are stored.
      // Assuming `habits` are logs, not definitions.
      const dayHabits = habits.filter(h => h.dateCompleted === dateString);
      const habitsCompleted = dayHabits.filter(h => h.completed).length;

      data.set(day, {
        date: day,
        isToday: date.toDateString() === new Date().toDateString(),
        isCurrentMonth: true, // Placeholder
        journalEntries: dayJournalEntries,
        habits: dayHabits,
        habitsCompleted: habitsCompleted,
        totalHabitsForDay: dayHabits.length // Or total definitions if you track all
      });
    }
    return data;
  }, [journalEntries, habits, year, month, daysInMonth]);

  const selectedDayData = selectedDate && selectedDate.getMonth() === month && selectedDate.getFullYear() === year
    ? calendarData.get(selectedDate.getDate()) || null
    : null;

  return (
    <div className="space-y-6 wellness-enter p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Calendar Overview</h1>
        <p className="text-muted-foreground">Track your wellness journey over time.</p>
      </div>
      
      {/* Main Responsive Layout: 1 column on mobile, 2 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* --- Left Column: Day Details Sidebar --- */}
        <div className="lg:col-span-1">
          <DayDetailsSidebar 
            dayData={selectedDayData}
            monthName={monthNames[month]}
            year={year}
          />
        </div>

        {/* --- Right Column: Calendar Grid --- */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {monthNames[month]} {year}
              </h2>
              <div className="flex space-x-2">
                <Button onClick={goToPreviousMonth} variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={goToNextMonth} variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground border-b pb-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayData = calendarData.get(day);
                  if (!dayData) return null;

                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
                  const firstJournal = dayData.journalEntries[0];

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "relative flex flex-col items-start p-2 h-24 rounded-lg border text-sm text-left transition-colors duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        dayData.isToday ? "border-primary/60 bg-primary/5" : "border-transparent hover:bg-muted",
                        isSelected ? "bg-primary/10 border-primary" : ""
                      )}
                    >
                      <span className={cn(
                        "font-medium", 
                        dayData.isToday ? "text-primary" : "text-foreground"
                      )}>{day}</span>
                      
                      <div className="mt-1 space-y-1 w-full overflow-hidden">
                        {firstJournal && (
                          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                            <BookText className="h-3 w-3 flex-shrink-0" />
                            <p className="truncate">{firstJournal.title}</p>
                          </div>
                        )}
                        {dayData.totalHabitsForDay > 0 && (
                          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                             {dayData.habitsCompleted === dayData.totalHabitsForDay ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                              <p>{dayData.habitsCompleted}/{dayData.totalHabitsForDay} habits</p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}