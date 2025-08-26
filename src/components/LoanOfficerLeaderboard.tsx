import React, { useState, useEffect } from "react";
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  ChevronDown,
  Medal,
  Crown,
  Star,
  Flame,
  BarChart3,
  LineChart,
  Search,
  X,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";

interface LoanOfficer {
  id: string;
  name: string;
  avatar?: string;
  monthlyVolume: number;
  monthlyLoans: number;
  ytdVolume: number;
  ytdLoans: number;
  compensation: number;
  fireFund: number;
  recruitmentTier: number;
  activeRecruits: number;
  rank: number;
}

const mockLoanOfficers: LoanOfficer[] = [
  {
    id: "1",
    name: "Jimmy Hendrix",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    monthlyVolume: 2400000,
    monthlyLoans: 24,
    ytdVolume: 18700000,
    ytdLoans: 187,
    compensation: 45000,
    fireFund: 12500,
    recruitmentTier: 2,
    activeRecruits: 7,
    rank: 3,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    monthlyVolume: 3200000,
    monthlyLoans: 28,
    ytdVolume: 24500000,
    ytdLoans: 245,
    compensation: 62000,
    fireFund: 18200,
    recruitmentTier: 3,
    activeRecruits: 12,
    rank: 1,
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    monthlyVolume: 2700000,
    monthlyLoans: 27,
    ytdVolume: 21300000,
    ytdLoans: 213,
    compensation: 54000,
    fireFund: 15800,
    recruitmentTier: 2,
    activeRecruits: 8,
    rank: 2,
  },
  {
    id: "4",
    name: "Emily Chen",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    monthlyVolume: 2100000,
    monthlyLoans: 22,
    ytdVolume: 16800000,
    ytdLoans: 168,
    compensation: 38000,
    fireFund: 11200,
    recruitmentTier: 1,
    activeRecruits: 4,
    rank: 4,
  },
  {
    id: "5",
    name: "David Thompson",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    monthlyVolume: 1900000,
    monthlyLoans: 20,
    ytdVolume: 15200000,
    ytdLoans: 152,
    compensation: 34000,
    fireFund: 9800,
    recruitmentTier: 1,
    activeRecruits: 3,
    rank: 5,
  },
];

export default function LoanOfficerLeaderboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedMetric, setSelectedMetric] = useState("volume");
  const [users, setUsers] = useState<Tables<"users">[]>([]);
  const [userPerformance, setUserPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphPeriod, setGraphPeriod] = useState<
    "months" | "quarters" | "years" | "ytd"
  >("months");
  const [graphMetric, setGraphMetric] = useState<
    "volume" | "loans" | "compensation" | "fireFund"
  >("volume");
  const [graphLoading, setGraphLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<LoanOfficer | null>(null);
  const [selectedUserBadges, setSelectedUserBadges] = useState<any[]>([]);
  const [selectedUserGraphData, setSelectedUserGraphData] = useState<any[]>([]);
  const [detailViewLoading, setDetailViewLoading] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, performanceData] = await Promise.all([
          supabaseHelpers.getUsers(),
          supabaseHelpers.getAllUserPerformance(),
        ]);

        setUsers(usersData || []);
        setUserPerformance(performanceData || []);
      } catch (err) {
        console.error("Error loading leaderboard data:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load graph data when period or user changes
  useEffect(() => {
    const loadGraphData = async () => {
      if (!user?.id) return;

      try {
        setGraphLoading(true);
        const data = await supabaseHelpers.getUserPerformanceGraphData(
          user.id,
          graphPeriod,
          graphPeriod === "ytd"
            ? 12
            : graphPeriod === "years"
              ? 5
              : graphPeriod === "quarters"
                ? 8
                : 12,
        );
        setGraphData(data);
      } catch (err) {
        console.error("Error loading graph data:", err);
        // Use mock data on error
        setGraphData(supabaseHelpers.getMockPerformanceData(graphPeriod, 12));
      } finally {
        setGraphLoading(false);
      }
    };

    loadGraphData();
  }, [user?.id, graphPeriod]);

  // Transform data for leaderboard display
  const loanOfficers = users.map((userData, index) => {
    const performance =
      userPerformance.find((p) => p.user_id === userData.id) || {};
    return {
      id: userData.id,
      name: userData.name || "Unknown User",
      avatar: userData.avatar,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      nmlsNumber: userData.nmls_number,
      clientFacingTitle: userData.client_facing_title,
      createdAt: userData.created_at,
      monthlyVolume: performance.monthly_volume || 0,
      monthlyLoans: performance.monthly_loans || 0,
      ytdVolume: performance.ytd_volume || 0,
      ytdLoans: performance.ytd_loans || 0,
      compensation: performance.compensation || 0,
      fireFund: performance.fire_fund || 0,
      recruitmentTier: performance.recruitment_tier || 0,
      activeRecruits: performance.active_recruits || 0,
      rank: performance.rank || index + 1,
    };
  });

  const currentUser =
    loanOfficers.find((officer) => officer.name === user?.name) ||
    loanOfficers[0];

  const getRankBadge = (rank: number) => {
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

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 0:
        return {
          label: "No Tier",
          color: "bg-gray-100 text-gray-600",
          icon: "⚪",
        };
      case 1:
        return {
          label: "Bronze",
          color: "bg-amber-100 text-amber-700",
          icon: "🥉",
        };
      case 2:
        return {
          label: "Silver",
          color: "bg-gray-100 text-gray-700",
          icon: "🥈",
        };
      case 3:
        return {
          label: "Gold",
          color: "bg-yellow-100 text-yellow-700",
          icon: "🥇",
        };
      default:
        return {
          label: "No Tier",
          color: "bg-gray-100 text-gray-600",
          icon: "⚪",
        };
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return `${amount.toLocaleString()}`;
  };

  const formatPeriodLabel = (period: string) => {
    if (period.includes("Q")) {
      return period; // Already formatted for quarters
    }
    if (period.length === 4) {
      return period; // Year format
    }
    // Month format: 2024-01 -> Jan 2024
    const [year, month] = period.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getGraphValue = (dataPoint: any) => {
    switch (graphMetric) {
      case "loans":
        return dataPoint.loans;
      case "compensation":
        return dataPoint.compensation;
      case "fireFund":
        return dataPoint.fireFund;
      default:
        return dataPoint.volume;
    }
  };

  const formatGraphValue = (value: number) => {
    if (graphMetric === "loans") {
      return value.toString();
    }
    return formatCurrency(value);
  };

  const getMaxValue = () => {
    if (graphData.length === 0) return 100;

    const values = graphData.map(getGraphValue);
    const maxValue = Math.max(...values);

    // For loans, use a more appropriate scale
    if (graphMetric === "loans") {
      // Round up to nearest 10 for loans
      const roundedMax = Math.ceil(maxValue / 10) * 10;
      return Math.max(roundedMax, 20); // Ensure at least 20 for visibility
    }

    // For other metrics, use percentage-based scaling
    if (maxValue === 0) {
      return 100; // Default scale if all values are 0
    }

    // Add 15% padding to the max value (since min is always 0)
    return maxValue * 1.15;
  };

  const generateCurvePath = () => {
    if (graphData.length === 0) return "";

    const width = 800;
    const height = 200;
    const padding = 40;
    const values = graphData.map(getGraphValue);
    const minValue = 0; // Always start from 0
    const maxValue = getMaxValue();
    const range = maxValue - minValue;

    // For YTD and months, data should be in chronological order (oldest to newest)
    // For other periods, reverse to show most recent on the right
    let orderedData;
    if (graphPeriod === "ytd" || graphPeriod === "months") {
      // Sort chronologically for YTD and months
      orderedData = [...graphData].sort((a, b) =>
        a.period.localeCompare(b.period),
      );
    } else {
      // Reverse for quarters and years to show most recent on the right
      orderedData = [...graphData].reverse();
    }

    const points = orderedData.map((dataPoint, index) => {
      const x =
        padding + (index * (width - 2 * padding)) / (orderedData.length - 1);
      const normalizedValue =
        range > 0 ? (getGraphValue(dataPoint) - minValue) / range : 0.5;
      const y = height - padding - normalizedValue * (height - 2 * padding);
      return {
        x,
        y,
        value: getGraphValue(dataPoint),
        originalIndex: graphData.findIndex(
          (item) => item.period === dataPoint.period,
        ),
      };
    });

    if (points.length < 2) return "";

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (i === 1) {
        // First curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        // Subsequent curves
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      }
    }

    return { path, points, width, height, maxValue, orderedData };
  };

  // Filter and sort officers
  const filteredOfficers = loanOfficers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (officer.role &&
        officer.role.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
    if (selectedPeriod === "monthly") {
      return selectedMetric === "volume"
        ? b.monthlyVolume - a.monthlyVolume
        : b.monthlyLoans - a.monthlyLoans;
    } else {
      return selectedMetric === "volume"
        ? b.ytdVolume - a.ytdVolume
        : b.ytdLoans - a.ytdLoans;
    }
  });

  // Load detailed user data when user is selected
  const loadUserDetails = async (officer: LoanOfficer) => {
    setDetailViewLoading(true);
    setSelectedUser(officer);

    try {
      // Load user badges
      const badges = await supabaseHelpers.getUserBadges(officer.id);
      setSelectedUserBadges(badges || []);

      // Load user performance graph data
      const performanceData = await supabaseHelpers.getUserPerformanceGraphData(
        officer.id,
        "months",
        12,
      );
      setSelectedUserGraphData(performanceData || []);
    } catch (error) {
      console.error("Error loading user details:", error);
      // Use mock data on error
      setSelectedUserBadges([]);
      setSelectedUserGraphData(
        supabaseHelpers.getMockPerformanceData("months", 12),
      );
    } finally {
      setDetailViewLoading(false);
    }
  };

  // Calculate time at company
  const getTimeAtCompany = (createdAt: string | null) => {
    if (!createdAt) return "Unknown";

    const startDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}` : ""}`;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-full bg-workspace p-1 sm:p-2 lg:p-3 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full bg-workspace p-1 sm:p-2 lg:p-3 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#032F60] text-white rounded hover:bg-[#1a4a73]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-workspace p-1 sm:p-2 lg:p-3 overflow-auto">
      <div className="w-full max-w-none space-y-1 sm:space-y-2 lg:space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base lg:text-xl font-extrabold text-[#1d2430] mb-0.5 truncate">
              Loan Officer Statistics
            </h1>
            <p className="text-gray-600 text-xs hidden sm:block">
              Track performance, leaderboards, and personal production metrics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search officers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 pr-8 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#032F60] focus:border-transparent w-32 sm:w-40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={10} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 hidden sm:inline">
                Period:
              </span>
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-medium cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#032F60] focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="ytd">YTD</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 hidden sm:inline">
                Metric:
              </span>
              <div className="relative">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-medium cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#032F60] focus:border-transparent"
                >
                  <option value="volume">Volume</option>
                  <option value="loans">Loans</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Performance Card */}
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#1d2430] truncate">
                {currentUser.name} - Personal Performance
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative">
                  <img
                    src={getRankBadge(currentUser.rank).image}
                    alt={`Rank ${currentUser.rank}`}
                    className="w-16 h-10 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="absolute top-1 right-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRankBadge(currentUser.rank).bgColor} ${getRankBadge(currentUser.rank).textColor} shadow-sm`}
                    >
                      {getRankBadge(currentUser.rank).label}
                    </span>
                  </div>
                  <div
                    className="w-16 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500"
                    style={{ display: "none" }}
                  >
                    {getRankBadge(currentUser.rank).label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Grid - Wraps metrics into multiple rows on smaller screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
            {/* Monthly Volume */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <TrendingUp className="w-2 h-2 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">MTH</span>
              </div>
              <div className="text-xs font-extrabold text-[#1d2430] mb-0.5">
                {formatCurrency(currentUser.monthlyVolume)}
              </div>
              <div className="text-xs text-blue-600">
                {currentUser.monthlyLoans}
              </div>
            </div>

            {/* YTD Volume */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Target className="w-2 h-2 text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  YTD
                </span>
              </div>
              <div className="text-xs font-extrabold text-[#1d2430] mb-0.5">
                {formatCurrency(currentUser.ytdVolume)}
              </div>
              <div className="text-xs text-green-600">
                {currentUser.ytdLoans}
              </div>
            </div>

            {/* Fire Fund */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Flame className="w-2 h-2 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700">
                  FIRE
                </span>
              </div>
              <div className="text-xs font-extrabold text-[#1d2430] mb-0.5">
                {formatCurrency(currentUser.fireFund)}
              </div>
              <div className="text-xs text-orange-600">Total</div>
            </div>

            {/* Recruitment */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Users className="w-2 h-2 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">
                  REC
                </span>
              </div>
              <div className="text-xs font-extrabold text-[#1d2430] mb-0.5">
                {currentUser.activeRecruits}
              </div>
              <div className="text-xs text-indigo-600">Active</div>
            </div>

            {/* Tier */}
            <div
              className={`bg-gradient-to-br rounded p-1.5 sm:p-2 ${getTierBadge(currentUser.recruitmentTier).color.includes("gray") ? "from-gray-50 to-gray-100" : getTierBadge(currentUser.recruitmentTier).color.includes("amber") ? "from-amber-50 to-amber-100" : getTierBadge(currentUser.recruitmentTier).color.includes("yellow") ? "from-yellow-50 to-yellow-100" : "from-gray-50 to-gray-100"}`}
            >
              <div className="flex items-center gap-0.5 mb-0.5">
                <Star
                  className={`w-2 h-2 ${getTierBadge(currentUser.recruitmentTier).color.includes("gray") ? "text-gray-600" : getTierBadge(currentUser.recruitmentTier).color.includes("amber") ? "text-amber-600" : "text-yellow-600"}`}
                />
                <span
                  className={`text-xs font-semibold ${getTierBadge(currentUser.recruitmentTier).color.includes("gray") ? "text-gray-700" : getTierBadge(currentUser.recruitmentTier).color.includes("amber") ? "text-amber-700" : "text-yellow-700"}`}
                >
                  TIER
                </span>
              </div>
              <div className="text-xs font-extrabold text-[#1d2430] mb-0.5">
                {getTierBadge(currentUser.recruitmentTier).icon}
              </div>
              <div
                className={`text-xs ${getTierBadge(currentUser.recruitmentTier).color.includes("gray") ? "text-gray-600" : getTierBadge(currentUser.recruitmentTier).color.includes("amber") ? "text-amber-600" : "text-yellow-600"}`}
              >
                {getTierBadge(currentUser.recruitmentTier).label}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Graph */}
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1d2430] mb-1 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[#032F60]" />
                Performance Visualization
              </h3>
              <p className="text-xs text-gray-600 hidden sm:block">
                Track your {graphMetric} performance over time
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 hidden sm:inline">
                  Period:
                </span>
                <div className="relative">
                  <select
                    value={graphPeriod}
                    onChange={(e) => setGraphPeriod(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-medium cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#032F60] focus:border-transparent"
                  >
                    <option value="months">Months</option>
                    <option value="quarters">Quarters</option>
                    <option value="years">Years</option>
                    <option value="ytd">YTD</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 hidden sm:inline">
                  Metric:
                </span>
                <div className="relative">
                  <select
                    value={graphMetric}
                    onChange={(e) => setGraphMetric(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 pr-6 text-xs font-medium cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#032F60] focus:border-transparent"
                  >
                    <option value="volume">Volume</option>
                    <option value="loans">Loans</option>
                    <option value="compensation">Compensation</option>
                    <option value="fireFund">FIRE Fund</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Graph Container */}
          <div className="relative bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-x-auto">
            {graphLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60] mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Loading graph...</p>
                </div>
              </div>
            ) : graphData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <BarChart3 size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-600">No data available</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <svg
                  viewBox="0 0 800 200"
                  className="w-full h-[200px]"
                  style={{ minWidth: "600px" }}
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern
                      id="grid"
                      width="80"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 80 0 L 0 0 0 40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Gradient definition for area under curve */}
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#032F60" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#032F60"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>

                  {(() => {
                    const curveData = generateCurvePath();
                    if (!curveData || !curveData.path) return null;

                    const {
                      path,
                      points,
                      width,
                      height,
                      maxValue,
                      orderedData,
                    } = curveData;
                    const padding = 40;
                    const values = graphData.map(getGraphValue);
                    const minValue = 0; // Always start from 0
                    const actualMaxValue = getMaxValue();
                    const range = actualMaxValue - minValue;

                    return (
                      <g>
                        {/* Area under curve */}
                        <path
                          d={`${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                          fill="url(#areaGradient)"
                        />

                        {/* Main curve line */}
                        <path
                          d={path}
                          fill="none"
                          stroke="#032F60"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="#032F60"
                              stroke="white"
                              strokeWidth="2"
                              className="hover:r-6 transition-all cursor-pointer"
                            />
                            {/* Hover tooltip */}
                            <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                              <rect
                                x={point.x - 30}
                                y={point.y - 35}
                                width="60"
                                height="25"
                                fill="#1f2937"
                                rx="4"
                              />
                              <text
                                x={point.x}
                                y={point.y - 18}
                                textAnchor="middle"
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                {formatGraphValue(point.value)}
                              </text>
                            </g>
                          </g>
                        ))}

                        {/* Y-axis labels */}
                        {(() => {
                          const maxValue = getMaxValue();
                          const minValue = 0; // Always start from 0
                          const range = maxValue - minValue;

                          return [0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const y =
                              height - padding - ratio * (height - 2 * padding);
                            const value = minValue + range * ratio;
                            return (
                              <g key={index}>
                                <text
                                  x={padding - 10}
                                  y={y + 3}
                                  textAnchor="end"
                                  fill="#6b7280"
                                  fontSize="10"
                                >
                                  {formatGraphValue(value)}
                                </text>
                              </g>
                            );
                          });
                        })()}

                        {/* X-axis labels */}
                        {points.map((point, index) => {
                          if (
                            index % Math.ceil(points.length / 6) === 0 ||
                            index === points.length - 1
                          ) {
                            return (
                              <text
                                key={index}
                                x={point.x}
                                y={height - padding + 15}
                                textAnchor="middle"
                                fill="#6b7280"
                                fontSize="10"
                              >
                                {formatPeriodLabel(orderedData[index].period)}
                              </text>
                            );
                          }
                          return null;
                        })}
                      </g>
                    );
                  })()}
                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center mt-2 gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#032F60] rounded-full"></div>
                    <span className="capitalize">
                      {graphMetric}{" "}
                      {graphPeriod === "ytd"
                        ? "YTD"
                        : `by ${graphPeriod.slice(0, -1)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 sm:p-3 border-b border-gray-200">
            <div className="flex items-center gap-1 sm:gap-2">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-[#032F60]" />
              <h2 className="text-xs sm:text-sm font-extrabold text-[#1d2430]">
                Leaderboard - {selectedPeriod === "monthly" ? "Monthly" : "YTD"}{" "}
                {selectedMetric === "volume" ? "Volume" : "Loans"}
              </h2>
            </div>
          </div>

          {/* Mobile/Tablet Card Layout */}
          <div className="block lg:hidden">
            {sortedOfficers.map((officer, index) => {
              const isCurrentUser = officer.name === user?.name;
              const tierBadge = getTierBadge(officer.recruitmentTier);

              return (
                <div
                  key={officer.id}
                  className={`p-2 border-b border-gray-200 ${
                    isCurrentUser
                      ? "bg-blue-50 border-l-2 border-[#032F60]"
                      : ""
                  }`}
                >
                  {/* First Row - Name and Rank */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        {officer.avatar ? (
                          <img
                            src={officer.avatar}
                            alt={officer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-xs">
                            {officer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => loadUserDetails(officer)}
                          className={`text-xs font-semibold truncate max-w-32 hover:underline cursor-pointer text-left ${
                            isCurrentUser ? "text-[#032F60]" : "text-gray-900"
                          }`}
                        >
                          {officer.name}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs bg-[#032F60] text-white px-1 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="relative">
                        <img
                          src={getRankBadge(index + 1).image}
                          alt={`Rank ${index + 1}`}
                          className="w-12 h-7 object-cover rounded shadow-sm"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="absolute top-0 right-0">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRankBadge(index + 1).bgColor} ${getRankBadge(index + 1).textColor} shadow-sm`}
                          >
                            {getRankBadge(index + 1).label}
                          </span>
                        </div>
                        <div
                          className="w-12 h-7 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500"
                          style={{ display: "none" }}
                        >
                          {getRankBadge(index + 1).label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row - Compact Metrics */}
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-xs">
                        {selectedMetric === "volume"
                          ? formatCurrency(
                              selectedPeriod === "monthly"
                                ? officer.monthlyVolume
                                : officer.ytdVolume,
                            )
                          : (selectedPeriod === "monthly"
                              ? officer.monthlyLoans
                              : officer.ytdLoans
                            ).toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {selectedMetric === "volume" ? "Vol" : "Loans"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-xs">
                        {officer.activeRecruits}
                      </div>
                      <div className="text-gray-500 text-xs">Rec</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs">{tierBadge.icon}</div>
                      <div className="text-gray-500 text-xs">
                        {tierBadge.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout - More Compact */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    Officer
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    {selectedMetric === "volume" ? "Vol" : "Loans"}
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    Fire
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    Rec
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-bold text-gray-600 uppercase">
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOfficers.map((officer, index) => {
                  const isCurrentUser = officer.name === user?.name;
                  const tierBadge = getTierBadge(officer.recruitmentTier);

                  return (
                    <tr
                      key={officer.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isCurrentUser
                          ? "bg-blue-50 border-l-2 border-[#032F60]"
                          : ""
                      }`}
                    >
                      <td className="px-1 py-1 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          <div className="relative">
                            <img
                              src={getRankBadge(index + 1).image}
                              alt={`Rank ${index + 1}`}
                              className="w-10 h-6 object-cover rounded shadow-sm"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div className="absolute top-0 right-0">
                              <span
                                className={`px-1 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRankBadge(index + 1).bgColor} ${getRankBadge(index + 1).textColor} shadow-sm`}
                              >
                                {getRankBadge(index + 1).label}
                              </span>
                            </div>
                            <div
                              className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500"
                              style={{ display: "none" }}
                            >
                              {getRankBadge(index + 1).label}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                            {officer.avatar ? (
                              <img
                                src={officer.avatar}
                                alt={officer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-xs">
                                {officer.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => loadUserDetails(officer)}
                              className={`text-xs font-semibold truncate max-w-32 hover:underline cursor-pointer text-left ${
                                isCurrentUser
                                  ? "text-[#032F60]"
                                  : "text-gray-900"
                              }`}
                            >
                              {officer.name}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs bg-[#032F60] text-white px-1 py-0.5 rounded-full">
                                  YOU
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-900">
                          {selectedMetric === "volume"
                            ? formatCurrency(
                                selectedPeriod === "monthly"
                                  ? officer.monthlyVolume
                                  : officer.ytdVolume,
                              )
                            : (selectedPeriod === "monthly"
                                ? officer.monthlyLoans
                                : officer.ytdLoans
                              ).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-900">
                          {formatCurrency(officer.fireFund)}
                        </div>
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-900">
                          {officer.activeRecruits}
                        </div>
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap">
                        <div className="text-xs">{tierBadge.icon}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-lg">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1d2430]">
                      {selectedUser.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedUser.role || selectedUser.clientFacingTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {detailViewLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032F60] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user details...</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* User Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact & Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[#1d2430] mb-3 flex items-center gap-2">
                        <User size={18} className="text-[#032F60]" />
                        Contact Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-500" />
                          <span>{selectedUser.email}</span>
                        </div>
                        {selectedUser.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-500" />
                            <span>{selectedUser.phone}</span>
                          </div>
                        )}
                        {selectedUser.department && (
                          <div className="flex items-center gap-2">
                            <Building size={14} className="text-gray-500" />
                            <span>{selectedUser.department}</span>
                          </div>
                        )}
                        {selectedUser.nmlsNumber && (
                          <div className="flex items-center gap-2">
                            <Award size={14} className="text-gray-500" />
                            <span>NMLS: {selectedUser.nmlsNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-500" />
                          <span>
                            Time at Company:{" "}
                            {getTimeAtCompany(selectedUser.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-[#1d2430] mb-3 flex items-center gap-2">
                        <BarChart3 size={18} className="text-[#032F60]" />
                        Performance Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded p-3 text-center">
                          <div className="text-lg font-bold text-[#1d2430]">
                            {formatCurrency(selectedUser.monthlyVolume)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Monthly Volume
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <div className="text-lg font-bold text-[#1d2430]">
                            {selectedUser.monthlyLoans}
                          </div>
                          <div className="text-xs text-gray-600">
                            Monthly Loans
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <div className="text-lg font-bold text-[#1d2430]">
                            {formatCurrency(selectedUser.ytdVolume)}
                          </div>
                          <div className="text-xs text-gray-600">
                            YTD Volume
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <div className="text-lg font-bold text-[#1d2430]">
                            {selectedUser.ytdLoans}
                          </div>
                          <div className="text-xs text-gray-600">YTD Loans</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#1d2430] mb-3 flex items-center gap-2">
                      <Award size={18} className="text-[#032F60]" />
                      Achievements & Badges
                    </h3>
                    {selectedUserBadges.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedUserBadges.map((userBadge, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 text-center border"
                          >
                            <div className="text-2xl mb-2">
                              {userBadge.badges?.icon || "🏆"}
                            </div>
                            <div className="text-sm font-semibold text-[#1d2430] mb-1">
                              {userBadge.badges?.name || "Achievement"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {userBadge.badges?.description || "Great work!"}
                            </div>
                            {userBadge.count > 1 && (
                              <div className="text-xs text-[#032F60] font-semibold mt-1">
                                x{userBadge.count}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Award
                          size={32}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p>No badges earned yet</p>
                        <p className="text-xs">
                          Keep working hard to earn your first badge!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Performance Graphs */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#1d2430] mb-3 flex items-center gap-2">
                      <LineChart size={18} className="text-[#032F60]" />
                      Performance Trends
                    </h3>

                    {/* Volume Graph */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold text-[#1d2430] mb-3">
                        Volume Performance
                      </h4>
                      <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                        {selectedUserGraphData.length > 0 ? (
                          <svg viewBox="0 0 400 150" className="w-full h-full">
                            <defs>
                              <linearGradient
                                id="volumeGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#032F60"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#032F60"
                                  stopOpacity="0.05"
                                />
                              </linearGradient>
                            </defs>
                            {(() => {
                              const maxVolume = Math.max(
                                ...selectedUserGraphData.map((d) => d.volume),
                              );
                              const points = selectedUserGraphData.map(
                                (d, i) => {
                                  const x =
                                    50 +
                                    (i * 300) /
                                      (selectedUserGraphData.length - 1);
                                  const y = 130 - (d.volume / maxVolume) * 100;
                                  return { x, y, value: d.volume };
                                },
                              );
                              const pathData = points
                                .map(
                                  (p, i) =>
                                    `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
                                )
                                .join(" ");
                              return (
                                <g>
                                  <path
                                    d={`${pathData} L ${points[points.length - 1].x} 130 L 50 130 Z`}
                                    fill="url(#volumeGradient)"
                                  />
                                  <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#032F60"
                                    strokeWidth="2"
                                  />
                                  {points.map((p, i) => (
                                    <circle
                                      key={i}
                                      cx={p.x}
                                      cy={p.y}
                                      r="3"
                                      fill="#032F60"
                                    />
                                  ))}
                                </g>
                              );
                            })()}
                          </svg>
                        ) : (
                          <div className="text-center text-gray-500">
                            <BarChart3 size={32} className="mx-auto mb-2" />
                            <p>No volume data available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loans Graph */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold text-[#1d2430] mb-3">
                        Loan Count Performance
                      </h4>
                      <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                        {selectedUserGraphData.length > 0 ? (
                          <svg viewBox="0 0 400 150" className="w-full h-full">
                            <defs>
                              <linearGradient
                                id="loansGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#10B981"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#10B981"
                                  stopOpacity="0.05"
                                />
                              </linearGradient>
                            </defs>
                            {(() => {
                              const maxLoans = Math.max(
                                ...selectedUserGraphData.map((d) => d.loans),
                              );
                              const points = selectedUserGraphData.map(
                                (d, i) => {
                                  const x =
                                    50 +
                                    (i * 300) /
                                      (selectedUserGraphData.length - 1);
                                  const y = 130 - (d.loans / maxLoans) * 100;
                                  return { x, y, value: d.loans };
                                },
                              );
                              const pathData = points
                                .map(
                                  (p, i) =>
                                    `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
                                )
                                .join(" ");
                              return (
                                <g>
                                  <path
                                    d={`${pathData} L ${points[points.length - 1].x} 130 L 50 130 Z`}
                                    fill="url(#loansGradient)"
                                  />
                                  <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                  />
                                  {points.map((p, i) => (
                                    <circle
                                      key={i}
                                      cx={p.x}
                                      cy={p.y}
                                      r="3"
                                      fill="#10B981"
                                    />
                                  ))}
                                </g>
                              );
                            })()}
                          </svg>
                        ) : (
                          <div className="text-center text-gray-500">
                            <BarChart3 size={32} className="mx-auto mb-2" />
                            <p>No loan data available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FIRE Fund Graph */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-md font-semibold text-[#1d2430] mb-3">
                        FIRE Fund Performance
                      </h4>
                      <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                        {selectedUserGraphData.length > 0 ? (
                          <svg viewBox="0 0 400 150" className="w-full h-full">
                            <defs>
                              <linearGradient
                                id="fireGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#F59E0B"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#F59E0B"
                                  stopOpacity="0.05"
                                />
                              </linearGradient>
                            </defs>
                            {(() => {
                              const maxFire = Math.max(
                                ...selectedUserGraphData.map((d) => d.fireFund),
                              );
                              const points = selectedUserGraphData.map(
                                (d, i) => {
                                  const x =
                                    50 +
                                    (i * 300) /
                                      (selectedUserGraphData.length - 1);
                                  const y = 130 - (d.fireFund / maxFire) * 100;
                                  return { x, y, value: d.fireFund };
                                },
                              );
                              const pathData = points
                                .map(
                                  (p, i) =>
                                    `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
                                )
                                .join(" ");
                              return (
                                <g>
                                  <path
                                    d={`${pathData} L ${points[points.length - 1].x} 130 L 50 130 Z`}
                                    fill="url(#fireGradient)"
                                  />
                                  <path
                                    d={pathData}
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="2"
                                  />
                                  {points.map((p, i) => (
                                    <circle
                                      key={i}
                                      cx={p.x}
                                      cy={p.y}
                                      r="3"
                                      fill="#F59E0B"
                                    />
                                  ))}
                                </g>
                              );
                            })()}
                          </svg>
                        ) : (
                          <div className="text-center text-gray-500">
                            <Flame size={32} className="mx-auto mb-2" />
                            <p>No FIRE fund data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Me Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#1d2430] mb-3 flex items-center gap-2">
                      <User size={18} className="text-[#032F60]" />
                      About Me
                    </h3>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {/* This would come from a user profile field in the future */}
                        &quot;I'm passionate about helping clients achieve their
                        homeownership dreams. With{" "}
                        {getTimeAtCompany(selectedUser.createdAt)} at the
                        company, I've built strong relationships and
                        consistently delivered exceptional results. I believe in
                        the power of teamwork and continuous learning to drive
                        success.&quot;
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Recruitment Tier:{" "}
                            {getTierBadge(selectedUser.recruitmentTier).label}
                          </span>
                          <span>
                            Active Recruits: {selectedUser.activeRecruits}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
