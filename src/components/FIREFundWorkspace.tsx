import React, { useState, useEffect } from "react";
import {
  Flame,
  TrendingUp,
  BarChart3,
  Target,
  Trophy,
  X,
  CheckCircle,
  Users,
  ArrowLeft,
  DollarSign,
  User,
  Crown,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseHelpers } from "@/lib/supabase";

interface FIREFundWorkspaceProps {
  onBack?: () => void;
}

export default function FIREFundWorkspace({
  onBack,
}: FIREFundWorkspaceProps = {}) {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState("overview"); // "overview", "genealogy", "earnings"
  const [downlineData, setDownlineData] = useState([]);
  const [downlineEarnings, setDownlineEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMonthlyVolume, setUserMonthlyVolume] = useState(0);

  // Load downline data and earnings from Supabase
  useEffect(() => {
    const loadDownlineData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get user's current monthly loan volume
        const userPerformance = await supabaseHelpers.getUserPerformance(
          user.id,
        );
        const monthlyVolume = userPerformance?.[0]?.monthly_volume || 0;
        setUserMonthlyVolume(monthlyVolume);

        // Get downline data (up to 3 levels)
        const downlineUsers = await supabaseHelpers.getUserDownline(user.id, 3);

        // Transform downline data with performance info
        const enrichedDownline = await Promise.all(
          downlineUsers.map(async (relationship) => {
            const downlineUser = relationship.downline_user;
            if (!downlineUser) return null;

            // Get performance data for each downline user
            const performance = await supabaseHelpers.getUserPerformance(
              downlineUser.id,
            );
            const currentPerformance = performance?.[0] || {};

            return {
              ...downlineUser,
              relationship_level: relationship.relationship_level,
              monthly_volume: currentPerformance.monthly_volume || 0,
              monthly_loans: currentPerformance.monthly_loans || 0,
              fire_fund_contribution: Math.round(
                (currentPerformance.monthly_volume || 0) * 0.001,
              ), // 0.1% of volume
            };
          }),
        );

        const validDownline = enrichedDownline.filter(Boolean);
        setDownlineData(validDownline);

        // Calculate total earnings from downline
        const totalEarnings = validDownline.reduce((sum, user) => {
          return sum + (user.fire_fund_contribution || 0);
        }, 0);

        const level1Earnings = validDownline
          .filter((user) => user.relationship_level === 1)
          .reduce((sum, user) => sum + (user.fire_fund_contribution || 0), 0);

        const level2Earnings = validDownline
          .filter((user) => user.relationship_level === 2)
          .reduce((sum, user) => sum + (user.fire_fund_contribution || 0), 0);

        const level3Earnings = validDownline
          .filter((user) => user.relationship_level === 3)
          .reduce((sum, user) => sum + (user.fire_fund_contribution || 0), 0);

        setDownlineEarnings({
          total: totalEarnings,
          level1: level1Earnings,
          level2: level2Earnings,
          level3: level3Earnings,
          ytdTotal: totalEarnings * 8, // Assuming 8 months YTD
          projectedAnnual: totalEarnings * 12,
        });
      } catch (error) {
        console.error("Error loading downline data:", error);
        // Fallback to mock data
        setUserMonthlyVolume(2800000);
        setDownlineData([
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah@safire.com",
            role: "Senior Loan Officer",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
            relationship_level: 1,
            monthly_volume: 1800000,
            monthly_loans: 18,
            fire_fund_contribution: 1800,
          },
          {
            id: "2",
            name: "Mike Rodriguez",
            email: "mike@safire.com",
            role: "Loan Officer",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
            relationship_level: 1,
            monthly_volume: 1200000,
            monthly_loans: 12,
            fire_fund_contribution: 1200,
          },
          {
            id: "3",
            name: "Emily Chen",
            email: "emily@safire.com",
            role: "Junior Loan Officer",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
            relationship_level: 2,
            monthly_volume: 800000,
            monthly_loans: 8,
            fire_fund_contribution: 800,
          },
        ]);
        setDownlineEarnings({
          total: 3800,
          level1: 3000,
          level2: 800,
          level3: 0,
          ytdTotal: 30400,
          projectedAnnual: 45600,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDownlineData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FIRE fund data...</p>
        </div>
      </div>
    );
  }

  if (!downlineEarnings) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center py-20 text-gray-500">
          No downline data available
        </div>
      </div>
    );
  }

  // Check if user has reached the $2.5M monthly threshold
  const hasReachedThreshold = userMonthlyVolume >= 2500000;

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
                <Flame className="text-red-600" size={28} />
                FIRE Fund - Downline Earnings
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Track earnings from your downline network and genealogy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${(downlineEarnings?.total || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Monthly Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(downlineEarnings?.ytdTotal || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">YTD Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#032F60]">
                {downlineData.length}
              </div>
              <div className="text-xs text-gray-500">Network Size</div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setSelectedView("overview")}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
              selectedView === "overview"
                ? "bg-[#032F60] text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView("genealogy")}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
              selectedView === "genealogy"
                ? "bg-[#032F60] text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Genealogy
          </button>
          <button
            onClick={() => setSelectedView("earnings")}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded transition-colors ${
              selectedView === "earnings"
                ? "bg-[#032F60] text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Earnings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {selectedView === "overview" && (
            <>
              {/* Earnings Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Flame size={16} className="text-red-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        Monthly Earnings
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${(downlineEarnings?.total || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-red-600 font-medium">
                      From downline network
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        YTD Earnings
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${(downlineEarnings?.ytdTotal || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Year to date total
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
                        Network Size
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {downlineData.length}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Active contributors
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
                        Projected Annual
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      $
                      {(
                        downlineEarnings?.projectedAnnual || 0
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      Based on current rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Level Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-[#032F60]" size={20} />
                    Earnings by Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown size={16} className="text-yellow-600" />
                        <span className="font-semibold text-yellow-800">
                          Level 1 (Direct)
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-800">
                        ${(downlineEarnings?.level1 || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-yellow-600">
                        {
                          downlineData.filter((u) => u.relationship_level === 1)
                            .length
                        }{" "}
                        contributors
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star size={16} className="text-gray-600" />
                        <span className="font-semibold text-gray-800">
                          Level 2
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        ${(downlineEarnings?.level2 || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          downlineData.filter((u) => u.relationship_level === 2)
                            .length
                        }{" "}
                        contributors
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-amber-600" />
                        <span className="font-semibold text-amber-800">
                          Level 3
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-amber-800">
                        ${(downlineEarnings?.level3 || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-amber-600">
                        {
                          downlineData.filter((u) => u.relationship_level === 3)
                            .length
                        }{" "}
                        contributors
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedView === "genealogy" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-[#032F60]" size={20} />
                  Network Genealogy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current User */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-xl shadow-lg">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20">
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
                      <div className="text-left">
                        <div className="font-bold">{user?.name || "You"}</div>
                        <div className="text-sm opacity-90">
                          ${(userMonthlyVolume / 1000000).toFixed(1)}M Monthly
                        </div>
                      </div>
                      <Crown size={20} className="text-yellow-300" />
                    </div>
                  </div>

                  {/* Level 1 - Direct Reports */}
                  {downlineData.filter((u) => u.relationship_level === 1)
                    .length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Direct Reports (Level 1)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {downlineData
                          .filter((u) => u.relationship_level === 1)
                          .map((user) => (
                            <div
                              key={user.id}
                              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-200">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-yellow-800 font-bold text-sm">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-yellow-800 truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-yellow-600">
                                    {user.role}
                                  </div>
                                </div>
                                <Crown size={16} className="text-yellow-600" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-yellow-700">
                                    Volume:
                                  </span>
                                  <span className="font-semibold">
                                    $
                                    {(user.monthly_volume / 1000000).toFixed(1)}
                                    M
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-yellow-700">
                                    Contribution:
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    ${user.fire_fund_contribution}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Level 2 */}
                  {downlineData.filter((u) => u.relationship_level === 2)
                    .length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Second Level
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {downlineData
                          .filter((u) => u.relationship_level === 2)
                          .map((user) => (
                            <div
                              key={user.id}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 text-sm truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    $
                                    {(user.monthly_volume / 1000000).toFixed(1)}
                                    M
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <Badge variant="secondary" className="text-xs">
                                  +${user.fire_fund_contribution}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Level 3 */}
                  {downlineData.filter((u) => u.relationship_level === 3)
                    .length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Third Level
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {downlineData
                          .filter((u) => u.relationship_level === 3)
                          .map((user) => (
                            <div
                              key={user.id}
                              className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-200">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-800 font-bold text-xs">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-amber-800 text-xs truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-amber-600">
                                    +${user.fire_fund_contribution}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {downlineData.length === 0 && (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No Downline Network Yet
                      </h3>
                      <p className="text-gray-500">
                        Start recruiting to build your network and earn from
                        downline contributions.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedView === "earnings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="text-[#032F60]" size={20} />
                  Detailed Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Earnings Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">
                      Monthly Earnings Trend
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={[
                          { month: "Jan", earnings: 2800 },
                          { month: "Feb", earnings: 3200 },
                          { month: "Mar", earnings: 3600 },
                          { month: "Apr", earnings: 3800 },
                          { month: "May", earnings: 4200 },
                          { month: "Jun", earnings: 4000 },
                          { month: "Jul", earnings: 4400 },
                          {
                            month: "Aug",
                            earnings: downlineEarnings?.total || 3800,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value}`, "Earnings"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#032F60"
                          fill="#032F60"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Individual Contributors */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">
                      Individual Contributors
                    </h4>
                    <div className="space-y-3">
                      {downlineData.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.role} • Level {user.relationship_level}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              ${user.fire_fund_contribution}/month
                            </div>
                            <div className="text-sm text-gray-500">
                              ${(user.monthly_volume / 1000000).toFixed(1)}M
                              volume
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
