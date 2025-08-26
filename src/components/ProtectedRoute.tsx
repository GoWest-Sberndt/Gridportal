import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  console.log("ProtectedRoute - user:", user?.name, "isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-workspace flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#032F60] text-2xl font-extrabold">S</span>
          </div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#032F60] mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute - User authenticated, rendering children");
  return <>{children}</>;
}
