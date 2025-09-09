import React from "react";
import { supabaseHelpers } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Video, Play, ExternalLink } from "lucide-react";

// Featured Video Player Component - Uses YouTube iframe embed directly
export default function FeaturedVideoPlayer({ currentVideoIndex = 0 }) {
  const [videoData, setVideoData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [featuredVideos, setFeaturedVideos] = React.useState([]);
  const [showVideoDialog, setShowVideoDialog] = React.useState(false);

  // Load featured videos from Supabase
  React.useEffect(() => {
    let cancelled = false;

    const loadFeaturedVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const videos = await supabaseHelpers.getFeaturedVideos();

        if (!cancelled && videos?.length) {
          setFeaturedVideos(videos);

          const currentVideo = videos[currentVideoIndex] || videos[0];

          setVideoData({
            title: currentVideo.title ?? "Featured Video",
            channelTitle: currentVideo.channelTitle ?? "Safire Home Lending",
            publishedAt: currentVideo.publishedAt || null,
            duration: currentVideo.duration ?? null,
            views: Number(currentVideo.views ?? 0),
            embedUrl: currentVideo.embedUrl || null, // YouTube embed URL for iframe
            content: currentVideo.content || null, // Raw content from database
            thumbnail: currentVideo.thumbnail ?? null,
            videoId: currentVideo.videoId || null,
          });
        } else if (!cancelled) {
          setError("No featured videos found");
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load featured videos");
        console.error(
          "FeaturedVideoPlayer: error loading featured videos",
          err,
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFeaturedVideos();
    return () => {
      cancelled = true;
    };
  }, [currentVideoIndex]);

  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoData?.embedUrl) {
      setShowVideoDialog(true);
    } else if (videoData?.content) {
      // Fallback: try to open the raw content URL
      window.open(videoData.content, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="relative mb-3">
        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#032F60] mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="relative mb-3">
        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Video className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-gray-500 text-xs">
              No featured videos available
            </p>
          </div>
        </div>
        <h4 className="text-[#1d2430] font-bold text-sm mb-2 mt-2">
          No Featured Video
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#6f7d8f] text-xs">
            {error || "No featured videos found"}
          </span>
        </div>
        <p className="text-[#6f7d8f] text-xs">
          Add featured videos in the News section
        </p>
      </div>
    );
  }

  const thumbnailUrl =
    videoData.thumbnail ||
    (videoData.videoId
      ? `https://img.youtube.com/vi/${videoData.videoId}/maxresdefault.jpg`
      : null);

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={handleVideoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleVideoClick(e);
        }}
      >
        <div className="relative mb-3">
          <img
            src={thumbnailUrl}
            alt={videoData.title || "Featured Video"}
            className="w-full h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=120&fit=crop&crop=center";
            }}
          />
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors rounded-lg group"
            onClick={handleVideoClick}
            aria-label={
              videoData?.embedUrl
                ? "Play video in player"
                : "Open video on YouTube"
            }
          >
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors group-hover:scale-110">
              {videoData?.embedUrl ? (
                <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
              ) : (
                <ExternalLink className="w-3 h-3 text-white" />
              )}
            </div>
          </button>
          <div className="absolute top-2 right-2">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
              {videoData?.embedUrl ? "Player" : "YouTube"}
            </div>
          </div>
          {videoData.duration && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                {videoData.duration}
              </div>
            </div>
          )}
          {featuredVideos.length > 1 && (
            <div className="absolute top-2 left-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                {(currentVideoIndex % featuredVideos.length) + 1}/
                {featuredVideos.length}
              </div>
            </div>
          )}
        </div>

        <div className="hover:text-[#032F60] transition-colors">
          <h4 className="text-[#1d2430] font-bold text-sm mb-2 line-clamp-2">
            {videoData.title || "Featured Video"}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#6f7d8f] text-xs">
              {videoData.channelTitle || "Safire Home Lending"}
            </span>
            {!!videoData.views && videoData.views > 0 && (
              <>
                <span className="text-[#6f7d8f] text-xs">•</span>
                <span className="text-[#6f7d8f] text-xs">
                  {Number(videoData.views).toLocaleString()} views
                </span>
              </>
            )}
          </div>
          <p className="text-[#6f7d8f] text-xs">
            {videoData.publishedAt
              ? new Date(videoData.publishedAt).toLocaleDateString()
              : "Recently added"}
          </p>
        </div>
      </div>

      {/* Video Player Dialog with YouTube iframe */}
      {showVideoDialog && videoData?.embedUrl && (
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <button
                onClick={() => setShowVideoDialog(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Close video player"
              >
                <X size={16} />
              </button>

              {/* YouTube iframe embed */}
              <iframe
                src={`${videoData.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={videoData.title || "Featured Video"}
              />

              {/* Video info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                <h3 className="text-white font-bold text-lg mb-2">
                  {videoData?.title || "Featured Video"}
                </h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span>
                    {videoData?.channelTitle || "Safire Home Lending"}
                  </span>
                  {!!videoData?.views && (
                    <>
                      <span>•</span>
                      <span>
                        {Number(videoData.views).toLocaleString()} views
                      </span>
                    </>
                  )}
                  {!!videoData?.publishedAt && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(videoData.publishedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}