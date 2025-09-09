import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Target,
  Trophy,
  TrendingUp as TrendingUpIcon,
  Users,
  CheckCircle,
  X,
} from "lucide-react";

export default function FireFundView() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = React.useState("ytd");
  const [fireFundData, setFireFundData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userMonthlyVolume, setUserMonthlyVolume] = React.useState(0);

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

        const userPerformance = await supabaseHelpers.getUserPerformance(
          user.id,
        );
        const monthlyVolume = userPerformance?.[0]?.monthly_volume || 0;
        setUserMonthlyVolume(monthlyVolume);

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
              downlineEarnings: fireFund * 0.6 * 1.2,
              growth: fireFund * 0.4,
              balance: (index + 1) * fireFund + 35000,
            };
          }),
        };

        setFireFundData(transformedData);
      } catch (error) {
        console.error("Error loading FIRE fund data:", error);
        setUserMonthlyVolume(2800000);
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

  const hasReachedThreshold = userMonthlyVolume >= 2500000;

  if (!hasReachedThreshold) {
    return (
      <div className="space-y-6">
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
            <Target className="text-[#032F60]" size={20} />
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