import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings as SettingsIcon,
  LogOut,
  X,
} from "lucide-react";
import CalendarWidget from "../CalendarWidget";
import UpcomingTasksWidget from "../UpcomingTasksWidget";
import BasicCalculatorWidget from "../BasicCalculatorWidget";
import MortgageCalculatorWidget from "../MortgageCalculatorWidget";
import OutsideToolsWidget from "../OutsideToolsWidget";

interface RightSidebarProps {
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setShowSettings: (show: boolean) => void;
  handleLogout: () => void;
  mockEvents: any[];
  mockTasks: any[];
  setCalendarSelectedDate: (date: Date | null) => void;
  setShowCalendarWorkspace: (show: boolean) => void;
}

export default function RightSidebar({
  rightSidebarOpen,
  setRightSidebarOpen,
  setActiveTab,
  setShowSettings,
  handleLogout,
  mockEvents,
  mockTasks,
  setCalendarSelectedDate,
  setShowCalendarWorkspace,
}: RightSidebarProps) {
  const { user } = useAuth();

  return (
    <div
      className={`fixed inset-y-0 right-0 z-10 w-[320px] bg-[#032F60] transform transition-transform duration-300 ease-in-out ${
        rightSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ paddingBottom: "20px" }}
    >
      <div className="h-full flex flex-col">
        {/* Profile Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => setActiveTab("profile")}
          >
            <div className="w-11 h-11 bg-white/10 rounded-full overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <div className="text-[#e7f0ff] text-sm font-extrabold">
                {user?.name || "User"}
              </div>
              <div className="text-[#e7f0ff]/90 text-xs">
                {user?.role || "User"}
              </div>
              <div className="text-[#e7f0ff]/70 text-xs">
                {user?.internalRole && (
                  <span className="capitalize">
                    {user.internalRole} Access
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded hover:bg-white/10"
              onClick={() => setShowSettings(true)}
            >
              <SettingsIcon size={16} className="text-[#e7f0ff]/75" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-white/10"
              title="Logout"
            >
              <LogOut size={16} className="text-[#e7f0ff]/75" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/10"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {/* Quick Access Widget - Always visible */}
          <div className="mb-4">
            <OutsideToolsWidget />
          </div>
          
          <Tabs defaultValue="calendar" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
              <TabsTrigger value="calendar" className="text-xs font-bold">
                Calendar & Tasks
              </TabsTrigger>
              <TabsTrigger
                value="calculators"
                className="text-xs font-bold"
              >
                Calculators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="flex-1 mt-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1 pb-6">
                  <CalendarWidget
                    onOpenWorkspace={(selectedDate) => {
                      setCalendarSelectedDate(selectedDate || null);
                      setShowCalendarWorkspace(true);
                    }}
                    events={mockEvents}
                    tasks={mockTasks}
                  />
                  <UpcomingTasksWidget />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="calculators"
              className="flex-1 mt-0 min-h-0"
            >
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1 pb-6">
                  <BasicCalculatorWidget />
                  <MortgageCalculatorWidget />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}