import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Users2,
  TreePine,
  X,
} from "lucide-react";
import NetworkDownlineView from "../network/NetworkDownlineView";
import BadgeSelectorModal from "../dashboard/BadgeSelectorModal";

interface ProfileWorkspaceProps {
  user: any;
  userProfile: any;
  userPerformance: any;
  userBadges: any[];
  networkSummary: any;
  uplineUsers: any[];
  downlineUsers: any[];
  loading: boolean;
  currentUserData: any;
  transformedUsers: any[];
}

export default function ProfileWorkspace({
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
}: ProfileWorkspaceProps) {
  const [profileView, setProfileView] = React.useState("badges");
  const [selectedBadgeCategory, setSelectedBadgeCategory] = React.useState("all");
  const [selectedBadge, setSelectedBadge] = React.useState(null);
  const [showBadgeModal, setShowBadgeModal] = React.useState(false);
  const [showBadgeSelector, setShowBadgeSelector] = React.useState(false);
  const [selectedBadgesForProfile, setSelectedBadgesForProfile] = React.useState([]);
  const [isUpdatingBadges, setIsUpdatingBadges] = React.useState(false);

  const badgeCategories = [
    { id: "all", label: "All Badges", count: 30 },
    { id: "performance", label: "Performance", count: 15 },
    { id: "leadership", label: "Leadership", count: 5 },
    { id: "milestones", label: "Milestones", count: 10 },
  ];

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

                          {badge.obtained && badge.count > 1 && (
                            <div className="absolute -top-2 -right-2">
                              <span className="bg-[#032F60] text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                                x{badge.count}
                              </span>
                            </div>
                          )}

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
          ) : (
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