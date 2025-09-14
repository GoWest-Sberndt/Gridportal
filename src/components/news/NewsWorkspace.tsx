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
  Star,
  Flame,
  PlayCircle,
  BookOpen,
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

export default function NewsWorkspace() {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
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
            priority: item.priority || 'medium',
            status: item.status || (item.is_published ? 'published' : 'draft'),
            scheduled_date: item.scheduled_date,
            seo_title: item.seo_title,
            seo_description: item.seo_description,
            read_time: item.read_time,
          }));
          
          // Only show published content to users
          const publishedNews = formattedNews.filter(item => item.is_published && item.status === 'published');
          setNewsItems(publishedNews);
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

    loadNews();
  }, []);

  // Mock data for demonstration
  const mockNewsData: NewsItem[] = [];

  // Filter data for each section
  const recentAndHighlights = newsItems
    .filter(item => item.featured || new Date(item.publish_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    });

  const videoContent = newsItems
    .filter(item => item.type === 'video')
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());

  const articleContent = newsItems
    .filter(item => item.type === 'article')
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());

  // Apply search filter if search term exists
  const filteredRecentAndHighlights = searchTerm 
    ? recentAndHighlights.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : recentAndHighlights;

  const filteredVideoContent = searchTerm
    ? videoContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : videoContent;

  const filteredArticleContent = searchTerm
    ? articleContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : articleContent;

  const handleShare = (item: NewsItem, platform?: string) => {
    const url = `${window.location.origin}/news/${item.id}`;
    const text = `Check out this ${item.type}: ${item.title}`;

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
    setNewsItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, likes: item.likes + 1 } : item
    ));
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

  // Hero Card Component for featured content
  const HeroCard = ({ item }: { item: NewsItem }) => (
    <Card 
      className="relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
      onClick={() => setSelectedArticle(item)}
    >
      <div className="relative h-80 lg:h-96">
        <img
          src={item.image_url || item.video_thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
        
        {item.featured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
              <Star className="w-3 h-3 mr-1" />
              FEATURED
            </Badge>
          </div>
        )}
        
        {item.video_duration && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {item.video_duration}
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
              {item.category.replace('-', ' ').toUpperCase()}
            </Badge>
            {item.type === 'video' && (
              <Badge variant="secondary" className="bg-red-600/80 text-white backdrop-blur-sm">
                <Video className="w-3 h-3 mr-1" />
                VIDEO
              </Badge>
            )}
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 line-clamp-2">
            {item.title}
          </h2>
          
          <p className="text-gray-200 text-lg mb-4 line-clamp-2">
            {item.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/90">
              {item.author_avatar ? (
                <img
                  src={item.author_avatar}
                  alt={item.author}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="font-medium">{item.author}</div>
                <div className="text-sm text-white/70">{formatDate(item.publish_date)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{item.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{item.likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Large Thumbnail Card for videos and articles
  const LargeThumbnailCard = ({ item }: { item: NewsItem }) => (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
      onClick={() => setSelectedArticle(item)}
    >
      <div className="relative h-48 lg:h-56">
        <img
          src={item.image_url || item.video_thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
        
        {item.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
              <Flame className="w-3 h-3 mr-1" />
              HOT
            </Badge>
          </div>
        )}
        
        {item.video_duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {item.video_duration}
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm mb-2">
            {item.type === 'video' ? 'VIDEO' : 'ARTICLE'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
            <span className="font-medium">{item.author}</span>
          </div>
          <span>{formatDate(item.publish_date)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{item.likes}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(item.id);
              }}
              className="h-7 px-2"
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
              className="h-7 px-2"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
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
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">News & Updates</h1>
              <p className="text-gray-600 text-lg">Stay informed with the latest industry insights and company news</p>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search all content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="highlights" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white shadow-sm">
            <TabsTrigger value="highlights" className="flex items-center gap-2 text-lg font-medium">
              <Star className="w-5 h-5" />
              Recent & Highlights
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2 text-lg font-medium">
              <PlayCircle className="w-5 h-5" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2 text-lg font-medium">
              <BookOpen className="w-5 h-5" />
              Articles
            </TabsTrigger>
          </TabsList>

          {/* Recent & Highlights Tab */}
          <TabsContent value="highlights" className="space-y-8">
            {filteredRecentAndHighlights.length > 0 ? (
              <>
                {/* Hero Section */}
                <div className="mb-8">
                  <HeroCard item={filteredRecentAndHighlights[0]} />
                </div>
                
                {/* Other Highlights */}
                {filteredRecentAndHighlights.length > 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Flame className="w-6 h-6 text-orange-500" />
                      More Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredRecentAndHighlights.slice(1).map(item => (
                        <LargeThumbnailCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No highlights available</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'No content matches your search criteria' : 'Check back soon for featured content and recent updates'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-red-500" />
                Video Content
              </h2>
              {filteredVideoContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideoContent.map(item => (
                    <LargeThumbnailCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos available</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'No videos match your search criteria' : 'Check back soon for new video content'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                Articles
              </h2>
              {filteredArticleContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticleContent.map(item => (
                    <LargeThumbnailCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles available</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'No articles match your search criteria' : 'Check back soon for new articles'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold pr-8">
                {selectedArticle.title}
              </DialogTitle>
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
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
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
                  Share {selectedArticle.type}
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
              <DialogTitle>Share {shareItem.type}</DialogTitle>
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