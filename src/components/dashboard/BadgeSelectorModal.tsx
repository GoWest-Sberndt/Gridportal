import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Badge Selector Modal Component
export default function BadgeSelectorModal({
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