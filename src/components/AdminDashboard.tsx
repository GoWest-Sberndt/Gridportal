import React, { useState, useEffect } from "react";
import {
  Users,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  MessageSquare,
  Zap,
  Gift,
  Coins,
  Award,
  Trophy,
  Video,
  BookOpen,
  Newspaper,
  Upload,
  Save,
  X,
  Star,
  PlayCircle,
  Image,
  Link,
  Tag,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers, supabase } from "@/lib/supabase";
import AdminQuickAccessManager from "@/components/AdminQuickAccessManager";
import AdminNewsManager from "@/components/AdminNewsManager";
import AdminAdManager from "@/components/AdminAdManager";

interface AdminDashboardProps {
  className?: string;
}

// Learning Content Management Component
function LearningContentManagement({
  learningContent,
  setLearningContent,
  showAddModal,
  setShowAddModal,
  isLoading,
  setIsLoading,
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    category: "",
    status: "draft",
    duration: "",
    description: "",
    url: "",
    thumbnail: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would call the Supabase helper
      const newItem = {
        id: editingItem?.id || Date.now().toString(),
        ...formData,
        views: editingItem?.views || 0,
        created_at: editingItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingItem) {
        setLearningContent((prev) =>
          prev.map((item) => (item.id === editingItem.id ? newItem : item)),
        );
      } else {
        setLearningContent((prev) => [newItem, ...prev]);
      }

      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        title: "",
        type: "video",
        category: "",
        status: "draft",
        duration: "",
        description: "",
        url: "",
        thumbnail: "",
      });
    } catch (error) {
      console.error("Error saving learning content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      type: item.type || "video",
      category: item.category || "",
      status: item.status || "draft",
      duration: item.duration || "",
      description: item.description || "",
      url: item.url || "",
      thumbnail: item.thumbnail || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this learning content?")) {
      setLearningContent((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setAutoGenerateThumbnail(false);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
    setThumbnailPreview(url);
    setAutoGenerateThumbnail(false);
    setThumbnailFile(null);
  };

  const handleAutoGenerateToggle = (checked) => {
    setAutoGenerateThumbnail(checked);
    if (checked) {
      setThumbnailFile(null);
      setThumbnailPreview("");
      setFormData((prev) => ({ ...prev, thumbnail: "" }));
    }
  };

  const getPreviewThumbnail = () => {
    if (thumbnailPreview) return thumbnailPreview;

    if (
      formData.type === "video" &&
      formData.youtube_content &&
      autoGenerateThumbnail
    ) {
      const videoIdMatch = formData.youtube_content.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      );
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#032F60]" />
                Learning Content Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage training videos, documents, and educational resources
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#032F60] hover:bg-[#1a4a73]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.type === "video" ? (
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-green-600" />
                      )}
                      <Badge
                        variant={
                          item.status === "published" ? "default" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    {item.duration && (
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{item.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Views:</span>
                      <span className="font-medium">{item.views || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Learning Content" : "Add Learning Content"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the learning content details below."
                : "Create new learning content for your team."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g., Training, Guidelines"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === "video" && (
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 15:30"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="url">Content URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Thumbnail</Label>
              <div className="space-y-4">
                {/* Thumbnail Options */}
                <div className="flex items-center space-x-4">
                  {formData.type === "video" && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto_generate_thumbnail"
                        checked={autoGenerateThumbnail}
                        onChange={(e) =>
                          handleAutoGenerateToggle(e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label
                        htmlFor="auto_generate_thumbnail"
                        className="text-sm"
                      >
                        Auto-generate from YouTube
                      </Label>
                    </div>
                  )}
                </div>

                {!autoGenerateThumbnail && (
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <Label
                        htmlFor="thumbnail_file"
                        className="text-sm font-medium"
                      >
                        Upload Image
                      </Label>
                      <input
                        type="file"
                        id="thumbnail_file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {/* URL Input */}
                    <div>
                      <Label
                        htmlFor="thumbnail_url"
                        className="text-sm font-medium"
                      >
                        Or enter URL
                      </Label>
                      <Input
                        id="thumbnail_url"
                        value={formData.thumbnail}
                        onChange={(e) =>
                          handleThumbnailUrlChange(e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnail Preview */}
                {getPreviewThumbnail() && (
                  <div>
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="mt-2 relative inline-block">
                      <img
                        src={getPreviewThumbnail()}
                        alt="Thumbnail preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <div
                        className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500"
                        style={{ display: "none" }}
                      >
                        Preview not available
                      </div>
                      {autoGenerateThumbnail && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                          Auto
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#032F60] hover:bg-[#1a4a73]"
              >
                {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard({
  className = "",
}: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPITSystem, setShowPITSystem] = useState(false);
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState("");
  const [learningContent, setLearningContent] = useState([]);
  const [newsContent, setNewsContent] = useState([]);
  const [showAddLearningModal, setShowAddLearningModal] = useState(false);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "Loan Officer",
    internal_role: "user",
    department: "",
    phone: "",
    nmls_number: "",
    client_facing_title: "",
    monthly_loan_volume: 0,
    is_producing: false,
    status: "active",
    recruiter_id: "",
  });

  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVolume: 0,
    monthlyGrowth: 0,
    pendingApprovals: 0,
    systemAlerts: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [systemActivity, setSystemActivity] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load various admin dashboard data
        const [
          usersData,
          activityData,
          metricsData,
          videoData,
          learningData,
          newsData,
        ] = await Promise.allSettled([
          supabaseHelpers.getUsers(),
          supabaseHelpers.getSystemActivity?.() || Promise.resolve([]),
          supabaseHelpers.getPerformanceMetrics?.() || Promise.resolve([]),
          supabaseHelpers.getFeaturedVideoUrl(),
          supabaseHelpers.getLearningContent(),
          supabaseHelpers.getNews(),
        ]);

        // Process users data
        if (usersData.status === "fulfilled" && usersData.value) {
          const users = usersData.value;
          setRecentUsers(users.slice(0, 10));

          // Calculate stats
          const totalUsers = users.length;
          const activeUsers = users.filter((u) => u.is_active !== false).length;
          const totalVolume = users.reduce(
            (sum, u) => sum + (u.monthly_loan_volume || 0),
            0,
          );

          setDashboardStats((prev) => ({
            ...prev,
            totalUsers,
            activeUsers,
            totalVolume,
            monthlyGrowth: 12.5, // Mock data
            pendingApprovals: Math.floor(totalUsers * 0.1),
            systemAlerts: 3, // Mock data
          }));
        }

        // Process activity data
        if (activityData.status === "fulfilled" && activityData.value) {
          setSystemActivity(activityData.value.slice(0, 20));
        }

        // Process metrics data
        if (metricsData.status === "fulfilled" && metricsData.value) {
          setPerformanceMetrics(metricsData.value);
        }

        // Load featured video URL
        if (videoData.status === "fulfilled" && videoData.value) {
          setFeaturedVideoUrl(videoData.value);
        }

        // Update learning content if successful
        if (learningData.status === "fulfilled" && learningData.value) {
          setLearningContent(learningData.value);
        }

        // Update news content if successful
        if (newsData.status === "fulfilled" && newsData.value) {
          setNewsContent(newsData.value);
        }
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // User management functions
  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      role: "Loan Officer",
      internal_role: "user",
      department: "",
      phone: "",
      nmls_number: "",
      client_facing_title: "",
      monthly_loan_volume: 0,
      is_producing: false,
      status: "active",
      recruiter_id: "",
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Loan Officer",
      internal_role: user.internal_role || "user",
      department: user.department || "",
      phone: user.phone || "",
      nmls_number: user.nmls_number || "",
      client_facing_title: user.client_facing_title || "",
      monthly_loan_volume: user.monthly_loan_volume || 0,
      is_producing: user.is_producing || false,
      status: user.status || "active",
      recruiter_id: user.recruiter_id || "",
    });
    setShowAddUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await supabaseHelpers.deleteUser(userId);

      // Remove user from local state
      setRecentUsers((prev) => prev.filter((user) => user.id !== userId));

      // Update dashboard stats
      setDashboardStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: prev.activeUsers - 1,
      }));

      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await supabaseHelpers.updateUser(
          editingUser.id,
          userFormData,
        );

        // Update local state
        setRecentUsers((prev) =>
          prev.map((user) => (user.id === editingUser.id ? updatedUser : user)),
        );

        alert("User updated successfully!");
      } else {
        // Create new user - generate a UUID for the user ID
        const userId = crypto.randomUUID();
        const newUser = await supabaseHelpers.createUser({
          id: userId,
          ...userFormData,
        });

        // Add to local state
        setRecentUsers((prev) => [newUser, ...prev]);

        // Update dashboard stats
        setDashboardStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers:
            userFormData.status === "active"
              ? prev.activeUsers + 1
              : prev.activeUsers,
        }));

        alert("User created successfully!");
      }

      // Close modal and reset form
      setShowAddUserModal(false);
      setEditingUser(null);
      resetUserForm();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(
        `Failed to ${editingUser ? "update" : "create"} user. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage users, monitor system performance, and oversee operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users, activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-11 max-w-7xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="spark-points">Spark Points</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="pit">PIT System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.activeUsers} active users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Volume
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardStats.totalVolume)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approvals
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.pendingApprovals}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Require admin attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Alerts
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.systemAlerts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active system issues
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Users
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.is_active !== false ? "default" : "secondary"
                            }
                          >
                            {user.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemActivity.length > 0
                      ? systemActivity.slice(0, 5).map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div className="flex-shrink-0">
                              <Activity className="h-4 w-4 text-blue-500 mt-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      : // Mock activity data
                        [
                          {
                            description: "New user registration: John Doe",
                            time: "2 minutes ago",
                          },
                          {
                            description: "System backup completed successfully",
                            time: "1 hour ago",
                          },
                          {
                            description: "Performance metrics updated",
                            time: "3 hours ago",
                          },
                          {
                            description: "User role updated: Jane Smith",
                            time: "5 hours ago",
                          },
                          {
                            description: "Database maintenance completed",
                            time: "1 day ago",
                          },
                        ].map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div className="flex-shrink-0">
                              <Activity className="h-4 w-4 text-blue-500 mt-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  User Management
                  <Button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#032F60] hover:bg-[#1a4a73]"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {user.name || "Unknown User"}
                          </h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            Role: {user.role || "User"} | Internal:{" "}
                            {user.internal_role || "user"} | NMLS:{" "}
                            {user.nmls_number || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            Department: {user.department || "N/A"} | Volume:{" "}
                            {formatCurrency(user.monthly_loan_volume || 0)}
                          </p>
                          {user.recruiter_id && (
                            <p className="text-xs text-gray-400">
                              Recruiter:{" "}
                              {recentUsers.find(
                                (u) => u.id === user.recruiter_id,
                              )?.name || "Unknown"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                        >
                          {user.status || "Active"}
                        </Badge>
                        <Badge
                          variant={
                            user.internal_role === "admin"
                              ? "destructive"
                              : user.internal_role === "manager"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {user.internal_role || "user"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add/Edit User Modal */}
            <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Update the user information below."
                      : "Create a new user account with the details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userFormData.name}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={userFormData.role}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        placeholder="e.g., Loan Officer, Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="internal_role">Internal Role</Label>
                      <Select
                        value={userFormData.internal_role}
                        onValueChange={(value) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            internal_role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={userFormData.department}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        placeholder="e.g., Sales, Operations"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={userFormData.phone}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nmls_number">NMLS Number</Label>
                      <Input
                        id="nmls_number"
                        value={userFormData.nmls_number}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            nmls_number: e.target.value,
                          }))
                        }
                        placeholder="123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_facing_title">
                        Client Facing Title
                      </Label>
                      <Input
                        id="client_facing_title"
                        value={userFormData.client_facing_title}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            client_facing_title: e.target.value,
                          }))
                        }
                        placeholder="Senior Loan Officer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthly_loan_volume">
                        Monthly Loan Volume
                      </Label>
                      <Input
                        id="monthly_loan_volume"
                        type="number"
                        value={userFormData.monthly_loan_volume}
                        onChange={(e) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            monthly_loan_volume: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="2500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={userFormData.status}
                        onValueChange={(value) =>
                          setUserFormData((prev) => ({
                            ...prev,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recruiter_id">Recruiter</Label>
                    <Select
                      value={userFormData.recruiter_id}
                      onValueChange={(value) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          recruiter_id: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recruiter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Recruiter</SelectItem>
                        {recentUsers
                          .filter((u) => u.id !== editingUser?.id) // Don't allow self-recruitment
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_producing"
                      checked={userFormData.is_producing}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          is_producing: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="is_producing">Is Producing</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddUserModal(false);
                        setEditingUser(null);
                        resetUserForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#032F60] hover:bg-[#1a4a73]"
                    >
                      {loading
                        ? "Saving..."
                        : editingUser
                          ? "Update User"
                          : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Average Loan Volume
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(
                          dashboardStats.totalVolume /
                            Math.max(dashboardStats.totalUsers, 1),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        User Growth Rate
                      </span>
                      <span className="text-sm text-green-600">
                        +{dashboardStats.monthlyGrowth}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-sm text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Active Sessions
                      </span>
                      <span className="text-sm text-gray-600">
                        {dashboardStats.activeUsers}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers
                      .sort(
                        (a, b) =>
                          (b.monthly_loan_volume || 0) -
                          (a.monthly_loan_volume || 0),
                      )
                      .slice(0, 5)
                      .map((user, index) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {user.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.role || "User"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(user.monthly_loan_volume || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Monthly Volume
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Spark Points Tab */}
          <TabsContent value="spark-points" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spark Points Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Spark Points Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">
                            Total Points Awarded
                          </span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          125,450
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Points Redeemed
                          </span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          45,200
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Active Users with Points</span>
                        <span className="font-medium">87</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Pending Redemptions</span>
                        <span className="font-medium text-orange-600">12</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Available Rewards</span>
                        <span className="font-medium">24</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Award Points to User
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Gift className="h-4 w-4 mr-2" />
                      Create New Reward
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Point Rules
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View All Redemptions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Point Earners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Top Point Earners
                  </div>
                  <Button variant="outline" size="sm">
                    View Leaderboard
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah Johnson",
                      points: 4250,
                      avatar:
                        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
                      rank: 1,
                    },
                    {
                      name: "Jimmy Hendrix",
                      points: 3890,
                      avatar:
                        "https://images.unsplash.com/photo-1507003211033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                      rank: 2,
                    },
                    {
                      name: "Michael Chen",
                      points: 3650,
                      avatar:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                      rank: 3,
                    },
                    {
                      name: "Emily Rodriguez",
                      points: 3200,
                      avatar:
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                      rank: 4,
                    },
                  ].map((user) => (
                    <div
                      key={user.rank}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.rank}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            {user.points.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Redemptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Recent Redemptions
                  </div>
                  <Button variant="outline" size="sm">
                    Manage All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      user: "Sarah Johnson",
                      reward: "Amazon Gift Card - $50",
                      points: 1000,
                      status: "pending",
                      date: "2 hours ago",
                    },
                    {
                      user: "Jimmy Hendrix",
                      reward: "Extra PTO Day",
                      points: 2000,
                      status: "approved",
                      date: "1 day ago",
                    },
                    {
                      user: "Michael Chen",
                      reward: "Premium Parking Spot",
                      points: 750,
                      status: "fulfilled",
                      date: "3 days ago",
                    },
                  ].map((redemption, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">
                            {redemption.user}
                          </p>
                          <Badge
                            variant={
                              redemption.status === "pending"
                                ? "secondary"
                                : redemption.status === "approved"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {redemption.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {redemption.reward}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600 font-medium">
                            {redemption.points} points
                          </span>
                          <span className="text-xs text-gray-500">
                            {redemption.date}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Database Status
                      </span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Status</span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage Usage</span>
                      <span className="text-sm text-gray-600">67% of 1TB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Backup</span>
                      <span className="text-sm text-gray-600">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats.systemAlerts > 0 ? (
                      [
                        {
                          type: "warning",
                          message: "High memory usage detected",
                          time: "5 minutes ago",
                        },
                        {
                          type: "info",
                          message: "Scheduled maintenance in 2 days",
                          time: "1 hour ago",
                        },
                        {
                          type: "error",
                          message: "Failed login attempts detected",
                          time: "3 hours ago",
                        },
                      ]
                        .slice(0, dashboardStats.systemAlerts)
                        .map((alert, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 border rounded-lg"
                          >
                            <AlertCircle
                              className={`h-4 w-4 mt-0.5 ${
                                alert.type === "error"
                                  ? "text-red-500"
                                  : alert.type === "warning"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {alert.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {alert.time}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          No active alerts
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PIT System Tab */}
          <TabsContent value="pit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Performance & Issues Ticketing System
                  </div>
                  <Button
                    onClick={() => setShowPITSystem(true)}
                    className="bg-[#032F60] hover:bg-[#1a4a73]"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open PIT System
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Manage Support Tickets
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Access the Performance & Issues Ticketing system to manage
                      user support requests, assign tickets, and track
                      resolution progress.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Create & Manage
                        </h4>
                        <p className="text-sm text-blue-700">
                          Create new tickets and manage existing ones with full
                          admin privileges
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">
                          Assign & Track
                        </h4>
                        <p className="text-sm text-green-700">
                          Assign tickets to team members and track resolution
                          progress
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">
                          Analytics
                        </h4>
                        <p className="text-sm text-purple-700">
                          View ticket statistics and performance metrics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <LearningContentManagement
              learningContent={learningContent}
              setLearningContent={setLearningContent}
              showAddModal={showAddLearningModal}
              setShowAddModal={setShowAddLearningModal}
              isLoading={isLoadingContent}
              setIsLoading={setIsLoadingContent}
            />
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <AdminNewsManager
              newsContent={newsContent}
              setNewsContent={setNewsContent}
              showAddModal={showAddNewsModal}
              setShowAddModal={setShowAddNewsModal}
              isLoading={isLoadingContent}
              setIsLoading={setIsLoadingContent}
              featuredVideoUrl={featuredVideoUrl}
              setFeaturedVideoUrl={setFeaturedVideoUrl}
            />
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <AdminAdManager />
          </TabsContent>

          {/* Quick Access Tab */}
          <TabsContent value="quick-access" className="space-y-6">
            <AdminQuickAccessManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Featured Video Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Featured Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Featured Video Source
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        The featured video is now automatically pulled from news
                        items marked as "featured" with type "video".
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-blue-600">
                          • Go to the News tab to manage video content
                        </p>
                        <p className="text-xs text-blue-600">
                          • Mark a video news item as "Featured" to display it
                        </p>
                        <p className="text-xs text-blue-600">
                          • Include the YouTube URL in the content field
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab("news")}
                      className="w-full"
                    >
                      Manage News & Videos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        General Settings
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User Registration</span>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Security Settings</span>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Data Management
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database Backup</span>
                          <Button variant="outline" size="sm">
                            Run Backup
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Export</span>
                          <Button variant="outline" size="sm">
                            Export Data
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Logs</span>
                          <Button variant="outline" size="sm">
                            View Logs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* PIT System Modal */}
      {showPITSystem && <AdminAdManager onClose={() => setShowPITSystem(false)} />}
    </div>
  );
}