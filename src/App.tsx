import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import SafireDashboard from "./components/SafireDashboard";
import Microsoft365Workspace from "./components/Microsoft365Workspace";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import routes from "tempo-routes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import SessionWarningDialog from "./components/SessionWarningDialog";
import ElevenLabsWidget from "./components/ElevenLabsWidget";

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { showSessionWarning } = useAuth();

  return (
    <>
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center relative"
            style={{
              backgroundColor: "#1e3a5f",
              backgroundImage: `url('/safire-logo-grid.png')`,
              backgroundSize: "200px 200px",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[#1e3a5f] bg-opacity-80"></div>
            <div className="text-center relative z-10">
              <div className="w-full max-w-sm px-8 mb-6">
                <img
                  src="/safire-logo-main.png"
                  alt="Safire Logo"
                  className="w-full h-auto object-contain drop-shadow-lg"
                  onError={(e) => {
                    console.error("Logo failed to load:", e);
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={() => console.log("Logo loaded successfully")}
                />
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white">Initializing application...</p>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Tempo routes - render first to avoid conflicts */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Main dashboard route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SafireDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* Microsoft 365 Email Workspace */}
          <Route
            path="/email"
            element={
              <ProtectedRoute>
                <Microsoft365Workspace />
              </ProtectedRoute>
            }
          />
          {/* Fallback route for any unmatched paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Tempo routes - render separately to avoid conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes || [])}
      </Suspense>

      {/* Session Warning Dialog */}
      {showSessionWarning && <SessionWarningDialog />}

      {/* ElevenLabs AI Chatbot Widget */}
      <ElevenLabsWidget enabled={false} />

      <Toaster />
    </>
  );
}

export default App;