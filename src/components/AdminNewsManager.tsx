import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
  FileText,
  Image,
  Link,
  Upload,
  Save,
  X,
  Star,
  PlayCircle,
  Calendar,
  User,
  Tag,
  Globe,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Newspaper,
  Filter,
  Search,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  author_avatar?: string;
  publish_date: string;
  created_at: string;
  updated_at: string;
  category: string;
  tags: string[];
  featured: boolean;
  image_url?: string;
  video_url?: string;
  video_thumbnail?: string;
  video_duration?: string;
  views: number;
  likes: number;
  comments_count: number;
  is_published: boolean;
  type: 'article' | 'video';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduled_date?: string;
  seo_title?: string;
  seo_description?: string;
  read_time?: string;
}

const categories = [
  { id: 'market-updates', label: 'Market Updates', color: 'bg-blue-100 text-blue-800' },
  { id: 'industry-news', label: 'Industry News', color: 'bg-green-100 text-green-800' },
  { id: 'company-updates', label: 'Company Updates', color: 'bg-purple-100 text-purple-800' },
  { id: 'training', label: 'Training & Education', color: 'bg-orange-100 text-orange-800' },
  { id: 'announcements', label: 'Announcements', color: 'bg-red-100 text-red-800' },
  { id: 'success-stories', label: 'Success Stories', color: 'bg-yellow-100 text-yellow-800' },
];

const contentTypes = [
  { id: 'article', label: 'Article', icon: FileText, description: 'Written content with rich text formatting' },
  { id: 'video', label: 'Video', icon: Video, description: 'YouTube videos or embedded video content' },
];

export default function AdminNewsManager() {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPreview, setShowPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: user?.name || "",
    category: "company-updates",
    type: "article" as "article" | "video",
    status: "draft" as "draft" | "published" | "scheduled" | "archived",
    priority: "medium" as "low" | "medium" | "high",
    tags: "",
    featured: false,
    image_url: "",
    video_url: "",
    video_duration: "",
    scheduled_date: "",
    seo_title: "",
    seo_description: "",
    read_time: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [autoGenerateThumbnail, setAutoGenerateThumbnail] = useState(true);

  // Load news data
  useEffect(() => {
    loadNewsData();
  }, []);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      const data = await supabaseHelpers.getNewsWithVideoData();
      
      if (data && data.length > 0) {
        const formattedNews: NewsItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content || '',
          excerpt: item.excerpt || item.content?.substring(0, 200) + '...' || '',
          author: item.author || 'Safire Team',
          author_avatar: item.author_avatar,
          publish_date: item.publish_date || item.created_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          category: item.category || 'company-updates',
          tags: item.tags || [],
          featured: item.featured || false,
          image_url: item.image_url,
          video_url: item.video_url,
          video_thumbnail: item.video_thumbnail,
          video_duration: item.video_duration,
          views: item.views || 0,
          likes: item.likes || 0,
          comments_count: item.comments_count || 0,
          is_published: item.is_published !== false,
          type: item.video_url ? 'video' : 'article',
          priority: item.priority || 'medium',
          status: item.status || 'draft',
          scheduled_date: item.scheduled_date,
          seo_title: item.seo_title,
          seo_description: item.seo_description,
          read_time: item.read_time,
        }));
        
        setNewsItems(formattedNews);
      } else {
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: user?.name || "",
      category: "company-updates",
      type: "article",
      status: "draft",
      priority: "medium",
      tags: "",
      featured: false,
      image_url: "",
      video_url: "",
      video_duration: "",
      scheduled_date: "",
      seo_title: "",
      seo_description: "",
      read_time: "",
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setAutoGenerateThumbnail(true);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      content: item.content || "",
      excerpt: item.excerpt || "",
      author: item.author || "",
      category: item.category || "company-updates",
      type: item.type || "article",
      status: item.status || "draft",
      priority: item.priority || "medium",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      featured: item.featured || false,
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      video_duration: item.video_duration || "",
      scheduled_date: item.scheduled_date || "",
      seo_title: item.seo_title || "",
      seo_description: item.seo_description || "",
      read_time: item.read_time || "",
    });
    setThumbnailPreview(item.image_url || item.video_thumbnail || "");
    setAutoGenerateThumbnail(!item.image_url && !item.video_thumbnail);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;

      setNewsItems(prev => prev.filter(item => item.id !== id));
      alert("News item deleted successfully!");
    } catch (error) {
      console.error("Error deleting news item:", error);
      alert("Failed to delete news item. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle thumbnail upload if file is provided
      let thumbnailUrl = formData.image_url;

      if (thumbnailFile) {
        try {
          const uploadedUrl = await supabaseHelpers.uploadNewsImage(
            thumbnailFile,
            Date.now().toString(),
          );
          thumbnailUrl = uploadedUrl;
        } catch (uploadError) {
          console.error("Error uploading thumbnail:", uploadError);
          alert("Failed to upload thumbnail. Using URL instead.");
        }
      } else if (
        formData.type === "video" &&
        formData.video_url &&
        autoGenerateThumbnail
      ) {
        // Auto-generate thumbnail from YouTube URL
        const videoIdMatch = formData.video_url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        );
        if (videoIdMatch && videoIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        }
      }

      // Prepare data for Supabase
      const newsData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
        author: formData.author,
        category: formData.category,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        featured: formData.featured,
        image_url: formData.type === 'article' ? thumbnailUrl : null,
        video_url: formData.type === 'video' ? formData.video_url : null,
        video_thumbnail: formData.type === 'video' ? thumbnailUrl : null,
        video_duration: formData.type === 'video' ? formData.video_duration : null,
        scheduled_date: formData.scheduled_date || null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        read_time: formData.type === 'article' ? formData.read_time : null,
        is_published: formData.status === 'published',
        publish_date: formData.status === 'published' ? new Date().toISOString() : null,
        views: 0,
        likes: 0,
        comments_count: 0,
      };

      let savedItem;
      if (editingItem) {
        // Update existing news item
        const { data, error } = await supabase
          .from("news")
          .update({
            ...newsData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;
        savedItem = data;

        setNewsItems(prev =>
          prev.map(item => (item.id === editingItem.id ? { ...item, ...savedItem } : item))
        );
      } else {
        // Create new news item
        const { data, error } = await supabase
          .from("news")
          .insert(newsData)
          .select()
          .single();

        if (error) throw error;
        savedItem = data;

        setNewsItems(prev => [{ ...savedItem, type: formData.type }, ...prev]);
      }

      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      alert(`News item ${editingItem ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error saving news content:", error);
      alert(`Failed to ${editingItem ? "update" : "create"} news item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setAutoGenerateThumbnail(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewThumbnail = () => {
    if (thumbnailPreview) return thumbnailPreview;

    if (
      formData.type === "video" &&
      formData.video_url &&
      autoGenerateThumbnail
    ) {
      const videoIdMatch = formData.video_url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      );
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    return null;
  };

  // Filter news items
  const filteredNews = newsItems.filter(item => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedType !== "all" && item.type !== selectedType) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStats = () => {
    const total = newsItems.length;
    const published = newsItems.filter(item => item.status === 'published').length;
    const drafts = newsItems.filter(item => item.status === 'draft').length;
    const videos = newsItems.filter(item => item.type === 'video').length;
    const articles = newsItems.filter(item => item.type === 'article').length;
    const featured = newsItems.filter(item => item.featured).length;
    const totalViews = newsItems.reduce((sum, item) => sum + item.views, 0);

    return { total, published, drafts, videos, articles, featured, totalViews };
  };

  const stats = getStats();

  if (loading && newsItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-[#032F60]" />
            News & Content Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create, manage, and publish news articles and video content
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="bg-[#032F60] hover:bg-[#1a4a73]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">All Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Content</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Newspaper className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.drafts}</p>
                  </div>
                  <Edit className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Content Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Videos</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.videos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Articles</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.articles}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Featured</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.featured}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setFormData(prev => ({ ...prev, type: 'article' }));
                      setShowAddModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setFormData(prev => ({ ...prev, type: 'video' }));
                      setShowAddModal(true);
                    }}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.type === 'video' ? (
                        <Video className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.author} • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="article">Articles</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <div className="space-y-4">
            {filteredNews.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'video' ? (
                          <Video className="h-4 w-4 text-red-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge 
                          variant={item.status === 'published' ? 'default' : 'secondary'}
                          className={item.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {item.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={categories.find(cat => cat.id === item.category)?.color}
                        >
                          {categories.find(cat => cat.id === item.category)?.label || item.category}
                        </Badge>
                        {item.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {item.priority === 'high' && (
                          <Badge variant="destructive">High Priority</Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.excerpt}</p>

                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{item.likes} likes</span>
                        </div>
                        {item.type === 'video' && item.video_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.video_duration}</span>
                          </div>
                        )}
                        {item.type === 'article' && item.read_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.read_time}</span>
                          </div>
                        )}
                      </div>

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewItem(item);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNews.length === 0 && (
              <div className="text-center py-20">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No content found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Content
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Views per Article</span>
                    <span className="text-sm text-gray-600">
                      {stats.articles > 0 ? Math.round(stats.totalViews / stats.articles) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Content Engagement Rate</span>
                    <span className="text-sm text-green-600">12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Publishing Frequency</span>
                    <span className="text-sm text-gray-600">3.2 per week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsItems
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.views}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Default Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-publish scheduled content</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email notifications</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SEO optimization</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Content" : "Create New Content"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Type Selection */}
            <div>
              <Label className="text-base font-medium">Content Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {contentTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === type.id
                          ? 'border-[#032F60] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id as "article" | "video" }))}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${formData.type === type.id ? 'text-[#032F60]' : 'text-gray-500'}`} />
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video-specific fields */}
            {formData.type === 'video' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video_url">YouTube URL *</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required={formData.type === 'video'}
                  />
                </div>
                <div>
                  <Label htmlFor="video_duration">Duration</Label>
                  <Input
                    id="video_duration"
                    value={formData.video_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_duration: e.target.value }))}
                    placeholder="e.g., 12:34"
                  />
                </div>
              </div>
            )}

            {/* Article-specific fields */}
            {formData.type === 'article' && (
              <div>
                <Label htmlFor="read_time">Estimated Read Time</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                  placeholder="e.g., 5 min read"
                />
              </div>
            )}

            {/* Content */}
            <div>
              <Label htmlFor="content">
                {formData.type === 'video' ? 'Description' : 'Content'} *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder={formData.type === 'video' ? 'Video description...' : 'Article content...'}
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                placeholder="Brief summary for previews..."
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            {/* Thumbnail/Image */}
            <div>
              <Label>
                {formData.type === 'video' ? 'Thumbnail' : 'Featured Image'}
              </Label>
              <div className="space-y-4">
                {formData.type === 'video' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_generate_thumbnail"
                      checked={autoGenerateThumbnail}
                      onChange={(e) => setAutoGenerateThumbnail(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="auto_generate_thumbnail" className="text-sm">
                      Auto-generate from YouTube
                    </Label>
                  </div>
                )}

                {!autoGenerateThumbnail && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="thumbnail_file" className="text-sm font-medium">
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

                    <div>
                      <Label htmlFor="image_url" className="text-sm font-medium">
                        Or enter URL
                      </Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {getPreviewThumbnail() && (
                  <div>
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="mt-2 relative inline-block">
                      <img
                        src={getPreviewThumbnail()}
                        alt="Thumbnail preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
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

            {/* SEO Fields */}
            <div className="space-y-4">
              <h4 className="font-medium">SEO Settings</h4>
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  rows={2}
                  placeholder="SEO meta description"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="featured">Mark as Featured</Label>
              </div>
            </div>

            {/* Scheduled Date */}
            {formData.status === 'scheduled' && (
              <div>
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#032F60] hover:bg-[#1a4a73]"
              >
                {loading ? "Saving..." : editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {showPreview && previewItem && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewItem.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{previewItem.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(previewItem.publish_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{previewItem.views} views</span>
                </div>
              </div>

              {/* Featured Image or Video */}
              {previewItem.type === 'video' && previewItem.video_url ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={previewItem.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={previewItem.title}
                  />
                </div>
              ) : previewItem.image_url ? (
                <img
                  src={previewItem.image_url}
                  alt={previewItem.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : null}

              {/* Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {previewItem.content}
                </div>
              </div>

              {/* Tags */}
              {previewItem.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewItem.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}