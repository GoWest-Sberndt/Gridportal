import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Eye,
  Heart,
  Share2,
  Play,
  ExternalLink,
  Clock,
  User,
  Tag,
  TrendingUp,
  Newspaper,
  Video,
  FileText,
  Building,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Link,
  Copy,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Send,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
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
}

const categories = [
  { id: 'all', label: 'All News', icon: Newspaper },
  { id: 'market-updates', label: 'Market Updates', icon: TrendingUp },
  { id: 'industry-news', label: 'Industry News', icon: Building },
  { id: 'company-updates', label: 'Company Updates', icon: FileText },
  { id: 'training', label: 'Training & Education', icon: Video },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'featured', label: 'Featured First' },
];

export default function NewsWorkspace() {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState<NewsItem | null>(null);

  // Load news data
  useEffect(() => {
    const loadNews = async () => {
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
          }));
          
          setNewsItems(formattedNews);
          
          // Extract unique tags
          const tags = new Set<string>();
          formattedNews.forEach(item => {
            item.tags.forEach(tag => tags.add(tag));
          });
          setAvailableTags(Array.from(tags));
        } else {
          // Set mock data if no data from database
          setNewsItems(mockNewsData);
          setAvailableTags(['mortgage rates', 'industry trends', 'company news', 'training', 'market analysis']);
        }
      } catch (error) {
        console.error('Error loading news:', error);
        setNewsItems(mockNewsData);
        setAvailableTags(['mortgage rates', 'industry trends', 'company news', 'training', 'market analysis']);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Mock data for demonstration
  const mockNewsData: NewsItem[] = [
    {
      id: '1',
      title: 'Federal Reserve Announces New Interest Rate Decision',
      content: 'The Federal Reserve has announced its latest interest rate decision, impacting mortgage rates across the industry. This comprehensive analysis covers the implications for home buyers and the lending market...',
      excerpt: 'The Federal Reserve has announced its latest interest rate decision, impacting mortgage rates across the industry...',
      author: 'Sarah Johnson',
      author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      publish_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'market-updates',
      tags: ['mortgage rates', 'federal reserve', 'market analysis'],
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      views: 1250,
      likes: 89,
      comments_count: 23,
      is_published: true,
      type: 'article',
    },
    {
      id: '2',
      title: 'New Loan Processing System Training',
      content: 'Learn about our new loan processing system in this comprehensive training video. Discover improved workflows, enhanced security features, and streamlined approval processes...',
      excerpt: 'Learn about our new loan processing system in this comprehensive training video...',
      author: 'Mike Chen',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      publish_date: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      category: 'training',
      tags: ['training', 'loan processing', 'system update'],
      featured: false,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      video_thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      video_duration: '12:34',
      views: 892,
      likes: 67,
      comments_count: 15,
      is_published: true,
      type: 'video',
    },
    {
      id: '3',
      title: 'Q4 Company Performance and 2024 Outlook',
      content: 'Our Q4 performance exceeded expectations with record loan volumes and customer satisfaction scores. Looking ahead to 2024, we are excited to announce new initiatives...',
      excerpt: 'Our Q4 performance exceeded expectations with record loan volumes and customer satisfaction scores...',
      author: 'Jennifer Davis',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      publish_date: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      category: 'company-updates',
      tags: ['company news', 'performance', 'outlook'],
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      views: 2100,
      likes: 156,
      comments_count: 42,
      is_published: true,
      type: 'article',
    },
  ];

  // Filter and sort news items
  const filteredNews = newsItems
    .filter(item => {
      if (!item.is_published) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedTags.length > 0 && !selectedTags.some(tag => item.tags.includes(tag))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime();
        case 'most-viewed':
          return b.views - a.views;
        case 'most-liked':
          return b.likes - a.likes;
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
        default: // newest
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      }
    });

  const handleShare = (item: NewsItem, platform?: string) => {
    const url = `${window.location.origin}/news/${item.id}`;
    const text = `Check out this article: ${item.title}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
      default:
        setShareItem(item);
        setShowShareModal(true);
    }
  };

  const handleLike = async (itemId: string) => {
    // Update local state optimistically
    setNewsItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, likes: item.likes + 1 } : item
    ));
    
    // TODO: Update in database
    try {
      await supabaseHelpers.likeNewsItem(itemId, user?.id);
    } catch (error) {
      console.error('Error liking item:', error);
      // Revert on error
      setNewsItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, likes: item.likes - 1 } : item
      ));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const NewsCard = ({ item, isGrid = true }: { item: NewsItem; isGrid?: boolean }) => (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
        isGrid ? 'h-full' : 'mb-4'
      } ${item.featured ? 'ring-2 ring-blue-200' : ''}`}
      onClick={() => setSelectedArticle(item)}
    >
      {item.featured && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-xs font-bold">
          FEATURED
        </div>
      )}
      
      <div className={`relative ${isGrid ? '' : 'flex'}`}>
        {(item.image_url || item.video_thumbnail) && (
          <div className={`relative ${isGrid ? 'w-full h-48' : 'w-48 h-32 flex-shrink-0'} overflow-hidden ${isGrid ? 'rounded-t-lg' : 'rounded-l-lg'}`}>
            <img
              src={item.image_url || item.video_thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
              </div>
            )}
            {item.video_duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {item.video_duration}
              </div>
            )}
          </div>
        )}
        
        <CardContent className={`p-4 ${isGrid ? '' : 'flex-1'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {categories.find(cat => cat.id === item.category)?.label || item.category}
            </Badge>
            {item.type === 'video' && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video
              </Badge>
            )}
          </div>
          
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 ${isGrid ? 'text-lg' : 'text-base'}`}>
            {item.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              {item.author_avatar ? (
                <img
                  src={item.author_avatar}
                  alt={item.author}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              )}
              <span>{item.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(item.publish_date)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{item.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{item.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{item.comments_count}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(item.id);
                }}
                className="h-8 px-2"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(item);
                }}
                className="h-8 px-2"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Updates</h1>
          <p className="text-gray-600 mt-1">Stay informed with the latest industry news and company updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {availableTags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className="flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* News Grid/List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-20">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No news found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredNews.map(item => (
            <NewsCard key={item.id} item={item} isGrid={viewMode === 'grid'} />
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold pr-8">
                  {selectedArticle.title}
                </DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Article Meta */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {selectedArticle.author_avatar ? (
                      <img
                        src={selectedArticle.author_avatar}
                        alt={selectedArticle.author}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-medium">{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedArticle.publish_date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedArticle.views.toLocaleString()} views</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedArticle)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Featured Image or Video */}
              {selectedArticle.type === 'video' && selectedArticle.video_url ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={selectedArticle.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedArticle.title}
                  />
                </div>
              ) : selectedArticle.image_url ? (
                <div className="relative">
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              ) : null}

              {/* Article Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedArticle.content}
                </div>
              </div>

              {/* Tags */}
              {selectedArticle.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleLike(selectedArticle.id)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Like ({selectedArticle.likes})
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedArticle)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Article
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Modal */}
      {showShareModal && shareItem && (
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Article</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Share "{shareItem.title}" with others
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShare(shareItem, 'facebook')}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(shareItem, 'twitter')}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(shareItem, 'linkedin')}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(shareItem, 'copy')}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}