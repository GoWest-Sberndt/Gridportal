import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Bell,
  Edit,
  Trash2,
  Filter,
  Search,
  X,
  Check,
  AlertCircle,
  Video,
  Phone,
  User,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarWorkspaceProps {
  onBack?: () => void;
  initialSelectedDate?: Date;
}

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

export default function CalendarWorkspace({
  onBack,
  initialSelectedDate,
}: CalendarWorkspaceProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialSelectedDate || new Date(),
  );
  const [currentMonth, setCurrentMonth] = useState(
    initialSelectedDate || new Date(),
  );

  // Update selected date and current month when initialSelectedDate changes
  React.useEffect(() => {
    if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
      setCurrentMonth(initialSelectedDate);
    }
  }, [initialSelectedDate]);
  const [activeView, setActiveView] = useState<"month" | "week" | "day">(
    "month",
  );
  const [activeTab, setActiveTab] = useState("calendar");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Mock events data
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Client Meeting - Johnson Family",
      date: new Date(2024, 0, 15, 10, 0),
      time: "10:00 AM",
      duration: "1 hour",
      type: "meeting",
      location: "Conference Room A",
      attendees: ["John Johnson", "Sarah Johnson"],
      description: "Discuss mortgage options for new home purchase",
      priority: "high",
      status: "upcoming",
    },
    {
      id: "2",
      title: "Loan Application Review",
      date: new Date(2024, 0, 15, 14, 30),
      time: "2:30 PM",
      duration: "45 minutes",
      type: "appointment",
      description: "Review and process loan application #LA-2024-001",
      priority: "medium",
      status: "upcoming",
    },
    {
      id: "3",
      title: "Team Standup",
      date: new Date(2024, 0, 16, 9, 0),
      time: "9:00 AM",
      duration: "30 minutes",
      type: "meeting",
      location: "Virtual - Zoom",
      attendees: ["Team Members"],
      priority: "medium",
      status: "upcoming",
    },
    {
      id: "4",
      title: "Follow-up Call - Martinez",
      date: new Date(2024, 0, 17, 11, 0),
      time: "11:00 AM",
      duration: "20 minutes",
      type: "call",
      description: "Follow up on loan status and next steps",
      priority: "high",
      status: "upcoming",
    },
    {
      id: "5",
      title: "Document Deadline - Smith Loan",
      date: new Date(2024, 0, 18, 17, 0),
      time: "5:00 PM",
      duration: "Deadline",
      type: "deadline",
      description: "Final documents due for Smith loan application",
      priority: "high",
      status: "upcoming",
    },
  ]);

  // Mock tasks data
  const [tasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Review credit report for Johnson application",
      dueDate: new Date(2024, 0, 15),
      priority: "high",
      status: "pending",
      category: "loan",
      assignedTo: "You",
      description: "Analyze credit history and identify any potential issues",
    },
    {
      id: "t2",
      title: "Prepare closing documents",
      dueDate: new Date(2024, 0, 16),
      priority: "medium",
      status: "in-progress",
      category: "admin",
      assignedTo: "You",
    },
    {
      id: "t3",
      title: "Call back potential client - Williams",
      dueDate: new Date(2024, 0, 17),
      priority: "medium",
      status: "pending",
      category: "follow-up",
      assignedTo: "You",
      description: "Interested in refinancing, needs rate quote",
    },
    {
      id: "t4",
      title: "Update client portal with loan status",
      dueDate: new Date(2024, 0, 18),
      priority: "low",
      status: "completed",
      category: "client",
      assignedTo: "You",
    },
  ]);

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

  const getEventTypeIcon = (type: Event["type"]) => {
    switch (type) {
      case "meeting":
        return <Users size={14} />;
      case "call":
        return <Phone size={14} />;
      case "appointment":
        return <User size={14} />;
      case "deadline":
        return <AlertCircle size={14} />;
      case "reminder":
        return <Bell size={14} />;
      default:
        return <CalendarIcon size={14} />;
    }
  };

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "call":
        return "bg-green-100 text-green-800 border-green-200";
      case "appointment":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "deadline":
        return "bg-red-100 text-red-800 border-red-200";
      case "reminder":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchTerm === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || task.category === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-[#1d2430]">
                Calendar
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your schedule, events, and tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search events and tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button size="sm" className="bg-[#032F60] hover:bg-[#1a4a73]">
              <Plus size={16} className="mr-1" />
              New Event
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="calendar" className="text-xs font-bold">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs font-bold">
                Events
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs font-bold">
                Tasks
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "meeting" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("meeting")}
            >
              Meetings
            </Button>
            <Button
              variant={filterType === "call" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("call")}
            >
              Calls
            </Button>
            <Button
              variant={filterType === "deadline" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("deadline")}
            >
              Deadlines
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Calendar View */}
          <TabsContent value="calendar" className="h-full mt-0">
            <div className="flex h-full">
              {/* Calendar */}
              <div className="w-80 border-r border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("prev")}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("next")}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                    modifiers={{
                      hasEvents: (date) => getEventsForDate(date).length > 0,
                      hasTasks: (date) => getTasksForDate(date).length > 0,
                    }}
                    modifiersStyles={{
                      hasEvents: {
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                      },
                      hasTasks: {
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                      },
                    }}
                  />
                </div>

                {/* Mini Event List */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Today's Schedule
                  </h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {getEventsForDate(new Date()).map((event) => (
                        <div
                          key={event.id}
                          className="p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getEventTypeIcon(event.type)}
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {event.title}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.time} • {event.duration}
                          </div>
                        </div>
                      ))}
                      {getEventsForDate(new Date()).length === 0 && (
                        <div className="text-sm text-gray-500 italic text-center py-4">
                          No events today
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Selected Date Details */}
              <div className="flex-1 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{getEventsForDate(selectedDate).length} events</span>
                    <span>{getTasksForDate(selectedDate).length} tasks</span>
                  </div>
                </div>

                {/* Events for Selected Date */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CalendarIcon size={16} />
                      Events
                    </h4>
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event) => (
                        <Card
                          key={event.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1 rounded ${getEventTypeColor(event.type)}`}
                                >
                                  {getEventTypeIcon(event.type)}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-800">
                                    {event.title}
                                  </h5>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock size={12} />
                                    <span>
                                      {event.time} • {event.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`}
                                ></div>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(event.status)}
                                >
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPin size={12} />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {getEventsForDate(selectedDate).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon
                            size={48}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p>No events scheduled for this date</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tasks for Selected Date */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Check size={16} />
                      Tasks Due
                    </h4>
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).map((task) => (
                        <Card
                          key={task.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    task.status === "completed"
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {task.status === "completed" && (
                                    <Check size={10} className="text-white" />
                                  )}
                                </div>
                                <div>
                                  <h5
                                    className={`font-semibold ${
                                      task.status === "completed"
                                        ? "text-gray-500 line-through"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {task.title}
                                  </h5>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Badge variant="outline" size="sm">
                                      {task.category}
                                    </Badge>
                                    <span>•</span>
                                    <span>{task.assignedTo}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                                ></div>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(task.status)}
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 ml-7 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {getTasksForDate(selectedDate).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Check
                            size={48}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p>No tasks due on this date</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Events List View */}
          <TabsContent value="events" className="h-full mt-0">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}
                          >
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <CalendarIcon size={12} />
                              <span>{event.date.toLocaleDateString()}</span>
                              <Clock size={12} />
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`}
                        ></div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin size={12} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Users size={12} />
                          <span>{event.attendees.length} attendees</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={getStatusColor(event.status)}
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {event.duration}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tasks List View */}
          <TabsContent value="tasks" className="h-full mt-0">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              task.status === "completed"
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {task.status === "completed" && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <CardTitle
                              className={`text-base ${
                                task.status === "completed"
                                  ? "text-gray-500 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <CalendarIcon size={12} />
                              <span>
                                Due: {task.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
                        ></div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" size="sm">
                          {task.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getStatusColor(task.status)}
                        >
                          {task.status}
                        </Badge>
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <User size={12} />
                          <span>Assigned to: {task.assignedTo}</span>
                        </div>
                      )}
                      {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <Check size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEventModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEventModal(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${getEventTypeColor(selectedEvent.type)}`}
                >
                  {getEventTypeIcon(selectedEvent.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {selectedEvent.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedEvent.status)}
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon size={14} className="text-gray-500" />
                  <span>{selectedEvent.date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-gray-500" />
                  <span>
                    {selectedEvent.time} • {selectedEvent.duration}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.attendees &&
                  selectedEvent.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-gray-500" />
                      <span>{selectedEvent.attendees.join(", ")}</span>
                    </div>
                  )}
              </div>

              {selectedEvent.description && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h5>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Priority:
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(selectedEvent.priority)}`}
                  ></div>
                  <span className="text-sm capitalize">
                    {selectedEvent.priority}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
