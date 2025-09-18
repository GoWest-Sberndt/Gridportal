import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Calendar,
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Newspaper,
  GraduationCap,
  Search as SearchIcon,
} from "lucide-react";

// Import new modular components
import LeftSidebar from "./sidebar/LeftSidebar";
import RightSidebar from "./sidebar/RightSidebar";
import DashboardContent from "./dashboard/DashboardContent";
import Settings from "./Settings";
import CalendarWorkspace from "./CalendarWorkspace";
import PITSystem from "./PITSystem";
import NewsWorkspace from "./news/NewsWorkspace";
import { supabaseHelpers } from "@/lib/supabase";

// Lazy load heavy components
const LoanOfficerLeaderboard = React.lazy(() => import("./LoanOfficerLeaderboard"));
const Learning = React.lazy(() => import("./Learning"));
const LendersWorkspace = React.lazy(() => import("./LendersWorkspace"));
const SparkPointsWorkspace = React.lazy(() => import("./SparkPointsWorkspace"));
const CompensationWorkspace = React.lazy(() => import("./CompensationWorkspace"));
const FIREFundWorkspace = React.lazy(() => import("./FIREFundWorkspace"));
const ProfileWorkspace = React.lazy(() => import("./profile/ProfileWorkspace"));

// Define tabs array
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "pipeline", label: "Pipeline", icon: TrendingUp },
  { id: "lenders", label: "Lenders", icon: Users },
  { id: "processing", label: "Processing", icon: FileText },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "news", label: "News", icon: Newspaper },
];

export default function SafireDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [metricsView, setMetricsView] = useState("monthly");
  
  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendarWorkspace, setShowCalendarWorkspace] = useState(false);
  const [showPITSystem, setShowPITSystem] = useState(false);
  const [showCompensationWorkspace, setShowCompensationWorkspace] = useState(false);
  const [showFIREFundWorkspace, setShowFIREFundWorkspace] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);

  // Data State
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [selectedUmbsRate, setSelectedUmbsRate] = useState("5.5");
  const [activeAds, setActiveAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(null);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [pitNotificationCount, setPitNotificationCount] = useState(0);

  // Mock events and tasks data for calendar widget
  const mockEvents = [
    {
      id: "1",
      title: "Client Meeting - Johnson Family",
      date: new Date(2024, 0, 15, 10, 0),
      time: "10:00 AM",
      duration: "1 hour",
      type: "meeting" as const,
      location: "Conference Room A",
      attendees: ["John Johnson", "Sarah Johnson"],
      description: "Discuss mortgage options for new home purchase",
      priority: "high" as const,
      status: "upcoming" as const,
    },
    {
      id: "2",
      title: "Loan Application Review",
      date: new Date(2024, 0, 16, 14, 30),
      time: "2:30 PM",
      duration: "45 minutes",
      type: "appointment" as const,
      description: "Review and process loan application #LA-2024-001",
      priority: "medium" as const,
      status: "upcoming" as const,
    },
  ];

  const mockTasks = [
    {
      id: "t1",
      title: "Review credit report for Johnson application",
      dueDate: new Date(2024, 0, 15),
      priority: "high" as const,
      status: "pending" as const,
      category: "loan" as const,
      assignedTo: "You",
      description: "Analyze credit history and identify any potential issues",
    },
    {
      id: "t2",
      title: "Prepare closing documents",
      dueDate: new Date(2024, 0, 16),
      priority: "medium" as const,
      status: "in-progress" as const,
      category: "admin" as const,
      assignedTo: "You",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Load PIT notification count
  const loadPITNotifications = async () => {
    if (!user?.id) return;
    try {
      const count = await supabaseHelpers.getPITNotificationCount(user.id);
      setPitNotificationCount(count);
    } catch (error) {
      console.error("Error loading PIT notifications:", error);
      setPitNotificationCount(0);
    }
  };

  // Load data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Set default data first
        const defaultMarketData = {
          umbs30yr55: { value: "100.01", change: "+0.03", isPositive: true },
          umbs30yr5: { value: "99.85", change: "-0.02", isPositive: false },
          umbs30yr6: { value: "100.25", change: "+0.05", isPositive: true },
          treasury10yr: { value: "4.236", change: "-0.003", isPositive: false },
        };

        const defaultNewsData = {
          title: "Welcome to Safire Dashboard",
          content: "Stay updated with the latest mortgage industry news and market data.",
          publishedAt: new Date().toISOString(),
        };

        setMarketData(defaultMarketData);
        setNewsData(defaultNewsData);

        // Load PIT notifications
        await loadPITNotifications();

        // Load user profile data if user is available
        if (user?.id) {
          try {
            const [profileResult, performanceResult, adsResult, videoResult] = 
              await Promise.allSettled([
                supabaseHelpers.getUserById(user.id),
                supabaseHelpers.getUserPerformance(user.id),
                supabaseHelpers.getActiveAds(),
                supabaseHelpers.getFeaturedVideos(),
              ]);

            if (profileResult.status === "fulfilled" && profileResult.value) {
              setUserProfile(profileResult.value);
            }

            if (performanceResult.status === "fulfilled" && performanceResult.value) {
              setUserPerformance(performanceResult.value[0] || null);
            }

            if (adsResult.status === "fulfilled" && adsResult.value?.length > 0) {
              setActiveAds(adsResult.value);
            }

            if (videoResult.status === "fulfilled" && videoResult.value?.length > 0) {
              setFeaturedVideos(videoResult.value);
              setFeaturedVideoUrl(videoResult.value[0].url);
              setCurrentVideoIndex(0);
            }
          } catch (dataError) {
            console.warn("Error loading user profile data:", dataError);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Set up interval to refresh PIT notifications
  useEffect(() => {
    if (!user?.id) return;

    loadPITNotifications();
    const notificationInterval = setInterval(loadPITNotifications, 30000);

    return () => clearInterval(notificationInterval);
  }, [user?.id]);

  // Set up intervals for ad rotation
  useEffect(() => {
    let adRotationInterval: NodeJS.Timeout;
    let videoRotationInterval: NodeJS.Timeout;

    if (activeAds.length > 1) {
      adRotationInterval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % activeAds.length);
      }, 10000);
    }

    if (featuredVideos.length > 1) {
      videoRotationInterval = setInterval(() => {
        setCurrentVideoIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % featuredVideos.length;
          setFeaturedVideoUrl(featuredVideos[nextIndex].url);
          return nextIndex;
        });
      }, 60000);
    }

    return () => {
      if (adRotationInterval) clearInterval(adRotationInterval);
      if (videoRotationInterval) clearInterval(videoRotationInterval);
    };
  }, [activeAds.length, featuredVideos.length]);

  return (
    <div className="w-full h-screen bg-[#032F60] relative overflow-hidden">
      {/* Bottom gradient mask */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#032F60] to-transparent z-30 pointer-events-none"></div>
      
      <div className="flex h-full relative">
        {/* Main Content Area */}
        <div
          className={`flex-1 h-full relative z-20 transition-all duration-300 ease-in-out ${
            leftSidebarOpen && rightSidebarOpen
              ? leftSidebarCollapsed
                ? "ml-[60px] mr-[320px]"
                : "ml-[200px] mr-[320px]"
              : leftSidebarOpen
                ? leftSidebarCollapsed
                  ? "ml-[60px]"
                  : "ml-[200px]"
                : rightSidebarOpen
                  ? "mr-[320px]"
                  : ""
          }`}
        >
          <div
            className={`h-full bg-white flex flex-col overflow-hidden transition-all duration-300 ${
              rightSidebarOpen ? "rounded-[40px]" : "rounded-l-[40px]"
            }`}
          >
            {/* Header - Hidden in pipeline view */}
            {activeTab !== "pipeline" && (
              <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between rounded-t-[30px] bg-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLeftSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Menu size={20} className="text-[#032F60]" />
                  </button>
                  <h1 className="text-xl lg:text-2xl font-extrabold text-[#1d2430] capitalize">
                    {tabs.find((tab) => tab.id === activeTab)?.label || "Dashboard"}
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-full">
                    <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2 w-full max-w-lg">
                      <input
                        type="text"
                        placeholder=""
                        className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-600 flex-1"
                      />
                      <button className="ml-3 p-1 hover:bg-gray-300 rounded-full transition-colors">
                        <SearchIcon size={16} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setRightSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Calendar size={20} className="text-[#032F60]" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-gray-200">
              <div className={`${activeTab === "pipeline" ? "h-full" : "p-4 lg:p-6 pb-8"}`}>
                {showSettings ? (
                  <Settings onBack={() => setShowSettings(false)} />
                ) : showCalendarWorkspace ? (
                  <CalendarWorkspace
                    onBack={() => {
                      setShowCalendarWorkspace(false);
                      setCalendarSelectedDate(null);
                    }}
                    initialSelectedDate={calendarSelectedDate || undefined}
                  />
                ) : showCompensationWorkspace ? (
                  <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading compensation workspace...</div></div>}>
                    <CompensationWorkspace onBack={() => setShowCompensationWorkspace(false)} />
                  </Suspense>
                ) : showFIREFundWorkspace ? (
                  <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading FIRE fund workspace...</div></div>}>
                    <FIREFundWorkspace onBack={() => setShowFIREFundWorkspace(false)} />
                  </Suspense>
                ) : (
                  <>
                    {activeTab === "dashboard" && (
                      loading ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading dashboard...</p>
                          </div>
                        </div>
                      ) : (
                        <DashboardContent
                          user={user}
                          userProfile={userProfile}
                          userPerformance={userPerformance}
                          marketData={marketData}
                          newsData={newsData}
                          selectedUmbsRate={selectedUmbsRate}
                          setSelectedUmbsRate={setSelectedUmbsRate}
                          metricsView={metricsView}
                          setMetricsView={setMetricsView}
                          setActiveTab={setActiveTab}
                          activeAds={activeAds}
                          currentAdIndex={currentAdIndex}
                          featuredVideoUrl={featuredVideoUrl}
                          featuredVideos={featuredVideos}
                          currentVideoIndex={currentVideoIndex}
                          setShowCompensationWorkspace={setShowCompensationWorkspace}
                          setShowFIREFundWorkspace={setShowFIREFundWorkspace}
                        />
                      )
                    )}

                    {activeTab === "pipeline" && (
                      <div className="w-full h-full">
                        <iframe
                          src="https://safire.myarive.com"
                          className="w-full h-full border-0"
                          title="Safire Pipeline"
                          allow="fullscreen"
                        />
                      </div>
                    )}

                    {activeTab === "lenders" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading lenders...</div></div>}>
                        <LendersWorkspace />
                      </Suspense>
                    )}

                    {activeTab === "processing" && (
                      <div className="text-center py-20 text-gray-500">
                        Processing view coming soon...
                      </div>
                    )}

                    {activeTab === "statistics" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading statistics...</div></div>}>
                        <LoanOfficerLeaderboard />
                      </Suspense>
                    )}

                    {activeTab === "learning" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading learning content...</div></div>}>
                        <Learning />
                      </Suspense>
                    )}

                    {activeTab === "news" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading news...</div></div>}>
                        <NewsWorkspace />
                      </Suspense>
                    )}

                    {activeTab === "spark-points" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading Spark Points...</div></div>}>
                        <SparkPointsWorkspace />
                      </Suspense>
                    )}

                    {activeTab === "profile" && (
                      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-gray-500">Loading profile...</div></div>}>
                        <ProfileWorkspace />
                      </Suspense>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Sidebar Collapse Button */}
        <button
          onClick={() => {
            if (leftSidebarOpen) {
              setLeftSidebarCollapsed(!leftSidebarCollapsed);
            } else {
              setLeftSidebarOpen(true);
            }
          }}
          className={`fixed top-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
            leftSidebarOpen
              ? leftSidebarCollapsed
                ? "left-[60px]"
                : "left-[200px]"
              : "left-0"
          }`}
        >
          <div className="relative">
            <div className="w-4 h-24 bg-[#032F60] rounded-r-full shadow-lg border-r border-t border-b border-[#032F60] flex items-center justify-center hover:bg-[#1a4a73] transition-colors">
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </button>

        {/* Left Sidebar */}
        <LeftSidebar
          leftSidebarOpen={leftSidebarOpen}
          leftSidebarCollapsed={leftSidebarCollapsed}
          setLeftSidebarOpen={setLeftSidebarOpen}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pitNotificationCount={pitNotificationCount}
          setShowPITSystem={setShowPITSystem}
          setPitNotificationCount={setPitNotificationCount}
        />

        {/* Right Sidebar Collapse Button */}
        <button
          onClick={() => {
            if (rightSidebarOpen) {
              setRightSidebarOpen(false);
            } else {
              setRightSidebarOpen(true);
            }
          }}
          className={`fixed top-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
            rightSidebarOpen ? "right-[320px]" : "right-0"
          }`}
        >
          <div className="relative">
            <div className="w-4 h-24 bg-[#032F60] rounded-l-full shadow-lg border-l border-t border-b border-[#032F60] flex items-center justify-center hover:bg-[#1a4a73] transition-colors">
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </button>

        {/* Right Sidebar */}
        <RightSidebar
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          setActiveTab={setActiveTab}
          setShowSettings={setShowSettings}
          handleLogout={handleLogout}
          mockEvents={mockEvents}
          mockTasks={mockTasks}
          setCalendarSelectedDate={setCalendarSelectedDate}
          setShowCalendarWorkspace={setShowCalendarWorkspace}
        />
      </div>

      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}

      {/* PIT System Modal */}
      {showPITSystem && (
        <PITSystem
          onClose={() => {
            setShowPITSystem(false);
            loadPITNotifications();
          }}
        />
      )}
    </div>
  );
}