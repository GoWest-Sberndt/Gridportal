import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
  Image,
  Upload,
  Save,
  X,
  Star,
  Calendar,
  User,
  Tag,
  Globe,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Archive,
  Target,
  MousePointer,
  Activity,
  FileImage,
  Loader2,
} from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  description?: string;
  company_name?: string;
  company_logo?: string;
  image_url?: string;
  background_image?: string;
  headline?: string;
  subheading?: string;
  cta_text?: string;
  target_url?: string;
  category?: string;
  status: 'active' | 'inactive' | 'scheduled' | 'expired' | 'draft';
  priority: number;
  start_date?: string;
  end_date?: string;
  clicks: number;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  company_logo_file_name?: string;
  background_image_file_name?: string;
  image_url_file_name?: string;
}

const adCategories = [
  { id: 'financial-services', label: 'Financial Services', color: 'bg-blue-100 text-blue-800' },
  { id: 'technology', label: 'Technology', color: 'bg-green-100 text-green-800' },
  { id: 'real-estate', label: 'Real Estate', color: 'bg-purple-100 text-purple-800' },
  { id: 'insurance', label: 'Insurance', color: 'bg-orange-100 text-orange-800' },
  { id: 'education', label: 'Education', color: 'bg-red-100 text-red-800' },
  { id: 'professional-services', label: 'Professional Services', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'internal', label: 'Internal', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
];

export default function AdminAdManager() {
  const { user } = useAuth();
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPreview, setShowPreview] = useState(false);
  const [previewAd, setPreviewAd] = useState<AdItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_name: "",
    company_logo: "",
    image_url: "",
    background_image: "",
    headline: "",
    subheading: "",
    cta_text: "Learn More",
    target_url: "",
    category: "internal",
    status: "draft" as AdItem['status'],
    priority: 1,
    start_date: "",
    end_date: "",
    tags: "",
    notes: "",
  });

  const [imageFiles, setImageFiles] = useState({
    company_logo: null as File | null,
    background_image: null as File | null,
    image_url: null as File | null,
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState({
    company_logo: "",
    background_image: "",
    image_url: "",
  });

  // Load ads data
  useEffect(() => {
    loadAdsData();
  }, []);

  const loadAdsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedAds: AdItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        company_name: item.company_name,
        company_logo: item.company_logo,
        image_url: item.image_url,
        background_image: item.background_image,
        headline: item.headline,
        subheading: item.subheading,
        cta_text: item.cta_text || 'Learn More',
        target_url: item.target_url,
        category: item.category,
        status: item.status,
        priority: item.priority || 1,
        start_date: item.start_date,
        end_date: item.end_date,
        clicks: item.clicks || 0,
        tags: item.tags || [],
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: item.created_by,
        updated_by: item.updated_by,
        company_logo_file_name: item.company_logo_file_name,
        background_image_file_name: item.background_image_file_name,
        image_url_file_name: item.image_url_file_name,
      }));

      setAds(formattedAds);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      company_name: "",
      company_logo: "",
      image_url: "",
      background_image: "",
      headline: "",
      subheading: "",
      cta_text: "Learn More",
      target_url: "",
      category: "internal",
      status: "draft",
      priority: 1,
      start_date: "",
      end_date: "",
      tags: "",
      notes: "",
    });
    setImageFiles({
      company_logo: null,
      background_image: null,
      image_url: null,
    });
    setImagePreviewUrls({
      company_logo: "",
      background_image: "",
      image_url: "",
    });
  };

  const handleFileChange = (fileType: keyof typeof imageFiles, file: File | null) => {
    setImageFiles(prev => ({ ...prev, [fileType]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => ({ 
          ...prev, 
          [fileType]: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrls(prev => ({ ...prev, [fileType]: "" }));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('ad-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('ad-images')
      .getPublicUrl(path);

    return urlData.publicUrl;
  };

  const handleEdit = (ad: AdItem) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name || "",
      description: ad.description || "",
      company_name: ad.company_name || "",
      company_logo: ad.company_logo || "",
      image_url: ad.image_url || "",
      background_image: ad.background_image || "",
      headline: ad.headline || "",
      subheading: ad.subheading || "",
      cta_text: ad.cta_text || "Learn More",
      target_url: ad.target_url || "",
      category: ad.category || "internal",
      status: ad.status || "draft",
      priority: ad.priority || 1,
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : "",
      end_date: ad.end_date ? new Date(ad.end_date).toISOString().slice(0, 16) : "",
      tags: Array.isArray(ad.tags) ? ad.tags.join(", ") : "",
      notes: ad.notes || "",
    });
    
    // Set existing image URLs as previews
    setImagePreviewUrls({
      company_logo: ad.company_logo || "",
      background_image: ad.background_image || "",
      image_url: ad.image_url || "",
    });
    
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;

      setAds(prev => prev.filter(ad => ad.id !== id));
      alert("Ad deleted successfully!");
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Failed to delete ad. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls = {
        company_logo: formData.company_logo,
        background_image: formData.background_image,
        image_url: formData.image_url,
      };

      let fileNames = {
        company_logo_file_name: "",
        background_image_file_name: "",
        image_url_file_name: "",
      };

      // Upload files if provided
      for (const [key, file] of Object.entries(imageFiles)) {
        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${key}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          try {
            const publicUrl = await uploadFile(file, filePath);
            imageUrls[key as keyof typeof imageUrls] = publicUrl;
            fileNames[`${key}_file_name` as keyof typeof fileNames] = fileName;
          } catch (uploadError) {
            console.error(`Error uploading ${key}:`, uploadError);
            alert(`Failed to upload ${key.replace('_', ' ')}. Please try again.`);
            return;
          }
        }
      }

      // Prepare data for Supabase
      const adData = {
        name: formData.name,
        description: formData.description || null,
        company_name: formData.company_name || null,
        company_logo: imageUrls.company_logo || null,
        image_url: imageUrls.image_url || null,
        background_image: imageUrls.background_image || null,
        headline: formData.headline || null,
        subheading: formData.subheading || null,
        cta_text: formData.cta_text || 'Learn More',
        target_url: formData.target_url || null,
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        cost_per_click: formData.cost_per_click ? parseFloat(formData.cost_per_click) : null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: formData.notes || null,
        updated_by: user?.id || null,
        ...fileNames,
      };

      let savedAd;
      if (editingAd) {
        // Update existing ad
        const { data, error } = await supabase
          .from("ads")
          .update({
            ...adData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAd.id)
          .select()
          .single();

        if (error) throw error;
        savedAd = data;

        setAds(prev =>
          prev.map(ad => (ad.id === editingAd.id ? { ...ad, ...savedAd } : ad))
        );
      } else {
        // Create new ad
        const { data, error } = await supabase
          .from("ads")
          .insert({
            ...adData,
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (error) throw error;
        savedAd = data;

        setAds(prev => [{ ...savedAd, clicks: 0 }, ...prev]);
      }

      setShowAddModal(false);
      setEditingAd(null);
      resetForm();
      alert(`Ad ${editingAd ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error saving ad:", error);
      alert(`Failed to ${editingAd ? "update" : "create"} ad. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (adId: string, newStatus: AdItem['status']) => {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        })
        .eq("id", adId);

      if (error) throw error;

      setAds(prev =>
        prev.map(ad => (ad.id === adId ? { ...ad, status: newStatus } : ad))
      );
    } catch (error) {
      console.error("Error updating ad status:", error);
      alert("Failed to update ad status. Please try again.");
    }
  };

  // Filter ads
  const filteredAds = ads.filter(ad => {
    if (selectedCategory !== "all" && ad.category !== selectedCategory) return false;
    if (selectedStatus !== "all" && ad.status !== selectedStatus) return false;
    if (searchTerm && !ad.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ad.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStats = () => {
    const total = ads.length;
    const active = ads.filter(ad => ad.status === 'active').length;
    const inactive = ads.filter(ad => ad.status === 'inactive').length;
    const scheduled = ads.filter(ad => ad.status === 'scheduled').length;
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);

    return { total, active, inactive, scheduled, totalClicks };
  };

  const stats = getStats();

  if (loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ad management...</p>
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
            <Target className="h-6 w-6 text-[#032F60]" />
            Internal Advertisement Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage internal advertising content
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingAd(null);
            setShowAddModal(true);
          }}
          className="bg-[#032F60] hover:bg-[#1a4a73]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ad
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">All Ads</TabsTrigger>
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
                    <p className="text-sm font-medium text-gray-600">Total Ads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Ads</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalClicks.toLocaleString()}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-orange-600">${stats.totalBudget.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.scheduled}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Ads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      setShowAddModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Ad
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Ad Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.slice(0, 5).map(ad => (
                    <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {ad.company_logo ? (
                          <img src={ad.company_logo} alt={ad.company_name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <Target className="h-8 w-8 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{ad.name}</p>
                          <p className="text-xs text-gray-500">
                            {ad.company_name} • {new Date(ad.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={statusOptions.find(s => s.value === ad.status)?.color}
                        >
                          {statusOptions.find(s => s.value === ad.status)?.label}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Ads Tab */}
        <TabsContent value="ads" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search ads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {adCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ads List */}
          <div className="space-y-4">
            {filteredAds.map(ad => (
              <Card key={ad.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={statusOptions.find(s => s.value === ad.status)?.color}
                        >
                          {statusOptions.find(s => s.value === ad.status)?.label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={adCategories.find(cat => cat.id === ad.category)?.color}
                        >
                          {adCategories.find(cat => cat.id === ad.category)?.label || ad.category}
                        </Badge>
                        <Badge variant="outline">
                          Priority {ad.priority}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-4">
                        {ad.company_logo && (
                          <img 
                            src={ad.company_logo} 
                            alt={ad.company_name} 
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{ad.name}</h3>
                          {ad.company_name && (
                            <p className="text-sm text-gray-600 mb-2">{ad.company_name}</p>
                          )}
                          {ad.headline && (
                            <p className="font-medium text-gray-800 mb-1">{ad.headline}</p>
                          )}
                          {ad.subheading && (
                            <p className="text-sm text-gray-600 mb-3">{ad.subheading}</p>
                          )}

                          <div className="flex items-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              <span>{ad.clicks} clicks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {ad.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {ad.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {ad.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{ad.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Select
                        value={ad.status}
                        onValueChange={(value) => handleStatusChange(ad.id, value as AdItem['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewAd(ad);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)}>
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

            {filteredAds.length === 0 && (
              <div className="text-center py-20">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No ads found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad
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
                    <span className="text-sm font-medium">Total Clicks</span>
                    <span className="text-sm text-gray-600">
                      {stats.totalClicks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Campaigns</span>
                    <span className="text-sm text-green-600">{stats.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Scheduled Campaigns</span>
                    <span className="text-sm text-blue-600">{stats.scheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Inactive Campaigns</span>
                    <span className="text-sm text-gray-600">{stats.inactive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Default Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-expire ads after end date</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email notifications for ad performance</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Default ad rotation settings</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Image upload settings</span>
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
              {editingAd ? "Edit Advertisement" : "Create New Advertisement"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                />
              </div>
            </div>

            {/* Headlines */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="Main headline text"
                />
              </div>
              <div>
                <Label htmlFor="cta_text">Call-to-Action Text</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                  placeholder="Learn More"
                />
              </div>
            </div>

            {/* Description and Subheading */}
            <div>
              <Label htmlFor="subheading">Subheading</Label>
              <Input
                id="subheading"
                value={formData.subheading}
                onChange={(e) => setFormData(prev => ({ ...prev, subheading: e.target.value }))}
                placeholder="Supporting text"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Detailed description of the advertisement"
              />
            </div>

            {/* Target URL */}
            <div>
              <Label htmlFor="target_url">Target URL</Label>
              <Input
                id="target_url"
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* Image Uploads */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Images</h3>
              
              {/* Company Logo Upload */}
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('company_logo', e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {imagePreviewUrls.company_logo && (
                      <img 
                        src={imagePreviewUrls.company_logo} 
                        alt="Company logo preview" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                  </div>
                  <Input
                    placeholder="Or enter image URL"
                    value={formData.company_logo}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, company_logo: e.target.value }));
                      setImagePreviewUrls(prev => ({ ...prev, company_logo: e.target.value }));
                    }}
                  />
                </div>
              </div>

              {/* Background Image Upload */}
              <div>
                <Label>Background Image</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('background_image', e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {imagePreviewUrls.background_image && (
                      <img 
                        src={imagePreviewUrls.background_image} 
                        alt="Background preview" 
                        className="w-16 h-12 object-cover rounded border"
                      />
                    )}
                  </div>
                  <Input
                    placeholder="Or enter image URL"
                    value={formData.background_image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, background_image: e.target.value }));
                      setImagePreviewUrls(prev => ({ ...prev, background_image: e.target.value }));
                    }}
                  />
                </div>
              </div>

              {/* Additional Image Upload */}
              <div>
                <Label>Additional Image</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image_url', e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {imagePreviewUrls.image_url && (
                      <img 
                        src={imagePreviewUrls.image_url} 
                        alt="Additional image preview" 
                        className="w-16 h-12 object-cover rounded border"
                      />
                    )}
                  </div>
                  <Input
                    placeholder="Or enter image URL"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image_url: e.target.value }));
                      setImagePreviewUrls(prev => ({ ...prev, image_url: e.target.value }));
                    }}
                  />
                </div>
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
                    {adCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as AdItem['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Highest)</SelectItem>
                    <SelectItem value="2">2 (High)</SelectItem>
                    <SelectItem value="3">3 (Medium)</SelectItem>
                    <SelectItem value="4">4 (Low)</SelectItem>
                    <SelectItem value="5">5 (Lowest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Budget and Cost per Click */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="cost_per_click">Cost per Click ($)</Label>
                <Input
                  id="cost_per_click"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_click}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_per_click: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Tags and Notes */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Internal notes about this advertisement"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAd(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-[#032F60] hover:bg-[#1a4a73]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingAd ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingAd ? "Update" : "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {showPreview && previewAd && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ad Preview: {previewAd.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Ad Preview */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg overflow-hidden">
                {previewAd.background_image && (
                  <img
                    src={previewAd.background_image}
                    alt={previewAd.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Company Logo - Top Right */}
                {previewAd.company_logo && (
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={previewAd.company_logo}
                        alt={previewAd.company_name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Headline - Top Left */}
                {previewAd.headline && (
                  <div className="absolute left-6 top-4">
                    <h2 className="text-white font-bold text-2xl leading-tight drop-shadow-lg">
                      {previewAd.headline}
                    </h2>
                  </div>
                )}

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-end justify-between">
                    {/* Subheading - Bottom Left */}
                    <div className="flex-1 mr-4">
                      {previewAd.subheading && (
                        <p className="text-white/90 text-sm leading-relaxed">
                          {previewAd.subheading}
                        </p>
                      )}
                    </div>

                    {/* CTA Button - Bottom Right */}
                    <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2">
                      {previewAd.cta_text || "Learn More"}
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ad Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Ad Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company:</strong> {previewAd.company_name || 'N/A'}</div>
                    <div><strong>Category:</strong> {adCategories.find(cat => cat.id === previewAd.category)?.label || previewAd.category}</div>
                    <div><strong>Status:</strong> {statusOptions.find(s => s.value === previewAd.status)?.label}</div>
                    <div><strong>Priority:</strong> {previewAd.priority}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Clicks:</strong> {previewAd.clicks.toLocaleString()}</div>
                    <div><strong>Created:</strong> {new Date(previewAd.created_at).toLocaleDateString()}</div>
                    {previewAd.start_date && (
                      <div><strong>Start Date:</strong> {new Date(previewAd.start_date).toLocaleDateString()}</div>
                    )}
                    {previewAd.end_date && (
                      <div><strong>End Date:</strong> {new Date(previewAd.end_date).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>

              {previewAd.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewAd.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewAd.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{previewAd.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}