import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  Filter,
  ChevronRight,
  Clock,
  User,
  Tag,
  Star,
  Eye,
  CheckCircle,
  PlayCircle,
  FileCheck,
  GraduationCap,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Learning() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);

  const categories = [
    { id: "all", label: "All Resources", count: 45, icon: BookOpen },
    { id: "sop", label: "SOPs", count: 12, icon: FileCheck },
    { id: "guidelines", label: "Guidelines", count: 8, icon: Target },
    { id: "training", label: "Training Videos", count: 15, icon: PlayCircle },
    { id: "compliance", label: "Compliance", count: 6, icon: Award },
    {
      id: "best-practices",
      label: "Best Practices",
      count: 4,
      icon: TrendingUp,
    },
  ];

  const learningResources = [
    {
      id: 1,
      title: "Loan Processing SOP - Complete Guide",
      description:
        "Comprehensive standard operating procedure for loan processing from application to closing.",
      type: "sop",
      format: "document",
      duration: "15 min read",
      author: "Sarah Johnson",
      lastUpdated: "2024-01-15",
      tags: ["Processing", "SOP", "Workflow"],
      difficulty: "Intermediate",
      views: 1250,
      rating: 4.8,
      completed: false,
      featured: true,
    },
    {
      id: 2,
      title: "FHA Underwriting Guidelines 2024",
      description:
        "Updated FHA underwriting guidelines and requirements for 2024, including recent policy changes.",
      type: "guidelines",
      format: "document",
      duration: "20 min read",
      author: "Michael Chen",
      lastUpdated: "2024-01-10",
      tags: ["FHA", "Underwriting", "Guidelines"],
      difficulty: "Advanced",
      views: 890,
      rating: 4.9,
      completed: true,
      featured: false,
    },
    {
      id: 3,
      title: "Customer Service Excellence Training",
      description:
        "Interactive training module on providing exceptional customer service throughout the loan process.",
      type: "training",
      format: "video",
      duration: "45 min",
      author: "Jennifer Martinez",
      lastUpdated: "2024-01-08",
      tags: ["Customer Service", "Training", "Communication"],
      difficulty: "Beginner",
      views: 2100,
      rating: 4.7,
      completed: false,
      featured: true,
    },
    {
      id: 4,
      title: "TRID Compliance Checklist",
      description:
        "Essential checklist for TRID compliance requirements and common pitfalls to avoid.",
      type: "compliance",
      format: "document",
      duration: "10 min read",
      author: "Robert Kim",
      lastUpdated: "2024-01-05",
      tags: ["TRID", "Compliance", "Checklist"],
      difficulty: "Intermediate",
      views: 675,
      rating: 4.6,
      completed: false,
      featured: false,
    },
    {
      id: 5,
      title: "Best Practices for Loan Officer Productivity",
      description:
        "Proven strategies and techniques to maximize productivity and efficiency as a loan officer.",
      type: "best-practices",
      format: "video",
      duration: "30 min",
      author: "Lisa Anderson",
      lastUpdated: "2024-01-03",
      tags: ["Productivity", "Best Practices", "Efficiency"],
      difficulty: "Intermediate",
      views: 1450,
      rating: 4.8,
      completed: true,
      featured: false,
    },
    {
      id: 6,
      title: "VA Loan Processing Workflow",
      description:
        "Step-by-step workflow for processing VA loans, including required documentation and timelines.",
      type: "sop",
      format: "document",
      duration: "12 min read",
      author: "David Thompson",
      lastUpdated: "2023-12-28",
      tags: ["VA Loans", "Processing", "Workflow"],
      difficulty: "Intermediate",
      views: 820,
      rating: 4.5,
      completed: false,
      featured: false,
    },
  ];

  const filteredResources = learningResources.filter((resource) => {
    const matchesSearch =
      searchTerm === "" ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || resource.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case "video":
        return <Video size={16} />;
      case "document":
        return <FileText size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  return (
    <div className="h-full bg-workspace flex">
      {/* Sidebar Categories */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#032F60] rounded-lg flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1d2430]">
                Learning Center
              </h2>
              <p className="text-sm text-gray-600">
                SOPs, Guidelines & Training
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#032F60] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{category.label}</span>
                  </div>
                  <Badge
                    variant={
                      selectedCategory === category.id ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {category.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-[#032F60] to-[#1a4a73] rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} />
              <span className="font-semibold text-sm">Your Progress</span>
            </div>
            <div className="text-2xl font-bold mb-1">67%</div>
            <div className="text-xs opacity-90">
              12 of 18 required completed
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-white rounded-full h-2"
                style={{ width: "67%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1d2430] mb-1">
                {categories.find((cat) => cat.id === selectedCategory)?.label ||
                  "All Resources"}
              </h1>
              <p className="text-gray-600">
                {filteredResources.length} resource
                {filteredResources.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Total Resources
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">45</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Completed
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">12</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  In Progress
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">6</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Featured
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">8</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 p-6 overflow-auto">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or category filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card
                  key={resource.id}
                  className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                    resource.featured
                      ? "ring-2 ring-[#f6d44b] ring-opacity-50"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(resource.format)}
                        <Badge
                          variant="outline"
                          className={getDifficultyColor(resource.difficulty)}
                        >
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {resource.featured && (
                          <Badge className="bg-[#f6d44b] text-black font-bold text-xs">
                            Featured
                          </Badge>
                        )}
                        {resource.completed && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-[#032F60] transition-colors line-clamp-2">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{resource.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{resource.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500"
                          fill="currentColor"
                        />
                        <span>{resource.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{resource.views.toLocaleString()}</span>
                        </div>
                        <span>
                          Updated{" "}
                          {new Date(resource.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#032F60] hover:text-[#1a4a73] p-0 h-auto font-semibold"
                      >
                        {resource.format === "video" ? "Watch" : "Read"} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
