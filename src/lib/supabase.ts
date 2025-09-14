import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  });
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(userData: {
    id: string;
    name: string;
    email: string;
    role?: string;
    internal_role?: "user" | "manager" | "admin";
    department?: string;
    phone?: string;
    status?: string;
    nmls_number?: string;
    client_facing_title?: string;
    recruiter_id?: string;
    recruiter_name?: string;
    recruiter_type?: string;
    monthly_loan_volume?: number;
    is_producing?: boolean;
    avatar?: string;
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "Loan Officer",
        internal_role: userData.internal_role || "user",
        department: userData.department || null,
        phone: userData.phone || null,
        status: userData.status || "active",
        nmls_number: userData.nmls_number || null,
        client_facing_title: userData.client_facing_title || null,
        recruiter_id: userData.recruiter_id || null,
        recruiter_name: userData.recruiter_name || null,
        recruiter_type: userData.recruiter_type || null,
        monthly_loan_volume: userData.monthly_loan_volume || 0,
        is_producing: userData.is_producing || false,
        avatar: userData.avatar || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(
    userId: string,
    userData: {
      name?: string;
      email?: string;
      role?: string;
      internal_role?: "user" | "manager" | "admin";
      department?: string;
      phone?: string;
      status?: string;
      nmls_number?: string;
      client_facing_title?: string;
      recruiter_id?: string;
      recruiter_name?: string;
      recruiter_type?: string;
      monthly_loan_volume?: number;
      is_producing?: boolean;
      avatar?: string;
    },
  ) {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
    return true;
  },

  async updateUserInternalRole(
    userId: string,
    internalRole: "user" | "manager" | "admin",
  ) {
    const { data, error } = await supabase
      .from("users")
      .update({
        internal_role: internalRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  },

  // News
  async getNews() {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("publish_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getNewsWithVideoData() {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(
          `
          id,
          title,
          content,
          excerpt,
          category,
          type,
          status,
          priority,
          author,
          author_avatar,
          tags,
          views,
          likes,
          comments_count,
          featured,
          image_url,
          video_url,
          video_thumbnail,
          video_duration,
          read_time,
          seo_title,
          seo_description,
          is_published,
          publish_date,
          scheduled_date,
          created_at,
          updated_at
        `,
        )
        .eq("is_published", true)
        .order("publish_date", { ascending: false });

      if (error) {
        console.error("Error fetching news with video data:", error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn("No news data found");
        return [];
      }

      // Transform data to include video-specific information
      return (data || []).map((item) => {
        const isVideo = item.type === "video";
        let videoId = null;
        let videoUrl = null;

        if (isVideo && item.video_url) {
          // Extract YouTube video ID and URL from video_url field
          let youtubeMatch = item.video_url.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          );

          // If no direct URL match, try to extract from embed code
          if (!youtubeMatch) {
            youtubeMatch = item.video_url.match(
              /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            );
          }

          if (youtubeMatch) {
            videoId = youtubeMatch[1];
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          } else {
            videoUrl = item.video_url;
          }
        }

        return {
          ...item,
          videoId,
          videoUrl: videoUrl || item.video_url,
          thumbnailUrl:
            item.image_url || 
            item.video_thumbnail ||
            (videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : null),
          isVideo,
          hasValidVideo: isVideo && (videoId !== null || (item.video_url && item.video_url.startsWith("http"))),
        };
      });
    } catch (error) {
      console.error("Error in getNewsWithVideoData:", error);
      return [];
    }
  },

  async getFeaturedNews() {
    try {
      console.log("Fetching featured news...");
      const { data, error } = await supabase
        .from("news")
        .select(
          `
          id,
          title,
          content,
          excerpt,
          category,
          type,
          author,
          author_avatar,
          tags,
          views,
          likes,
          comments_count,
          image_url,
          video_url,
          video_thumbnail,
          video_duration,
          read_time,
          publish_date,
          created_at
        `,
        )
        .eq("featured", true)
        .eq("is_published", true)
        .order("publish_date", { ascending: false });

      if (error) {
        console.error("Featured news query failed:", error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn("No featured news found in database");
        return [];
      }

      console.log("Featured news data from database:", data);

      // Transform data to include video-specific information
      return data.map((item) => {
        const isVideo = item.type === "video";
        let videoId = null;
        let videoUrl = null;

        if (isVideo && item.video_url) {
          const youtubeMatch = item.video_url.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          );
          if (youtubeMatch) {
            videoId = youtubeMatch[1];
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          } else {
            videoUrl = item.video_url;
          }
        }

        return {
          ...item,
          videoId,
          videoUrl: videoUrl || item.video_url,
          thumbnailUrl:
            item.image_url ||
            item.video_thumbnail ||
            (videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : null),
          isVideo,
          hasValidVideo: isVideo && (videoId !== null || (item.video_url && item.video_url.startsWith("http"))),
        };
      });
    } catch (error) {
      console.error("Featured news fetch failed:", error);
      return [];
    }
  },

  // Badges
  async getBadges() {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badges (*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async updateUserSelectedBadges(userId: string, selectedBadgeIds: string[]) {
    // Limit to 3 badges maximum
    const limitedBadgeIds = selectedBadgeIds.slice(0, 3);

    const { data, error } = await supabase
      .from("users")
      .update({
        selected_badges: limitedBadgeIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSelectedBadges(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("selected_badges")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data?.selected_badges || [];
  },

  // Ads
  async getActiveAds() {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllAds() {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createAd(adData: {
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
    status?: string;
    priority?: number;
    start_date?: string;
    end_date?: string;
    tags?: string[];
    notes?: string;
    created_by?: string;
    company_logo_file_name?: string;
    background_image_file_name?: string;
    image_url_file_name?: string;
  }) {
    const { data, error } = await supabase
      .from("ads")
      .insert({
        name: adData.name,
        description: adData.description || null,
        company_name: adData.company_name || null,
        company_logo: adData.company_logo || null,
        image_url: adData.image_url || null,
        background_image: adData.background_image || null,
        headline: adData.headline || null,
        subheading: adData.subheading || null,
        cta_text: adData.cta_text || 'Learn More',
        target_url: adData.target_url || null,
        category: adData.category || null,
        status: adData.status || 'draft',
        priority: adData.priority || 1,
        start_date: adData.start_date || null,
        end_date: adData.end_date || null,
        tags: adData.tags || [],
        notes: adData.notes || null,
        created_by: adData.created_by || null,
        company_logo_file_name: adData.company_logo_file_name || null,
        background_image_file_name: adData.background_image_file_name || null,
        image_url_file_name: adData.image_url_file_name || null,
        clicks: 0,
        impressions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAd(adId: string, adData: {
    name?: string;
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
    status?: string;
    priority?: number;
    start_date?: string;
    end_date?: string;
    tags?: string[];
    notes?: string;
    updated_by?: string;
    company_logo_file_name?: string;
    background_image_file_name?: string;
    image_url_file_name?: string;
  }) {
    const { data, error } = await supabase
      .from("ads")
      .update({
        ...adData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAd(adId: string) {
    const { error } = await supabase.from("ads").delete().eq("id", adId);

    if (error) throw error;
    return true;
  },

  async updateAdStatus(adId: string, status: string, updatedBy?: string) {
    const { data, error } = await supabase
      .from("ads")
      .update({
        status,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null,
      })
      .eq("id", adId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementAdClicks(adId: string) {
    // Try to use RPC function first, fallback to manual increment
    try {
      const { data, error } = await supabase.rpc('increment_ad_clicks', {
        ad_id: adId
      });

      if (error) throw error;
      return data;
    } catch (rpcError) {
      // Fallback to manual increment
      const { data: currentAd, error: fetchError } = await supabase
        .from("ads")
        .select("clicks")
        .eq("id", adId)
        .single();

      if (fetchError) throw fetchError;

      const { data: updatedAd, error: updateError } = await supabase
        .from("ads")
        .update({
          clicks: (currentAd.clicks || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedAd;
    }
  },

  async incrementAdImpressions(adId: string) {
    const { data, error } = await supabase.rpc('increment_ad_impressions', {
      ad_id: adId
    });

    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: currentAd, error: fetchError } = await supabase
        .from("ads")
        .select("impressions")
        .eq("id", adId)
        .single();

      if (fetchError) throw fetchError;

      const { data: updatedAd, error: updateError } = await supabase
        .from("ads")
        .update({
          impressions: (currentAd.impressions || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedAd;
    }

    return data;
  },

  async getAdsByCategory(category: string) {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("category", category)
      .eq("status", "active")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAdsByStatus(status: string) {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("status", status)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAdsStats() {
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("status, clicks");

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(ad => ad.status === 'active').length,
        inactive: data.filter(ad => ad.status === 'inactive').length,
        scheduled: data.filter(ad => ad.status === 'scheduled').length,
        expired: data.filter(ad => ad.status === 'expired').length,
        draft: data.filter(ad => ad.status === 'draft').length,
        totalClicks: data.reduce((sum, ad) => sum + (ad.clicks || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching ads stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        scheduled: 0,
        expired: 0,
        draft: 0,
        totalClicks: 0,
      };
    }
  },

  // Ad Image Upload to Supabase Storage
  async uploadAdImage(file: File, fileName: string): Promise<string> {
    try {
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("ad-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("ad-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading ad image:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  },

  // Delete ad image from storage
  async deleteAdImage(fileName: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from("ad-images")
        .remove([fileName]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting ad image:", error);
      return false;
    }
  },

  // Learning Content
  async getLearningContent() {
    const { data, error } = await supabase
      .from("learning_content")
      .select("*")
      .order("upload_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getLearningContentWithVideoData() {
    const { data, error } = await supabase
      .from("learning_content")
      .select(
        `
        id,
        title,
        type,
        category,
        status,
        views,
        duration,
        description,
        url,
        thumbnail,
        upload_date,
        created_at,
        updated_at
      `,
      )
      .eq("status", "published")
      .order("upload_date", { ascending: false });

    if (error) throw error;

    // Transform data to include video-specific information
    return (data || []).map((item) => {
      const isVideo = item.type === "video";
      let videoId = null;
      let videoUrl = null;

      if (isVideo && item.url) {
        // Extract YouTube video ID and URL from url field (handles both URLs and embed codes)
        let youtubeMatch = item.url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        );

        // If no direct URL match, try to extract from embed code
        if (!youtubeMatch) {
          youtubeMatch = item.url.match(
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
          );
        }

        if (youtubeMatch) {
          videoId = youtubeMatch[1];
          videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (item.url && item.url.startsWith("http")) {
          // If it's already a valid URL, use it directly
          videoUrl = item.url;
        }
      }

      return {
        ...item,
        videoId,
        videoUrl: videoUrl || item.url,
        thumbnailUrl:
          item.thumbnail ||
          (videoId
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            : null),
        isVideo,
        hasValidVideo:
          isVideo &&
          (videoId !== null || (item.url && item.url.startsWith("http"))),
      };
    });
  },

  // Tasks
  async getUserTasks(userId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Market Data
  async getLatestMarketData() {
    try {
      const { data, error } = await supabase
        .from("market_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn("Market data query failed:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.warn("Market data fetch failed:", error);
      return null;
    }
  },

  // User Performance
  async getUserPerformance(userId: string, month?: number, year?: number) {
    let query = supabase
      .from("user_performance")
      .select("*")
      .eq("user_id", userId);

    if (month && year) {
      query = query.eq("month", month).eq("year", year);
    }

    const { data, error } = await query
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllUserPerformance(month?: number, year?: number) {
    let query = supabase.from("user_performance").select(`
        *,
        users (*)
      `);

    if (month && year) {
      query = query.eq("month", month).eq("year", year);
    }

    const { data, error } = await query.order("monthly_volume", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  // Enhanced Monthly Performance Functions
  async getUserPerformanceForGraphs(
    userId: string,
    startYear?: number,
    startMonth?: number,
    endYear?: number,
    endMonth?: number,
  ) {
    const { data, error } = await supabase.rpc(
      "get_user_performance_for_graphs",
      {
        p_user_id: userId,
        p_start_year: startYear || null,
        p_start_month: startMonth || null,
        p_end_year: endYear || null,
        p_end_month: endMonth || null,
      },
    );

    if (error) throw error;
    return data;
  },

  async upsertMonthlyPerformance(
    userId: string,
    month: number,
    year: number,
    performanceData: {
      monthlyVolume?: number;
      monthlyLoans?: number;
      ytdVolume?: number;
      ytdLoans?: number;
      compensation?: number;
      fireFundBalance?: number;
      fireFundContribution?: number;
      fireFundReceipt?: number;
      recruitmentTier?: number;
      activeRecruits?: number;
      rank?: number;
    },
  ) {
    const { data, error } = await supabase.rpc("upsert_monthly_performance", {
      p_user_id: userId,
      p_month: month,
      p_year: year,
      p_monthly_volume: performanceData.monthlyVolume || null,
      p_monthly_loans: performanceData.monthlyLoans || null,
      p_ytd_volume: performanceData.ytdVolume || null,
      p_ytd_loans: performanceData.ytdLoans || null,
      p_compensation: performanceData.compensation || null,
      p_fire_fund_balance: performanceData.fireFundBalance || null,
      p_fire_fund_contribution: performanceData.fireFundContribution || null,
      p_fire_fund_receipt: performanceData.fireFundReceipt || null,
      p_recruitment_tier: performanceData.recruitmentTier || null,
      p_active_recruits: performanceData.activeRecruits || null,
      p_rank: performanceData.rank || null,
    });

    if (error) throw error;
    return data;
  },

  async getMonthlyPerformanceSummary(
    month?: number,
    year?: number,
    limit?: number,
  ) {
    let query = supabase.from("monthly_performance_summary").select("*");

    if (month && year) {
      query = query.eq("month", month).eq("year", year);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order("monthly_volume", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  async getUserPerformanceHistory(userId: string, monthsBack: number = 12) {
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - monthsBack,
      1,
    );

    return await this.getUserPerformanceForGraphs(
      userId,
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
    );
  },

  async getTopPerformers(
    month: number,
    year: number,
    metric:
      | "monthly_volume"
      | "monthly_loans"
      | "compensation" = "monthly_volume",
    limit: number = 10,
  ) {
    const { data, error } = await supabase
      .from("monthly_performance_summary")
      .select("*")
      .eq("month", month)
      .eq("year", year)
      .order(metric, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getCurrentMonthPerformance(userId: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data, error } = await supabase
      .from("user_performance")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"
    return data;
  },

  // User Relationships
  async getUserUpline(userId: string, maxLevels: number = 3) {
    const { data, error } = await supabase
      .from("user_relationships")
      .select(
        `
        *,
        upline_user:upline_user_id (
          id,
          name,
          email,
          role,
          avatar,
          nmls_number,
          client_facing_title,
          monthly_loan_volume,
          is_producing
        )
      `,
      )
      .eq("user_id", userId)
      .lte("relationship_level", maxLevels)
      .order("relationship_level", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getUserDownline(userId: string, maxLevels: number = 3) {
    const { data, error } = await supabase
      .from("user_relationships")
      .select(
        `
        *,
        downline_user:user_id (
          id,
          name,
          email,
          role,
          avatar,
          nmls_number,
          client_facing_title,
          monthly_loan_volume,
          is_producing,
          recruiter_id
        )
      `,
      )
      .eq("upline_user_id", userId)
      .lte("relationship_level", maxLevels)
      .order("relationship_level", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getDirectRecruits(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("recruiter_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserNetworkSummary(userId: string) {
    // Get upline count
    const { data: uplineData, error: uplineError } = await supabase
      .from("user_relationships")
      .select("id")
      .eq("user_id", userId);

    if (uplineError) throw uplineError;

    // Get downline count
    const { data: downlineData, error: downlineError } = await supabase
      .from("user_relationships")
      .select("id")
      .eq("upline_user_id", userId);

    if (downlineError) throw downlineError;

    // Get direct recruits count
    const { data: directRecruitsData, error: directRecruitsError } =
      await supabase.from("users").select("id").eq("recruiter_id", userId);

    if (directRecruitsError) throw directRecruitsError;

    return {
      uplineCount: uplineData?.length || 0,
      downlineCount: downlineData?.length || 0,
      directRecruitsCount: directRecruitsData?.length || 0,
    };
  },

  // Lenders
  async getLenders() {
    const { data, error } = await supabase
      .from("lenders")
      .select("*")
      .order("company_name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createLender(lenderData: {
    companyName: string;
    companyDescription?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyWebsite?: string;
    companyAddress?: string;
    companyCity?: string;
    companyState?: string;
    companyZip?: string;
    companyLogo?: string;
    aeName?: string;
    aeTitle?: string;
    aeEmail?: string;
    aePhone?: string;
    aeExtension?: string;
    aePhoto?: string;
    specialties?: string[];
    productOfferings?: string[];
    status?: string;
    priority?: number;
    notes?: string;
    has_conventional?: boolean;
    has_fha?: boolean;
    has_va?: boolean;
    has_usda?: boolean;
    has_jumbo?: boolean;
    has_heloc?: boolean;
    has_dpa?: boolean;
    has_bank_statement?: boolean;
    has_dscr?: boolean;
  }) {
    const { data, error } = await supabase
      .from("lenders")
      .insert({
        company_name: lenderData.companyName,
        company_description: lenderData.companyDescription || null,
        company_email: lenderData.companyEmail || null,
        company_phone: lenderData.companyPhone || null,
        company_website: lenderData.companyWebsite || null,
        company_address: lenderData.companyAddress || null,
        company_city: lenderData.companyCity || null,
        company_state: lenderData.companyState || null,
        company_zip: lenderData.companyZip || null,
        company_logo: lenderData.companyLogo || null,
        ae_name: lenderData.aeName || null,
        ae_title: lenderData.aeTitle || null,
        ae_email: lenderData.aeEmail || null,
        ae_phone: lenderData.aePhone || null,
        ae_extension: lenderData.aeExtension || null,
        ae_photo: lenderData.aePhoto || null,
        specialties: lenderData.specialties || null,
        status: lenderData.status || "active",
        priority: lenderData.priority || 1,
        notes: lenderData.notes || null,
        has_conventional: lenderData.has_conventional || false,
        has_fha: lenderData.has_fha || false,
        has_va: lenderData.has_va || false,
        has_usda: lenderData.has_usda || false,
        has_jumbo: lenderData.has_jumbo || false,
        has_heloc: lenderData.has_heloc || false,
        has_dpa: lenderData.has_dpa || false,
        has_bank_statement: lenderData.has_bank_statement || false,
        has_dscr: lenderData.has_dscr || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLender(id: string, lenderData: any) {
    const { data, error } = await supabase
      .from("lenders")
      .update({
        ...lenderData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLender(id: string) {
    const { error } = await supabase.from("lenders").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  // Badge Image Upload
  async uploadBadgeImage(file: File, badgeId: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `badge-${badgeId}-${Date.now()}.${fileExt}`;
      const filePath = `badges/${fileName}`;

      // Convert file to base64 data URL as fallback
      const convertToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Try to upload to Supabase storage first
      try {
        const { error: uploadError } = await supabase.storage
          .from("badge-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Supabase storage upload failed:", uploadError.message);
          // Fall back to data URL
          return await convertToDataUrl(file);
        }

        const { data } = supabase.storage
          .from("badge-images")
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (storageError) {
        console.warn(
          "Storage service unavailable, using data URL fallback:",
          storageError,
        );
        // Fall back to data URL
        return await convertToDataUrl(file);
      }
    } catch (error) {
      console.error("Error processing badge image:", error);
      throw new Error(
        "Failed to process image. Please try again or use an image URL instead.",
      );
    }
  },

  // News Image Upload
  async uploadNewsImage(file: File, newsId: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `news-${newsId}-${Date.now()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      // Convert file to base64 data URL as fallback
      const convertToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Try to upload to Supabase storage first
      try {
        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Supabase storage upload failed:", uploadError.message);
          // Fall back to data URL
          return await convertToDataUrl(file);
        }

        const { data } = supabase.storage
          .from("news-images")
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (storageError) {
        console.warn(
          "Storage service unavailable, using data URL fallback:",
          storageError,
        );
        // Fall back to data URL
        return await convertToDataUrl(file);
      }
    } catch (error) {
      console.error("Error processing news image:", error);
      throw new Error(
        "Failed to process image. Please try again or use an image URL instead.",
      );
    }
  },

  // System Settings
  async getSystemSetting(key: string) {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("setting_key", key)
      .single();

    if (error) throw error;
    return data;
  },

  async getFeaturedVideoUrl() {
    try {
      console.log("getFeaturedVideoUrl: Starting query...");

      // Get featured video from news table
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_featured", true)
        .eq("type", "video")
        .eq("status", "published")
        .order("publish_date", { ascending: false })
        .limit(1);

      console.log("getFeaturedVideoUrl: Query result:", { data, error });

      if (error) {
        console.error("getFeaturedVideoUrl: Database error:", error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const videoData = data[0];
      console.log("getFeaturedVideoUrl: Processing video data:", videoData);

      if (!videoData.content) {
        console.warn("getFeaturedVideoUrl: No content found in video data");
        return null;
      }

      // Try multiple YouTube URL patterns
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      ];

      for (const pattern of patterns) {
        const match = videoData.content.match(pattern);
        if (match && match[1]) {
          const videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
          console.log("getFeaturedVideoUrl: Extracted video URL:", videoUrl);
          return videoUrl;
        }
      }

      console.warn(
        "getFeaturedVideoUrl: No valid YouTube URL found in content:",
        videoData.content,
      );
      return null;
    } catch (error) {
      console.error(
        "getFeaturedVideoUrl: Failed to get featured video URL:",
        error,
      );
      return null;
    }
  },

  async getFeaturedVideos(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(
          `
          id,
          title,
          content,
          author,
          video_url,
          video_thumbnail,
          video_duration,
          views,
          likes,
          comments_count,
          publish_date,
          created_at
        `,
        )
        .eq("type", "video")
        .eq("featured", true)
        .eq("is_published", true)
        .order("publish_date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching featured videos:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform data to include video-specific information
      return data.map((item) => {
        let videoId = null;
        let embedUrl = null;

        if (item.video_url) {
          const youtubeMatch = item.video_url.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          );
          if (youtubeMatch) {
            videoId = youtubeMatch[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }

        return {
          ...item,
          videoId,
          embedUrl,
          thumbnail: item.video_thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null),
          channelTitle: "Safire Home Lending",
          publishedAt: item.publish_date || item.created_at,
          duration: item.video_duration,
        };
      });
    } catch (error) {
      console.error("Error in getFeaturedVideos:", error);
      return [];
    }
  },

  async updateFeaturedVideoUrl(url: string) {
    return await this.updateSystemSetting("featured_video_url", url, "string");
  },

  async updateSystemSetting(
    key: string,
    value: string,
    type: string = "string",
  ) {
    const { data, error } = await supabase
      .from("system_settings")
      .upsert({
        setting_key: key,
        setting_value: value,
        setting_type: type,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllSystemSettings() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getAutoLogoutTimeout() {
    try {
      const setting = await this.getSystemSetting(
        "auto_logout_timeout_minutes",
      );
      return parseInt(setting.setting_value) || 30; // Default 30 minutes
    } catch (error) {
      console.warn("Failed to get auto-logout timeout, using default:", error);
      return 30; // Default fallback
    }
  },

  async updateAutoLogoutTimeout(minutes: number) {
    return await this.updateSystemSetting(
      "auto_logout_timeout_minutes",
      minutes.toString(),
      "number",
    );
  },

  // Performance Graph Data
  async getUserPerformanceGraphData(
    userId: string,
    period: "months" | "quarters" | "years" | "ytd" = "months",
    count: number = 12,
  ) {
    const currentDate = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "quarters":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - count * 3,
          1,
        );
        groupBy = "quarter";
        break;
      case "years":
        startDate = new Date(currentDate.getFullYear() - count, 0, 1);
        groupBy = "year";
        break;
      case "ytd":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        groupBy = "month";
        break;
      default: // months
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - count,
          1,
        );
        groupBy = "month";
        break;
    }

    try {
      const { data, error } = await supabase
        .from("user_performance")
        .select(
          `
          month,
          year,
          monthly_volume,
          monthly_loans,
          compensation,
          fire_fund_balance
        `,
        )
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (error) throw error;

      // Transform data based on period
      const transformedData = this.transformPerformanceData(data || [], period);
      return transformedData;
    } catch (error) {
      console.error("Error fetching performance graph data:", error);
      // Return mock data for demonstration
      return this.getMockPerformanceData(period, count);
    }
  },

  transformPerformanceData(data: any[], period: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    if (period === "quarters") {
      // Group by quarters
      const quarterData = data.reduce((acc, item) => {
        const quarter = Math.ceil(item.month / 3);
        const key = `${item.year}-Q${quarter}`;

        if (!acc[key]) {
          acc[key] = {
            period: key,
            volume: 0,
            loans: 0,
            compensation: 0,
            fireFund: 0,
            count: 0,
          };
        }

        acc[key].volume += item.monthly_volume || 0;
        acc[key].loans += item.monthly_loans || 0;
        acc[key].compensation += item.compensation || 0;
        acc[key].fireFund += item.fire_fund_balance || 0;
        acc[key].count += 1;

        return acc;
      }, {});

      return Object.values(quarterData);
    } else if (period === "years") {
      // Group by years
      const yearData = data.reduce((acc, item) => {
        const key = item.year.toString();

        if (!acc[key]) {
          acc[key] = {
            period: key,
            volume: 0,
            loans: 0,
            compensation: 0,
            fireFund: 0,
            count: 0,
          };
        }

        acc[key].volume += item.monthly_volume || 0;
        acc[key].loans += item.monthly_loans || 0;
        acc[key].compensation += item.compensation || 0;
        acc[key].fireFund += item.fire_fund_balance || 0;
        acc[key].count += 1;

        return acc;
      }, {});

      return Object.values(yearData);
    } else {
      // Monthly data (including YTD)
      let transformedData = data.map((item) => ({
        period: `${item.year}-${String(item.month).padStart(2, "0")}`,
        volume: item.monthly_volume || 0,
        loans: item.monthly_loans || 0,
        compensation: item.compensation || 0,
        fireFund: item.fire_fund_balance || 0,
      }));

      // For YTD, filter out future months
      if (period === "ytd") {
        transformedData = transformedData.filter((item) => {
          const [year, month] = item.period.split("-").map(Number);
          return (
            year < currentYear ||
            (year === currentYear && month <= currentMonth)
          );
        });
      }

      return transformedData;
    }
  },

  getMockPerformanceData(period: string, count: number) {
    const data = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (let i = count - 1; i >= 0; i--) {
      let periodLabel: string;
      let baseVolume = 2000000 + Math.random() * 1000000;
      let baseLoans = 20 + Math.floor(Math.random() * 15);
      let baseCompensation = 35000 + Math.random() * 20000;
      let baseFire = 8000 + Math.random() * 5000;
      let shouldInclude = true;

      switch (period) {
        case "quarters":
          const quarterDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i * 3,
            1,
          );
          const quarter = Math.ceil((quarterDate.getMonth() + 1) / 3);
          periodLabel = `${quarterDate.getFullYear()}-Q${quarter}`;
          baseVolume *= 3; // Quarterly totals
          baseLoans *= 3;
          baseCompensation *= 3;
          baseFire *= 3;
          break;
        case "years":
          const yearDate = new Date(currentDate.getFullYear() - i, 0, 1);
          periodLabel = yearDate.getFullYear().toString();
          baseVolume *= 12; // Yearly totals
          baseLoans *= 12;
          baseCompensation *= 12;
          baseFire *= 12;
          break;
        case "ytd":
          // For YTD, generate data from January to current month only
          const monthIndex = i;
          if (monthIndex > currentMonth) {
            shouldInclude = false; // Skip future months
          }
          const ytdDate = new Date(currentYear, monthIndex, 1);
          periodLabel = `${ytdDate.getFullYear()}-${String(ytdDate.getMonth() + 1).padStart(2, "0")}`;
          break;
        default: // months
          const monthDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1,
          );
          periodLabel = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
          break;
      }

      if (shouldInclude) {
        data.push({
          period: periodLabel,
          volume: Math.round(baseVolume),
          loans: Math.round(baseLoans),
          compensation: Math.round(baseCompensation),
          fireFund: Math.round(baseFire),
        });
      }
    }

    // For YTD, sort by period to ensure correct chronological order
    if (period === "ytd") {
      data.sort((a, b) => a.period.localeCompare(b.period));
    }

    return data;
  },

  // PIT (Performance & Issues Ticketing) System
  async createTicket(ticketData: {
    title: string;
    description: string;
    category: string;
    priority?: "low" | "medium" | "high" | "urgent";
    loanNumber?: string;
    clientName?: string;
    attachments?: any[];
    userId: string;
  }) {
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || "medium",
        loan_number: ticketData.loanNumber || null,
        client_name: ticketData.clientName || null,
        attachments: ticketData.attachments || [],
        user_id: ticketData.userId,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // ticket_number will be automatically generated by the database trigger
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserTickets(userId: string, status?: string) {
    let query = supabase
      .from("tickets")
      .select(
        `
        *,
        assigned_user:assigned_to(
          id,
          name,
          email,
          role
        ),
        resolved_user:resolved_by(
          id,
          name,
          email,
          role
        )
      `,
      )
      .eq("user_id", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  async getAllTickets(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    department?: string;
  }) {
    let query = supabase.from("tickets").select(`
        *,
        user:user_id(
          id,
          name,
          email,
          role
        ),
        assigned_user:assigned_to(
          id,
          name,
          email,
          role
        ),
        resolved_user:resolved_by(
          id,
          name,
          email,
          role
        )
      `);

    if (filters) {
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.priority) query = query.eq("priority", filters.priority);
      if (filters.assignedTo)
        query = query.eq("assigned_to", filters.assignedTo);
      if (filters.department)
        query = query.eq("department", filters.department);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  async getTicketById(ticketId: string) {
    const { data, error } = await supabase
      .from("tickets")
      .select(
        `
        *,
        user:user_id(
          id,
          name,
          email,
          role
        ),
        assigned_user:assigned_to(
          id,
          name,
          email,
          role
        ),
        resolved_user:resolved_by(
          id,
          name,
          email,
          role
        )
      `,
      )
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTicket(
    ticketId: string,
    updates: {
      status?: string;
      priority?: string;
      assigned_to?: string;
      department?: string;
      internal_notes?: string;
      resolution_notes?: string;
      resolved_by?: string;
    },
  ) {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === "resolved" || updates.status === "closed") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("tickets")
      .update(updateData)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addTicketComment(commentData: {
    ticketId: string;
    userId: string;
    comment: string;
    isInternal?: boolean;
    attachments?: any[];
  }) {
    // Handle special case for Safire system user
    let userIdToUse = commentData.userId;
    if (commentData.userId === "safire-system") {
      // Check if system user exists, create if not
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", "safire-system")
        .single();

      if (userError && userError.code === "PGRST116") {
        // User doesn't exist, create it
        try {
          await supabase.from("users").insert({
            id: "safire-system",
            name: "Safire Home Lending",
            email: "system@safirehome.com",
            role: "System",
            internal_role: "admin",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (createError) {
          console.warn("Could not create system user:", createError);
        }
      }
    }

    const { data, error } = await supabase
      .from("ticket_comments")
      .insert({
        ticket_id: commentData.ticketId,
        user_id: userIdToUse,
        comment: commentData.comment,
        is_internal: commentData.isInternal || false,
        attachments: commentData.attachments || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        user:user_id(
          id,
          name,
          email,
          role,
          avatar
        )
      `,
      )
      .single();

    if (error) throw error;
    return data;
  },

  async getTicketComments(ticketId: string, includeInternal: boolean = false) {
    let query = supabase
      .from("ticket_comments")
      .select(
        `
        *,
        user:user_id(
          id,
          name,
          email,
          role,
          avatar
        )
      `,
      )
      .eq("ticket_id", ticketId);

    if (!includeInternal) {
      query = query.eq("is_internal", false);
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) throw error;
    return data;
  },

  async getPITCategories() {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "pit_categories")
        .single();

      if (error) throw error;
      return JSON.parse(data.setting_value);
    } catch (error) {
      console.error("Error fetching PIT categories:", error);
      // Return default categories if database fetch fails
      return [
        {
          id: "loan_processing",
          name: "Loan Processing",
          description:
            "Issues related to loan processing, underwriting, and documentation",
          department: "Operations",
        },
        {
          id: "technical_support",
          name: "Technical Support",
          description:
            "IT issues, software problems, system access, and technical difficulties",
          department: "IT",
        },
        {
          id: "compliance",
          name: "Compliance",
          description:
            "Regulatory compliance questions, audit requirements, and policy clarifications",
          department: "Compliance",
        },
        {
          id: "marketing",
          name: "Marketing & Sales",
          description:
            "Marketing materials, lead generation, sales support, and promotional questions",
          department: "Marketing",
        },
        {
          id: "hr_payroll",
          name: "HR & Payroll",
          description:
            "Human resources, payroll, benefits, and employee-related questions",
          department: "HR",
        },
        {
          id: "training",
          name: "Training & Development",
          description:
            "Training requests, educational resources, and professional development",
          department: "Training",
        },
        {
          id: "general_inquiry",
          name: "General Inquiry",
          description:
            "General questions and requests that don't fit other categories",
          department: "General",
        },
      ];
    }
  },

  async uploadTicketAttachment(file: File, ticketId: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `ticket-${ticketId}-${Date.now()}.${fileExt}`;
      const filePath = `tickets/${fileName}`;

      // Convert file to base64 data URL as fallback
      const convertToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Try to upload to Supabase storage first
      try {
        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Supabase storage upload failed:", uploadError.message);
          // Fall back to data URL
          return await convertToDataUrl(file);
        }

        const { data } = supabase.storage
          .from("ticket-attachments")
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (storageError) {
        console.warn(
          "Storage service unavailable, using data URL fallback:",
          storageError,
        );
        // Fall back to data URL
        return await convertToDataUrl(file);
      }
    } catch (error) {
      console.error("Error processing ticket attachment:", error);
      throw new Error(
        "Failed to process attachment. Please try again or use a different file.",
      );
    }
  },

  async getAssignedTickets(userId: string, status?: string) {
    try {
      let query = supabase
        .from("tickets")
        .select(
          `
          *,
          user:user_id(
            id,
            name,
            email,
            role
          ),
          resolved_user:resolved_by(
            id,
            name,
            email,
            role
          )
        `,
        )
        .eq("assigned_to", userId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching assigned tickets:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAssignedTickets:", error);
      // Return empty array as fallback
      return [];
    }
  },

  async getTicketStats(userId?: string) {
    try {
      let query = supabase.from("tickets").select("status, priority, category");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        open: data.filter((t) => t.status === "open").length,
        in_progress: data.filter((t) => t.status === "in_progress").length,
        resolved: data.filter((t) => t.status === "resolved").length,
        closed: data.filter((t) => t.status === "closed").length,
        high_priority: data.filter(
          (t) => t.priority === "high" || t.priority === "urgent",
        ).length,
        by_category: data.reduce(
          (acc, ticket) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      return {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        high_priority: 0,
        by_category: {},
      };
    }
  },

  async getAssignedTicketStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("status, priority, category")
        .eq("assigned_to", userId);

      if (error) {
        console.error("Error fetching assigned ticket stats:", error);
        throw error;
      }

      const ticketData = data || [];
      const stats = {
        total: ticketData.length,
        open: ticketData.filter((t) => t.status === "open").length,
        in_progress: ticketData.filter((t) => t.status === "in_progress")
          .length,
        resolved: ticketData.filter((t) => t.status === "resolved").length,
        closed: ticketData.filter((t) => t.status === "closed").length,
        high_priority: ticketData.filter(
          (t) => t.priority === "high" || t.priority === "urgent",
        ).length,
        by_category: ticketData.reduce(
          (acc, ticket) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching assigned ticket stats:", error);
      return {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        high_priority: 0,
        by_category: {},
      };
    }
  },

  // Spark Points System
  async getUserSparkPointBalance(userId: string) {
    try {
      const { data, error } = await supabase
        .from("spark_point_balances")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 is "not found"

      // If no balance record exists, create one
      if (!data) {
        const { data: newBalance, error: createError } = await supabase
          .from("spark_point_balances")
          .insert({
            user_id: userId,
            total_points: 0,
            available_points: 0,
            redeemed_points: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating spark point balance:", createError);
          return { total_points: 0, available_points: 0, redeemed_points: 0 };
        }

        return newBalance;
      }

      return data;
    } catch (error) {
      console.error("Error fetching spark point balance:", error);
      return { total_points: 0, available_points: 0, redeemed_points: 0 };
    }
  },

  async getUserSparkPointHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("spark_points")
        .select(
          `
          *,
          awarded_by_user:awarded_by (
            id,
            name,
            email
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching spark point history:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserSparkPointHistory:", error);
      return [];
    }
  },

  async getSparkPointLeaderboard(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from("spark_point_leaderboard")
        .select("*")
        .limit(limit);

      if (error) {
        console.error("Error fetching spark point leaderboard:", error);
        // Return mock leaderboard data as fallback
        return [
          {
            id: "mock-1",
            name: "Top Performer",
            email: "top@example.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top",
            role: "Senior Loan Officer",
            total_points: 5000,
            available_points: 4500,
            redeemed_points: 500,
            rank: 1,
          },
          {
            id: "mock-2",
            name: "Second Place",
            email: "second@example.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=second",
            role: "Loan Officer",
            total_points: 4200,
            available_points: 3800,
            redeemed_points: 400,
            rank: 2,
          },
        ];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSparkPointLeaderboard:", error);
      return [];
    }
  },

  async getUserSparkPointSummary(userId: string) {
    try {
      const { data, error } = await supabase.rpc(
        "get_user_spark_point_summary",
        {
          p_user_id: userId,
        },
      );

      if (error) {
        console.error("Error fetching spark point summary:", error);
        // Return default values if RPC fails
        return {
          total_points: 0,
          available_points: 0,
          redeemed_points: 0,
          rank: 0,
          recent_points: [],
          points_this_month: 0,
          points_this_week: 0,
        };
      }

      const summary = data?.[0] || {
        total_points: 0,
        available_points: 0,
        redeemed_points: 0,
        rank: 0,
        recent_points: [],
        points_this_month: 0,
        points_this_week: 0,
      };

      // Parse recent_points if it's a string
      if (typeof summary.recent_points === "string") {
        try {
          summary.recent_points = JSON.parse(summary.recent_points);
        } catch (parseError) {
          console.error("Error parsing recent_points:", parseError);
          summary.recent_points = [];
        }
      }

      return summary;
    } catch (error) {
      console.error("Error in getUserSparkPointSummary:", error);
      return {
        total_points: 0,
        available_points: 0,
        redeemed_points: 0,
        rank: 0,
        recent_points: [],
        points_this_month: 0,
        points_this_week: 0,
      };
    }
  },

  async awardSparkPoints(
    userId: string,
    points: number,
    reason: string,
    category: string = "general",
    referenceId?: string,
    awardedBy?: string,
  ) {
    try {
      console.log(
        `Awarding ${points} spark points to user ${userId} for: ${reason}`,
      );

      const { data, error } = await supabase.rpc("award_spark_points", {
        p_user_id: userId,
        p_points: points,
        p_reason: reason,
        p_category: category,
        p_reference_id: referenceId || null,
        p_awarded_by: awardedBy || null,
      });

      if (error) {
        console.error("Error awarding spark points:", error);
        throw error;
      }

      console.log(
        `Successfully awarded ${points} spark points to user ${userId}`,
      );
      return data;
    } catch (error) {
      console.error("Error in awardSparkPoints:", error);
      throw error;
    }
  },

  async getSparkPointRewards(category?: string) {
    let query = supabase
      .from("spark_point_rewards")
      .select("*")
      .eq("is_active", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("cost", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async redeemSparkPointReward(
    userId: string,
    rewardId: string,
    pointsSpent: number,
    notes?: string,
  ) {
    try {
      console.log(
        `User ${userId} attempting to redeem reward ${rewardId} for ${pointsSpent} points`,
      );

      // Check if user has enough points
      const balance = await this.getUserSparkPointBalance(userId);
      if (balance.available_points < pointsSpent) {
        throw new Error(
          `Insufficient points. Available: ${balance.available_points}, Required: ${pointsSpent}`,
        );
      }

      // Check if reward is available
      const { data: reward, error: rewardError } = await supabase
        .from("spark_point_rewards")
        .select("*")
        .eq("id", rewardId)
        .eq("is_active", true)
        .single();

      if (rewardError) {
        console.error("Error fetching reward:", rewardError);
        throw new Error("Reward not found or not available");
      }

      if (reward.stock_quantity === 0) {
        throw new Error("Reward is out of stock");
      }

      // Create redemption request
      const { data, error } = await supabase
        .from("spark_point_redemptions")
        .insert({
          user_id: userId,
          reward_id: rewardId,
          points_spent: pointsSpent,
          status: "approved", // Auto-approve for now, can be changed to "pending" for manual approval
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating redemption:", error);
        throw error;
      }

      console.log(`Successfully created redemption for user ${userId}`);
      return data;
    } catch (error) {
      console.error("Error in redeemSparkPointReward:", error);
      throw error;
    }
  },

  async getUserSparkPointRedemptions(userId: string) {
    const { data, error } = await supabase
      .from("spark_point_redemptions")
      .select(
        `
        *,
        reward:reward_id (
          name,
          description,
          cost,
          category,
          image_url
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateSparkPointRedemptionStatus(
    redemptionId: string,
    status: "pending" | "approved" | "fulfilled" | "cancelled",
    notes?: string,
  ) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (notes) updateData.notes = notes;

    const { data, error } = await supabase
      .from("spark_point_redemptions")
      .update(updateData)
      .eq("id", redemptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSparkPointRules() {
    const { data, error } = await supabase
      .from("spark_point_rules")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSparkPointRule(ruleData: {
    name: string;
    description: string;
    triggerEvent: string;
    pointsAwarded: number;
    conditions?: any;
    isActive?: boolean;
  }) {
    const { data, error } = await supabase
      .from("spark_point_rules")
      .insert({
        name: ruleData.name,
        description: ruleData.description,
        trigger_event: ruleData.triggerEvent,
        points_awarded: ruleData.pointsAwarded,
        conditions: ruleData.conditions || {},
        is_active: ruleData.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSparkPointRule(
    ruleId: string,
    updates: {
      name?: string;
      description?: string;
      triggerEvent?: string;
      pointsAwarded?: number;
      conditions?: any;
      isActive?: boolean;
    },
  ) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.triggerEvent) updateData.trigger_event = updates.triggerEvent;
    if (updates.pointsAwarded)
      updateData.points_awarded = updates.pointsAwarded;
    if (updates.conditions) updateData.conditions = updates.conditions;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from("spark_point_rules")
      .update(updateData)
      .eq("id", ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createSparkPointReward(rewardData: {
    name: string;
    description: string;
    cost: number;
    category: string;
    imageUrl?: string;
    stockQuantity?: number;
    isActive?: boolean;
  }) {
    const { data, error } = await supabase
      .from("spark_point_rewards")
      .insert({
        name: rewardData.name,
        description: rewardData.description,
        cost: rewardData.cost,
        category: rewardData.category,
        image_url: rewardData.imageUrl || null,
        stock_quantity: rewardData.stockQuantity ?? -1,
        is_active: rewardData.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllSparkPointRedemptions(status?: string) {
    try {
      let query = supabase.from("spark_point_redemptions").select(`
          *,
          user:user_id (
            id,
            name,
            email,
            avatar
          ),
          reward:reward_id (
            name,
            description,
            cost,
            category,
            image_url
          )
        `);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching spark point redemptions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllSparkPointRedemptions:", error);
      return [];
    }
  },

  // Additional helper functions for spark points logging and management
  async getSparkPointStats(userId?: string) {
    try {
      let totalPointsQuery = supabase.from("spark_points").select("points");
      let positivePointsQuery = supabase
        .from("spark_points")
        .select("points")
        .gt("points", 0);
      let negativePointsQuery = supabase
        .from("spark_points")
        .select("points")
        .lt("points", 0);

      if (userId) {
        totalPointsQuery = totalPointsQuery.eq("user_id", userId);
        positivePointsQuery = positivePointsQuery.eq("user_id", userId);
        negativePointsQuery = negativePointsQuery.eq("user_id", userId);
      }

      const [totalResult, positiveResult, negativeResult] = await Promise.all([
        totalPointsQuery,
        positivePointsQuery,
        negativePointsQuery,
      ]);

      const totalTransactions = totalResult.data?.length || 0;
      const totalPointsAwarded =
        positiveResult.data?.reduce((sum, record) => sum + record.points, 0) ||
        0;
      const totalPointsSpent = Math.abs(
        negativeResult.data?.reduce((sum, record) => sum + record.points, 0) ||
          0,
      );

      return {
        totalTransactions,
        totalPointsAwarded,
        totalPointsSpent,
        netPoints: totalPointsAwarded - totalPointsSpent,
      };
    } catch (error) {
      console.error("Error fetching spark point stats:", error);
      return {
        totalTransactions: 0,
        totalPointsAwarded: 0,
        totalPointsSpent: 0,
        netPoints: 0,
      };
    }
  },

  async getSparkPointTransactionsByCategory(
    userId?: string,
    days: number = 30,
  ) {
    try {
      let query = supabase
        .from("spark_points")
        .select("category, points, created_at")
        .gte(
          "created_at",
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching transactions by category:", error);
        return {};
      }

      const categoryStats = (data || []).reduce((acc, transaction) => {
        const category = transaction.category || "general";
        if (!acc[category]) {
          acc[category] = {
            totalPoints: 0,
            positivePoints: 0,
            negativePoints: 0,
            transactionCount: 0,
          };
        }

        acc[category].totalPoints += transaction.points;
        acc[category].transactionCount += 1;

        if (transaction.points > 0) {
          acc[category].positivePoints += transaction.points;
        } else {
          acc[category].negativePoints += Math.abs(transaction.points);
        }

        return acc;
      }, {});

      return categoryStats;
    } catch (error) {
      console.error("Error in getSparkPointTransactionsByCategory:", error);
      return {};
    }
  },

  // PIT Notification System
  async getPITNotificationCount(userId: string) {
    try {
      // Get tickets that need user's attention:
      // 1. Tickets created by user that have new comments from others
      // 2. Tickets assigned to user that are open or in_progress

      // Get user's tickets with recent comments from others
      const { data: userTicketsWithComments, error: userTicketsError } =
        await supabase
          .from("tickets")
          .select(
            `
          id,
          user_id,
          status,
          updated_at,
          ticket_comments!inner(
            id,
            user_id,
            created_at
          )
        `,
          )
          .eq("user_id", userId)
          .neq("ticket_comments.user_id", userId) // Comments not from the user themselves
          .in("status", ["open", "in_progress"]); // Only active tickets

      // Get tickets assigned to user that are active
      const { data: assignedTickets, error: assignedError } = await supabase
        .from("tickets")
        .select("id, status, updated_at")
        .eq("assigned_to", userId)
        .in("status", ["open", "in_progress"]);

      if (userTicketsError && assignedError) {
        console.error("Error fetching notification data:", {
          userTicketsError,
          assignedError,
        });
        return 0;
      }

      // Count unique tickets that need attention
      const ticketsNeedingAttention = new Set();

      // Add user's tickets with new comments
      if (userTicketsWithComments) {
        userTicketsWithComments.forEach((ticket) => {
          ticketsNeedingAttention.add(ticket.id);
        });
      }

      // Add assigned tickets
      if (assignedTickets) {
        assignedTickets.forEach((ticket) => {
          ticketsNeedingAttention.add(ticket.id);
        });
      }

      return ticketsNeedingAttention.size;
    } catch (error) {
      console.error("Error getting PIT notification count:", error);
      return 0;
    }
  },
};