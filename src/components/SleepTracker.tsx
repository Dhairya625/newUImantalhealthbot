import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Clock, TrendingUp } from "lucide-react";
import { useWellness } from "@/hooks/wellness-context";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const sleepData: never[] = [];

export function SleepTracker() {
  const [bedtime, setBedtime] = useState("");
  const [wakeupTime, setWakeupTime] = useState("");
  const [quality, setQuality] = useState("");
  const { addSleepEntry, sleepEntries } = useWellness();

  const qualityOptions = [
    { value: "excellent", label: "Excellent", emoji: "😴" },
    { value: "good", label: "Good", emoji: "😊" },
    { value: "fair", label: "Fair", emoji: "😐" },
    { value: "poor", label: "Poor", emoji: "😴" },
  ];

  const calculateDuration = () => {
    if (bedtime && wakeupTime) {
      // Use arbitrary same base date, adjust for crossing midnight
      const bed = new Date(`1970-01-01T${bedtime}:00`);
      const wake = new Date(`1970-01-01T${wakeupTime}:00`);
      if (wake < bed) wake.setDate(wake.getDate() + 1);
      const diff = wake.getTime() - bed.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return "0h 0m";
  };

  const handleSubmit = () => {
    if (bedtime && wakeupTime && quality) {
      const bed = new Date(`1970-01-01T${bedtime}:00`);
      const wake = new Date(`1970-01-01T${wakeupTime}:00`);
      if (wake < bed) wake.setDate(wake.getDate() + 1);
      const diffMinutes = Math.round((wake.getTime() - bed.getTime()) / (1000 * 60));
      // Associate with the wake-up calendar day in local time
      const now = new Date();
      const wakeDate = new Date(now);
      // Map to today's date by default (you could add a date picker later)
      const dateKey = wakeDate.toISOString().slice(0, 10);
      addSleepEntry({
        date: dateKey,
        bedtime,
        wakeup: wakeupTime,
        durationMinutes: diffMinutes,
        quality: quality as any,
      });
      setBedtime("");
      setWakeupTime("");
      setQuality("");
    }
  };

  // Build a month dataset (1..daysInMonth) with hours slept (0 if missing)
  const monthData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const byDay: Record<number, number> = {};
    sleepEntries.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        const hours = Math.round((e.durationMinutes / 60) * 100) / 100;
        byDay[day] = hours;
      }
    });
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day: String(day), hours: byDay[day] ?? 0 };
    });
  }, [sleepEntries]);

  return (
    <div className="space-y-6 wellness-enter">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sleep Tracker</h1>
        <p className="text-muted-foreground">Monitor your sleep patterns for better rest</p>
      </div>

      {/* Sleep Entry Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Moon className="h-5 w-5 mr-2 text-primary" />
          Log Last Night's Sleep
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="bedtime" className="flex items-center">
              <Moon className="h-4 w-4 mr-2" />
              Bedtime
            </Label>
            <Input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wakeup" className="flex items-center">
              <Sun className="h-4 w-4 mr-2" />
              Wake up time
            </Label>
            <Input
              id="wakeup"
              type="time"
              value={wakeupTime}
              onChange={(e) => setWakeupTime(e.target.value)}
            />
          </div>
        </div>

        {/* Duration Display */}
        {bedtime && wakeupTime && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-primary">
                Sleep Duration: {calculateDuration()}
              </span>
            </div>
          </div>
        )}

        {/* Sleep Quality */}
        <div className="space-y-3 mb-6">
          <Label>How was your sleep quality?</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {qualityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setQuality(option.value)}
                className={`
                  p-3 rounded-xl text-center border-2 transition-all duration-200
                  ${quality === option.value 
                    ? "border-primary bg-primary/10 scale-105" 
                    : "border-border hover:border-muted-foreground/30 hover:scale-105"
                  }
                `}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!bedtime || !wakeupTime || !quality}
          className="w-full"
        >
          Save Sleep Entry
        </Button>
      </Card>

      {/* Sleep History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sleep History</h2>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {sleepEntries.slice(0, 10).map((entry) => {
            const hours = Math.floor(entry.durationMinutes / 60);
            const minutes = entry.durationMinutes % 60;
            const duration = `${hours}h ${minutes}m`;
            return (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.bedtime} - {entry.wakeup}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{duration}</div>
                  <div className="text-sm text-secondary">{entry.quality}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Sleep Chart (Line) */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">This Month's Sleep (hours per day)</h2>
        <ChartContainer
          config={{ hours: { label: "Hours Slept", color: "hsl(var(--primary))" } }}
          className="w-full"
        >
          <LineChart data={monthData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="hours" stroke="var(--color-hours)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ChartContainer>
      </Card>
    </div>
  );
}