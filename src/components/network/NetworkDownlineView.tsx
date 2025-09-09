import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NetworkDownlineViewProps {
  userId: string;
  users: any[];
  level?: number;
}

export default function NetworkDownlineView({
  userId,
  users,
  level = 1,
}: NetworkDownlineViewProps) {
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
}