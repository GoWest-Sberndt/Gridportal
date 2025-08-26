import React, { useState, useEffect } from "react";
import {
  Zap,
  Target,
  Activity,
  Gift,
  Video,
  BookOpen,
  MessageSquare,
  UserPlus,
  FileText,
  Upload,
  X,
  Coins,
  Flame,
  CheckCircle,
  Star,
  Trophy,
  Award,
  Plus,
  Camera,
  Share,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Play,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function SparkPointsWorkspace() {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [sparkPointsBalance, setSparkPointsBalance] = useState(2450);
  const [weeklyPointsEarned, setWeeklyPointsEarned] = useState(180);
  const [weeklyPointsCap] = useState(500);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      multiplier: 1.5, // Current week multiplier
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
      multiplier: 1.5, // Current week multiplier
    },
    {
      id: 7,
      category: "Content",
      title: "Share Company Post",
      description: "Share and engage with company social media posts",
      points: 25,
      icon: Share,
      color: "bg-purple-500",
      verification: "Screenshot of share",
      multiplier: 1.5, // Current week multiplier
    },
    {
      id: 8,
      category: "Outreach",
      title: "Referral Partner Meeting",
      description: "Meet with real estate agents or other referral partners",
      points: 100,
      icon: Users,
      color: "bg-green-500",
      verification: "Meeting notes or photo",
    },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      activity: "Posted social video",
      points: 150, // With multiplier
      originalPoints: 100,
      date: "2 hours ago",
      status: "approved",
      multiplier: 1.5,
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
      points: 225, // With multiplier
      originalPoints: 150,
      date: "3 days ago",
      status: "approved",
      multiplier: 1.5,
    },
    {
      id: 5,
      activity: "Shared company post",
      points: 38, // With multiplier
      originalPoints: 25,
      date: "4 days ago",
      status: "approved",
      multiplier: 1.5,
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
      category: "merchandise",
    },
    {
      id: 2,
      name: "Co-op Ad Credit",
      description: "$100 credit for co-op advertising campaigns",
      points: 1000,
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop",
      available: true,
      category: "business",
    },
    {
      id: 3,
      name: "1:1 Coaching Session",
      description: "Personal coaching session with senior leadership",
      points: 1500,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=150&fit=crop",
      available: true,
      category: "development",
    },
    {
      id: 4,
      name: "Priority Lead Routing",
      description: "Get priority access to incoming leads for 1 week",
      points: 2000,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop",
      available: true,
      category: "business",
    },
    {
      id: 5,
      name: "Premium Training Access",
      description: "Unlock premium training modules and resources",
      points: 3000,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=150&fit=crop",
      available: false,
      category: "development",
    },
    {
      id: 6,
      name: "Conference Ticket",
      description: "Free ticket to annual mortgage industry conference",
      points: 5000,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=150&fit=crop",
      available: false,
      category: "development",
    },
    {
      id: 7,
      name: "Amazon Gift Card ($50)",
      description: "$50 Amazon gift card for personal use",
      points: 750,
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=150&fit=crop",
      available: true,
      category: "gift-cards",
    },
    {
      id: 8,
      name: "Starbucks Gift Card ($25)",
      description: "$25 Starbucks gift card for your coffee needs",
      points: 400,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=150&fit=crop",
      available: true,
      category: "gift-cards",
    },
  ];

  const categoryBreakdown = {
    Content: 450,
    Learning: 150,
    Outreach: 200,
    Leadership: 500,
    Milestones: 300,
  };

  // Chart data for points over time
  const pointsChartData = [
    { month: "Apr", points: 420 },
    { month: "May", points: 320 },
    { month: "Jun", points: 450 },
    { month: "Jul", points: 350 },
    { month: "Aug", points: 380 },
  ];

  // Leaderboard data
  const leaderboard = [
    {
      rank: 1,
      name: "Sarah Johnson",
      points: 3250,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      rank: 2,
      name: "Mike Chen",
      points: 2890,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    },
    {
      rank: 3,
      name: user?.name || "You",
      points: sparkPointsBalance,
      avatar:
        user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: "Jennifer Martinez",
      points: 2100,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer",
    },
    {
      rank: 5,
      name: "David Thompson",
      points: 1950,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    },
  ];

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

  const getActivityPoints = (activity) => {
    const basePoints = activity.points;
    const multiplier = activity.multiplier || 1;
    return Math.round(basePoints * multiplier);
  };

  return (
    <div className="h-full bg-workspace flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1d2430] flex items-center gap-2">
              <Zap className="text-[#f6d44b]" size={28} />
              Spark Points
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Earn points through activities, track your progress, and redeem
              rewards
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f6d44b] flex items-center gap-1">
                <Zap size={24} className="text-[#f6d44b]" />
                {sparkPointsBalance.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#032F60]">
                {weeklyPointsEarned}
              </div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                #{leaderboard.find((l) => l.isCurrentUser)?.rank || 3}
              </div>
              <div className="text-xs text-gray-500">Leaderboard</div>
            </div>
          </div>
        </div>

        {/* Multiplier Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl mb-4">
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="dashboard" className="text-sm font-bold">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="earn" className="text-sm font-bold">
              Earn Points
            </TabsTrigger>
            <TabsTrigger value="redeem" className="text-sm font-bold">
              Redeem Rewards
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Dashboard Tab - Consolidated Overview and Progress */}
          <TabsContent value="dashboard" className="mt-0">
            <div className="space-y-6">
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[#f6d44b] to-[#f5d02b]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#032F60] text-sm font-medium">
                          Total Points
                        </p>
                        <p className="text-[#032F60] text-2xl font-bold">
                          {sparkPointsBalance.toLocaleString()}
                        </p>
                      </div>
                      <Zap className="text-[#032F60]" size={24} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          This Week
                        </p>
                        <p className="text-gray-900 text-2xl font-bold">
                          {weeklyPointsEarned}
                        </p>
                      </div>
                      <TrendingUp className="text-green-500" size={24} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Rank
                        </p>
                        <p className="text-gray-900 text-2xl font-bold">
                          #{leaderboard.find((l) => l.isCurrentUser)?.rank || 3}
                        </p>
                      </div>
                      <Trophy className="text-orange-500" size={24} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Activities
                        </p>
                        <p className="text-gray-900 text-2xl font-bold">
                          {recentActivity.length}
                        </p>
                      </div>
                      <Activity className="text-blue-500" size={24} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Progress Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Points Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <BarChart size={20} className="text-[#f6d44b]" />
                      Points Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={pointsChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
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
                          <Area
                            type="monotone"
                            dataKey="points"
                            stroke="#f6d44b"
                            fill="url(#pointsGradient)"
                          />
                          <defs>
                            <linearGradient
                              id="pointsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#f6d44b"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="100%"
                                stopColor="#f6d44b"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Progress & Category Breakdown */}
                <div className="space-y-6">
                  {/* Weekly Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Clock size={20} className="text-[#032F60]" />
                        Weekly Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            Progress
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {weeklyPointsEarned}/{weeklyPointsCap}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#f6d44b] to-[#f5d02b] h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((weeklyPointsEarned / weeklyPointsCap) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {Math.round(
                              (weeklyPointsEarned / weeklyPointsCap) * 100,
                            )}
                            % complete
                          </span>
                          <span className="text-gray-500">
                            {weeklyPointsCap - weeklyPointsEarned} remaining
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Target size={20} className="text-green-500" />
                        Category Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(categoryBreakdown).map(
                          ([category, points]) => {
                            const categoryColors = {
                              Content: "bg-purple-500",
                              Learning: "bg-blue-500",
                              Outreach: "bg-green-500",
                              Leadership: "bg-orange-500",
                              Milestones: "bg-red-500",
                            };
                            return (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${categoryColors[category]}`}
                                  ></div>
                                  <span className="text-gray-700 text-sm font-medium">
                                    {category}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  {points} pts
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity & Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Activity size={20} className="text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">
                              {item.activity}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {item.date}
                              </p>
                              {item.status === "approved" && (
                                <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                                  Approved
                                </Badge>
                              )}
                              {item.status === "pending" && (
                                <Badge variant="outline" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#f6d44b] text-sm flex items-center gap-1">
                              <Zap size={12} />+{item.points}
                            </span>
                            {item.multiplier && (
                              <span className="text-xs text-orange-600">
                                x{item.multiplier} bonus
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Users size={20} className="text-orange-500" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.slice(0, 5).map((person) => (
                        <div
                          key={person.rank}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            person.isCurrentUser
                              ? "bg-[#f6d44b]/20 border border-[#f6d44b]/30"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                              <span className="text-sm font-bold text-gray-700">
                                {person.rank}
                              </span>
                            </div>
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {person.name}
                                {person.isCurrentUser && (
                                  <span className="text-[#f6d44b] ml-1">
                                    (You)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 text-sm">
                              {person.points.toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Earn Points Tab */}
          <TabsContent value="earn" className="mt-0">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-[#f6d44b] to-[#f5d02b]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#032F60] text-sm font-medium">
                          This Week
                        </p>
                        <p className="text-[#032F60] text-xl font-bold">
                          {weeklyPointsEarned}
                        </p>
                      </div>
                      <Zap className="text-[#032F60]" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Weekly Cap
                        </p>
                        <p className="text-gray-900 text-xl font-bold">
                          {weeklyPointsCap}
                        </p>
                      </div>
                      <Target className="text-blue-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Available
                        </p>
                        <p className="text-gray-900 text-xl font-bold">
                          {activities.length}
                        </p>
                      </div>
                      <Activity className="text-green-500" size={20} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activities Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Star className="text-[#f6d44b]" size={24} />
                    Available Activities
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete activities to earn Spark Points and climb the
                    leaderboard
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => {
                      const IconComponent = activity.icon;
                      const finalPoints = getActivityPoints(activity);
                      const hasMultiplier =
                        activity.multiplier && activity.multiplier > 1;

                      return (
                        <div
                          key={activity.id}
                          className="group relative p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#f6d44b]/30 transition-all duration-200 bg-white"
                        >
                          {hasMultiplier && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Flame size={12} />x{activity.multiplier}
                            </div>
                          )}

                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`${activity.color} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <IconComponent size={24} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-[#032F60] transition-colors">
                                {activity.title}
                              </h4>
                              <Badge variant="outline" className="text-xs mb-2">
                                {activity.category}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            {activity.description}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[#f6d44b]">
                                <Zap size={16} />
                                <span className="text-lg font-bold">
                                  {finalPoints}
                                </span>
                              </div>
                              {hasMultiplier && (
                                <span className="text-xs text-gray-500">
                                  (base: {activity.points})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">
                              <strong>Verification:</strong>{" "}
                              {activity.verification}
                            </p>
                            <Button
                              className="w-full group-hover:bg-[#032F60] group-hover:text-white transition-colors"
                              onClick={() => handleActivitySubmit(activity)}
                            >
                              Submit Activity
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Redeem Rewards Tab */}
          <TabsContent value="redeem" className="mt-0">
            <div className="space-y-6">
              {/* Balance and Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[#f6d44b] to-[#f5d02b]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#032F60] text-sm font-medium">
                          Your Balance
                        </p>
                        <p className="text-[#032F60] text-xl font-bold">
                          {sparkPointsBalance.toLocaleString()}
                        </p>
                      </div>
                      <Coins className="text-[#032F60]" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Available
                        </p>
                        <p className="text-gray-900 text-xl font-bold">
                          {rewards.filter((r) => r.available).length}
                        </p>
                      </div>
                      <Gift className="text-green-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Affordable
                        </p>
                        <p className="text-gray-900 text-xl font-bold">
                          {
                            rewards.filter(
                              (r) =>
                                r.available && sparkPointsBalance >= r.points,
                            ).length
                          }
                        </p>
                      </div>
                      <CheckCircle className="text-blue-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          Categories
                        </p>
                        <p className="text-gray-900 text-xl font-bold">4</p>
                      </div>
                      <Award className="text-purple-500" size={20} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rewards by Category */}
              <div className="space-y-8">
                {/* Gift Cards */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="text-green-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Gift Cards
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {
                        rewards.filter((r) => r.category === "gift-cards")
                          .length
                      }{" "}
                      items
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewards
                      .filter((r) => r.category === "gift-cards")
                      .map((reward) => {
                        const canAfford = sparkPointsBalance >= reward.points;
                        const isAvailable = reward.available;

                        return (
                          <div
                            key={reward.id}
                            className={`group relative p-4 border border-gray-200 rounded-xl transition-all bg-white ${
                              canAfford && isAvailable
                                ? "hover:shadow-lg hover:border-green-300 cursor-pointer"
                                : "opacity-60"
                            }`}
                            onClick={() =>
                              canAfford &&
                              isAvailable &&
                              handleRewardRedeem(reward)
                            }
                          >
                            <div className="space-y-3">
                              <div className="relative">
                                <img
                                  src={reward.image}
                                  alt={reward.name}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                {canAfford && isAvailable && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle size={12} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                  {reward.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reward.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[#f6d44b]">
                                    <Coins size={14} />
                                    <span className="text-sm font-bold">
                                      {reward.points}
                                    </span>
                                  </div>
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
                </div>

                {/* Merchandise */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="text-purple-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Merchandise
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {
                        rewards.filter((r) => r.category === "merchandise")
                          .length
                      }{" "}
                      items
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewards
                      .filter((r) => r.category === "merchandise")
                      .map((reward) => {
                        const canAfford = sparkPointsBalance >= reward.points;
                        const isAvailable = reward.available;

                        return (
                          <div
                            key={reward.id}
                            className={`group relative p-4 border border-gray-200 rounded-xl transition-all bg-white ${
                              canAfford && isAvailable
                                ? "hover:shadow-lg hover:border-purple-300 cursor-pointer"
                                : "opacity-60"
                            }`}
                            onClick={() =>
                              canAfford &&
                              isAvailable &&
                              handleRewardRedeem(reward)
                            }
                          >
                            <div className="space-y-3">
                              <div className="relative">
                                <img
                                  src={reward.image}
                                  alt={reward.name}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                {canAfford && isAvailable && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle size={12} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                  {reward.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reward.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[#f6d44b]">
                                    <Coins size={14} />
                                    <span className="text-sm font-bold">
                                      {reward.points}
                                    </span>
                                  </div>
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
                </div>

                {/* Business Tools */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-blue-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Business Tools
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {rewards.filter((r) => r.category === "business").length}{" "}
                      items
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards
                      .filter((r) => r.category === "business")
                      .map((reward) => {
                        const canAfford = sparkPointsBalance >= reward.points;
                        const isAvailable = reward.available;

                        return (
                          <div
                            key={reward.id}
                            className={`group relative p-4 border border-gray-200 rounded-xl transition-all bg-white ${
                              canAfford && isAvailable
                                ? "hover:shadow-lg hover:border-blue-300 cursor-pointer"
                                : "opacity-60"
                            }`}
                            onClick={() =>
                              canAfford &&
                              isAvailable &&
                              handleRewardRedeem(reward)
                            }
                          >
                            <div className="space-y-3">
                              <div className="relative">
                                <img
                                  src={reward.image}
                                  alt={reward.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                {canAfford && isAvailable && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle size={12} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                  {reward.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reward.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[#f6d44b]">
                                    <Coins size={14} />
                                    <span className="text-sm font-bold">
                                      {reward.points}
                                    </span>
                                  </div>
                                  {!isAvailable ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Coming Soon
                                    </Badge>
                                  ) : canAfford ? (
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                    >
                                      Redeem
                                    </Button>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Need {reward.points - sparkPointsBalance}{" "}
                                      more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Development */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="text-orange-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Professional Development
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {
                        rewards.filter((r) => r.category === "development")
                          .length
                      }{" "}
                      items
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards
                      .filter((r) => r.category === "development")
                      .map((reward) => {
                        const canAfford = sparkPointsBalance >= reward.points;
                        const isAvailable = reward.available;

                        return (
                          <div
                            key={reward.id}
                            className={`group relative p-4 border border-gray-200 rounded-xl transition-all bg-white ${
                              canAfford && isAvailable
                                ? "hover:shadow-lg hover:border-orange-300 cursor-pointer"
                                : "opacity-60"
                            }`}
                            onClick={() =>
                              canAfford &&
                              isAvailable &&
                              handleRewardRedeem(reward)
                            }
                          >
                            <div className="space-y-3">
                              <div className="relative">
                                <img
                                  src={reward.image}
                                  alt={reward.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                {canAfford && isAvailable && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle size={12} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                  {reward.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reward.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[#f6d44b]">
                                    <Coins size={14} />
                                    <span className="text-sm font-bold">
                                      {reward.points}
                                    </span>
                                  </div>
                                  {!isAvailable ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Coming Soon
                                    </Badge>
                                  ) : canAfford ? (
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs"
                                    >
                                      Redeem
                                    </Button>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Need {reward.points - sparkPointsBalance}{" "}
                                      more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
                    {getActivityPoints(selectedActivity)} points
                  </span>
                  {selectedActivity.multiplier &&
                    selectedActivity.multiplier > 1 && (
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">
                        x{selectedActivity.multiplier} bonus!
                      </span>
                    )}
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
