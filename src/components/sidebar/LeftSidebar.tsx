import React from "react";
import { X, MessageSquare } from "lucide-react";

interface LeftSidebarProps {
  leftSidebarOpen: boolean;
  leftSidebarCollapsed: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
  }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pitNotificationCount: number;
  setShowPITSystem: (show: boolean) => void;
  setPitNotificationCount: (count: number) => void;
}

export default function LeftSidebar({
  leftSidebarOpen,
  leftSidebarCollapsed,
  setLeftSidebarOpen,
  tabs,
  activeTab,
  setActiveTab,
  pitNotificationCount,
  setShowPITSystem,
  setPitNotificationCount,
}: LeftSidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-10 bg-[#032F60] transform transition-all duration-300 ease-in-out ${
        leftSidebarOpen
          ? leftSidebarCollapsed
            ? "translate-x-0 w-[60px]"
            : "translate-x-0 w-[200px]"
          : "-translate-x-full w-[200px]"
      }`}
      style={{ paddingBottom: "20px" }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div
          className={`p-4 border-b border-white/10 flex items-center ${
            leftSidebarCollapsed ? "justify-center" : "justify-center"
          }`}
        >
          {leftSidebarCollapsed ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/safire-logo-collapsed.png"
                alt="Safire Home Lending"
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 flex justify-center">
                <img
                  src="https://storage.googleapis.com/tempo-image-previews/github%7C198421472-1755189815189-Untitled%20design%20(15).png"
                  alt="Safire Home Lending"
                  className="object-contain h-10 max-w-[200px] w-auto"
                />
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-white/10 flex-shrink-0"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          className={`flex-1 p-4 space-y-2 ${
            leftSidebarCollapsed ? "flex flex-col items-center" : ""
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className="relative">
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 1024) {
                      setLeftSidebarOpen(false);
                    }
                  }}
                  className={`${leftSidebarCollapsed ? "w-10 h-10" : "w-full"} p-3 flex items-center ${leftSidebarCollapsed ? "justify-center" : "gap-3"} text-left transition-all duration-300 relative z-10 ${
                    activeTab === tab.id
                      ? "text-[#032F60]"
                      : "text-[#e8f0fb] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {!leftSidebarCollapsed && (
                    <span className="font-semibold">{tab.label}</span>
                  )}
                </button>
                {/* Active tab indicator – flares into workspace */}
                {activeTab === tab.id && (
                  <div className="absolute inset-y-0 left-0 pointer-events-none z-0">
                    <div
                      className={[
                        "relative h-full bg-gray-200 shadow-sm transition-[width,border-radius] duration-300",
                        leftSidebarCollapsed
                          ? "w-[80px] rounded-l-[15px]"
                          : "w-[240px] rounded-l-[30px]",
                      ].join(" ")}
                    >
                      {/* the flare: a circle whose diameter equals row height */}
                      <span
                        className="
                          absolute top-1/2 right-0
                          -translate-y-1/2 translate-x-1/2
                          h-full aspect-square rounded-full
                          bg-gray-200
                          shadow-[0_1px_8px_rgba(0,0,0,0.06)]
                        "
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Button - PIT System */}
        <div
          className={`p-4 sticky ${
            leftSidebarCollapsed ? "flex justify-center" : ""
          }`}
        >
          <div className="relative">
            <button
              onClick={() => {
                setShowPITSystem(true);
                // Reset notification count when PIT system is opened
                setPitNotificationCount(0);
              }}
              className={`${leftSidebarCollapsed ? "w-10 h-10" : "w-full"} p-3 bg-yellow-400 hover:bg-yellow-500 rounded-xl border border-yellow-300 flex items-center ${leftSidebarCollapsed ? "justify-center" : "gap-2"} text-[#032F60] transition-colors`}
            >
              <MessageSquare size={16} />
              {!leftSidebarCollapsed && (
                <span className="text-sm font-bold">
                  Submit PIT request
                </span>
              )}
            </button>
            {/* Notification Badge */}
            {pitNotificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-xs font-bold text-white">
                  {pitNotificationCount > 9 ? "9+" : pitNotificationCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}