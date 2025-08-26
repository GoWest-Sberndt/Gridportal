import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { supabase, supabaseHelpers } from "../lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  internalRole: "user" | "manager" | "admin";
  avatar?: string;
  nmlsNumber?: string;
  clientFacingTitle?: string;
  recruiterId?: string;
  recruiterType?: "user" | "company";
  recruiterName?: string;
  upline?: string[];
  downline?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  resetInactivityTimer: () => void;
  showSessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In development/storybook mode, return a mock context to prevent crashes
    if (import.meta.env.VITE_TEMPO === "true") {
      return {
        user: null,
        login: async () => false,
        logout: () => {},
        isLoading: false,
        resetInactivityTimer: () => {},
        showSessionWarning: false,
        extendSession: () => {},
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [autoLogoutTimeout, setAutoLogoutTimeout] = useState(30); // minutes

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef(true);

  // Load auto-logout timeout setting
  useEffect(() => {
    const loadAutoLogoutTimeout = async () => {
      try {
        const timeout = await supabaseHelpers.getAutoLogoutTimeout();
        setAutoLogoutTimeout(timeout);
      } catch (error) {
        console.warn("Failed to load auto-logout timeout:", error);
      }
    };

    loadAutoLogoutTimeout();
  }, []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowSessionWarning(false);
  }, []);

  // Auto logout due to inactivity
  const handleAutoLogout = useCallback(async () => {
    console.log("AuthProvider: Auto-logout due to inactivity");
    clearTimers();
    await logout();
  }, []);

  // Show session warning
  const handleSessionWarning = useCallback(() => {
    console.log("AuthProvider: Showing session warning");
    setShowSessionWarning(true);

    // Set final logout timer (5 minutes after warning)
    inactivityTimerRef.current = setTimeout(
      () => {
        handleAutoLogout();
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }, [handleAutoLogout]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!user || !isActiveRef.current) return;

    lastActivityRef.current = Date.now();
    clearTimers();

    // Set warning timer (timeout - 5 minutes)
    const warningTime = Math.max((autoLogoutTimeout - 5) * 60 * 1000, 60000); // At least 1 minute
    warningTimerRef.current = setTimeout(() => {
      handleSessionWarning();
    }, warningTime);
  }, [user, autoLogoutTimeout, clearTimers, handleSessionWarning]);

  // Extend session (dismiss warning)
  const extendSession = useCallback(() => {
    console.log("AuthProvider: Session extended by user");
    setShowSessionWarning(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      if (Date.now() - lastActivityRef.current > 30000) {
        // Throttle to every 30 seconds
        resetInactivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetInactivityTimer();

    return () => {
      // Remove event listeners
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimers();
    };
  }, [user, resetInactivityTimer, clearTimers]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        isActiveRef.current = true;
        if (user) {
          resetInactivityTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, resetInactivityTimer]);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Initializing...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("AuthProvider: Session error:", error);
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        if (session?.user) {
          console.log(
            "AuthProvider: Found existing session for:",
            session.user.email,
          );
          await loadUserProfile(
            session.user.id,
            session.user.email || "",
            mounted,
          );
        } else {
          console.log("AuthProvider: No existing session");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthProvider: Initialization error:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: Auth state change:", event);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      }
      // Don't handle SIGNED_IN here to avoid conflicts with login function
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserDataExists = async (
    userId: string,
    mounted: boolean = true,
  ) => {
    if (!mounted) return;

    try {
      console.log("AuthProvider: Ensuring user data exists for:", userId);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Check and create user performance record
      const { data: existingPerformance } = await supabase
        .from("user_performance")
        .select("id")
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      if (!existingPerformance) {
        console.log("AuthProvider: Creating user performance record...");
        await supabase.from("user_performance").insert({
          user_id: userId,
          monthly_volume: 0,
          monthly_loans: 0,
          ytd_volume: 0,
          ytd_loans: 0,
          compensation: 0,
          fire_fund: 0,
          recruitment_tier: 0,
          active_recruits: 0,
          rank: 0,
          month: currentMonth,
          year: currentYear,
        });
      }

      // Check and create default badges for new users
      const { data: existingBadges } = await supabase
        .from("user_badges")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (!existingBadges || existingBadges.length === 0) {
        console.log("AuthProvider: Creating default badge entries...");

        // Get the "Rookie of the Year" badge to assign to new users
        const { data: rookieBadge } = await supabase
          .from("badges")
          .select("id")
          .eq("name", "Rookie of the Year")
          .single();

        if (rookieBadge) {
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: rookieBadge.id,
            count: 1,
            date_obtained: new Date().toISOString(),
          });
        }
      }

      // Check and create default tasks
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (!existingTasks || existingTasks.length === 0) {
        console.log("AuthProvider: Creating default tasks...");

        const defaultTasks = [
          {
            user_id: userId,
            title: "Complete Profile Setup",
            description:
              "Update your profile information and upload a professional photo",
            day: "MON",
            date: currentDate.getDate().toString(),
            time: "9:00 AM",
            completed: false,
          },
          {
            user_id: userId,
            title: "Review Market Updates",
            description: "Check the latest market trends and rate changes",
            day: "TUE",
            date: (currentDate.getDate() + 1).toString(),
            time: "10:00 AM",
            completed: false,
          },
          {
            user_id: userId,
            title: "Client Follow-up",
            description: "Follow up with potential clients from this week",
            day: "WED",
            date: (currentDate.getDate() + 2).toString(),
            time: "2:00 PM",
            completed: false,
          },
        ];

        await supabase.from("tasks").insert(defaultTasks);
      }

      console.log("AuthProvider: User data setup complete");
    } catch (error) {
      console.error("AuthProvider: Error ensuring user data exists:", error);
      // Don't throw error here to avoid breaking login flow
    }
  };

  const loadUserProfile = async (
    userId: string,
    email: string,
    mounted: boolean = true,
  ) => {
    try {
      console.log("AuthProvider: Loading profile for:", email);

      let { data: userProfile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!mounted) return;

      // Create user profile if it doesn't exist
      if (error && error.code === "PGRST116") {
        console.log("AuthProvider: Creating new user profile...");

        let displayName = "User";
        if (email === "sberndt@safire.loans") {
          displayName = "Scott Berndt";
        } else if (email === "jimmy@safire.com") {
          displayName = "Jimmy Hendrix";
        } else {
          const emailName = email?.split("@")[0] || "User";
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: email,
            name: displayName,
            role: "Senior Loan Officer",
            internal_role: email.includes("admin") ? "admin" : "user",
            recruiter_id: null,
            recruiter_type: null,
            recruiter_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error("AuthProvider: Error creating profile:", createError);
          throw createError;
        }

        userProfile = newProfile;
      } else if (error) {
        console.error("AuthProvider: Error fetching profile:", error);
        throw error;
      }

      if (!mounted) return;

      if (userProfile) {
        // Ensure all required database entries exist for this user
        await ensureUserDataExists(userProfile.id, mounted);

        const userData = {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          internalRole: userProfile.internal_role || "user",
          avatar: userProfile.avatar,
          nmlsNumber: userProfile.nmls_number,
          clientFacingTitle: userProfile.client_facing_title,
          recruiterId: userProfile.recruiter_id,
          recruiterType: userProfile.recruiter_type,
          recruiterName: userProfile.recruiter_name,
        };

        console.log("AuthProvider: Setting user data:", userData.name);
        setUser(userData);
      }
    } catch (error) {
      console.error("AuthProvider: Profile loading error:", error);
      if (mounted) {
        setUser(null);
      }
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthProvider: Login attempt for:", email);
    setIsLoading(true);
    setUser(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("AuthProvider: Login error:", error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log("AuthProvider: Authentication successful");

        try {
          await loadUserProfile(data.user.id, data.user.email || email, true);
          setIsLoading(false);
          return true;
        } catch (profileError) {
          console.error("AuthProvider: Profile loading failed:", profileError);
          // Sign out on profile error
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return false;
        }
      } else {
        console.error("AuthProvider: No user data received");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("AuthProvider: Login error:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthProvider: Logging out...");
      setIsLoading(true);
      clearTimers();
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error("AuthProvider: Logout error:", error);
      clearTimers();
      setUser(null);
      setIsLoading(false);
    }
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-workspace flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#032F60] text-2xl font-extrabold">S</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    resetInactivityTimer,
    showSessionWarning,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};