import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Zap,
  TrendingUp as TrendingUpIcon,
  Flame,
  Coins,
  Clock,
  Eye,
} from "lucide-react";

// Dashboard Quick View Component
export default function DashboardQuickView({
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
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>FIRE Fund</span>
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