import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export default function SessionWarningDialog() {
  const { showSessionWarning, extendSession, logout } = useAuth();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!showSessionWarning) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout(); // Auto logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSessionWarning, logout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStayLoggedIn = () => {
    setCountdown(300); // Reset countdown
    extendSession();
  };

  return (
    <Dialog open={showSessionWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Session Expiring Soon
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-center py-4">
          <div className="space-y-4">
            <p className="text-gray-600">
              Your session will expire due to inactivity. You will be
              automatically logged out in:
            </p>

            <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-red-600">
              <Clock className="w-6 h-6" />
              <span>{formatTime(countdown)}</span>
            </div>

            <p className="text-sm text-gray-500">
              Click "Stay Logged In" to extend your session, or "Logout Now" to
              logout immediately.
            </p>
          </div>
        </DialogDescription>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button
            onClick={handleStayLoggedIn}
            className="w-full sm:w-auto bg-[#032F60] hover:bg-[#032F60]/90"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
