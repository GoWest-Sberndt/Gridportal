import React from "react";

interface Task {
  id: string;
  day: string;
  date: string;
  title: string;
  description: string;
  time: string;
}

interface UpcomingTasksWidgetProps {
  tasks?: Task[];
  className?: string;
}

const defaultTasks: Task[] = [
  {
    id: "1",
    day: "TUE",
    date: "28",
    title: "Client Meeting",
    description: "Meeting with potential borrower",
    time: "10:00 AM",
  },
  {
    id: "2",
    day: "WED",
    date: "29",
    title: "Rate Review",
    description: "Weekly rate analysis meeting",
    time: "2:00 PM",
  },
  {
    id: "3",
    day: "THU",
    date: "30",
    title: "Document Review",
    description: "Review loan documentation",
    time: "11:00 AM",
  },
];

export default function UpcomingTasksWidget({
  tasks = defaultTasks,
  className = "",
}: UpcomingTasksWidgetProps) {
  return (
    <div className={`bg-[#0b2a48] rounded-xl p-4 h-full ${className}`}>
      <h3 className="text-[#e7f0ff] font-extrabold mb-4">Upcoming</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#0e2f52] rounded-xl p-3 flex items-center gap-3 hover:bg-[#1a4a73] transition-colors cursor-pointer"
          >
            <div className="bg-[#08243f] rounded-lg p-2 text-center min-w-[50px]">
              <div className="text-[#d9e7ff] text-xs font-extrabold">
                {task.day}
              </div>
              <div className="text-[#d9e7ff] text-xs font-extrabold">
                {task.date}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[#d9e7ff] text-sm font-extrabold">
                {task.title}
              </div>
              <div className="text-[#d9e7ff]/90 text-xs">
                {task.description}
              </div>
            </div>
            <div className="text-[#d9e7ff]/90 text-xs">{task.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
