"use client";

import { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CyberDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  disabled?: boolean;
}

export function CyberDatePicker({ value, onChange, placeholder = "Select date", minDate, disabled = false }: CyberDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    const formatted = format(date, "yyyy-MM-dd");
    onChange(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Generate days in month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get index of the first day of the week (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = monthStart.getDay();
  // Adjust so Monday is 0 or keep Sunday as 0
  const emptyDays = Array.from({ length: startDayOfWeek });

  const selectedDate = value ? new Date(value) : null;
  const parsedMinDate = minDate ? new Date(minDate) : null;

  const isDateDisabled = (date: Date) => {
    if (parsedMinDate) {
      // Set hours/minutes/seconds to 0 for accurate comparison
      const dCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const minCompare = new Date(parsedMinDate.getFullYear(), parsedMinDate.getMonth(), parsedMinDate.getDate());
      return dCompare < minCompare;
    }
    return false;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-950/85 border border-cyan-500/25 hover:border-cyan-400 text-left text-white font-mono text-sm py-5 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.02)] focus:ring-1 focus:ring-cyan-400/45"
      >
        <span className={value ? "text-slate-100" : "text-slate-500"}>
          {value ? format(new Date(value), "dd MMM yyyy") : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-cyan-400/60" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-[290px] bg-slate-950/95 border border-cyan-500/30 backdrop-blur-xl rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-md transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-md transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day, i) => (
              <span key={i} className="font-mono text-[9px] text-cyan-500/50 font-bold uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty days padding */}
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Actual Month Days */}
            {days.map((day, i) => {
              const disabledDate = isDateDisabled(day);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabledDate}
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-8 rounded-lg font-mono text-xs flex items-center justify-center transition-all duration-200
                    ${disabledDate 
                      ? "text-slate-700 cursor-not-allowed opacity-30" 
                      : selected
                      ? "bg-cyan-500 text-black font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : isToday
                      ? "border border-cyan-500/50 text-cyan-400 font-bold"
                      : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300"
                    }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
