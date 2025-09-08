import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  Coins,
  Gift,
  Users,
  Calendar,
  Target,
  ArrowLeft,
  Eye,
  Clock,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseHelpers } from "@/lib/supabase";

interface CompensationWorkspaceProps {
  onBack?: () => void;
}

export default function CompensationWorkspace({
  onBack,
}: CompensationWorkspaceProps = {}) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("ytd"); // "ytd", "monthly", "quarterly"
  const [compensationData, setCompensationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load compensation data from Supabase
  useEffect(() => {
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
            fireFund: performanceData.reduce(
              (sum, item) => sum + (item.fire_fund_balance || 0),
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
            fireFund: 10000,
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
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compensation data...</p>
        </div>
      </div>
    );
  }

  if (!compensationData) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center py-20 text-gray-500">
          No compensation data available
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-[#1d2430] flex items-center gap-2">
                <TrendingUp className="text-green-600" size={28} />
                Compensation Workspace
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Track your earnings, commission performance, and compensation
                trends
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${compensationData.ytd.totalEarnings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#032F60]">
                +{compensationData.monthly.growth.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Growth Rate</div>
            </div>
          </div>
        </div>

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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
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
                    <Target size={16} className="text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    FIRE Fund
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  ${compensationData.ytd.fireFund.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  FIRE Fund Balance
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
                        `$${value.toLocaleString()}`,
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
                          ...compensationData.ytd.monthlyData.map(
                            (d) => d.amount,
                          ),
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
      </div>
    </div>
  );
}
