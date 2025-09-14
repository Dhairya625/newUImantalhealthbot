import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

export function TimePicker({ value, onChange, label, id }: TimePickerProps) {
  const [hour, minute] = value.split(":").map(Number);
  const [activeMode, setActiveMode] = React.useState<"hour" | "minute">("hour");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    let newHour = isNaN(hour) ? 12 : hour;
    let newMinute = isNaN(minute) ? 0 : minute;

    if (type === "hour") {
      newHour = val;
    } else {
      newMinute = val;
    }

    const formattedHour = String(newHour).padStart(2, "0");
    const formattedMinute = String(newMinute).padStart(2, "0");
    onChange(`${formattedHour}:${formattedMinute}`);
  };

  const incrementValue = (type: "hour" | "minute") => {
    if (type === "hour") {
      const newHour = isNaN(hour) ? 0 : (hour + 1) % 24;
      handleTimeChange("hour", newHour);
    } else {
      const newMinute = isNaN(minute) ? 0 : (minute + 5) % 60;
      handleTimeChange("minute", newMinute);
    }
  };

  const decrementValue = (type: "hour" | "minute") => {
    if (type === "hour") {
      const newHour = isNaN(hour) ? 23 : hour === 0 ? 23 : hour - 1;
      handleTimeChange("hour", newHour);
    } else {
      const newMinute = isNaN(minute) ? 55 : minute === 0 ? 55 : minute - 5;
      handleTimeChange("minute", newMinute);
    }
  };

  const renderDial = (
    count: number,
    currentValue: number,
    onSelect: (value: number) => void,
    step = 1,
    type: "hour" | "minute"
  ) => {
    const items = [];
    const radius = 85;
    const center = 110;
    const isActive = activeMode === type;

    for (let i = 0; i < count; i += step) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isSelected = i === currentValue;

      items.push(
        <button
          key={i}
          onClick={() => {
            onSelect(i);
            if (type === "hour") {
              setActiveMode("minute");
            }
          }}
          className={cn(
            "absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-in-out",
            "transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95",
            "border-2 backdrop-blur-sm",
            isSelected
              ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-primary/40 shadow-lg shadow-primary/30 scale-110"
              : isActive
              ? "bg-gradient-to-br from-card/60 to-card/80 border-border hover:border-primary/40 text-foreground hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary-soft/20"
              : "bg-gradient-to-br from-muted/50 to-muted/70 border-border/50 text-muted-foreground opacity-60 hover:opacity-80"
          )}
          style={{ left: x, top: y }}
        >
          {String(i).padStart(2, "0")}
        </button>
      );
    }
    
    // Add center indicator
    const centerDot = (
      <div 
        key="center"
        className={cn(
          "absolute w-3 h-3 rounded-full transition-all duration-300",
          "transform -translate-x-1/2 -translate-y-1/2",
          isActive 
            ? "bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/30" 
            : "bg-muted-foreground/40"
        )}
        style={{ left: center, top: center }}
      />
    );
    
    // Add selected value indicator line
    const selectedLine = currentValue >= 0 ? (
      <div
        key="line"
        className={cn(
          "absolute w-0.5 transition-all duration-500 ease-in-out transform -translate-x-1/2",
          isActive && currentValue >= 0
            ? "bg-gradient-to-t from-primary to-primary-glow shadow-sm shadow-primary/30"
            : "bg-muted-foreground/40 opacity-40"
        )}
        style={{
          left: center,
          top: center - 15,
          height: radius - 25,
          transformOrigin: `50% ${15 + radius - 25}px`,
          transform: `translateX(-50%) rotate(${(currentValue / count) * 360 - 90}deg)`,
        }}
      />
    ) : null;

    return (
      <div className="relative w-56 h-56 my-6">
        <div className={cn(
          "absolute inset-4 border-2 rounded-full transition-all duration-500",
          isActive 
            ? "border-primary/30 shadow-lg shadow-primary/20" 
            : "border-dashed border-border/50"
        )}></div>
        {selectedLine}
        {centerDot}
        {items}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="flex items-center text-sm font-medium text-foreground">
        <Clock className="h-4 w-4 mr-2 text-primary" />
        {label}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full h-14 text-lg justify-center font-mono transition-all duration-300",
              "glass-card hover:scale-[1.02] active:scale-[0.98]",
              "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              value && "text-foreground",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="h-5 w-5 mr-3 text-primary" />
            {value || "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-card-intense border-border shadow-2xl">
          <div className="p-6">
            {/* Time Display and Controls */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                {/* Hour Section */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => incrementValue("hour")}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  >
                    <ChevronUp className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => setActiveMode("hour")}
                    className={cn(
                      "px-4 py-3 text-3xl font-mono rounded-xl transition-all duration-300 min-w-[80px]",
                      activeMode === "hour"
                        ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "bg-gradient-to-br from-card/60 to-card/80 text-foreground hover:scale-105 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary-soft/20"
                    )}
                  >
                    {String(isNaN(hour) ? "00" : hour).padStart(2, "0")}
                  </button>
                  <button
                    onClick={() => decrementValue("hour")}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  >
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </button>
                </div>
                
                {/* Separator */}
                <div className="text-3xl font-mono text-muted-foreground animate-pulse">:</div>
                
                {/* Minute Section */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => incrementValue("minute")}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  >
                    <ChevronUp className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => setActiveMode("minute")}
                    className={cn(
                      "px-4 py-3 text-3xl font-mono rounded-xl transition-all duration-300 min-w-[80px]",
                      activeMode === "minute"
                        ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "bg-gradient-to-br from-card/60 to-card/80 text-foreground hover:scale-105 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary-soft/20"
                    )}
                  >
                    {String(isNaN(minute) ? "00" : minute).padStart(2, "0")}
                  </button>
                  <button
                    onClick={() => decrementValue("minute")}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  >
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
              
              {/* Mode Indicator */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => setActiveMode("hour")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    activeMode === "hour"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Select Hour
                </button>
                <button
                  onClick={() => setActiveMode("minute")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    activeMode === "minute"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Select Minute
                </button>
              </div>
            </div>
            
            {/* Dial */}
            <div className="flex justify-center">
              {activeMode === "hour" && renderDial(24, isNaN(hour) ? -1 : hour, (h) => handleTimeChange("hour", h), 1, "hour")}
              {activeMode === "minute" && renderDial(60, isNaN(minute) ? -1 : minute, (m) => handleTimeChange("minute", m), 5, "minute")}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 glass-card hover:bg-muted/30 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}