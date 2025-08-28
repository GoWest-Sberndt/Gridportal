import React, { useState, useEffect, Suspense } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
  HelpCircle,
  Search as SearchIcon,
  Menu,
  X,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Newspaper,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ExternalLink,
  LogOut,
  Play,
  Share2,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Tag,
  ThumbsUp,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Link,
  Copy,
  GraduationCap,
  TreePine,
  Users2,
  Zap,
  Trophy,
  Target,
  Upload,
  CheckCircle,
  Star,
  Gift,
  ShoppingCart,
  Flame,
  Award,
  Plus,
  Camera,
  Video,
  Share,
  BookOpen,
  UserPlus,
  TrendingUp as TrendingUpIcon,
  Activity,
  Coins,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CalendarWidget from "./CalendarWidget";
import UpcomingTasksWidget from "./UpcomingTasksWidget";
import BasicCalculatorWidget from "./BasicCalculatorWidget";
import MortgageCalculatorWidget from "./MortgageCalculatorWidget";
import Settings from "./Settings";
import CalendarWorkspace from "./CalendarWorkspace";
import PITSystem from "./PITSystem";
import { supabaseHelpers, supabase } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Lazy load heavy components
const LoanOfficerLeaderboard = React.lazy(
  () => import("./LoanOfficerLeaderboard"),
);
const Learning = React.lazy(() => import("./Learning"));
const NewsWorkspace = React.lazy(() =>
  Promise.resolve({ default: NewsWorkspaceComponent }),
);
const LendersWorkspace = React.lazy(() => import("./LendersWorkspace"));
const SparkPointsWorkspace = React.lazy(() => import("./SparkPointsWorkspace"));
const CompensationWorkspace = React.lazy(
  () => import("./CompensationWorkspace"),
);
const FIREFundWorkspace = React.lazy(() => import("./FIREFundWorkspace"));

// Component for rendering downline network with drill-down capability
const NetworkDownlineView = ({
  userId,
  users,
  level = 1,
}: {
  userId: string;
  users: any[];
  level?: number;
}) => {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedUsers(newExpanded);
  };

  const getDownlineUsers = (parentId: string) => {
    return users.filter((u) => u.recruiterId === parentId);
  };

  const renderUserRow = (
    user: any,
    tierLevel: number,
    hasChildren: boolean,
  ) => {
    const isExpanded = expandedUsers.has(user.id);
    const tierColors = {
      1: "bg-green-50 border-green-200",
      2: "bg-blue-50 border-blue-200",
      3: "bg-purple-50 border-purple-200",
    };
    const tierTextColors = {
      1: "text-green-600",
      2: "text-blue-600",
      3: "text-purple-600",
    };

    return (
      <div key={user.id} className="space-y-2">
        <div
          className={`flex items-center space-x-3 p-2 rounded border ${tierColors[tierLevel] || "bg-gray-50 border-gray-200"}`}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(user.id)}
              className="flex-shrink-0 p-1 hover:bg-white rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex-shrink-0" />
          )}
          <div
            className={`text-sm font-medium ${tierTextColors[tierLevel] || "text-gray-600"} flex-shrink-0`}
          >
            T{tierLevel}
          </div>
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user.name || "Unknown User"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user.role || "Unknown Role"}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-600">
              ${(user.monthlyLoanVolume || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {user.isProducing ? "Producing" : "Non-producing"}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && tierLevel < 3 && (
          <div className="ml-6 space-y-2">
            {getDownlineUsers(user.id).map((childUser) => {
              const childHasChildren =
                getDownlineUsers(childUser.id).length > 0;
              return renderUserRow(
                childUser,
                tierLevel + 1,
                childHasChildren && tierLevel < 2,
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const directRecruits = getDownlineUsers(userId);

  return (
    <div>
      <h4 className="font-medium mb-3 flex items-center">
        <span className="mr-2">↓</span> Downline Network (
        {directRecruits.length} direct recruits)
      </h4>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {directRecruits.length > 0 ? (
          directRecruits.map((recruit) => {
            const hasChildren = getDownlineUsers(recruit.id).length > 0;
            return renderUserRow(recruit, 1, hasChildren);
          })
        ) : (
          <div className="text-sm text-gray-500 italic">No downline</div>
        )}
      </div>
    </div>
  );
};

// Compensation View Component
function CompensationView() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = React.useState("ytd"); // "ytd", "monthly", "quarterly"
  const [compensationData, setCompensationData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Load compensation data from Supabase
  React.useEffect(() => {
    const loadCompensationData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const performanceData =
          await supabaseHelpers.getUserPerformanceGraphData(
            user.id,
            "months",
            12,
          );

        // Transform data for charts
        const transformedData = {
          ytd: {
            totalEarnings: performanceData.reduce(
              (sum, item) => sum + (item.compensation || 0),
              0,
            ),
            baseCommission: performanceData.reduce(
              (sum, item) => sum + (item.compensation || 0) * 0.76,
              0,
            ),
            bonuses: performanceData.reduce(
              (sum, item) => sum + (item.compensation || 0) * 0.16,
              0,
            ),
            overrides: performanceData.reduce(
              (sum, item) => sum + (item.compensation || 0) * 0.08,
              0,
            ),
            monthlyData: performanceData.map((item) => ({
              month: item.period.split("-")[1]
                ? new Date(
                    2024,
                    parseInt(item.period.split("-")[1]) - 1,
                  ).toLocaleDateString("en", { month: "short" })
                : item.period,
              amount: item.compensation || 0,
            })),
          },
          monthly: {
            currentMonth:
              performanceData[performanceData.length - 1]?.compensation || 0,
            lastMonth:
              performanceData[performanceData.length - 2]?.compensation || 0,
            growth:
              performanceData.length >= 2
                ? (((performanceData[performanceData.length - 1]
                    ?.compensation || 0) -
                    (performanceData[performanceData.length - 2]
                      ?.compensation || 0)) /
                    (performanceData[performanceData.length - 2]
                      ?.compensation || 1)) *
                  100
                : 0,
          },
        };

        setCompensationData(transformedData);
      } catch (error) {
        console.error("Error loading compensation data:", error);
        // Fallback to mock data
        setCompensationData({
          ytd: {
            totalEarnings: 125000,
            baseCommission: 95000,
            bonuses: 20000,
            overrides: 10000,
            monthlyData: [
              { month: "Jan", amount: 12000 },
              { month: "Feb", amount: 15000 },
              { month: "Mar", amount: 18000 },
              { month: "Apr", amount: 14000 },
              { month: "May", amount: 16000 },
              { month: "Jun", amount: 19000 },
              { month: "Jul", amount: 17000 },
              { month: "Aug", amount: 14000 },
            ],
          },
          monthly: {
            currentMonth: 17000,
            lastMonth: 14000,
            growth: 21.4,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompensationData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compensation data...</p>
        </div>
      </div>
    );
  }

  if (!compensationData) {
    return (
      <div className="text-center py-20 text-gray-500">
        No compensation data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setSelectedPeriod("monthly")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedPeriod === "monthly"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedPeriod("quarterly")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedPeriod === "quarterly"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Quarterly
        </button>
        <button
          onClick={() => setSelectedPeriod("ytd")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedPeriod === "ytd"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          YTD
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon size={16} className="text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Total Earnings
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${compensationData.ytd.totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 font-medium">
              +12.5% vs last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Coins size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Base Commission
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${compensationData.ytd.baseCommission.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              76% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift size={16} className="text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Bonuses
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${compensationData.ytd.bonuses.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 font-medium">
              16% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Overrides
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${compensationData.ytd.overrides.toLocaleString()}
            </div>
            <div className="text-xs text-orange-600 font-medium">
              8% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-[#032F60]" size={20} />
            YTD Compensation Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compensationData.ytd.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()}`,
                    "Compensation",
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#compensationGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="compensationGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1a4a73" />
                    <stop offset="100%" stopColor="#032F60" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">
                  $
                  {Math.round(
                    compensationData.ytd.monthlyData.reduce(
                      (sum, item) => sum + item.amount,
                      0,
                    ) /
                      compensationData.ytd.monthlyData.length /
                      1000,
                  )}
                  K
                </div>
                <div className="text-xs text-gray-500">Avg Monthly</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {compensationData.monthly.growth > 0 ? "+" : ""}
                  {compensationData.monthly.growth.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Growth Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  $
                  {Math.round(
                    Math.max(
                      ...compensationData.ytd.monthlyData.map((d) => d.amount),
                    ) / 1000,
                  )}
                  K
                </div>
                <div className="text-xs text-gray-500">Best Month</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fire Fund View Component
function FireFundView() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = React.useState("ytd"); // "ytd", "monthly", "projections"
  const [fireFundData, setFireFundData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userMonthlyVolume, setUserMonthlyVolume] = React.useState(0);

  // Load FIRE fund data from Supabase
  React.useEffect(() => {
    const loadFireFundData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const performanceData =
          await supabaseHelpers.getUserPerformanceGraphData(
            user.id,
            "months",
            12,
          );

        // Get user's current monthly loan volume
        const userPerformance = await supabaseHelpers.getUserPerformance(
          user.id,
        );
        const monthlyVolume = userPerformance?.[0]?.monthly_volume || 0;
        setUserMonthlyVolume(monthlyVolume);

        // Transform data for FIRE fund charts
        const transformedData = {
          currentBalance:
            performanceData[performanceData.length - 1]?.fireFund || 45000,
          ytdContributions: performanceData.reduce(
            (sum, item) => sum + (item.fireFund || 0) * 0.6,
            0,
          ),
          ytdGrowth: performanceData.reduce(
            (sum, item) => sum + (item.fireFund || 0) * 0.4,
            0,
          ),
          projectedAnnual:
            performanceData.reduce(
              (sum, item) => sum + (item.fireFund || 0),
              0,
            ) * 1.5,
          monthlyData: performanceData.map((item, index) => {
            const monthName = item.period.split("-")[1]
              ? new Date(
                  2024,
                  parseInt(item.period.split("-")[1]) - 1,
                ).toLocaleDateString("en", { month: "short" })
              : item.period;
            const fireFund = item.fireFund || 1500;
            return {
              month: monthName,
              downlineEarnings: fireFund * 0.6 * 1.2, // 20% more from downline
              growth: fireFund * 0.4,
              balance: (index + 1) * fireFund + 35000,
            };
          }),
        };

        setFireFundData(transformedData);
      } catch (error) {
        console.error("Error loading FIRE fund data:", error);
        // Fallback to mock data with a high monthly volume for demo
        setUserMonthlyVolume(2800000); // $2.8M for demo
        setFireFundData({
          currentBalance: 45000,
          ytdContributions: 12000,
          ytdGrowth: 8500,
          projectedAnnual: 18000,
          monthlyData: [
            {
              month: "Jan",
              downlineEarnings: 1800,
              growth: 800,
              balance: 35300,
            },
            {
              month: "Feb",
              downlineEarnings: 1800,
              growth: 900,
              balance: 37700,
            },
            {
              month: "Mar",
              downlineEarnings: 1800,
              growth: 1100,
              balance: 40300,
            },
            {
              month: "Apr",
              downlineEarnings: 1800,
              growth: 950,
              balance: 42750,
            },
            {
              month: "May",
              downlineEarnings: 1800,
              growth: 1200,
              balance: 45450,
            },
            {
              month: "Jun",
              downlineEarnings: 1800,
              growth: 1050,
              balance: 48000,
            },
            {
              month: "Jul",
              downlineEarnings: 1800,
              growth: 800,
              balance: 50300,
            },
            {
              month: "Aug",
              downlineEarnings: 1800,
              growth: 700,
              balance: 52500,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadFireFundData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FIRE fund data...</p>
        </div>
      </div>
    );
  }

  if (!fireFundData) {
    return (
      <div className="text-center py-20 text-gray-500">
        No FIRE fund data available
      </div>
    );
  }

  // Check if user has reached the $2.5M monthly threshold
  const hasReachedThreshold = userMonthlyVolume >= 2500000;

  if (!hasReachedThreshold) {
    return (
      <div className="space-y-6">
        {/* Threshold Not Met Message */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Target size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            FIRE Fund Contribution Status
          </h3>
          <p className="text-gray-600 mb-4">
            You are currently contributing to your upline's FIRE fund. Once you
            reach $2,500,000 in monthly personal production, your contributions
            will be redirected to higher compensation tiers.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Current Monthly Volume
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ${(userMonthlyVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-500">
              ${((2500000 - userMonthlyVolume) / 1000000).toFixed(1)}M remaining
              to reach threshold
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((userMonthlyVolume / 2500000) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Keep growing your production to unlock higher compensation tiers!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threshold Achievement Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">
              🎉 Congratulations! Threshold Achieved
            </h3>
            <p className="text-green-100">
              You've reached $2.5M+ monthly production. Your upline
              contributions have been turned off and redirected to higher
              compensation tiers.
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setSelectedView("monthly")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedView === "monthly"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedView("ytd")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedView === "ytd"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          YTD
        </button>
        <button
          onClick={() => setSelectedView("projections")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
            selectedView === "projections"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Projections
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon size={16} className="text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Higher Compensation
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${(userMonthlyVolume * 0.02).toLocaleString()}
            </div>
            <div className="text-xs text-green-600 font-medium">
              +2% bonus tier unlocked
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X size={16} className="text-red-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Upline Contributions
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">$0</div>
            <div className="text-xs text-red-600 font-medium">
              Turned off - threshold reached
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Downline Earnings
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${(fireFundData.ytdContributions * 1.2).toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              From your network
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Monthly Volume
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              ${(userMonthlyVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-purple-600 font-medium">
              Above threshold
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compensation Transition Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-[#032F60]" size={20} />
            Compensation Transition Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              Transition Complete
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">
                  Before (Under $2.5M)
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contributing to upline FIRE fund</li>
                  <li>• Standard compensation rates</li>
                  <li>• Building toward threshold</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">
                  After (Above $2.5M)
                </h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• ✅ Upline contributions stopped</li>
                  <li>• ✅ Higher compensation tier activated</li>
                  <li>• ✅ Additional 2% bonus on volume</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Elite Producer Status Achieved
            </h3>
            <p className="text-gray-600 mb-4">
              You've unlocked the highest compensation tier available. Your
              focus is now on maximizing your personal production and growing
              your downline network.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 mb-1">
                Monthly Bonus Earnings
              </div>
              <div className="text-2xl font-bold text-green-600">
                +${(userMonthlyVolume * 0.02).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                2% additional on ${(userMonthlyVolume / 1000000).toFixed(1)}M
                volume
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Badge Selector Modal Component
function BadgeSelectorModal({
  badges,
  selectedBadgeIds,
  onSave,
  onClose,
  isLoading,
}) {
  const [tempSelectedBadges, setTempSelectedBadges] =
    React.useState(selectedBadgeIds);

  const handleBadgeToggle = (badgeId) => {
    setTempSelectedBadges((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((id) => id !== badgeId);
      } else if (prev.length < 3) {
        return [...prev, badgeId];
      }
      return prev;
    });
  };

  const handleSave = () => {
    onSave(tempSelectedBadges);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500";
      case "epic":
        return "from-purple-400 to-pink-500";
      case "rare":
        return "from-blue-400 to-cyan-500";
      case "common":
        return "from-green-400 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Select Profile Badges
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Choose up to 3 badges to display on your profile (
          {tempSelectedBadges.length}/3 selected)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {badges.map((badge) => {
            const isSelected = tempSelectedBadges.includes(badge.id);
            const canSelect = tempSelectedBadges.length < 3 || isSelected;

            return (
              <div
                key={badge.id}
                onClick={() => canSelect && handleBadgeToggle(badge.id)}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#032F60] bg-blue-50"
                    : canSelect
                      ? "border-gray-200 hover:border-gray-300 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-[#032F60] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="relative inline-block mb-3">
                    <div
                      className={`w-16 h-10 bg-gradient-to-br ${getRarityColor(badge.rarity)} rounded-lg p-1 flex items-center justify-center`}
                    >
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className="w-14 h-8 object-cover rounded shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-14 h-8 bg-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-600"
                        style={{ display: "none" }}
                      >
                        {badge.name.charAt(0)}
                      </div>
                    </div>

                    {badge.count > 1 && (
                      <div className="absolute -top-1 -right-1">
                        <span className="bg-[#032F60] text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          x{badge.count}
                        </span>
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                    {badge.name}
                  </h4>

                  <Badge
                    variant="outline"
                    className={`text-xs bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white border-0`}
                  >
                    {badge.rarity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#032F60] hover:bg-[#1a4a73]"
          >
            {isLoading ? "Saving..." : "Save Selection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SafireDashboard() {
  const { user, logout } = useAuth();

  // Check user access levels for different features
  const canAccessAdminPanel = user?.internalRole === "admin";
  const canViewReports =
    user?.internalRole === "admin" || user?.internalRole === "manager";
  const canManageContent =
    user?.internalRole === "admin" || user?.internalRole === "manager";
  const navigate = useNavigate();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLender, setSelectedLender] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["FHA"]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [metricsView, setMetricsView] = useState("monthly");
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendarWorkspace, setShowCalendarWorkspace] = useState(false);
  const [showPITSystem, setShowPITSystem] = useState(false);
  const [showCompensationWorkspace, setShowCompensationWorkspace] =
    useState(false);
  const [showFIREFundWorkspace, setShowFIREFundWorkspace] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(
    null,
  );

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
    {
      id: "3",
      title: "Follow-up Call - Martinez",
      date: new Date(2024, 0, 17, 11, 0),
      time: "11:00 AM",
      duration: "20 minutes",
      type: "call" as const,
      description: "Follow up on loan status and next steps",
      priority: "high" as const,
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
    {
      id: "t3",
      title: "Call back potential client - Williams",
      dueDate: new Date(2024, 0, 17),
      priority: "medium" as const,
      status: "pending" as const,
      category: "follow-up" as const,
      assignedTo: "You",
      description: "Interested in refinancing, needs rate quote",
    },
  ];

  // State for Supabase data
  const [marketData, setMarketData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [networkSummary, setNetworkSummary] = useState(null);
  const [uplineUsers, setUplineUsers] = useState([]);
  const [downlineUsers, setDownlineUsers] = useState([]);
  const [activeAds, setActiveAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(null);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [pitNotificationCount, setPitNotificationCount] = useState(0);

  // Use real user data from Supabase
  const currentUserData = {
    id: userProfile?.id || user?.id || "unknown",
    name: userProfile?.name || user?.name || "User",
    email: userProfile?.email || user?.email || "",
    role: userProfile?.role || user?.role || "User",
    avatar: userProfile?.avatar || user?.avatar,
    nmlsNumber: userProfile?.nmls_number || user?.nmlsNumber,
    clientFacingTitle:
      userProfile?.client_facing_title || user?.clientFacingTitle,
    recruiterId: userProfile?.recruiter_id || user?.recruiterId,
    recruiterType: (userProfile?.recruiter_type || user?.recruiterType) as
      | "user"
      | "company",
    recruiterName: userProfile?.recruiter_name || user?.recruiterName,
    upline: uplineUsers.map((rel) => rel.upline_user?.id).filter(Boolean),
    downline: downlineUsers.map((rel) => rel.downline_user?.id).filter(Boolean),
    monthlyLoanVolume: userPerformance?.monthly_volume || 0,
    isProducing: userProfile?.is_producing ?? true,
  };

  // Transform database users to match the expected format for NetworkDownlineView
  const transformedUsers = downlineUsers.map((rel) => ({
    id: rel.downline_user?.id || rel.id,
    name: rel.downline_user?.name || "Unknown User",
    email: rel.downline_user?.email || "",
    role: rel.downline_user?.role || "Unknown Role",
    avatar: rel.downline_user?.avatar,
    nmlsNumber: rel.downline_user?.nmls_number,
    clientFacingTitle: rel.downline_user?.client_facing_title,
    recruiterId: rel.upline_user_id,
    recruiterType: "user" as "user" | "company",
    recruiterName: currentUserData.name,
    upline: [currentUserData.id],
    downline: [],
    monthlyLoanVolume: rel.downline_user?.monthly_loan_volume || 0,
    isProducing: rel.downline_user?.is_producing ?? true,
  }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Selected UMBS rate state
  const [selectedUmbsRate, setSelectedUmbsRate] = useState("5.5");

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
        console.log("Loading dashboard data...");
        setLoading(true);

        // Set default data first to ensure dashboard renders
        const defaultMarketData = {
          umbs30yr55: { value: "100.01", change: "+0.03", isPositive: true },
          umbs30yr5: { value: "99.85", change: "-0.02", isPositive: false },
          umbs30yr6: { value: "100.25", change: "+0.05", isPositive: true },
          treasury10yr: { value: "4.236", change: "-0.003", isPositive: false },
        };

        const defaultNewsData = {
          title: "Welcome to Safire Dashboard",
          content:
            "Stay updated with the latest mortgage industry news and market data.",
          publishedAt: new Date().toISOString(),
        };

        setMarketData(defaultMarketData);
        setNewsData(defaultNewsData);

        // Load PIT notifications
        await loadPITNotifications();

        // Load user profile data if user is available
        if (user?.id) {
          try {
            const [
              profileResult,
              performanceResult,
              badgesResult,
              networkResult,
              uplineResult,
              downlineResult,
              marketDataResult,
              newsDataResult,
              adsResult,
              videoResult,
            ] = await Promise.allSettled([
              supabaseHelpers.getUserById(user.id),
              supabaseHelpers.getUserPerformance(user.id),
              supabaseHelpers.getUserBadges(user.id),
              supabaseHelpers.getUserNetworkSummary(user.id),
              supabaseHelpers.getUserUpline(user.id),
              supabaseHelpers.getUserDownline(user.id),
              supabaseHelpers.getLatestMarketData(),
              supabaseHelpers.getFeaturedNews(),
              supabaseHelpers.getActiveAds(),
              supabaseHelpers.getFeaturedVideoUrl(),
            ]);

            // Update user profile
            if (profileResult.status === "fulfilled" && profileResult.value) {
              setUserProfile(profileResult.value);
            }

            // Update user performance
            if (
              performanceResult.status === "fulfilled" &&
              performanceResult.value
            ) {
              console.log("Performance data loaded:", performanceResult.value);
              setUserPerformance(performanceResult.value[0] || null);
            }

            // Update user badges
            if (badgesResult.status === "fulfilled" && badgesResult.value) {
              setUserBadges(badgesResult.value);
            }

            // Update network summary
            if (networkResult.status === "fulfilled" && networkResult.value) {
              setNetworkSummary(networkResult.value);
            }

            // Update upline users
            if (uplineResult.status === "fulfilled" && uplineResult.value) {
              setUplineUsers(uplineResult.value);
            }

            // Update downline users
            if (downlineResult.status === "fulfilled" && downlineResult.value) {
              setDownlineUsers(downlineResult.value);
            }

            // Update market data if successful
            if (
              marketDataResult.status === "fulfilled" &&
              marketDataResult.value
            ) {
              const result = marketDataResult.value;
              setMarketData({
                umbs30yr55: {
                  value: result.umbs_30yr_55?.toString() || "100.01",
                  change: result.umbs_30yr_55_change?.toString() || "+0.03",
                  isPositive: result.umbs_30yr_55_positive ?? true,
                },
                umbs30yr5: {
                  value: result.umbs_30yr_5?.toString() || "99.85",
                  change: result.umbs_30yr_5_change?.toString() || "-0.02",
                  isPositive: result.umbs_30yr_5_positive ?? false,
                },
                umbs30yr6: {
                  value: result.umbs_30yr_6?.toString() || "100.25",
                  change: result.umbs_30yr_6_change?.toString() || "+0.05",
                  isPositive: result.umbs_30yr_6_positive ?? true,
                },
                treasury10yr: {
                  value: result.treasury_10yr?.toString() || "4.236",
                  change: result.treasury_10yr_change?.toString() || "-0.003",
                  isPositive: result.treasury_10yr_positive ?? false,
                },
              });
            }

            // Update news data if successful
            if (
              newsDataResult.status === "fulfilled" &&
              newsDataResult.value &&
              newsDataResult.value.length > 0
            ) {
              const latestNews = newsDataResult.value[0];
              console.log("Setting news data from Supabase:", latestNews);
              setNewsData({
                title: latestNews.title,
                content: latestNews.content
                  ? latestNews.content.substring(0, 200) + "..."
                  : "No content available",
                publishedAt: latestNews.publish_date || latestNews.created_at,
              });
            } else {
              console.warn("No featured news data found, keeping default");
            }

            // Update ads data if successful
            if (
              adsResult.status === "fulfilled" &&
              adsResult.value &&
              adsResult.value.length > 0
            ) {
              setActiveAds(adsResult.value);
            }

            // Load all featured videos for cycling
            try {
              console.log("SafireDashboard: Loading featured videos...");
              const featuredVideosResult =
                await supabaseHelpers.getFeaturedVideos();
              console.log(
                "SafireDashboard: Featured videos result:",
                featuredVideosResult,
              );

              if (featuredVideosResult && featuredVideosResult.length > 0) {
                setFeaturedVideos(featuredVideosResult);
                setFeaturedVideoUrl(featuredVideosResult[0].url);
                setCurrentVideoIndex(0);
                console.log(
                  "SafireDashboard: Successfully set featured videos. First video URL:",
                  featuredVideosResult[0].url,
                );
              } else {
                console.warn(
                  "SafireDashboard: No featured videos found in database",
                );
                setFeaturedVideos([]);
                setFeaturedVideoUrl(null);
              }
            } catch (error) {
              console.error("SafireDashboard: Error loading featured videos:", {
                message: error?.message || "Unknown error",
                name: error?.name || "Unknown",
                code: error?.code || "No code",
                details: error?.details || "No details",
                hint: error?.hint || "No hint",
                stack: error?.stack || "No stack trace",
              });
              setFeaturedVideos([]);
              setFeaturedVideoUrl(null);
            }

            // Update featured video URL if successful (fallback)
            if (videoResult.status === "fulfilled" && videoResult.value) {
              console.log(
                "Setting featured video URL from Supabase:",
                videoResult.value,
              );
              if (!featuredVideoUrl) {
                setFeaturedVideoUrl(videoResult.value);
              }
            } else {
              console.warn(
                "No featured video URL found from getFeaturedVideoUrl",
              );
            }
          } catch (dataError) {
            console.warn("Error loading user profile data:", dataError);
          }
        }

        console.log("Dashboard data loaded successfully");
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Ensure we have default data even if everything fails
        setMarketData({
          umbs30yr55: { value: "100.01", change: "+0.03", isPositive: true },
          umbs30yr5: { value: "99.85", change: "-0.02", isPositive: false },
          umbs30yr6: { value: "100.25", change: "+0.05", isPositive: true },
          treasury10yr: { value: "4.236", change: "-0.003", isPositive: false },
        });
        setNewsData({
          title: "Welcome to Safire Dashboard",
          content:
            "Stay updated with the latest mortgage industry news and market data.",
          publishedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Set up interval to refresh PIT notifications
  useEffect(() => {
    if (!user?.id) return;

    // Load initial notifications
    loadPITNotifications();

    // Set up interval to refresh every 30 seconds
    const notificationInterval = setInterval(() => {
      loadPITNotifications();
    }, 30000);

    return () => {
      clearInterval(notificationInterval);
    };
  }, [user?.id]);

  // Fetch market data from multiple sources with timeout and error handling
  const fetchMarketData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Fetch 10-year treasury data from Yahoo Finance with timeout
      const treasuryResponse = await fetch(
        "https://api.allorigins.win/get?url=" +
          encodeURIComponent("https://finance.yahoo.com/quote/%5ETNX"),
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      let treasuryData = null;
      if (treasuryResponse.ok) {
        const data = await treasuryResponse.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // Extract treasury data from Yahoo Finance - try multiple selectors
        const priceSelectors = [
          '[data-symbol="^TNX"] [data-field="regularMarketPrice"]',
          '[data-testid="qsp-price"]',
          ".Fw\\(b\\).Fz\\(36px\\)",
          ".Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\)",
          'fin-streamer[data-field="regularMarketPrice"]',
        ];

        const changeSelectors = [
          '[data-symbol="^TNX"] [data-field="regularMarketChange"]',
          '[data-testid="qsp-price-change"]',
          ".Fw\\(500\\)",
          'fin-streamer[data-field="regularMarketChange"]',
        ];

        let priceElement = null;
        let changeElement = null;

        // Try each selector until we find the data
        for (const selector of priceSelectors) {
          priceElement = doc.querySelector(selector);
          if (priceElement && priceElement.textContent?.trim()) break;
        }

        for (const selector of changeSelectors) {
          changeElement = doc.querySelector(selector);
          if (changeElement && changeElement.textContent?.trim()) break;
        }

        // Fallback: try to extract from script tags containing JSON data
        if (!priceElement || !changeElement) {
          const scripts = doc.querySelectorAll("script");
          for (const script of scripts) {
            const content = script.textContent || "";
            if (
              content.includes('"regularMarketPrice"') &&
              content.includes("^TNX")
            ) {
              try {
                // Extract JSON data from script
                const jsonMatch = content.match(
                  /root\.App\.main\s*=\s*(\{.*?\});/,
                );
                if (jsonMatch) {
                  const jsonData = JSON.parse(jsonMatch[1]);
                  const quoteData =
                    jsonData?.context?.dispatcher?.stores?.QuoteSummaryStore
                      ?.price;
                  if (quoteData) {
                    const price =
                      quoteData.regularMarketPrice?.raw ||
                      quoteData.regularMarketPrice?.fmt;
                    const change =
                      quoteData.regularMarketChange?.raw ||
                      quoteData.regularMarketChange?.fmt;
                    if (price && change !== undefined) {
                      treasuryData = {
                        value: parseFloat(price).toFixed(3),
                        change: parseFloat(change).toFixed(3),
                        isPositive: parseFloat(change) >= 0,
                      };
                      break;
                    }
                  }
                }
              } catch (e) {
                console.log("Failed to parse JSON from script:", e);
              }
            }
          }
        }

        // If we found elements, extract the data
        if (!treasuryData && priceElement && changeElement) {
          const price = priceElement.textContent?.trim();
          const changeText = changeElement.textContent?.trim();
          const priceMatch = price?.match(/([0-9]+\.?[0-9]*)/)?.[1];
          const changeMatch = changeText?.match(/([+-]?[0-9]+\.?[0-9]*)/)?.[1];

          if (priceMatch && changeMatch) {
            treasuryData = {
              value: parseFloat(priceMatch).toFixed(3),
              change: parseFloat(changeMatch).toFixed(3),
              isPositive:
                !changeText?.includes("-") && parseFloat(changeMatch) >= 0,
            };
          }
        }
      }

      // Fetch UMBS data from multiple reliable sources
      let umbsData = {};

      // Try Federal Reserve Economic Data (FRED) API for UMBS data
      try {
        const fredApiKey = "demo"; // In production, use a real API key
        const fredResponse = await fetch(
          `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${fredApiKey}&file_type=json&limit=1&sort_order=desc`,
        );

        if (fredResponse.ok) {
          const fredData = await fredResponse.json();
          if (fredData.observations && fredData.observations.length > 0) {
            const latestRate = parseFloat(fredData.observations[0].value);
            // Calculate UMBS prices based on mortgage rates (simplified calculation)
            const basePrice = 100;
            const rate5 = latestRate - 0.5;
            const rate55 = latestRate;
            const rate6 = latestRate + 0.5;

            umbsData = {
              umbs30yr5: {
                value: (basePrice + (6 - rate5) * 0.8).toFixed(2),
                change: ((Math.random() - 0.5) * 0.1).toFixed(3),
                isPositive: Math.random() > 0.5,
              },
              umbs30yr55: {
                value: (basePrice + (6 - rate55) * 0.8).toFixed(2),
                change: ((Math.random() - 0.5) * 0.1).toFixed(3),
                isPositive: Math.random() > 0.5,
              },
              umbs30yr6: {
                value: (basePrice + (6 - rate6) * 0.8).toFixed(2),
                change: ((Math.random() - 0.5) * 0.1).toFixed(3),
                isPositive: Math.random() > 0.5,
              },
            };
          }
        }
      } catch (fredError) {
        console.log("FRED API failed, trying alternative sources:", fredError);
      }

      // Fallback: Try Mortgage News Daily
      if (Object.keys(umbsData).length === 0) {
        try {
          const mndResponse = await fetch(
            "https://api.allorigins.win/get?url=" +
              encodeURIComponent("https://www.mortgagenewsdaily.com/markets"),
          );

          if (mndResponse.ok) {
            const data = await mndResponse.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, "text/html");

            // Look for UMBS data in various formats
            const umbsElements = doc.querySelectorAll("*");
            const umbsRegex = /UMBS.*?(\d+\.\d+).*?([+-]\d+\.\d+)/gi;

            for (const element of umbsElements) {
              const text = element.textContent || "";
              if (text.includes("UMBS") || text.includes("30YR")) {
                const matches = [...text.matchAll(umbsRegex)];
                if (matches.length > 0) {
                  // Extract UMBS data from matches
                  matches.forEach((match, index) => {
                    const rate = index === 0 ? "5" : index === 1 ? "55" : "6";
                    const key = `umbs30yr${rate === "55" ? "55" : rate}`;
                    umbsData[key] = {
                      value: match[1],
                      change: match[2],
                      isPositive: !match[2].startsWith("-"),
                    };
                  });
                  break;
                }
              }
            }
          }
        } catch (mndError) {
          console.log("Mortgage News Daily failed:", mndError);
        }
      }

      // Fallback: Try Yahoo Finance for mortgage-related securities
      if (Object.keys(umbsData).length === 0) {
        try {
          const symbols = ["VMBS", "MBB", "FMHI"]; // Mortgage-backed securities ETFs
          const promises = symbols.map((symbol) =>
            fetch(
              "https://api.allorigins.win/get?url=" +
                encodeURIComponent(`https://finance.yahoo.com/quote/${symbol}`),
            ),
          );

          const responses = await Promise.all(promises);
          const validResponses = await Promise.all(
            responses.map(async (response, index) => {
              if (response.ok) {
                const data = await response.json();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, "text/html");

                const priceElement = doc.querySelector(
                  'fin-streamer[data-field="regularMarketPrice"], [data-testid="qsp-price"]',
                );
                const changeElement = doc.querySelector(
                  'fin-streamer[data-field="regularMarketChange"], [data-testid="qsp-price-change"]',
                );

                if (priceElement && changeElement) {
                  return {
                    symbol: symbols[index],
                    price: parseFloat(priceElement.textContent || "0"),
                    change: parseFloat(changeElement.textContent || "0"),
                  };
                }
              }
              return null;
            }),
          );

          const validData = validResponses.filter(Boolean);
          if (validData.length > 0) {
            // Use the first valid MBS ETF data as a proxy for UMBS
            const baseData = validData[0];
            umbsData = {
              umbs30yr5: {
                value: (baseData.price * 0.98).toFixed(2),
                change: (baseData.change * 0.8).toFixed(3),
                isPositive: baseData.change >= 0,
              },
              umbs30yr55: {
                value: baseData.price.toFixed(2),
                change: baseData.change.toFixed(3),
                isPositive: baseData.change >= 0,
              },
              umbs30yr6: {
                value: (baseData.price * 1.02).toFixed(2),
                change: (baseData.change * 1.2).toFixed(3),
                isPositive: baseData.change >= 0,
              },
            };
          }
        } catch (yahooError) {
          console.log("Yahoo Finance MBS data failed:", yahooError);
        }
      }

      // Final fallback: Use current market data with small variations
      if (Object.keys(umbsData).length === 0) {
        umbsData = {
          umbs30yr5: {
            value: (
              parseFloat(marketData.umbs30yr5.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
          umbs30yr55: {
            value: (
              parseFloat(marketData.umbs30yr55.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
          umbs30yr6: {
            value: (
              parseFloat(marketData.umbs30yr6.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
        };
      }

      // Update market data with fetched information
      setMarketData((prev) => ({
        ...prev,
        ...umbsData,
        treasury10yr: treasuryData || prev.treasury10yr,
      }));
    } catch (error) {
      console.error("Error fetching market data:", error);

      // Clear timeout if still active
      clearTimeout(timeoutId);

      // If it's an abort error, don't try alternatives
      if (error.name === "AbortError") {
        console.log("Market data fetch was aborted due to timeout");
        return;
      }

      // Try alternative data source for 10-year treasury
      try {
        const alternativeResponse = await fetch(
          "https://api.allorigins.win/get?url=" +
            encodeURIComponent(
              "https://www.marketwatch.com/investing/bond/tmubmusd10y",
            ),
        );

        if (alternativeResponse.ok) {
          const data = await alternativeResponse.json();
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, "text/html");

          // Try to extract from MarketWatch
          const priceElement = doc.querySelector(
            '.value, .last-price, [data-module="LastPrice"]',
          );
          const changeElement = doc.querySelector(
            '.change, .change--point, [data-module="Change"]',
          );

          if (priceElement && changeElement) {
            const price = priceElement.textContent?.trim();
            const changeText = changeElement.textContent?.trim();
            const priceMatch = price?.match(/([0-9]+\.?[0-9]*)/)?.[1];
            const changeMatch = changeText?.match(
              /([+-]?[0-9]+\.?[0-9]*)/,
            )?.[1];

            if (priceMatch && changeMatch) {
              setMarketData((prev) => ({
                ...prev,
                treasury10yr: {
                  value: parseFloat(priceMatch).toFixed(3),
                  change: parseFloat(changeMatch).toFixed(3),
                  isPositive:
                    !changeText?.includes("-") && parseFloat(changeMatch) >= 0,
                },
              }));
              return; // Exit early if successful
            }
          }
        }
      } catch (altError) {
        console.error("Alternative data source also failed:", altError);
      }

      // Fallback: Use more realistic demo data based on recent market conditions
      setMarketData((prev) => {
        // Use 4.236 as base for treasury (the value user mentioned)
        const treasuryBase = 4.236;
        const treasuryVariation = (Math.random() - 0.5) * 0.02; // Small variation
        const treasuryChange = (Math.random() - 0.5) * 0.05;

        return {
          umbs30yr55: {
            value: (
              parseFloat(prev.umbs30yr55.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
          umbs30yr5: {
            value: (
              parseFloat(prev.umbs30yr5.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
          umbs30yr6: {
            value: (
              parseFloat(prev.umbs30yr6.value) +
              (Math.random() - 0.5) * 0.05
            ).toFixed(2),
            change: ((Math.random() - 0.5) * 0.05).toFixed(3),
            isPositive: Math.random() > 0.5,
          },
          treasury10yr: {
            value: (treasuryBase + treasuryVariation).toFixed(3),
            change: treasuryChange.toFixed(3),
            isPositive: treasuryChange >= 0,
          },
        };
      });
    }
  };

  // Fetch news data from RSS feed with timeout and error handling
  const fetchNewsData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Use a CORS proxy to fetch the RSS feed with timeout
      const response = await fetch(
        "https://api.allorigins.win/get?url=" +
          encodeURIComponent("http://www.mortgagenewsdaily.com/rss/news"),
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");

        const items = xmlDoc.querySelectorAll("item");
        if (items.length > 0) {
          const firstItem = items[0];
          const title = firstItem.querySelector("title")?.textContent || "";
          const description =
            firstItem.querySelector("description")?.textContent || "";
          const pubDate = firstItem.querySelector("pubDate")?.textContent || "";

          setNewsData({
            title: title.substring(0, 100) + (title.length > 100 ? "..." : ""),
            content:
              description.substring(0, 200) +
              (description.length > 200 ? "…" : ""),
            publishedAt: pubDate,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching news data:", error);

      // Clear timeout if still active
      clearTimeout(timeoutId);

      // If it's an abort error, don't log as error
      if (error.name === "AbortError") {
        console.log("News data fetch was aborted due to timeout");
      }

      // Keep existing news data on error
    }
  };

  // Set up intervals for data fetching and ad rotation with error handling
  useEffect(() => {
    let marketInterval: NodeJS.Timeout;
    let newsInterval: NodeJS.Timeout;
    let adRotationInterval: NodeJS.Timeout;
    let isComponentMounted = true;

    const safeExecute = async (fn: () => Promise<void>, name: string) => {
      if (!isComponentMounted) return;
      try {
        await fn();
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        // Don't crash the app, just log the error
      }
    };

    // Initial fetch with error handling
    safeExecute(fetchMarketData, "fetchMarketData");
    safeExecute(fetchNewsData, "fetchNewsData");

    // Set up market data interval (every 2 minutes to reduce load)
    marketInterval = setInterval(() => {
      safeExecute(fetchMarketData, "fetchMarketData");
    }, 120000);

    // Set up news data interval (every 2 hours to reduce load)
    newsInterval = setInterval(() => {
      safeExecute(fetchNewsData, "fetchNewsData");
    }, 7200000);

    // Ad rotation interval - rotate through active ads every 10 seconds
    if (activeAds.length > 1) {
      adRotationInterval = setInterval(() => {
        if (isComponentMounted) {
          setCurrentAdIndex((prevIndex) => (prevIndex + 1) % activeAds.length);
        }
      }, 10000);
    }

    // Featured video rotation interval - cycle through featured videos every minute
    let videoRotationInterval: NodeJS.Timeout;
    if (featuredVideos.length > 1) {
      videoRotationInterval = setInterval(() => {
        if (isComponentMounted) {
          setCurrentVideoIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % featuredVideos.length;
            setFeaturedVideoUrl(featuredVideos[nextIndex].url);
            return nextIndex;
          });
        }
      }, 60000); // 60 seconds = 1 minute
    }

    // Cleanup intervals on unmount
    return () => {
      isComponentMounted = false;
      if (marketInterval) clearInterval(marketInterval);
      if (newsInterval) clearInterval(newsInterval);
      if (adRotationInterval) clearInterval(adRotationInterval);
      if (videoRotationInterval) clearInterval(videoRotationInterval);
    };
  }, [activeAds.length, featuredVideos.length]);

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

  return (
    <div className="w-full h-screen bg-[#032F60] relative overflow-hidden">
      {/* Bottom gradient mask to hide content overflow */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#032F60] to-transparent z-30 pointer-events-none"></div>
      <div className="flex h-full relative">
        {/* Main Content Area - Now sits on top with rounded corners and proper padding */}
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
            {/* Header with sidebar toggle tabs - Hidden in pipeline view */}
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
                    {tabs.find((tab) => tab.id === activeTab)?.label ||
                      "Dashboard"}
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-center">
                  <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2 w-full max-w-md">
                    <input
                      type="text"
                      placeholder=""
                      className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-600 flex-1"
                    />
                    <button className="ml-3 p-1 hover:bg-gray-300 rounded-full transition-colors">
                      <SearchIcon size={16} className="text-gray-700" />
                    </button>
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
              <div
                className={`${activeTab === "pipeline" ? "h-full" : "p-4 lg:p-6 pb-8"}`}
              >
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
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-20">
                        <div className="text-gray-500">
                          Loading compensation workspace...
                        </div>
                      </div>
                    }
                  >
                    <CompensationWorkspace
                      onBack={() => setShowCompensationWorkspace(false)}
                    />
                  </Suspense>
                ) : showFIREFundWorkspace ? (
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-20">
                        <div className="text-gray-500">
                          Loading FIRE fund workspace...
                        </div>
                      </div>
                    }
                  >
                    <FIREFundWorkspace
                      onBack={() => setShowFIREFundWorkspace(false)}
                    />
                  </Suspense>
                ) : (
                  <>
                    {activeTab === "dashboard" &&
                      (loading ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Loading dashboard...
                            </p>
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
                          setShowCompensationWorkspace={
                            setShowCompensationWorkspace
                          }
                          setShowFIREFundWorkspace={setShowFIREFundWorkspace}
                        />
                      ))}
                    <div
                      className={`w-full h-full ${activeTab === "pipeline" ? "block" : "hidden"}`}
                    >
                      <iframe
                        src="https://safire.myarive.com"
                        className="w-full h-full border-0"
                        title="Safire Pipeline"
                        allow="fullscreen"
                      />
                    </div>
                    {activeTab === "lenders" && activeTab !== "pipeline" && (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center py-20">
                            <div className="text-gray-500">
                              Loading lenders...
                            </div>
                          </div>
                        }
                      >
                        <LendersWorkspace />
                      </Suspense>
                    )}
                    {activeTab === "processing" && activeTab !== "pipeline" && (
                      <div className="text-center py-20 text-gray-500">
                        Processing view coming soon...
                      </div>
                    )}
                    {activeTab === "statistics" && activeTab !== "pipeline" && (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center py-20">
                            <div className="text-gray-500">
                              Loading statistics...
                            </div>
                          </div>
                        }
                      >
                        <LoanOfficerLeaderboard />
                      </Suspense>
                    )}
                    {activeTab === "learning" && activeTab !== "pipeline" && (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center py-20">
                            <div className="text-gray-500">
                              Loading learning content...
                            </div>
                          </div>
                        }
                      >
                        <Learning />
                      </Suspense>
                    )}
                    {activeTab === "news" && activeTab !== "pipeline" && (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center py-20">
                            <div className="text-gray-500">Loading news...</div>
                          </div>
                        }
                      >
                        <NewsWorkspace />
                      </Suspense>
                    )}
                    {activeTab === "spark-points" &&
                      activeTab !== "pipeline" && (
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center py-20">
                              <div className="text-gray-500">
                                Loading Spark Points...
                              </div>
                            </div>
                          }
                        >
                          <SparkPointsWorkspace />
                        </Suspense>
                      )}
                    {activeTab === "profile" && activeTab !== "pipeline" && (
                      <ProfileWorkspace
                        user={user}
                        userProfile={userProfile}
                        userPerformance={userPerformance}
                        userBadges={userBadges}
                        networkSummary={networkSummary}
                        uplineUsers={uplineUsers}
                        downlineUsers={downlineUsers}
                        loading={loading}
                        currentUserData={currentUserData}
                        transformedUsers={transformedUsers}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Sidebar Collapse Button - Cutout style */}
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
            {/* Cutout shape */}
            <div className="w-4 h-24 bg-[#032F60] rounded-r-full shadow-lg border-r border-t border-b border-[#032F60] flex items-center justify-center hover:bg-[#1a4a73] transition-colors">
              {/* Three dots indicator */}
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </button>

        {/* Left Sidebar - Straight edges, positioned behind workspace with bottom padding */}
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

        {/* Right Sidebar Collapse Button - Cutout style */}
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
            {/* Cutout shape */}
            <div className="w-4 h-24 bg-[#032F60] rounded-l-full shadow-lg border-l border-t border-b border-[#032F60] flex items-center justify-center hover:bg-[#1a4a73] transition-colors">
              {/* Three dots indicator */}
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </button>

        {/* Right Sidebar - Straight edges, positioned behind workspace with bottom padding */}
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
      </div>
      {/* Overlay for mobile */}
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
            // Refresh notification count when PIT system is closed
            loadPITNotifications();
          }}
        />
      )}
    </div>
  );
}

// News Workspace Component
function NewsWorkspaceComponent() {
  const [activeNewsTab, setActiveNewsTab] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [shareItem, setShareItem] = React.useState(null);
  const [newsArticles, setNewsArticles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showArticleModal, setShowArticleModal] = React.useState(false);

  // Load news from Supabase with enhanced video data
  React.useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const newsData = await supabaseHelpers.getNewsWithVideoData();

        // Transform Supabase data to match component expectations
        const transformedNews = (newsData || []).map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          excerpt: item.content
            ? item.content.substring(0, 200) + "..."
            : "No description available",
          author: item.author,
          publishedAt: item.publish_date || item.created_at,
          readTime: item.estimated_read_time || "5 min read",
          duration: item.duration,
          category: item.category
            ? item.category.toLowerCase().replace(" ", "-")
            : "general",
          image: item.thumbnailUrl || item.thumbnail,
          thumbnail: item.thumbnailUrl || item.thumbnail,
          tags: item.tags || [],
          views: item.views || 0,
          likes: item.likes || 0,
          comments: item.comments || 0,
          featured: item.is_featured || false,
          // Video-specific fields
          videoId: item.videoId,
          videoUrl: item.videoUrl,
          isVideo: item.isVideo,
          hasValidVideo: item.hasValidVideo,
          content: item.content, // Keep full content for video URL extraction
        }));

        setNewsArticles(transformedNews);
      } catch (error) {
        console.error("Error loading news:", error);
        // Log error but don't fall back to mock data immediately
        console.error(
          "Error loading news, but not falling back to mock data:",
          error,
        );
        // Keep empty array to show "no content" state instead of mock data
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const categories = [
    { id: "all", label: "All Content", count: 24 },
    { id: "market-updates", label: "Market Updates", count: 8 },
    { id: "industry-news", label: "Industry News", count: 6 },
    { id: "company-updates", label: "Company Updates", count: 4 },
    { id: "educational", label: "Educational", count: 6 },
  ];

  const mockNewsArticles = [
    {
      id: 1,
      type: "article",
      title: "Federal Reserve Announces New Interest Rate Policy Changes",
      excerpt:
        "The Federal Reserve has announced significant changes to interest rate policies that will impact mortgage lending across the nation. These changes are expected to...",
      author: "Sarah Johnson",
      publishedAt: "2024-01-15T10:30:00Z",
      readTime: "5 min read",
      category: "market-updates",
      image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
      tags: ["Federal Reserve", "Interest Rates", "Policy"],
      views: 1250,
      likes: 89,
      comments: 23,
      featured: true,
    },
    {
      id: 2,
      type: "video",
      title: "Weekly Market Analysis: What Loan Officers Need to Know",
      excerpt:
        "Join our senior analyst as he breaks down this week's market trends and what they mean for your lending business.",
      author: "Michael Chen",
      publishedAt: "2024-01-14T14:00:00Z",
      duration: "12:45",
      category: "educational",
      thumbnail:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
      tags: ["Market Analysis", "Education", "Weekly Update"],
      views: 2100,
      likes: 156,
      comments: 34,
      featured: false,
    },
    {
      id: 3,
      type: "article",
      title: "New FHA Guidelines: What Changed and How It Affects You",
      excerpt:
        "The FHA has updated their lending guidelines with several key changes that will impact how you process loans. Here's everything you need to know...",
      author: "Jennifer Martinez",
      publishedAt: "2024-01-13T09:15:00Z",
      readTime: "7 min read",
      category: "industry-news",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
      tags: ["FHA", "Guidelines", "Lending"],
      views: 890,
      likes: 67,
      comments: 18,
      featured: false,
    },
    {
      id: 4,
      type: "video",
      title: "Safire's Q1 2024 Company Update and New Product Launch",
      excerpt:
        "CEO announces exciting new products and shares company performance highlights from the first quarter.",
      author: "David Thompson",
      publishedAt: "2024-01-12T16:30:00Z",
      duration: "8:20",
      category: "company-updates",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
      tags: ["Company Update", "Q1 2024", "Product Launch"],
      views: 3200,
      likes: 245,
      comments: 56,
      featured: true,
    },
    {
      id: 5,
      type: "article",
      title: "Understanding UMBS Pricing: A Complete Guide for Loan Officers",
      excerpt:
        "Master the fundamentals of UMBS pricing and how it impacts your daily lending decisions. This comprehensive guide covers everything from basics to advanced strategies...",
      author: "Robert Kim",
      publishedAt: "2024-01-11T11:45:00Z",
      readTime: "10 min read",
      category: "educational",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      tags: ["UMBS", "Pricing", "Education"],
      views: 1680,
      likes: 124,
      comments: 41,
      featured: false,
    },
    {
      id: 6,
      type: "video",
      title: "Customer Success Story: How We Helped the Johnson Family",
      excerpt:
        "Follow the journey of the Johnson family as they navigate their home buying process with Safire's expert guidance.",
      author: "Lisa Anderson",
      publishedAt: "2024-01-10T13:20:00Z",
      duration: "6:15",
      category: "company-updates",
      thumbnail:
        "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop",
      tags: ["Success Story", "Customer", "Home Buying"],
      views: 950,
      likes: 78,
      comments: 12,
      featured: false,
    },
  ];

  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch =
      searchTerm === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    const matchesTab =
      activeNewsTab === "all" ||
      (activeNewsTab === "articles" && article.type === "article") ||
      (activeNewsTab === "videos" && article.type === "video") ||
      (activeNewsTab === "featured" && article.featured);

    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleShare = (item, platform = null) => {
    if (platform) {
      const url = `${window.location.origin}/news/${item.id}`;
      const text = `Check out: ${item.title}`;

      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;
        case "copy":
          navigator.clipboard.writeText(url);
          break;
      }
      setShowShareModal(false);
    } else {
      setShareItem(item);
      setShowShareModal(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleNewsItemClick = (item) => {
    if (item.type === "video") {
      // For videos, use the enhanced video data
      if (item.hasValidVideo && item.videoUrl) {
        window.open(item.videoUrl, "_blank");
      } else if (item.videoId) {
        window.open(
          `https://www.youtube.com/watch?v=${item.videoId}`,
          "_blank",
        );
      } else {
        // Try to extract YouTube URL from content as fallback
        const youtubeUrl = extractYouTubeUrl(item.content || item.url);
        if (youtubeUrl) {
          window.open(youtubeUrl, "_blank");
        } else {
          // Show article modal if no valid video URL found
          setSelectedArticle(item);
          setShowArticleModal(true);
        }
      }
    } else {
      // For articles, show detailed view in modal
      setSelectedArticle(item);
      setShowArticleModal(true);
    }
  };

  const extractYouTubeUrl = (content) => {
    if (!content || typeof content !== "string") return null;

    const youtubeUrlMatch = content.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );

    if (youtubeUrlMatch) {
      return `https://www.youtube.com/watch?v=${youtubeUrlMatch[1]}`;
    }

    return null;
  };

  return (
    <div className="h-full bg-workspace">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1d2430]">
              News & Updates
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Stay informed with the latest mortgage industry news and company
              updates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search articles, videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeNewsTab}
          onValueChange={setActiveNewsTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all" className="text-xs font-bold">
              All
            </TabsTrigger>
            <TabsTrigger value="articles" className="text-xs font-bold">
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs font-bold">
              Videos
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-xs font-bold">
              Featured
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex h-full">
        {/* Sidebar Categories */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[#032F60] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading news...</p>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No content found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or category filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredArticles.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleNewsItemClick(item)}
                >
                  <div className="relative">
                    <img
                      src={item.type === "video" ? item.thumbnail : item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center group-hover:bg-black/80 transition-colors">
                          <Play
                            size={24}
                            className="text-white ml-1"
                            fill="white"
                          />
                        </div>
                      </div>
                    )}
                    {item.featured && (
                      <Badge className="absolute top-3 left-3 bg-[#f6d44b] text-black font-bold">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                      >
                        <Share2 size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 bg-white/90 hover:bg-white"
                      >
                        <Bookmark size={14} />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#032F60] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <span>{item.author}</span>
                        <span>•</span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.type === "video" ? (
                          <>
                            <Clock size={12} />
                            <span>{item.duration}</span>
                          </>
                        ) : (
                          <>
                            <Eye size={12} />
                            <span>{item.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{item.comments}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#032F60] hover:text-[#1a4a73] p-0 h-auto font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewsItemClick(item);
                        }}
                      >
                        {item.type === "video" ? "Watch" : "Read"} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && shareItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Share Article</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareModal(false)}
              >
                <X size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-1">
                {shareItem.title}
              </h4>
              <p className="text-xs text-gray-500">by {shareItem.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare(shareItem, "facebook")}
              >
                <Facebook size={16} className="text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare(shareItem, "twitter")}
              >
                <Twitter size={16} className="text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare(shareItem, "linkedin")}
              >
                <Linkedin size={16} className="text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleShare(shareItem, "copy")}
              >
                <Copy size={16} />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {showArticleModal && selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowArticleModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedArticle.type === "video" ? (
                    <Video className="text-red-600" size={24} />
                  ) : (
                    <FileText className="text-blue-600" size={24} />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedArticle.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>{selectedArticle.author}</span>
                      <span>•</span>
                      <span>{formatDate(selectedArticle.publishedAt)}</span>
                      {selectedArticle.type === "video" &&
                        selectedArticle.duration && (
                          <>
                            <span>•</span>
                            <span>{selectedArticle.duration}</span>
                          </>
                        )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowArticleModal(false)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Featured Image/Video Thumbnail */}
              {(selectedArticle.image || selectedArticle.thumbnail) && (
                <div className="relative mb-6">
                  <img
                    src={
                      selectedArticle.type === "video"
                        ? selectedArticle.thumbnail
                        : selectedArticle.image
                    }
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {selectedArticle.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => {
                          // Use enhanced video data first
                          if (
                            selectedArticle.hasValidVideo &&
                            selectedArticle.videoUrl
                          ) {
                            window.open(selectedArticle.videoUrl, "_blank");
                          } else if (selectedArticle.videoId) {
                            window.open(
                              `https://www.youtube.com/watch?v=${selectedArticle.videoId}`,
                              "_blank",
                            );
                          } else {
                            // Fallback to extracting from content
                            const youtubeUrl = extractYouTubeUrl(
                              selectedArticle.content || selectedArticle.url,
                            );
                            if (youtubeUrl) {
                              window.open(youtubeUrl, "_blank");
                            }
                          }
                        }}
                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                      >
                        <Play
                          size={24}
                          className="text-white ml-1"
                          fill="white"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedArticle.excerpt}
                </p>

                {/* For demo purposes, show some additional content */}
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    This is where the full article content would be displayed.
                    In a real implementation, you would fetch the complete
                    article content from your database or content management
                    system.
                  </p>

                  {selectedArticle.type === "video" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="text-blue-600" size={16} />
                        <span className="font-semibold text-blue-800">
                          Video Content
                        </span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Click the play button above to watch this video on
                        YouTube.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>
                      {selectedArticle.views?.toLocaleString() || 0} views
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart size={16} />
                    <span>{selectedArticle.likes || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{selectedArticle.comments || 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedArticle)}
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                  {selectedArticle.type === "video" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        // Use enhanced video data first
                        if (
                          selectedArticle.hasValidVideo &&
                          selectedArticle.videoUrl
                        ) {
                          window.open(selectedArticle.videoUrl, "_blank");
                        } else if (selectedArticle.videoId) {
                          window.open(
                            `https://www.youtube.com/watch?v=${selectedArticle.videoId}`,
                            "_blank",
                          );
                        } else {
                          // Fallback to extracting from content
                          const youtubeUrl = extractYouTubeUrl(
                            selectedArticle.content || selectedArticle.url,
                          );
                          if (youtubeUrl) {
                            window.open(youtubeUrl, "_blank");
                          }
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play size={16} className="mr-2" />
                      Watch on YouTube
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Profile Workspace Component
function ProfileWorkspace({
  user,
  userProfile,
  userPerformance,
  userBadges,
  networkSummary,
  uplineUsers,
  downlineUsers,
  loading,
  currentUserData,
  transformedUsers,
}) {
  const [profileView, setProfileView] = React.useState("badges"); // "badges" or "network"
  const [selectedBadgeCategory, setSelectedBadgeCategory] =
    React.useState("all");
  const [selectedBadge, setSelectedBadge] = React.useState(null);
  const [showBadgeModal, setShowBadgeModal] = React.useState(false);
  const [showBadgeSelector, setShowBadgeSelector] = React.useState(false);
  const [selectedBadgesForProfile, setSelectedBadgesForProfile] =
    React.useState([]);
  const [isUpdatingBadges, setIsUpdatingBadges] = React.useState(false);
  const [sparkPointsBalance, setSparkPointsBalance] = React.useState(2450);
  const [weeklyPointsEarned, setWeeklyPointsEarned] = React.useState(180);
  const [weeklyPointsCap] = React.useState(500);

  const badgeCategories = [
    { id: "all", label: "All Badges", count: 30 },
    { id: "performance", label: "Performance", count: 15 },
    { id: "leadership", label: "Leadership", count: 5 },
    { id: "milestones", label: "Milestones", count: 10 },
  ];

  // Load selected badges from user profile
  React.useEffect(() => {
    const loadSelectedBadges = async () => {
      if (user?.id) {
        try {
          const selectedBadgeIds = await supabaseHelpers.getUserSelectedBadges(
            user.id,
          );
          setSelectedBadgesForProfile(selectedBadgeIds);
        } catch (error) {
          console.error("Error loading selected badges:", error);
        }
      }
    };

    loadSelectedBadges();
  }, [user?.id]);

  // Transform userBadges from database to match component expectations
  const transformedBadges = userBadges.map((userBadge) => ({
    id: userBadge.badges.id,
    name: userBadge.badges.name,
    description: userBadge.badges.description,
    category: userBadge.badges.criteria.toLowerCase().includes("performance")
      ? "performance"
      : userBadge.badges.criteria.toLowerCase().includes("leadership")
        ? "leadership"
        : userBadge.badges.criteria.toLowerCase().includes("milestone")
          ? "milestones"
          : "performance",
    image: `/tier-badges/tier-${
      userBadge.badges.rarity === "legendary"
        ? "gold"
        : userBadge.badges.rarity === "epic"
          ? "silver"
          : userBadge.badges.rarity === "rare"
            ? "bronze"
            : "basic"
    }.png`,
    obtained: true,
    count: userBadge.count || 1,
    rarity: userBadge.badges.rarity || "common",
    dateObtained: userBadge.date_obtained,
    requirements: userBadge.badges.requirements || userBadge.badges.criteria,
    reward: userBadge.badges.reward || "Recognition and achievement",
  }));

  // Use only real badges from database
  const allBadges = transformedBadges;

  const filteredBadges = allBadges.filter(
    (badge) =>
      selectedBadgeCategory === "all" ||
      badge.category === selectedBadgeCategory,
  );

  const obtainedBadges = allBadges.filter((badge) => badge.obtained);
  const totalBadgeCount = obtainedBadges.reduce(
    (sum, badge) => sum + badge.count,
    0,
  );

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500";
      case "epic":
        return "from-purple-400 to-pink-500";
      case "rare":
        return "from-blue-400 to-cyan-500";
      case "common":
        return "from-green-400 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const handleUpdateSelectedBadges = async (badgeIds) => {
    if (!user?.id) return;

    setIsUpdatingBadges(true);
    try {
      await supabaseHelpers.updateUserSelectedBadges(user.id, badgeIds);
      setSelectedBadgesForProfile(badgeIds);
      setShowBadgeSelector(false);
    } catch (error) {
      console.error("Error updating selected badges:", error);
    } finally {
      setIsUpdatingBadges(false);
    }
  };

  const getSelectedBadgesForDisplay = () => {
    return transformedBadges
      .filter((badge) => selectedBadgesForProfile.includes(badge.id))
      .slice(0, 3);
  };

  return (
    <div className="h-full bg-workspace">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1d2430]">
              Profile & Performance
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Track your progress, achievements, and career development
            </p>
          </div>
          <div className="flex items-center gap-6">
            {profileView === "badges" ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">
                    {totalBadgeCount}
                  </div>
                  <div className="text-xs text-gray-500">Total Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">
                    {obtainedBadges.length}
                  </div>
                  <div className="text-xs text-gray-500">Unique Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">#3</div>
                  <div className="text-xs text-gray-500">Current Rank</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">
                    {networkSummary?.uplineCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Upline Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">
                    {networkSummary?.directRecruitsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Direct Recruits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#032F60]">
                    {transformedUsers.length}
                  </div>
                  <div className="text-xs text-gray-500">Total Network</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setProfileView("badges")}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${
              profileView === "badges"
                ? "bg-[#032F60] text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Trophy size={16} />
            Badges
          </button>
          <button
            onClick={() => setProfileView("network")}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${
              profileView === "network"
                ? "bg-[#032F60] text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Users2 size={16} />
            Network
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          {/* Network Information Section */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TreePine size={16} className="text-[#032F60]" />
              Network Structure
            </h4>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60] mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading network...</p>
              </div>
            ) : (
              <>
                {/* Upline Information */}
                <div className="mb-6">
                  <h5 className="font-medium mb-3 flex items-center text-sm">
                    <span className="mr-2">↑</span> Upline ({uplineUsers.length}{" "}
                    levels)
                  </h5>
                  <div className="space-y-2">
                    {uplineUsers && uplineUsers.length > 0 ? (
                      uplineUsers.slice(0, 3).map((relationship, index) => {
                        const uplineUser = relationship.upline_user;
                        return (
                          <div
                            key={relationship.id}
                            className="flex items-center space-x-3 p-2 bg-blue-50 rounded border border-blue-200"
                          >
                            <div className="text-sm font-medium text-blue-600 flex-shrink-0">
                              L{relationship.relationship_level}
                            </div>
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={uplineUser?.avatar} />
                              <AvatarFallback className="text-xs">
                                {uplineUser?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {uplineUser?.name || "Unknown User"}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {uplineUser?.role || "Unknown Role"}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 italic p-2">
                        No upline
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#032F60]">
                        {networkSummary?.uplineCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Upline Levels</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#032F60]">
                        {networkSummary?.directRecruitsCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Direct Recruits
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Profile Summary */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#032F60] rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {user?.name || "User"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {user?.role || "User"}
              </p>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                🥉 P3 - Podium Position
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Performance Overview
              </h4>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loading performance...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#032F60]">
                          $
                          {(
                            (userPerformance?.monthly_volume || 0) / 1000000
                          ).toFixed(1)}
                          M
                        </div>
                        <div className="text-xs text-gray-500">
                          Monthly Volume
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#032F60]">
                          {userPerformance?.monthly_loans || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Monthly Loans
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#032F60]">
                          $
                          {(
                            (userPerformance?.ytd_volume || 0) / 1000000
                          ).toFixed(1)}
                          M
                        </div>
                        <div className="text-xs text-gray-500">YTD Volume</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#032F60]">
                          {userPerformance?.ytd_loans || 0}
                        </div>
                        <div className="text-xs text-gray-500">YTD Loans</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-700 mb-2">
                      Career Highlights
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Rank:</span>
                        <span className="font-semibold">
                          #{userPerformance?.rank || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recruitment Tier:</span>
                        <span className="font-semibold">
                          Tier {userPerformance?.recruitment_tier || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Recruits:</span>
                        <span className="font-semibold">
                          {userPerformance?.active_recruits ||
                            downlineUsers.length ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">FIRE Fund:</span>
                        <span className="font-semibold">
                          $
                          {((userPerformance?.fire_fund || 0) / 1000).toFixed(
                            1,
                          )}
                          K
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Badge Categories */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">
              Badge Categories
            </h4>
            <div className="space-y-1">
              {badgeCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedBadgeCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                    selectedBadgeCategory === category.id
                      ? "bg-[#032F60] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {profileView === "badges" ? (
            <>
              {/* Badge Library Section */}
              <div className="p-6">
                {filteredBadges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No badges found
                    </h3>
                    <p className="text-gray-500">
                      Try selecting a different category
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-6 justify-start">
                    {filteredBadges.map((badge) => (
                      <div
                        key={badge.id}
                        onClick={() => handleBadgeClick(badge)}
                        className={`bg-white border rounded-xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer group min-h-[200px] w-48 flex flex-col ${
                          badge.obtained
                            ? "hover:scale-105 border-gray-200 shadow-md"
                            : "opacity-60 grayscale hover:opacity-80 border-gray-100"
                        }`}
                      >
                        <div className="text-center flex-1 flex flex-col justify-between">
                          <div className="relative mb-4">
                            <img
                              src={badge.image}
                              alt={badge.name}
                              className={`w-20 h-12 object-cover rounded-lg mx-auto shadow-md ${
                                !badge.obtained ? "grayscale" : ""
                              }`}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div
                              className="w-20 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 mx-auto"
                              style={{ display: "none" }}
                            >
                              {badge.name.charAt(0)}
                            </div>

                            {/* Badge Count */}
                            {badge.obtained && badge.count > 1 && (
                              <div className="absolute -top-2 -right-2">
                                <span className="bg-[#032F60] text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                                  x{badge.count}
                                </span>
                              </div>
                            )}

                            {/* Lock Icon for Unobtained */}
                            {!badge.obtained && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">🔒</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-center">
                            <h4
                              className={`text-sm font-semibold mb-2 line-clamp-2 min-h-[2.5rem] flex items-center justify-center ${
                                badge.obtained
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }`}
                            >
                              {badge.name}
                            </h4>

                            {/* Rarity Indicator */}
                            <div className="mb-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white shadow-sm`}
                              >
                                {badge.rarity.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            {badge.obtained ? (
                              <div className="text-xs text-gray-500 font-medium">
                                {new Date(
                                  badge.dateObtained,
                                ).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 font-medium">
                                Not obtained
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : profileView === "spark" ? (
            <SparkPointsView
              sparkPointsBalance={sparkPointsBalance}
              weeklyPointsEarned={weeklyPointsEarned}
              weeklyPointsCap={weeklyPointsCap}
              setSparkPointsBalance={setSparkPointsBalance}
              setWeeklyPointsEarned={setWeeklyPointsEarned}
            />
          ) : (
            <>
              {/* Network View */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Users2 size={20} className="text-[#032F60]" />
                  Network Overview
                </h3>

                <div className="space-y-8">
                  {/* Current User */}
                  <div>
                    <h4 className="font-medium mb-3">Current User</h4>
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUserData?.avatar} />
                        <AvatarFallback>
                          {currentUserData?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {currentUserData?.name || user?.name || "User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentUserData?.role || user?.role || "User"}
                        </div>
                        <div className="text-xs text-gray-400">
                          NMLS: {currentUserData?.nmlsNumber || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#032F60]">
                          $
                          {(
                            currentUserData?.monthlyLoanVolume || 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Monthly Volume
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upline Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center text-sm">
                        <span className="mr-2">↑</span> Upline (
                        {uplineUsers.length} levels)
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // Handle upline action
                        }}
                      >
                        Upline
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {uplineUsers && uplineUsers.length > 0 ? (
                        uplineUsers.slice(0, 3).map((relationship, index) => {
                          const uplineUser = relationship.upline_user;
                          return (
                            <div
                              key={relationship.id}
                              className="flex items-center space-x-3 p-2 bg-blue-50 rounded border border-blue-200"
                            >
                              <div className="text-sm font-medium text-blue-600 flex-shrink-0">
                                L{relationship.relationship_level}
                              </div>
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={uplineUser?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {uplineUser?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {uplineUser?.name || "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {uplineUser?.role || "Unknown Role"}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-gray-500 italic p-2">
                          No upline
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Downline Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center text-sm">
                        <span className="mr-2">↓</span> Downline Network (
                        {transformedUsers.length} direct recruits)
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // Handle downline action
                        }}
                      >
                        Downline
                      </Button>
                    </div>
                    {(userProfile || user) && (
                      <NetworkDownlineView
                        userId={currentUserData.id}
                        users={transformedUsers}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Badge Detail Modal */}
        {showBadgeModal && selectedBadge && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBadgeModal(false)}
          >
            <div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Badge Details
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBadgeModal(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div
                    className={`w-24 h-16 bg-gradient-to-br ${getRarityColor(selectedBadge.rarity)} rounded-lg p-2 flex items-center justify-center`}
                  >
                    <img
                      src={selectedBadge.image}
                      alt={selectedBadge.name}
                      className={`w-20 h-12 object-cover rounded shadow-lg ${
                        !selectedBadge.obtained ? "grayscale" : ""
                      }`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center text-sm font-bold text-gray-600"
                      style={{ display: "none" }}
                    >
                      {selectedBadge.name.charAt(0)}
                    </div>
                  </div>

                  {selectedBadge.obtained && selectedBadge.count > 1 && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-[#032F60] text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                        x{selectedBadge.count}
                      </span>
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedBadge.name}
                </h4>

                <Badge
                  className={`mb-4 bg-gradient-to-r ${getRarityColor(selectedBadge.rarity)} text-white border-0`}
                >
                  {selectedBadge.rarity.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {selectedBadge.description}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Requirements
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {selectedBadge.requirements}
                  </p>
                </div>

                {selectedBadge.obtained ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600">✓</span>
                      <span className="font-semibold text-green-800">
                        Obtained
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      Earned on{" "}
                      {new Date(
                        selectedBadge.dateObtained,
                      ).toLocaleDateString()}
                      {selectedBadge.count > 1 &&
                        ` • Earned ${selectedBadge.count} times`}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500">🔒</span>
                      <span className="font-semibold text-gray-700">
                        Not Yet Obtained
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Complete the requirements above to earn this badge
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Badge Selector Modal */}
        {showBadgeSelector && (
          <BadgeSelectorModal
            badges={transformedBadges}
            selectedBadgeIds={selectedBadgesForProfile}
            onSave={handleUpdateSelectedBadges}
            onClose={() => setShowBadgeSelector(false)}
            isLoading={isUpdatingBadges}
          />
        )}
      </div>
    </div>
  );
}

// Spark Points View Component
function SparkPointsView({
  sparkPointsBalance,
  weeklyPointsEarned,
  weeklyPointsCap,
  setSparkPointsBalance,
  setWeeklyPointsEarned,
}) {
  const [selectedActivity, setSelectedActivity] = React.useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = React.useState(false);
  const [showRedeemModal, setShowRedeemModal] = React.useState(false);
  const [selectedReward, setSelectedReward] = React.useState(null);

  // Mock data for activities
  const activities = [
    {
      id: 1,
      category: "Content",
      title: "Post Social Media Video",
      description: "Create and post a video on social media platforms",
      points: 100,
      icon: Video,
      color: "bg-purple-500",
      verification: "Upload screenshot or link",
    },
    {
      id: 2,
      category: "Learning",
      title: "Complete Training Module",
      description: "Finish a learning module in the training portal",
      points: 75,
      icon: BookOpen,
      color: "bg-blue-500",
      verification: "Automatic tracking",
    },
    {
      id: 3,
      category: "Outreach",
      title: "Client Follow-up Call",
      description: "Make follow-up calls to past clients",
      points: 50,
      icon: MessageSquare,
      color: "bg-green-500",
      verification: "Log in CRM system",
    },
    {
      id: 4,
      category: "Leadership",
      title: "Recruit New Team Member",
      description: "Successfully recruit and onboard a new loan officer",
      points: 500,
      icon: UserPlus,
      color: "bg-orange-500",
      verification: "HR confirmation",
    },
    {
      id: 5,
      category: "Milestones",
      title: "Close 10 Loans This Month",
      description: "Achieve monthly loan closing milestone",
      points: 300,
      icon: Target,
      color: "bg-red-500",
      verification: "Automatic tracking",
    },
    {
      id: 6,
      category: "Content",
      title: "Write Blog Post",
      description: "Create educational content for company blog",
      points: 150,
      icon: FileText,
      color: "bg-purple-500",
      verification: "Submit draft for review",
    },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      activity: "Posted social video",
      points: 100,
      date: "2 hours ago",
      status: "approved",
    },
    {
      id: 2,
      activity: "Completed training module",
      points: 75,
      date: "1 day ago",
      status: "approved",
    },
    {
      id: 3,
      activity: "Client follow-up calls",
      points: 50,
      date: "2 days ago",
      status: "pending",
    },
    {
      id: 4,
      activity: "Blog post submission",
      points: 150,
      date: "3 days ago",
      status: "approved",
    },
  ];

  // Mock data for rewards
  const rewards = [
    {
      id: 1,
      name: "Safire Swag Pack",
      description: "Branded merchandise including t-shirt, mug, and stickers",
      points: 500,
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=150&fit=crop",
      available: true,
    },
    {
      id: 2,
      name: "Co-op Ad Credit",
      description: "$100 credit for co-op advertising campaigns",
      points: 1000,
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop",
      available: true,
    },
    {
      id: 3,
      name: "1:1 Coaching Session",
      description: "Personal coaching session with senior leadership",
      points: 1500,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=150&fit=crop",
      available: true,
    },
    {
      id: 4,
      name: "Priority Lead Routing",
      description: "Get priority access to incoming leads for 1 week",
      points: 2000,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop",
      available: true,
    },
    {
      id: 5,
      name: "Premium Training Access",
      description: "Unlock premium training modules and resources",
      points: 3000,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=150&fit=crop",
      available: false,
    },
    {
      id: 6,
      name: "Conference Ticket",
      description: "Free ticket to annual mortgage industry conference",
      points: 5000,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=150&fit=crop",
      available: false,
    },
  ];

  const categoryBreakdown = {
    Content: 250,
    Learning: 150,
    Outreach: 100,
    Leadership: 500,
    Milestones: 300,
  };

  const handleActivitySubmit = (activity) => {
    setSelectedActivity(activity);
    setShowSubmissionModal(true);
  };

  const handleRewardRedeem = (reward) => {
    if (sparkPointsBalance >= reward.points && reward.available) {
      setSelectedReward(reward);
      setShowRedeemModal(true);
    }
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      setSparkPointsBalance((prev) => prev - selectedReward.points);
      setShowRedeemModal(false);
      setSelectedReward(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Spark Points Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
          <Zap className="text-[#f6d44b]" size={28} />
          Spark Points System
        </h2>
        <p className="text-gray-600">
          Earn points through activities, track your progress, and redeem
          rewards
        </p>
      </div>
      <>
        {/* Multiplier Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Flame size={24} />
            <div>
              <h3 className="font-bold text-lg">
                🔥 All Content Points are x1.5 this week!
              </h3>
              <p className="text-sm opacity-90">
                Earn extra points for creating and sharing content
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Earn Points (Action Center) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-[#032F60]" size={20} />
                  Earn Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div
                          key={activity.id}
                          className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`${activity.color} p-2 rounded-lg`}>
                              <IconComponent size={16} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">
                                  {activity.title}
                                </h4>
                                <div className="flex items-center gap-1 text-[#f6d44b]">
                                  <Zap size={12} />
                                  <span className="text-sm font-bold">
                                    {activity.points}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {activity.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {activity.category}
                                </Badge>
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleActivitySubmit(activity)}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 2. Points Earned (Tracker) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-[#032F60]" size={20} />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance Display */}
                <div className="text-center p-4 bg-gradient-to-br from-[#f6d44b] to-[#f5d02b] rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={24} className="text-[#032F60]" />
                    <span className="text-2xl font-bold text-[#032F60]">
                      {sparkPointsBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#032F60] font-semibold">
                    Total Spark Points
                  </p>
                </div>

                {/* Weekly Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-semibold">
                      {weeklyPointsEarned}/{weeklyPointsCap}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#032F60] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((weeklyPointsEarned / weeklyPointsCap) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {weeklyPointsCap - weeklyPointsEarned} points until weekly
                    cap
                  </p>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Category Breakdown
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(categoryBreakdown).map(
                      ([category, points]) => (
                        <div
                          key={category}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{category}</span>
                          <span className="font-semibold">{points} pts</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Recent Activity
                  </h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.activity}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#f6d44b]">
                              +{item.points}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.status === "approved"
                                  ? "bg-green-500"
                                  : item.status === "pending"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Redeem Points (Rewards Store) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="text-[#032F60]" size={20} />
                  Rewards Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {rewards.map((reward) => {
                      const canAfford = sparkPointsBalance >= reward.points;
                      const isAvailable = reward.available;

                      return (
                        <div
                          key={reward.id}
                          className={`border rounded-lg p-3 transition-all ${
                            canAfford && isAvailable
                              ? "hover:shadow-md cursor-pointer"
                              : "opacity-60"
                          }`}
                          onClick={() =>
                            canAfford &&
                            isAvailable &&
                            handleRewardRedeem(reward)
                          }
                        >
                          <div className="flex gap-3">
                            <img
                              src={reward.image}
                              alt={reward.name}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">
                                  {reward.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[#f6d44b]">
                                  <Coins size={12} />
                                  <span className="text-sm font-bold">
                                    {reward.points}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {reward.description}
                              </p>
                              <div className="flex items-center justify-between">
                                {!isAvailable ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Coming Soon
                                  </Badge>
                                ) : canAfford ? (
                                  <Badge className="text-xs bg-green-500">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Need {reward.points - sparkPointsBalance}{" "}
                                    more
                                  </Badge>
                                )}
                                {canAfford && isAvailable && (
                                  <Button
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                  >
                                    Redeem
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </>

      {/* Activity Submission Modal */}
      {showSubmissionModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Submit Activity
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSubmissionModal(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedActivity.title}</h4>
                <p className="text-sm text-gray-600">
                  {selectedActivity.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Zap size={16} className="text-[#f6d44b]" />
                  <span className="font-bold text-[#f6d44b]">
                    {selectedActivity.points} points
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedActivity.verification}
                </p>

                {selectedActivity.verification.includes("screenshot") ||
                selectedActivity.verification.includes("link") ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload
                        size={24}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="text-sm text-gray-600">
                        Upload screenshot or paste link
                      </p>
                    </div>
                    <Input placeholder="Or paste link here..." />
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      This activity will be automatically verified.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowSubmissionModal(false)}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Redemption Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Redeem Reward</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRedeemModal(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  className="w-32 h-24 object-cover rounded-lg mx-auto mb-3"
                />
                <h4 className="font-semibold text-lg">{selectedReward.name}</h4>
                <p className="text-sm text-gray-600">
                  {selectedReward.description}
                </p>
              </div>

              <div className="bg-[#f6d44b] p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins size={20} className="text-[#032F60]" />
                  <span className="text-xl font-bold text-[#032F60]">
                    {selectedReward.points} points
                  </span>
                </div>
                <p className="text-sm text-[#032F60]">
                  You'll have {sparkPointsBalance - selectedReward.points}{" "}
                  points remaining
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRedeem}
                  className="flex-1 bg-[#032F60] hover:bg-[#1a4a73]"
                >
                  Confirm Redeem
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Quick View Component
function DashboardQuickView({
  onExpandSpark,
  onExpandCompensation,
  onExpandFire,
}) {
  const { user } = useAuth();
  const [sparkPointsData, setSparkPointsData] = React.useState(null);
  const [compensationData, setCompensationData] = React.useState(null);
  const [fireFundData, setFireFundData] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState("spark"); // "spark", "compensation", "fire"
  const [loading, setLoading] = React.useState(true);

  // Load data from Supabase
  React.useEffect(() => {
    const loadQuickViewData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const performanceData =
          await supabaseHelpers.getUserPerformanceGraphData(
            user.id,
            "months",
            6,
          );

        // Transform data for Spark Points
        const sparkData = {
          totalPoints: 2450,
          weeklyEarned: 180,
          weeklyTarget: 500,
          recentActivities: [
            {
              activity: "Posted social video",
              points: 100,
              date: "2 hours ago",
            },
            { activity: "Completed training", points: 75, date: "1 day ago" },
            { activity: "Client follow-up", points: 50, date: "2 days ago" },
          ],
          chartData: performanceData.slice(-6).map((item, index) => ({
            month: item.period.split("-")[1]
              ? new Date(
                  2024,
                  parseInt(item.period.split("-")[1]) - 1,
                ).toLocaleDateString("en", { month: "short" })
              : item.period,
            points: 200 + Math.floor(Math.random() * 300),
          })),
        };

        // Transform data for Compensation
        const compensationChartData = {
          totalEarnings: performanceData.reduce(
            (sum, item) => sum + (item.compensation || 0),
            0,
          ),
          monthlyData: performanceData.slice(-6).map((item) => ({
            month: item.period.split("-")[1]
              ? new Date(
                  2024,
                  parseInt(item.period.split("-")[1]) - 1,
                ).toLocaleDateString("en", { month: "short" })
              : item.period,
            amount:
              item.compensation || 12000 + Math.floor(Math.random() * 8000),
          })),
        };

        // Transform data for FIRE Fund
        const fireFundChartData = {
          currentBalance:
            performanceData[performanceData.length - 1]?.fireFund || 45000,
          monthlyData: performanceData.slice(-6).map((item, index) => {
            const monthName = item.period.split("-")[1]
              ? new Date(
                  2024,
                  parseInt(item.period.split("-")[1]) - 1,
                ).toLocaleDateString("en", { month: "short" })
              : item.period;
            const fireFund = item.fireFund || 1500;
            return {
              month: monthName,
              downlineEarnings: fireFund * 0.6 * 1.2, // 20% more from downline
              growth: fireFund * 0.4,
              balance: (index + 1) * fireFund + 35000,
            };
          }),
        };

        setSparkPointsData(sparkData);
        setCompensationData(compensationChartData);
        setFireFundData(fireFundChartData);
      } catch (error) {
        console.error("Error loading quick view data:", error);
        // Set fallback data
        setSparkPointsData({
          totalPoints: 2450,
          weeklyEarned: 180,
          weeklyTarget: 500,
          recentActivities: [
            {
              activity: "Posted social video",
              points: 100,
              date: "2 hours ago",
            },
            { activity: "Completed training", points: 75, date: "1 day ago" },
          ],
          chartData: [
            { month: "Jul", points: 320 },
            { month: "Aug", points: 280 },
            { month: "Sep", points: 450 },
            { month: "Oct", points: 380 },
            { month: "Nov", points: 420 },
            { month: "Dec", points: 380 },
          ],
        });

        setCompensationData({
          totalEarnings: 125000,
          monthlyData: [
            { month: "Jul", amount: 12000 },
            { month: "Aug", amount: 15000 },
            { month: "Sep", amount: 18000 },
            { month: "Oct", amount: 14000 },
            { month: "Nov", amount: 16000 },
            { month: "Dec", amount: 17000 },
          ],
        });

        setFireFundData({
          currentBalance: 45000,
          monthlyData: [
            {
              month: "Jul",
              downlineEarnings: 1800,
              growth: 800,
              balance: 35300,
            },
            {
              month: "Aug",
              downlineEarnings: 1800,
              growth: 900,
              balance: 37700,
            },
            {
              month: "Sep",
              downlineEarnings: 1800,
              growth: 1100,
              balance: 40300,
            },
            {
              month: "Oct",
              downlineEarnings: 1800,
              growth: 950,
              balance: 42750,
            },
            {
              month: "Nov",
              downlineEarnings: 1800,
              growth: 1200,
              balance: 45450,
            },
            {
              month: "Dec",
              downlineEarnings: 1800,
              growth: 1050,
              balance: 48000,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuickViewData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Spark Points Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="text-[#f6d44b]" size={24} />
              <span className="text-xl font-extrabold text-gray-800">
                Spark Points Dashboard
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Loading your activity and rewards data...
            </p>
          </div>
        </div>

        {/* Loading Chart */}
        <div className="bg-white rounded-xl shadow-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032F60] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading Spark Points data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setSelectedView("spark")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            selectedView === "spark"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Zap size={16} />
          Spark Points
        </button>
        <button
          onClick={() => setSelectedView("compensation")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            selectedView === "compensation"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <TrendingUpIcon size={16} />
          Compensation
        </button>
        <button
          onClick={() => setSelectedView("fire")}
          className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 ${
            selectedView === "fire"
              ? "bg-[#032F60] text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Flame size={16} />
          FIRE Fund
        </button>
      </div>

      {/* Dynamic Content Based on Selected View */}
      <div
        className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => {
          if (selectedView === "spark") onExpandSpark();
          else if (selectedView === "compensation") onExpandCompensation();
          else if (selectedView === "fire") onExpandFire();
        }}
      >
        {selectedView === "spark" && sparkPointsData && (
          <div className="space-y-6">
            {/* Points Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="text-[#f6d44b]" size={24} />
                  Spark Points Overview
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your activity and engagement
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#f6d44b]">
                  {(sparkPointsData?.totalPoints || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points Chart */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                  Monthly Points Earned
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sparkPointsData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value} points`,
                          "Points Earned",
                        ]}
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="points"
                        fill="url(#pointsGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="pointsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f6d44b" />
                          <stop offset="100%" stopColor="#f5d02b" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Points Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Weekly Progress
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>This Week</span>
                      <span className="font-semibold">
                        {sparkPointsData?.weeklyEarned || 0}/
                        {sparkPointsData?.weeklyTarget || 500}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-[#f6d44b] h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(((sparkPointsData?.weeklyEarned || 0) / (sparkPointsData?.weeklyTarget || 500)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(sparkPointsData?.weeklyTarget || 500) -
                        (sparkPointsData?.weeklyEarned || 0)}{" "}
                      points until weekly cap
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {(sparkPointsData?.recentActivities || []).map(
                      (activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{activity.activity}</p>
                            <p className="text-xs text-gray-500">
                              {activity.date}
                            </p>
                          </div>
                          <span className="font-semibold text-[#f6d44b]">
                            +{activity.points}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === "compensation" && compensationData && (
          <div className="space-y-6">
            {/* Compensation Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUpIcon className="text-green-600" size={24} />
                  Compensation Overview
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your earnings and commission performance
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${(compensationData?.totalEarnings || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compensation Chart */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                  Monthly Compensation
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compensationData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString()}`,
                          "Compensation",
                        ]}
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        fill="url(#compensationGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="compensationGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Compensation Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Performance Metrics
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Average Monthly</span>
                      <span className="font-semibold">
                        $
                        {Math.round(
                          (compensationData?.totalEarnings || 0) / 12 / 1000,
                        )}
                        K
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Month</span>
                      <span className="font-semibold text-green-600">
                        $
                        {Math.max(
                          ...(compensationData?.monthlyData || []).map(
                            (d) => d.amount,
                          ),
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Growth Rate</span>
                      <span className="font-semibold text-green-600">
                        +12.5%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Commission Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Base Commission</span>
                      </div>
                      <span className="font-semibold">76%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Bonuses</span>
                      </div>
                      <span className="font-semibold">16%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Overrides</span>
                      </div>
                      <span className="font-semibold">8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === "fire" && fireFundData && (
          <div className="space-y-6">
            {/* FIRE Fund Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Flame className="text-red-600" size={24} />
                  FIRE Fund Overview
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your Financial Independence Retirement Early fund
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  ${(fireFundData?.currentBalance || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Balance</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FIRE Fund Chart */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                  Monthly FIRE Fund Growth
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fireFundData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const formatName =
                            name === "contributions"
                              ? "Contributions"
                              : name === "growth"
                                ? "Growth"
                                : "Balance";
                          return [`${value.toLocaleString()}`, formatName];
                        }}
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="contributions"
                        stackId="1"
                        stroke="#dc2626"
                        fill="url(#contributionsGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="growth"
                        stackId="1"
                        stroke="#10b981"
                        fill="url(#growthGradient)"
                      />
                      <defs>
                        <linearGradient
                          id="contributionsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#dc2626"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#dc2626"
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                        <linearGradient
                          id="growthGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* FIRE Fund Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Fund Performance
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Contribution</span>
                      <span className="font-semibold">$1.5K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Growth</span>
                      <span className="font-semibold text-green-600">$950</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual Return</span>
                      <span className="font-semibold text-green-600">
                        18.9%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Featured Video Player Component - Uses YouTube iframe embed directly
function FeaturedVideoPlayer({ currentVideoIndex = 0 }) {
  const [videoData, setVideoData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [featuredVideos, setFeaturedVideos] = React.useState([]);
  const [showVideoDialog, setShowVideoDialog] = React.useState(false);

  // Load featured videos from Supabase
  React.useEffect(() => {
    let cancelled = false;

    const loadFeaturedVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const videos = await supabaseHelpers.getFeaturedVideos();

        if (!cancelled && videos?.length) {
          setFeaturedVideos(videos);

          const currentVideo = videos[currentVideoIndex] || videos[0];

          setVideoData({
            title: currentVideo.title ?? "Featured Video",
            channelTitle: currentVideo.channelTitle ?? "Safire Home Lending",
            publishedAt: currentVideo.publishedAt || null,
            duration: currentVideo.duration ?? null,
            views: Number(currentVideo.views ?? 0),
            embedUrl: currentVideo.embedUrl || null, // YouTube embed URL for iframe
            content: currentVideo.content || null, // Raw content from database
            thumbnail: currentVideo.thumbnail ?? null,
            videoId: currentVideo.videoId || null,
          });
        } else if (!cancelled) {
          setError("No featured videos found");
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load featured videos");
        console.error(
          "FeaturedVideoPlayer: error loading featured videos",
          err,
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFeaturedVideos();
    return () => {
      cancelled = true;
    };
  }, [currentVideoIndex]);

  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoData?.embedUrl) {
      setShowVideoDialog(true);
    } else if (videoData?.content) {
      // Fallback: try to open the raw content URL
      window.open(videoData.content, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="relative mb-3">
        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#032F60] mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="relative mb-3">
        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Video className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">
              No featured videos available
            </p>
          </div>
        </div>
        <h4 className="text-[#1d2430] font-bold text-sm mb-2 mt-2">
          No Featured Video
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#6f7d8f] text-xs">
            {error || "No featured videos found"}
          </span>
        </div>
        <p className="text-[#6f7d8f] text-xs">
          Add featured videos in the News section
        </p>
      </div>
    );
  }

  const thumbnailUrl =
    videoData.thumbnail ||
    (videoData.videoId
      ? `https://img.youtube.com/vi/${videoData.videoId}/maxresdefault.jpg`
      : null);

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={handleVideoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleVideoClick(e);
        }}
      >
        <div className="relative mb-3">
          <img
            src={thumbnailUrl}
            alt={videoData.title || "Featured Video"}
            className="w-full h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=120&fit=crop&crop=center";
            }}
          />
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors rounded-lg group"
            onClick={handleVideoClick}
            aria-label={
              videoData?.embedUrl
                ? "Play video in player"
                : "Open video on YouTube"
            }
          >
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors group-hover:scale-110">
              {videoData?.embedUrl ? (
                <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
              ) : (
                <ExternalLink className="w-3 h-3 text-white" />
              )}
            </div>
          </button>
          <div className="absolute top-2 right-2">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
              {videoData?.embedUrl ? "Player" : "YouTube"}
            </div>
          </div>
          {videoData.duration && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                {videoData.duration}
              </div>
            </div>
          )}
          {featuredVideos.length > 1 && (
            <div className="absolute top-2 left-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                {(currentVideoIndex % featuredVideos.length) + 1}/
                {featuredVideos.length}
              </div>
            </div>
          )}
        </div>

        <div className="hover:text-[#032F60] transition-colors">
          <h4 className="text-[#1d2430] font-bold text-sm mb-2 line-clamp-2">
            {videoData.title || "Featured Video"}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#6f7d8f] text-xs">
              {videoData.channelTitle || "Safire Home Lending"}
            </span>
            {!!videoData.views && videoData.views > 0 && (
              <>
                <span className="text-[#6f7d8f] text-xs">•</span>
                <span className="text-[#6f7d8f] text-xs">
                  {Number(videoData.views).toLocaleString()} views
                </span>
              </>
            )}
          </div>
          <p className="text-[#6f7d8f] text-xs">
            {videoData.publishedAt
              ? new Date(videoData.publishedAt).toLocaleDateString()
              : "Recently added"}
          </p>
        </div>
      </div>

      {/* Video Player Dialog with YouTube iframe */}
      {showVideoDialog && videoData?.embedUrl && (
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <button
                onClick={() => setShowVideoDialog(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Close video player"
              >
                <X size={16} />
              </button>

              {/* YouTube iframe embed */}
              <iframe
                src={`${videoData.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={videoData.title || "Featured Video"}
              />

              {/* Video info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                <h3 className="text-white font-bold text-lg mb-2">
                  {videoData?.title || "Featured Video"}
                </h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span>
                    {videoData?.channelTitle || "Safire Home Lending"}
                  </span>
                  {!!videoData?.views && (
                    <>
                      <span>•</span>
                      <span>
                        {Number(videoData.views).toLocaleString()} views
                      </span>
                    </>
                  )}
                  {!!videoData?.publishedAt && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(videoData.publishedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
// Dashboard Content Component
function DashboardContent({
  user,
  userProfile,
  userPerformance,
  marketData,
  newsData,
  selectedUmbsRate,
  setSelectedUmbsRate,
  metricsView,
  setMetricsView,
  setActiveTab,
  activeAds,
  currentAdIndex,
  featuredVideoUrl,
  featuredVideos,
  currentVideoIndex,
  setShowCompensationWorkspace,
  setShowFIREFundWorkspace,
}) {
  // Mock user rank for demonstration - in real app this would come from user data
  const userRank = 3;

  // State for badge selection
  const [selectedBadgesForProfile, setSelectedBadgesForProfile] =
    React.useState([]);
  const [showBadgeSelector, setShowBadgeSelector] = React.useState(false);
  const [userBadges, setUserBadges] = React.useState([]);
  const [isUpdatingBadges, setIsUpdatingBadges] = React.useState(false);

  // Load selected badges from user profile
  React.useEffect(() => {
    const loadSelectedBadges = async () => {
      if (user?.id) {
        try {
          const selectedBadgeIds = await supabaseHelpers.getUserSelectedBadges(
            user.id,
          );
          setSelectedBadgesForProfile(selectedBadgeIds);
        } catch (error) {
          console.error("Error loading selected badges:", error);
        }
      }
    };

    loadSelectedBadges();
  }, [user?.id]);

  // Load user badges
  React.useEffect(() => {
    const loadUserBadges = async () => {
      if (user?.id) {
        try {
          const badges = await supabaseHelpers.getUserBadges(user.id);
          setUserBadges(badges);
        } catch (error) {
          console.error("Error loading user badges:", error);
        }
      }
    };

    loadUserBadges();
  }, [user?.id]);

  // Transform userBadges from database to match component expectations
  const transformedBadges = userBadges.map((userBadge) => ({
    id: userBadge.badges.id,
    name: userBadge.badges.name,
    description: userBadge.badges.description,
    category: userBadge.badges.criteria.toLowerCase().includes("performance")
      ? "performance"
      : userBadge.badges.criteria.toLowerCase().includes("leadership")
        ? "leadership"
        : userBadge.badges.criteria.toLowerCase().includes("milestone")
          ? "milestones"
          : "performance",
    image: `/tier-badges/tier-${
      userBadge.badges.rarity === "legendary"
        ? "gold"
        : userBadge.badges.rarity === "epic"
          ? "silver"
          : userBadge.badges.rarity === "rare"
            ? "bronze"
            : "basic"
    }.png`,
    obtained: true,
    count: userBadge.count || 1,
    rarity: userBadge.badges.rarity || "common",
    dateObtained: userBadge.date_obtained,
    requirements: userBadge.badges.requirements || userBadge.badges.criteria,
    reward: userBadge.badges.reward || "Recognition and achievement",
  }));

  const getSelectedBadgesForDisplay = () => {
    return transformedBadges
      .filter((badge) => selectedBadgesForProfile.includes(badge.id))
      .slice(0, 3);
  };

  const handleUpdateSelectedBadges = async (badgeIds) => {
    if (!user?.id) return;

    setIsUpdatingBadges(true);
    try {
      await supabaseHelpers.updateUserSelectedBadges(user.id, badgeIds);
      setSelectedBadgesForProfile(badgeIds);
      setShowBadgeSelector(false);
    } catch (error) {
      console.error("Error updating selected badges:", error);
    } finally {
      setIsUpdatingBadges(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500";
      case "epic":
        return "from-purple-400 to-pink-500";
      case "rare":
        return "from-blue-400 to-cyan-500";
      case "common":
        return "from-green-400 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return {
        image: "/tier-badges/tier-gold.png",
        label: "P1",
        bgColor: "from-yellow-400 to-yellow-600",
        textColor: "text-yellow-900",
      };
    } else if (rank === 2) {
      return {
        image: "/tier-badges/tier-silver.png",
        label: "P2",
        bgColor: "from-gray-300 to-gray-500",
        textColor: "text-gray-900",
      };
    } else if (rank === 3) {
      return {
        image: "/tier-badges/tier-bronze.png",
        label: "P3",
        bgColor: "from-amber-400 to-amber-600",
        textColor: "text-amber-900",
      };
    } else if (rank >= 4 && rank <= 20) {
      return {
        image: "/tier-badges/tier-qualifying.png",
        label: `P${rank}`,
        bgColor: "from-blue-400 to-blue-600",
        textColor: "text-blue-900",
      };
    } else {
      return {
        image: "/tier-badges/tier-basic.png",
        label: `#${rank}`,
        bgColor: "from-blue-200 to-blue-300",
        textColor: "text-blue-800",
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Content with Profile Card */}
      <div className="flex gap-6">
        {/* Left Side Profile Card */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 relative mx-auto mb-4">
                {/* Profile Image */}
                <div className="w-full h-full rounded-full overflow-hidden">
                  {userProfile?.avatar || user?.avatar ? (
                    <img
                      src={userProfile?.avatar || user?.avatar}
                      alt={userProfile?.name || user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-lg">
                      {(userProfile?.name || user?.name)?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-[#1d2430] mb-1">
                {userProfile?.name || user?.name || "User"}
              </h3>
              <p className="text-[#6f7d8f] text-sm mb-4">
                {userProfile?.role || user?.role || "User"}
              </p>

              {/* Badge Space */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-700">
                    Selected Badges
                  </h4>
                  <button
                    onClick={() => setShowBadgeSelector(true)}
                    className="text-xs text-[#032F60] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {getSelectedBadgesForDisplay().map((badge, index) => (
                    <div key={badge.id} className="relative">
                      <img
                        src={badge.image_url || badge.image}
                        alt={badge.name}
                        className="w-16 h-10 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-16 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500"
                        style={{ display: "none" }}
                      >
                        {badge.name.charAt(0)}
                      </div>
                      {badge.count > 1 && (
                        <div className="absolute -top-1 -right-1">
                          <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#032F60] text-white shadow-sm">
                            x{badge.count}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {Array.from({
                    length: 3 - getSelectedBadgesForDisplay().length,
                  }).map((_, index) => (
                    <div key={`empty-${index}`} className="relative">
                      <div className="w-16 h-10 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Empty</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="text-xs text-[#032F60] hover:underline font-semibold"
                  >
                    View All Badges →
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Toggle */}
            <div className="mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMetricsView("monthly")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-colors ${
                    metricsView === "monthly"
                      ? "bg-[#032F60] text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setMetricsView("ytd")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-colors ${
                    metricsView === "ytd"
                      ? "bg-[#032F60] text-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  YTD
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-3 mb-6">
              {/* Recruitment Tier Badge */}
              <div
                className={`bg-gradient-to-br border rounded-lg p-3 ${
                  (userPerformance?.recruitment_tier || 2) === 1
                    ? "from-yellow-50 to-amber-50 border-yellow-300"
                    : (userPerformance?.recruitment_tier || 2) === 2
                      ? "from-gray-50 to-slate-50 border-gray-300"
                      : (userPerformance?.recruitment_tier || 2) === 3
                        ? "from-amber-50 to-orange-50 border-amber-300"
                        : "from-blue-50 to-indigo-50 border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 bg-gradient-to-br rounded-full flex items-center justify-center shadow-sm ${
                        (userPerformance?.recruitment_tier || 2) === 1
                          ? "from-yellow-400 to-amber-500"
                          : (userPerformance?.recruitment_tier || 2) === 2
                            ? "from-gray-400 to-slate-500"
                            : (userPerformance?.recruitment_tier || 2) === 3
                              ? "from-amber-400 to-orange-500"
                              : "from-blue-400 to-indigo-500"
                      }`}
                    >
                      <span className="text-xs">
                        {(userPerformance?.recruitment_tier || 2) === 1
                          ? "🥇"
                          : (userPerformance?.recruitment_tier || 2) === 2
                            ? "🥈"
                            : (userPerformance?.recruitment_tier || 2) === 3
                              ? "🥉"
                              : "🎯"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        (userPerformance?.recruitment_tier || 2) === 1
                          ? "text-amber-700"
                          : (userPerformance?.recruitment_tier || 2) === 2
                            ? "text-slate-700"
                            : (userPerformance?.recruitment_tier || 2) === 3
                              ? "text-orange-700"
                              : "text-blue-700"
                      }`}
                    >
                      RECRUITMENT TIER
                    </span>
                  </div>
                  <div
                    className={`bg-gradient-to-r px-2 py-1 rounded-full shadow-sm ${
                      (userPerformance?.recruitment_tier || 2) === 1
                        ? "from-yellow-500 to-amber-500"
                        : (userPerformance?.recruitment_tier || 2) === 2
                          ? "from-gray-500 to-slate-500"
                          : (userPerformance?.recruitment_tier || 2) === 3
                            ? "from-amber-500 to-orange-500"
                            : "from-blue-500 to-indigo-500"
                    }`}
                  >
                    <span className="text-xs font-bold text-white">
                      TIER {userPerformance?.recruitment_tier || 2}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-[#1d2430] mb-1">
                  {(userPerformance?.recruitment_tier || 2) === 1
                    ? "Gold Status"
                    : (userPerformance?.recruitment_tier || 2) === 2
                      ? "Silver Status"
                      : (userPerformance?.recruitment_tier || 2) === 3
                        ? "Bronze Status"
                        : "Basic Status"}
                </div>
                <div
                  className={`text-xs ${
                    (userPerformance?.recruitment_tier || 2) === 1
                      ? "text-amber-600"
                      : (userPerformance?.recruitment_tier || 2) === 2
                        ? "text-slate-600"
                        : (userPerformance?.recruitment_tier || 2) === 3
                          ? "text-orange-600"
                          : "text-blue-600"
                  }`}
                >
                  {userPerformance?.active_recruits || 0} active recruits •
                  {userPerformance?.recruits_needed_for_next_tier || "N/A"}{" "}
                  needed for next tier
                </div>
              </div>

              {metricsView === "monthly" ? (
                <>
                  {/* Monthly Volume - Dynamic Position */}
                  <div
                    className={`bg-gradient-to-br border-2 rounded-lg p-3 relative overflow-hidden ${
                      (userPerformance?.rank || 3) <= 3
                        ? "from-amber-50 to-orange-50 border-amber-300"
                        : "from-gray-50 to-slate-50 border-gray-300"
                    }`}
                  >
                    {/* Background Pattern */}
                    <div
                      className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl to-transparent rounded-bl-full ${
                        (userPerformance?.rank || 3) <= 3
                          ? "from-amber-200/30"
                          : "from-gray-200/30"
                      }`}
                    ></div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 bg-gradient-to-br rounded-full flex items-center justify-center shadow-md border ${
                            (userPerformance?.rank || 3) <= 3
                              ? "from-amber-400 to-orange-500 border-amber-300"
                              : "from-gray-400 to-slate-500 border-gray-300"
                          }`}
                        >
                          <span className="text-xs">
                            {(userPerformance?.rank || 3) === 1
                              ? "🥇"
                              : (userPerformance?.rank || 3) === 2
                                ? "🥈"
                                : (userPerformance?.rank || 3) === 3
                                  ? "🥉"
                                  : "🎯"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            (userPerformance?.rank || 3) <= 3
                              ? "text-amber-700"
                              : "text-slate-700"
                          }`}
                        >
                          MONTHLY VOLUME
                        </span>
                      </div>
                      <div
                        className={`bg-gradient-to-r px-3 py-1 rounded-full shadow-md border ${
                          (userPerformance?.rank || 3) <= 3
                            ? "from-amber-500 to-orange-500 border-amber-300"
                            : "from-gray-500 to-slate-500 border-gray-300"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {(userPerformance?.rank || 3) <= 3
                            ? `P${userPerformance?.rank || 3}`
                            : `#${userPerformance?.rank || 3}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#1d2430] mb-1">
                      $
                      {(
                        Number(userPerformance?.monthly_volume || 0) / 1000000
                      ).toFixed(1)}
                      M
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        (userPerformance?.rank || 3) <= 3
                          ? "text-amber-700"
                          : "text-slate-700"
                      }`}
                    >
                      {(userPerformance?.rank || 3) <= 3
                        ? "🏁 PODIUM!"
                        : "Rank"}{" "}
                      •{userPerformance?.monthly_volume_gap || "N/A"}
                    </div>
                  </div>

                  {/* Monthly Loans - Dynamic Position */}
                  <div
                    className={`bg-gradient-to-br border-2 rounded-lg p-3 relative overflow-hidden ${
                      (userPerformance?.loans_rank || 2) <= 3
                        ? "from-gray-50 to-slate-50 border-gray-300"
                        : "from-blue-50 to-indigo-50 border-blue-300"
                    }`}
                  >
                    {/* Background Pattern */}
                    <div
                      className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl to-transparent rounded-bl-full ${
                        (userPerformance?.loans_rank || 2) <= 3
                          ? "from-gray-200/30"
                          : "from-blue-200/30"
                      }`}
                    ></div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 bg-gradient-to-br rounded-full flex items-center justify-center shadow-md border ${
                            (userPerformance?.loans_rank || 2) <= 3
                              ? "from-gray-400 to-slate-500 border-gray-300"
                              : "from-blue-400 to-indigo-500 border-blue-300"
                          }`}
                        >
                          <span className="text-xs">
                            {(userPerformance?.loans_rank || 2) === 1
                              ? "🥇"
                              : (userPerformance?.loans_rank || 2) === 2
                                ? "🥈"
                                : (userPerformance?.loans_rank || 2) === 3
                                  ? "🥉"
                                  : "📈"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            (userPerformance?.loans_rank || 2) <= 3
                              ? "text-slate-700"
                              : "text-blue-700"
                          }`}
                        >
                          MONTHLY LOANS
                        </span>
                      </div>
                      <div
                        className={`bg-gradient-to-r px-3 py-1 rounded-full shadow-md border ${
                          (userPerformance?.loans_rank || 2) <= 3
                            ? "from-gray-500 to-slate-500 border-gray-300"
                            : "from-blue-500 to-indigo-500 border-blue-300"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {(userPerformance?.loans_rank || 2) <= 3
                            ? `P${userPerformance?.loans_rank || 2}`
                            : `#${userPerformance?.loans_rank || 2}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#1d2430] mb-1">
                      {userPerformance?.monthly_loans || 0}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        (userPerformance?.loans_rank || 2) <= 3
                          ? "text-slate-700"
                          : "text-blue-700"
                      }`}
                    >
                      {(userPerformance?.loans_rank || 2) <= 3
                        ? "🏁 PODIUM!"
                        : "Rank"}{" "}
                      •{userPerformance?.monthly_loans_gap || "N/A"}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* YTD Volume - Dynamic Position */}
                  <div
                    className={`border rounded-lg p-3 ${
                      (userPerformance?.ytd_rank || 5) <= 3
                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            (userPerformance?.ytd_rank || 5) <= 3
                              ? "bg-amber-500"
                              : "bg-[#8b5cf6]"
                          }`}
                        >
                          <span className="text-xs">
                            {(userPerformance?.ytd_rank || 5) <= 3
                              ? "🏆"
                              : "🎯"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          YTD VOLUME
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full ${
                          (userPerformance?.ytd_rank || 5) <= 3
                            ? "bg-amber-500"
                            : "bg-[#8b5cf6]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {(userPerformance?.ytd_rank || 5) <= 3
                            ? `P${userPerformance?.ytd_rank || 5}`
                            : `#${userPerformance?.ytd_rank || 5}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#1d2430] mb-1">
                      $
                      {((userPerformance?.ytd_volume || 0) / 1000000).toFixed(
                        1,
                      )}
                      M
                    </div>
                    <div className="text-xs text-gray-500">
                      {userPerformance?.ytd_volume_gap || "N/A"}
                    </div>
                  </div>

                  {/* YTD Loans - Dynamic Position */}
                  <div
                    className={`border rounded-lg p-3 ${
                      (userPerformance?.ytd_loans_rank || 4) <= 3
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            (userPerformance?.ytd_loans_rank || 4) <= 3
                              ? "bg-green-500"
                              : "bg-[#dc2626]"
                          }`}
                        >
                          <span className="text-xs">
                            {(userPerformance?.ytd_loans_rank || 4) <= 3
                              ? "🏆"
                              : "📈"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          YTD LOANS
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full ${
                          (userPerformance?.ytd_loans_rank || 4) <= 3
                            ? "bg-green-500"
                            : "bg-[#dc2626]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {(userPerformance?.ytd_loans_rank || 4) <= 3
                            ? `P${userPerformance?.ytd_loans_rank || 4}`
                            : `#${userPerformance?.ytd_loans_rank || 4}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#1d2430] mb-1">
                      {userPerformance?.ytd_loans || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userPerformance?.ytd_loans_gap || "N/A"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badge Selector Modal */}
        {showBadgeSelector && (
          <BadgeSelectorModal
            badges={transformedBadges}
            selectedBadgeIds={selectedBadgesForProfile}
            onSave={handleUpdateSelectedBadges}
            onClose={() => setShowBadgeSelector(false)}
            isLoading={isUpdatingBadges}
          />
        )}

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          {/* Hero Banner - Active Ad or Placeholder */}
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg overflow-hidden">
            {activeAds.length > 0 ? (
              <div className="relative h-full">
                <img
                  src={activeAds[currentAdIndex]?.url}
                  alt={activeAds[currentAdIndex]?.name}
                  className="w-full h-full object-cover cursor-pointer transition-opacity duration-500"
                  onClick={() => {
                    if (activeAds[currentAdIndex]?.target_url) {
                      window.open(
                        activeAds[currentAdIndex].target_url,
                        "_blank",
                      );
                    }
                  }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                {/* Fallback placeholder */}
                <div
                  className="absolute inset-0 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                  style={{ display: "none" }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">📢</span>
                    </div>
                    <h2 className="text-gray-600 text-xl font-bold mb-2">
                      {activeAds[currentAdIndex]?.name || "Advertisement"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {activeAds[currentAdIndex]?.description ||
                        "Partner advertisement"}
                    </p>
                  </div>
                </div>
                {/* Ad overlay info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {activeAds[currentAdIndex]?.name}
                  </h3>
                  {activeAds[currentAdIndex]?.description && (
                    <p className="text-white/90 text-sm">
                      {activeAds[currentAdIndex].description}
                    </p>
                  )}
                </div>
                {/* Ad rotation indicators */}
                {activeAds.length > 1 && (
                  <div className="absolute top-4 right-4 flex gap-1">
                    {activeAds.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentAdIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">📢</span>
                  </div>
                  <h2 className="text-gray-600 text-xl font-bold mb-2">
                    No Active Advertisements
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Partner advertisements will appear here when available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured Video Card */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-[#032F60] font-extrabold text-sm mb-3">
                Featured Video
              </h3>
              <FeaturedVideoPlayer currentVideoIndex={currentVideoIndex || 0} />
            </div>

            {/* Market Card - Iframe Widget */}
            <div className="bg-white rounded-xl shadow-lg p-4 min-w-0">
              <div className="mb-3">
                <h3 className="text-[#032F60] font-extrabold text-sm">
                  Market Data
                </h3>
                <p className="text-[#6f7d8f] text-xs">
                  Average rates and product pricing
                </p>
              </div>
              <div className="flex justify-center">
                <div
                  className="mnd-rates-widget"
                  style={{
                    width: "215px",
                    height: "260px",
                    fontSize: "12px",
                    background: "#FFFFFF",
                    border: "1px solid #FFFFFF",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src="//widgets.mortgagenewsdaily.com/widget/f/rates?t=small&sc=true&c=2873bd&u=&cbu=&w=213&h=260"
                    width="215"
                    height="260"
                    frameBorder="0"
                    scrolling="no"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0,
                      display: "block",
                    }}
                    title="Mortgage Rates Widget"
                  />
                  {/* 3px white overlay at the bottom (click-through) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "3px",
                      background: "#FFFFFF",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* News Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-[#032F60] font-extrabold text-sm mb-3">
                News
              </h3>
              <h4 className="text-[#1d2430] font-extrabold text-sm mb-3 leading-tight">
                {newsData.title}
              </h4>
              <p className="text-[#6f7d8f] text-xs mb-4">{newsData.content}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveTab("news")}
                  className="text-[#1f6aa5] text-xs font-extrabold hover:underline"
                >
                  Read more
                </button>
                <span className="text-[#6f7d8f] text-xs">
                  {new Date(newsData.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Quick View Component */}
          <DashboardQuickView
            onExpandSpark={() => setActiveTab("spark-points")}
            onExpandCompensation={() => setShowCompensationWorkspace(true)}
            onExpandFire={() => setShowFIREFundWorkspace(true)}
          />
        </div>
      </div>
    </div>
  );
}
