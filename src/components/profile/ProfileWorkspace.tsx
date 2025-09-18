import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Award,
  Star,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  Settings,
  Camera,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Crown,
  Medal,
  Briefcase,
  GraduationCap,
  Building,
  Lock,
  ChevronDown,
  ChevronRight,
  Network,
  UserCheck,
  UserPlus,
  Sparkles,
  Flame,
  Gem,
  Package,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  nmls_number?: string;
  hire_date?: string;
  department?: string;
  manager?: string;
  status: 'active' | 'inactive';
  upline_id?: string;
}

interface UserPerformance {
  monthly_volume: number;
  monthly_loans: number;
  ytd_volume: number;
  ytd_loans: number;
  rank: number;
  recruitment_tier: number;
  active_recruits: number;
  fire_fund: number;
  spark_points: number;
  completion_rate: number;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tier?: string;
  color?: string;
  image_url?: string;
  requirements?: string;
  earned?: boolean;
  earned_date?: string;
  progress?: number;
  max_progress?: number;
  count?: number;
  collection?: {
    id: string;
    name: string;
    description: string;
    color?: string;
    image_url?: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive';
  level: number;
  monthly_volume: number;
  recruitment_tier: number;
  children?: TeamMember[];
}

export default function ProfileWorkspace() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPerformance, setUserPerformance] = useState<UserPerformance | null>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [uplineProfile, setUplineProfile] = useState<UserProfile | null>(null);
  const [downlineTeam, setDownlineTeam] = useState<TeamMember[]>([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  // Edit form data
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    department: "",
  });

  // Load user data
  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const formattedProfile: UserProfile = {
        id: profile.id,
        name: profile.name || user.name || 'User',
        email: profile.email || user.email || '',
        role: profile.role || 'Loan Officer',
        avatar: profile.avatar,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        nmls_number: profile.nmls_number,
        hire_date: profile.hire_date,
        department: profile.department,
        manager: profile.manager,
        status: profile.status || 'active',
        upline_id: profile.upline_id,
      };

      setUserProfile(formattedProfile);
      setEditForm({
        name: formattedProfile.name,
        phone: formattedProfile.phone || "",
        location: formattedProfile.location || "",
        bio: formattedProfile.bio || "",
        department: formattedProfile.department || "",
      });

      // Load upline profile if exists
      if (profile.upline_id) {
        const { data: upline } = await supabase
          .from('users')
          .select('*')
          .eq('id', profile.upline_id)
          .single();
        
        if (upline) {
          setUplineProfile({
            id: upline.id,
            name: upline.name,
            email: upline.email,
            role: upline.role || 'Loan Officer',
            avatar: upline.avatar,
            status: upline.status || 'active',
          });
        }
      }

      // Load performance data
      const { data: performance } = await supabase
        .from('monthly_performance')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);

      if (performance && performance.length > 0) {
        const perf = performance[0];
        setUserPerformance({
          monthly_volume: perf.loan_volume || 0,
          monthly_loans: perf.loan_count || 0,
          ytd_volume: perf.ytd_volume || 0,
          ytd_loans: perf.ytd_loans || 0,
          rank: perf.rank || 0,
          recruitment_tier: perf.recruitment_tier || 1,
          active_recruits: perf.active_recruits || 0,
          fire_fund: perf.fire_fund || 0,
          spark_points: perf.spark_points || 0,
          completion_rate: perf.completion_rate || 0,
        });
      }

      // Load badges with collections and user's earned badges
      const { data: badges } = await supabase
        .from('badges')
        .select(`
          *,
          badge_collections (
            id,
            name,
            description,
            color,
            image_url
          )
        `)
        .order('created_at', { ascending: true });

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (badges) {
        const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
        const formattedBadges: BadgeItem[] = badges.map(badge => {
          const userBadge = userBadges?.find(ub => ub.badge_id === badge.id);
          return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            category: badge.category || 'performance',
            rarity: badge.rarity || 'common',
            tier: badge.tier || 'qualifying',
            color: badge.color || '#3b82f6',
            image_url: badge.image_url,
            requirements: badge.requirements,
            earned: earnedBadgeIds.has(badge.id),
            earned_date: userBadge?.awarded_at,
            progress: earnedBadgeIds.has(badge.id) ? 100 : (userBadge?.progress || 0),
            max_progress: userBadge?.max_progress || 100,
            count: userBadges?.filter(ub => ub.badge_id === badge.id).length || 0,
            collection: badge.badge_collections,
          };
        });
        setAllBadges(formattedBadges);
      }

      // Load downline team (3 levels deep)
      await loadDownlineTeam(user.id);

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'achievement',
          title: 'Earned Silver Badge',
          description: 'Monthly Volume Achievement',
          date: new Date().toISOString(),
          icon: Trophy,
        },
        {
          id: '2',
          type: 'performance',
          title: 'Loan Closed',
          description: '$450,000 conventional loan',
          date: new Date(Date.now() - 86400000).toISOString(),
          icon: CheckCircle,
        },
        {
          id: '3',
          type: 'milestone',
          title: 'Rank Improvement',
          description: 'Moved up to #12 in leaderboard',
          date: new Date(Date.now() - 172800000).toISOString(),
          icon: TrendingUp,
        },
      ]);

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    if (!user) return;
    
    try {
      // Fetch all badges with user earned status
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges!left (
            date_obtained,
            user_id
          )
        `);

      if (badgesError) throw badgesError;

      // Process badges to include earned status and count
      const processedBadges = badgesData?.map(badge => {
        const userBadges = badge.user_badges?.filter((ub: any) => ub.user_id === user.id) || [];
        const earned = userBadges.length > 0;
        const count = userBadges.length;
        const earned_date = earned ? userBadges[0]?.date_obtained : null;

        // Dynamic progress based on badge requirements
        let progress = undefined;
        let max_progress = undefined;
        
        if (!earned && badge.requirements) {
          // Parse requirements to extract numbers for progress tracking
          const req = badge.requirements.toLowerCase();
          
          if (req.includes('close') && req.includes('loan')) {
            // Extract loan count requirement (e.g., "Close 6 loans" -> max_progress = 6)
            const match = req.match(/close\s+(\d+)\s+loan/);
            if (match) {
              max_progress = parseInt(match[1]);
              // Mock current progress (in real app, this would come from user's actual loan data)
              progress = Math.floor(Math.random() * max_progress);
            }
          } else if (req.includes('recruit') && req.includes('member')) {
            // Extract recruitment requirement (e.g., "Recruit 3 members" -> max_progress = 3)
            const match = req.match(/recruit\s+(\d+)\s+member/);
            if (match) {
              max_progress = parseInt(match[1]);
              progress = Math.floor(Math.random() * max_progress);
            }
          } else if (req.includes('volume') && req.includes('million')) {
            // Extract volume requirement (e.g., "Achieve $2 million volume" -> max_progress = 2)
            const match = req.match(/\$(\d+)\s+million/);
            if (match) {
              max_progress = parseInt(match[1]);
              progress = Math.floor(Math.random() * max_progress);
            }
          } else if (req.includes('month')) {
            // Extract monthly requirement (e.g., "Active for 12 months" -> max_progress = 12)
            const match = req.match(/(\d+)\s+month/);
            if (match) {
              max_progress = parseInt(match[1]);
              progress = Math.floor(Math.random() * max_progress);
            }
          } else if (req.includes('rank') && req.includes('top')) {
            // Extract ranking requirement (e.g., "Reach top 10" -> max_progress = 10, progress = current_rank)
            const match = req.match(/top\s+(\d+)/);
            if (match) {
              max_progress = parseInt(match[1]);
              progress = Math.max(1, Math.floor(Math.random() * (max_progress + 5))); // Current rank
            }
          }
        }

        return {
          ...badge,
          earned,
          count: count > 1 ? count : undefined,
          earned_date,
          progress,
          max_progress
        };
      }) || [];

      setAllBadges(processedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const loadDownlineTeam = async (userId: string, level: number = 1): Promise<TeamMember[]> => {
    if (level > 3) return []; // Limit to 3 levels

    const { data: directReports } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        avatar,
        status,
        monthly_performance (
          loan_volume,
          recruitment_tier
        )
      `)
      .eq('upline_id', userId);

    if (!directReports) return [];

    const teamMembers: TeamMember[] = [];
    
    for (const report of directReports) {
      const children = level < 3 ? await loadDownlineTeam(report.id, level + 1) : [];
      
      teamMembers.push({
        id: report.id,
        name: report.name,
        email: report.email,
        role: report.role || 'Loan Officer',
        avatar: report.avatar,
        status: report.status || 'active',
        level,
        monthly_volume: report.monthly_performance?.[0]?.loan_volume || 0,
        recruitment_tier: report.monthly_performance?.[0]?.recruitment_tier || 1,
        children,
      });
    }

    if (level === 1) {
      setDownlineTeam(teamMembers);
    }
    
    return teamMembers;
  };

  const handleSaveProfile = async () => {
    if (!user?.id || !userProfile) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          location: editForm.location,
          bio: editForm.bio,
          department: editForm.department,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? {
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        location: editForm.location,
        bio: editForm.bio,
        department: editForm.department,
      } : null);

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 via-orange-400 to-red-500';
      case 'epic': return 'from-purple-500 via-pink-500 to-purple-600';
      case 'rare': return 'from-blue-400 via-cyan-400 to-blue-500';
      case 'common': return 'from-green-400 via-emerald-400 to-green-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/50';
      case 'epic': return 'border-purple-400 shadow-purple-400/50';
      case 'rare': return 'border-blue-400 shadow-blue-400/50';
      case 'common': return 'border-green-400 shadow-green-400/50';
      default: return 'border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return Crown;
      case 'epic': return Gem;
      case 'rare': return Star;
      case 'common': return Sparkles;
      default: return Trophy;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'performance': return CheckCircle;
      case 'milestone': return TrendingUp;
      default: return Activity;
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTeamMember = (member: TeamMember, depth: number = 0) => {
    const hasChildren = member.children && member.children.length > 0;
    const isExpanded = expandedNodes.has(member.id);
    const indentClass = depth > 0 ? `ml-${depth * 6}` : '';

    return (
      <div key={member.id} className="space-y-2">
        <div className={`flex items-center gap-3 p-4 border-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:border-blue-300 ${indentClass} bg-white border-gray-200`}>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 hover:bg-blue-100"
              onClick={() => toggleNodeExpansion(member.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          )}
          
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-sm bg-gradient-to-br from-[#032F60] to-[#1a4a73] text-white font-bold">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{member.name}</h4>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Level {member.level}
              </Badge>
              <Badge className={`text-xs ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {member.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{member.role}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${(member.monthly_volume / 1000000).toFixed(1)}M
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Tier {member.recruitment_tier}
              </span>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-2 ml-4 border-l-2 border-blue-100 pl-4">
            {member.children!.map(child => renderTeamMember(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-[#032F60] mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 animate-pulse"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center py-20 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Not Found</h3>
          <p className="text-gray-500">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#032F60] to-[#1a4a73] rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#032F60] to-[#1a4a73] bg-clip-text text-transparent">
                My Profile
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your profile and track your achievements
              </p>
            </div>
          </div>
          <Button
            onClick={() => editing ? handleSaveProfile() : setEditing(true)}
            className="bg-gradient-to-r from-[#032F60] to-[#1a4a73] hover:from-[#1a4a73] hover:to-[#032F60] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {editing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-lg rounded-xl p-2 shadow-lg border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Performance</TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Badges</TabsTrigger>
            <TabsTrigger value="genealogy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Team</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#032F60] data-[state=active]:to-[#1a4a73] data-[state=active]:text-white rounded-lg transition-all duration-300">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={userProfile.avatar} />
                        <AvatarFallback className="text-2xl bg-[#032F60] text-white">
                          {userProfile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          variant="outline"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {userProfile.name}
                        </h3>
                        <p className="text-gray-600 mb-2">{userProfile.role}</p>
                        <Badge className="bg-green-100 text-green-800">
                          {userProfile.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{userProfile.email}</span>
                    </div>
                    
                    {editing ? (
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    ) : userProfile.phone ? (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{userProfile.phone}</span>
                      </div>
                    ) : null}

                    {editing ? (
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Location"
                          />
                        </div>
                      </div>
                    ) : userProfile.location ? (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{userProfile.location}</span>
                      </div>
                    ) : null}

                    {userProfile.nmls_number && (
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">NMLS: {userProfile.nmls_number}</span>
                      </div>
                    )}

                    {userProfile.hire_date && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Joined {new Date(userProfile.hire_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Department</Label>
                      {editing ? (
                        <Input
                          value={editForm.department}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="Department"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.department || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Manager</Label>
                      <p className="text-gray-900">{userProfile.manager || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Bio</Label>
                    {editing ? (
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">
                        {userProfile.bio || 'No bio provided yet.'}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-[#032F60] hover:bg-[#1a4a73]"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setEditForm({
                            name: userProfile.name,
                            phone: userProfile.phone || "",
                            location: userProfile.location || "",
                            bio: userProfile.bio || "",
                            department: userProfile.department || "",
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            {userPerformance && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Current Rank</p>
                        <p className="text-2xl font-bold text-[#032F60]">{allBadges.filter(b => b.earned).length}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Monthly Volume</p>
                        <p className="text-2xl font-bold text-[#032F60]">
                          ${(userPerformance.monthly_volume / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Spark Points</p>
                        <p className="text-2xl font-bold text-[#032F60]">
                          {userPerformance.spark_points.toLocaleString()}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Achievements</p>
                        <p className="text-2xl font-bold text-[#032F60]">{achievements.length}</p>
                      </div>
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {userPerformance ? (
              <>
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Monthly Volume</p>
                        <p className="text-2xl font-bold text-[#032F60]">
                          ${(userPerformance.monthly_volume / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-sm text-gray-500">{userPerformance.monthly_loans} loans</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">YTD Volume</p>
                        <p className="text-2xl font-bold text-[#032F60]">
                          ${(userPerformance.ytd_volume / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-sm text-gray-500">{userPerformance.ytd_loans} loans</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">Current Rank</p>
                        <p className="text-2xl font-bold text-[#032F60]">#{userPerformance.rank}</p>
                        <p className="text-sm text-gray-500">Leaderboard position</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">FIRE Fund</p>
                        <p className="text-2xl font-bold text-[#032F60]">
                          ${(userPerformance.fire_fund / 1000).toFixed(1)}K
                        </p>
                        <p className="text-sm text-gray-500">Retirement savings</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span>{userPerformance.completion_rate}%</span>
                        </div>
                        <Progress value={userPerformance.completion_rate} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Recruitment Tier:</span>
                          <span className="font-semibold">Tier {userPerformance.recruitment_tier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Recruits:</span>
                          <span className="font-semibold">{userPerformance.active_recruits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Spark Points:</span>
                          <span className="font-semibold">{userPerformance.spark_points.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Goals & Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Monthly Volume Goal</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            ${(userPerformance.monthly_volume / 1000000).toFixed(1)}M of $4.0M goal
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>YTD Volume Goal</span>
                            <span>82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            ${(userPerformance.ytd_volume / 1000000).toFixed(1)}M of $40M goal
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Performance Data</h3>
                <p className="text-gray-500">Performance metrics will appear here once available</p>
              </div>
            )}
          </TabsContent>

          {/* Enhanced Badges Tab */}
          <TabsContent value="badges" className="space-y-8">
            <div className="space-y-8">
              {/* Badge Shelf Header */}
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#032F60] to-[#1a4a73] bg-clip-text text-transparent mb-2">
                  Achievement Gallery
                </h3>
                <p className="text-gray-600">Your collection of earned badges and achievements</p>
              </div>

              {/* Collections */}
              {(() => {
                // Group badges by collection
                const badgesByCollection = allBadges.reduce((acc, badge) => {
                  const collectionKey = badge.collection?.id || 'uncategorized';
                  const collectionName = badge.collection?.name || 'General Achievements';
                  const collectionColor = badge.collection?.color || '#f3f4f6';
                  const collectionDescription = badge.collection?.description || 'General achievement badges';
                  
                  if (!acc[collectionKey]) {
                    acc[collectionKey] = {
                      name: collectionName,
                      color: collectionColor,
                      description: collectionDescription,
                      badges: []
                    };
                  }
                  acc[collectionKey].badges.push(badge);
                  return acc;
                }, {} as Record<string, { name: string; color: string; description: string; badges: BadgeItem[] }>);

                return Object.entries(badgesByCollection).map(([collectionId, collection]) => (
                  <div key={collectionId} className="relative">
                    {/* Collection Header */}
                    <div className="mb-6 text-center">
                      <div 
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg border-2 border-white/50"
                        style={{ backgroundColor: collection.color }}
                      >
                        <Package className="h-6 w-6 text-gray-700" />
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">
                            {collection.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {collection.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-400">
                          {collection.badges.filter(b => b.earned).length}/{collection.badges.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Pegboard Background */}
                    <div className="relative bg-gray-100 rounded-2xl p-8 shadow-2xl border-2 border-gray-200">
                      {/* Pegboard holes pattern */}
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at center, #9ca3af 2px, transparent 2px)`,
                        backgroundSize: '30px 30px',
                        backgroundPosition: '15px 15px'
                      }}></div>
                      
                      {/* Badges Grid */}
                      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                        {collection.badges.map((badge) => {
                          const RarityIcon = getRarityIcon(badge.rarity);
                          return (
                            <div
                              key={badge.id}
                              className={`relative group transition-all duration-500 hover:scale-110 cursor-pointer ${
                                badge.earned ? 'transform hover:rotate-3' : ''
                              }`}
                              onClick={() => {
                                setSelectedBadge(badge);
                                setShowBadgeModal(true);
                              }}
                            >
                              {/* Peg */}
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-2 h-4 bg-gray-600 rounded-full shadow-lg z-10"></div>
                              
                              {/* Badge Count (if multiple) */}
                              {badge.earned && badge.count && badge.count > 1 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                  {badge.count}
                                </div>
                              )}
                              
                              {/* Badge Container */}
                              <div
                                className={`relative p-4 rounded-2xl text-center transition-all duration-500 ${
                                  badge.earned 
                                    ? `shadow-2xl ${getRarityBorder(badge.rarity)} border-4` 
                                    : 'bg-gray-300 border-4 border-gray-400 opacity-60'
                                }`}
                                style={badge.earned && badge.color ? { backgroundColor: badge.color } : {}}
                              >
                                {/* Locked Overlay */}
                                {!badge.earned && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-2xl backdrop-blur-sm">
                                    <div className="text-center">
                                      <Lock className="h-8 w-8 text-white mx-auto mb-2" />
                                      <span className="text-white text-xs font-semibold">LOCKED</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Sparkle Effects for Earned Badges */}
                                {badge.earned && (
                                  <>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                                    <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-200 rounded-full animate-pulse delay-700"></div>
                                  </>
                                )}
                                
                                {/* Badge Icon */}
                                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center relative ${
                                  badge.earned 
                                    ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                                    : 'bg-gray-400'
                                }`}>
                                  {badge.image_url ? (
                                    <img 
                                      src={badge.image_url} 
                                      alt={badge.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  ) : (
                                    <RarityIcon className={`h-8 w-8 ${badge.earned ? 'text-white drop-shadow-lg' : 'text-gray-500'}`} />
                                  )}
                                  
                                  {/* Rarity Indicator */}
                                  {badge.earned && (
                                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} border-2 border-white shadow-lg flex items-center justify-center`}>
                                      <RarityIcon className="h-2 w-2 text-white" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Badge Info */}
                                <h4 className={`font-bold text-xs mb-1 ${badge.earned ? 'text-white drop-shadow-lg' : 'text-gray-500'}`}>
                                  {badge.name}
                                </h4>
                                
                                <p className={`text-xs mb-2 line-clamp-2 ${badge.earned ? 'text-white/90' : 'text-gray-400'}`}>
                                  {badge.description}
                                </p>
                                
                                {/* Rarity Badge */}
                                <div className="flex justify-center mb-2">
                                  <Badge 
                                    className={`text-xs font-bold px-2 py-1 ${
                                      badge.earned 
                                        ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm' 
                                        : 'bg-gray-200 text-gray-500 border-gray-300'
                                    }`}
                                  >
                                    {badge.rarity.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                {/* Tier Badge */}
                                {badge.tier && (
                                  <div className="flex justify-center mb-2">
                                    <Badge 
                                      className={`text-xs font-bold px-2 py-1 ${
                                        badge.earned 
                                          ? 'bg-black/20 text-gray-700 border-gray-300' 
                                          : 'bg-gray-300 text-gray-600 border-gray-400'
                                      }`}
                                    >
                                      {badge.tier.toUpperCase()}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Earned Date */}
                                {badge.earned && badge.earned_date && (
                                  <p className="text-xs text-white/80 font-medium">
                                    {new Date(badge.earned_date).toLocaleDateString()}
                                  </p>
                                )}
                                
                                {/* Progress Bar for Unearned */}
                                {!badge.earned && badge.progress !== undefined && badge.max_progress && (
                                  <div className="mt-3">
                                    <Progress 
                                      value={(badge.progress / badge.max_progress) * 100} 
                                      className="h-2 bg-gray-300" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                      {badge.progress}/{badge.max_progress}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 max-w-48">
                                {badge.earned ? `🏆 ${badge.name} - Click for details` : `🔒 ${badge.requirements || 'Complete requirements to unlock'}`}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </TabsContent>

          {/* Enhanced Genealogy/Team Tab */}
          <TabsContent value="genealogy" className="space-y-8">
            <div className="space-y-8">
              {/* Upline Section */}
              {uplineProfile && (
                <Card className="bg-white/80 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      Direct Upline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                          <AvatarImage src={uplineProfile.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#032F60] to-[#1a4a73] text-white text-xl font-bold">
                            {uplineProfile.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{uplineProfile.name}</h4>
                        <p className="text-gray-600 mb-1">{uplineProfile.role}</p>
                        <p className="text-gray-500 text-sm">{uplineProfile.email}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        {uplineProfile.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Downline Section */}
              <Card className="bg-white/80 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Network className="h-5 w-5" />
                    </div>
                    My Team Network
                    <Badge variant="outline" className="ml-auto bg-white/20 text-white border-white/30">
                      {downlineTeam.reduce((total, member) => {
                        const countMembers = (m: TeamMember): number => {
                          return 1 + (m.children?.reduce((sum, child) => sum + countMembers(child), 0) || 0);
                        };
                        return total + countMembers(member);
                      }, 0)} Total Members
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {downlineTeam.length > 0 ? (
                    <div className="space-y-4">
                      {downlineTeam.map(member => renderTeamMember(member))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                      <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Build Your Team</h3>
                      <p className="text-gray-500">Start recruiting to grow your network</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Statistics */}
              {downlineTeam.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Level 1 (Direct)", value: downlineTeam.length, color: "from-green-400 to-emerald-500" },
                    { label: "Level 2", value: downlineTeam.reduce((sum, member) => sum + (member.children?.length || 0), 0), color: "from-blue-400 to-cyan-500" },
                    { label: "Level 3", value: downlineTeam.reduce((sum, member) => sum + (member.children?.reduce((childSum, child) => childSum + (child.children?.length || 0), 0) || 0), 0), color: "from-purple-400 to-pink-500" }
                  ].map((stat, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-[#032F60] to-[#1a4a73] bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-[#032F60]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Settings Coming Soon</h3>
                  <p className="text-gray-500">Advanced profile settings will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Badge Details Modal */}
        <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedBadge?.earned ? (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                ) : (
                  <Lock className="h-6 w-6 text-gray-400" />
                )}
                {selectedBadge?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedBadge && (
              <div className="space-y-4">
                {/* Badge Visual */}
                <div className="flex justify-center">
                  <div className={`relative p-6 rounded-2xl ${
                    selectedBadge.earned 
                      ? `shadow-2xl ${getRarityBorder(selectedBadge.rarity)} border-4` 
                      : 'bg-gray-300 border-4 border-gray-400 opacity-60'
                  }`}
                  style={selectedBadge.earned && selectedBadge.color ? { backgroundColor: selectedBadge.color } : {}}>
                    {selectedBadge.image_url ? (
                      <img 
                        src={selectedBadge.image_url} 
                        alt={selectedBadge.name}
                        className="w-16 h-16 object-contain mx-auto"
                      />
                    ) : (
                      <Trophy className={`h-16 w-16 mx-auto ${selectedBadge.earned ? 'text-white' : 'text-gray-500'}`} />
                    )}
                    
                    {/* Count Badge */}
                    {selectedBadge.earned && selectedBadge.count && selectedBadge.count > 1 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        {selectedBadge.count}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Info */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center gap-2">
                    <Badge className={`${
                      selectedBadge.earned 
                        ? 'bg-white/20 text-gray-700 border-gray-300' 
                        : 'bg-gray-200 text-gray-500 border-gray-300'
                    }`}>
                      {selectedBadge.rarity.toUpperCase()}
                    </Badge>
                    {selectedBadge.tier && (
                      <Badge className={`${
                        selectedBadge.earned 
                          ? 'bg-black/20 text-gray-700 border-gray-300' 
                          : 'bg-gray-300 text-gray-600 border-gray-400'
                      }`}>
                        {selectedBadge.tier.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {selectedBadge.description}
                  </p>
                </div>

                {/* Status */}
                {selectedBadge.earned ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Achievement Unlocked!</span>
                    </div>
                    {selectedBadge.earned_date && (
                      <p className="text-green-700 text-sm">
                        Earned on {new Date(selectedBadge.earned_date).toLocaleDateString()}
                      </p>
                    )}
                    {selectedBadge.count && selectedBadge.count > 1 && (
                      <p className="text-green-700 text-sm mt-1">
                        Earned {selectedBadge.count} times
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Lock className="h-5 w-5" />
                      <span className="font-semibold">Requirements</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {selectedBadge.requirements || 'Complete specific tasks to unlock this badge'}
                    </p>
                    
                    {/* Progress Bar */}
                    {selectedBadge.progress !== undefined && selectedBadge.max_progress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{selectedBadge.progress}/{selectedBadge.max_progress}</span>
                        </div>
                        <Progress 
                          value={(selectedBadge.progress / selectedBadge.max_progress) * 100} 
                          className="h-3" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Current: {selectedBadge.progress}</span>
                          <span>Target: {selectedBadge.max_progress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}