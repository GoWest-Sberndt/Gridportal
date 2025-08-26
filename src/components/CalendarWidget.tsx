import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: "meeting" | "call" | "appointment" | "deadline" | "reminder";
  location?: string;
  attendees?: string[];
  description?: string;
  priority: "high" | "medium" | "low";
  status: "upcoming" | "completed" | "cancelled";
}

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  category: "loan" | "client" | "admin" | "follow-up";
  assignedTo?: string;
  description?: string;
}

interface CalendarWidgetProps {
  className?: string;
  onOpenWorkspace?: (selectedDate?: Date) => void;
  events?: Event[];
  tasks?: Task[];
}

export default function CalendarWidget({
  className = "",
  onOpenWorkspace,
  events = [],
  tasks = [],
}: CalendarWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => event.date.toDateString() === date.toDateString(),
    );
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => task.dueDate.toDateString() === date.toDateString(),
    );
  };

  return (
    <div
      className={`bg-[#0b2a48] rounded-xl p-4 cursor-pointer hover:bg-[#0e2f52] transition-colors ${className}`}
      onClick={() => onOpenWorkspace && onOpenWorkspace(date)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#e7f0ff] font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-1 text-[#e7f0ff]">
          <button
            className="p-1 hover:bg-white/10 rounded"
            onClick={(e) => {
              e.stopPropagation();
              navigateMonth("prev");
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded"
            onClick={(e) => {
              e.stopPropagation();
              navigateMonth("next");
            }}
          >
            <ChevronRight size={16} />
          </button>
          {onOpenWorkspace && (
            <button
              className="p-1 hover:bg-white/10 rounded ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWorkspace();
              }}
              title="Open Calendar Workspace"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="[&_.rdp]:bg-transparent [&_.rdp-months]:flex [&_.rdp-months]:flex-col [&_.rdp-month]:space-y-2 [&_.rdp-table]:w-full [&_.rdp-head_row]:grid [&_.rdp-head_row]:grid-cols-7 [&_.rdp-head_row]:gap-1 [&_.rdp-head_cell]:text-[#9db9dc] [&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:font-medium [&_.rdp-head_cell]:p-1 [&_.rdp-head_cell]:text-center [&_.rdp-tbody]:space-y-1 [&_.rdp-row]:grid [&_.rdp-row]:grid-cols-7 [&_.rdp-row]:gap-1 [&_.rdp-cell]:relative [&_.rdp-button]:aspect-square [&_.rdp-button]:bg-[#0e2f52] [&_.rdp-button]:rounded-lg [&_.rdp-button]:flex [&_.rdp-button]:items-center [&_.rdp-button]:justify-center [&_.rdp-button]:text-xs [&_.rdp-button]:text-[#cfe0ff] [&_.rdp-button]:hover:bg-[#1a4a73] [&_.rdp-button]:transition-colors [&_.rdp-day_selected]:ring-2 [&_.rdp-day_selected]:ring-[#cfe0ff] [&_.rdp-day_today]:ring-2 [&_.rdp-day_today]:ring-[#f6d44b] [&_.rdp-day_outside]:opacity-50 [&_.rdp-day_has_events]:bg-[#1a4a73] [&_.rdp-day_has_events]:ring-1 [&_.rdp-day_has_events]:ring-[#4ade80] [&_.rdp-day_has_tasks]:bg-[#1a4a73] [&_.rdp-day_has_tasks]:ring-1 [&_.rdp-day_has_tasks]:ring-[#fbbf24] [&_.rdp-day_has_both]:bg-[#1a4a73] [&_.rdp-day_has_both]:ring-2 [&_.rdp-day_has_both]:ring-[#4ade80] [&_.rdp-day_has_both]:shadow-[0_0_0_3px_#fbbf24]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full"
          classNames={{
            caption: "hidden",
            nav: "hidden",
          }}
          onDayClick={(clickedDate) => {
            setDate(clickedDate);
            if (onOpenWorkspace) {
              onOpenWorkspace(clickedDate);
            }
          }}
          modifiers={{
            hasEvents: (date) => getEventsForDate(date).length > 0,
            hasTasks: (date) => getTasksForDate(date).length > 0,
            hasBoth: (date) =>
              getEventsForDate(date).length > 0 &&
              getTasksForDate(date).length > 0,
          }}
          modifiersClassNames={{
            hasEvents: "rdp-day_has_events",
            hasTasks: "rdp-day_has_tasks",
            hasBoth: "rdp-day_has_both",
          }}
        />
      </div>
    </div>
  );
}
