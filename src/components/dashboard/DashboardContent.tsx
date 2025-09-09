import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Video, Play, ExternalLink } from "lucide-react";
import FeaturedVideoPlayer from "./FeaturedVideoPlayer";
import DashboardQuickView from "./DashboardQuickView";
import BadgeSelectorModal from "./BadgeSelectorModal";

// Dashboard Content Component
export default function DashboardContent({
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