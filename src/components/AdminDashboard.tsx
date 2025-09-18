import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// Import the new modular components
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminBadges from "@/components/admin/AdminBadges";
import AdminCollections from "@/components/admin/AdminCollections";
import AdminTickets from "@/components/admin/AdminTickets";
import UserDialog from "@/components/admin/UserDialog";
import BadgeDialog from "@/components/admin/BadgeDialog";
import CollectionDialog from "@/components/admin/CollectionDialog";
import CollectionBadgesDialog from "@/components/admin/CollectionBadgesDialog";
import AwardBadgeDialog from "@/components/admin/AwardBadgeDialog";
import TicketDialog from "@/components/admin/TicketDialog";
import AdminQuickAccessManager from "@/components/AdminQuickAccessManager";
import AdminNewsManager from "@/components/AdminNewsManager";
import AdminAdManager from "@/components/AdminAdManager";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  internal_role?: string;
  created_at: string;
  last_login: string;
  status: string;
  phone?: string;
  selected_badges?: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  rarity?: string;
  color?: string;
  requirements: any;
  is_active: boolean;
  created_at: string;
  collection_id?: string;
}

interface BadgeCollection {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  badge_count?: number;
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  user_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: {
    name: string;
    email: string;
  };
  assigned_user?: {
    name: string;
    email: string;
  };
}

interface SparkPointsTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [collections, setCollections] = useState<BadgeCollection[]>([]);
  const [collectionBadges, setCollectionBadges] = useState<Badge[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sparkPointsTransactions, setSparkPointsTransactions] = useState<SparkPointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<BadgeCollection | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isCollectionBadgesDialogOpen, setIsCollectionBadgesDialogOpen] = useState(false);
  const [isAwardBadgeDialogOpen, setIsAwardBadgeDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollection, setFilterCollection] = useState("all");

  // Form states
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    role: "loan_officer",
    phone: "",
    selected_badges: [] as string[],
  });

  const [badgeForm, setBadgeForm] = useState({
    name: "",
    description: "",
    image_url: "",
    tier: "qualifying",
    rarity: "common",
    color: "#3b82f6",
    requirements: {},
    is_active: true,
    collection_id: "none",
  });

  const [collectionForm, setCollectionForm] = useState({
    name: "",
    description: "",
    image_url: "",
    color: "#f3f4f6",
    is_active: true,
    sort_order: 0,
  });

  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    category: "general",
    assigned_to: "",
  });

  useEffect(() => {
    if (user?.internalRole === "admin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchBadges(),
        fetchCollections(),
        fetchTickets(),
        fetchSparkPointsTransactions(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from("badge_collections")
        .select(`
          *,
          badge_count:badge_collection_items(count)
        `)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      const collectionsWithCount = data?.map(collection => ({
        ...collection,
        badge_count: collection.badge_count?.[0]?.count || 0
      })) || [];
      
      setCollections(collectionsWithCount);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const fetchCollectionBadges = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from("badge_collection_items")
        .select(`
          badges (*)
        `)
        .eq("collection_id", collectionId);

      if (error) throw error;
      
      const badges = data?.map(item => item.badges).filter(Boolean) || [];
      setCollectionBadges(badges as Badge[]);
    } catch (error) {
      console.error("Error fetching collection badges:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          user:users!tickets_user_id_fkey(name, email),
          assigned_user:users!tickets_assigned_to_fkey(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchSparkPointsTransactions = async () => {
    try {
      // This would need to be implemented based on your spark points system
      setSparkPointsTransactions([]);
    } catch (error) {
      console.error("Error fetching spark points transactions:", error);
    }
  };

  // Collection handlers
  const handleCreateCollection = async () => {
    try {
      const { data, error } = await supabase
        .from("badge_collections")
        .insert([{ ...collectionForm, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCollections([{ ...data, badge_count: 0 }, ...collections]);
      setIsCollectionDialogOpen(false);
      resetCollectionForm();
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection) return;

    try {
      const { data, error } = await supabase
        .from("badge_collections")
        .update(collectionForm)
        .eq("id", selectedCollection.id)
        .select()
        .single();

      if (error) throw error;

      setCollections(collections.map(c => 
        c.id === selectedCollection.id ? { ...data, badge_count: selectedCollection.badge_count } : c
      ));
      setIsCollectionDialogOpen(false);
      setSelectedCollection(null);
      resetCollectionForm();
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from("badge_collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;

      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleAddBadgeToCollection = async (badgeId: string) => {
    if (!selectedCollection) return;

    try {
      const { error } = await supabase
        .from("badge_collection_items")
        .insert([{
          collection_id: selectedCollection.id,
          badge_id: badgeId
        }]);

      if (error) throw error;

      await fetchCollectionBadges(selectedCollection.id);
      await fetchCollections();
    } catch (error) {
      console.error("Error adding badge to collection:", error);
    }
  };

  const handleRemoveBadgeFromCollection = async (badgeId: string) => {
    if (!selectedCollection) return;

    try {
      const { error } = await supabase
        .from("badge_collection_items")
        .delete()
        .eq("collection_id", selectedCollection.id)
        .eq("badge_id", badgeId);

      if (error) throw error;

      await fetchCollectionBadges(selectedCollection.id);
      await fetchCollections();
    } catch (error) {
      console.error("Error removing badge from collection:", error);
    }
  };

  const handleAwardBadge = async (userId: string, badgeId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("user_badges")
        .insert([{
          user_id: userId,
          badge_id: badgeId,
          awarded_by: user?.id,
          reason: reason,
          awarded_at: new Date().toISOString(),
          progress: 100,
          max_progress: 100
        }]);

      if (error) throw error;

      console.log("Badge awarded successfully");
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([userForm])
        .select()
        .single();

      if (error) throw error;

      setUsers([data, ...users]);
      setIsUserDialogOpen(false);
      resetUserForm();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update(userForm)
        .eq("id", selectedUser.id)
        .select()
        .single();

      if (error) throw error;

      setUsers(users.map(u => u.id === selectedUser.id ? data : u));
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      resetUserForm();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateBadge = async () => {
    try {
      const badgeData = {
        name: badgeForm.name,
        description: badgeForm.description,
        image_url: badgeForm.image_url,
        tier: badgeForm.tier,
        rarity: badgeForm.rarity,
        color: badgeForm.color,
        requirements: badgeForm.requirements,
        is_active: badgeForm.is_active,
        collection_id: badgeForm.collection_id === "none" ? null : badgeForm.collection_id,
        created_by: user?.id
      };
      
      const { data, error } = await supabase
        .from("badges")
        .insert([badgeData])
        .select()
        .single();

      if (error) throw error;

      setBadges([data, ...badges]);
      setIsBadgeDialogOpen(false);
      resetBadgeForm();
    } catch (error) {
      console.error("Error creating badge:", error);
    }
  };

  const handleUpdateBadge = async () => {
    if (!selectedBadge) return;

    try {
      const badgeData = {
        name: badgeForm.name,
        description: badgeForm.description,
        image_url: badgeForm.image_url,
        tier: badgeForm.tier,
        rarity: badgeForm.rarity,
        color: badgeForm.color,
        requirements: badgeForm.requirements,
        is_active: badgeForm.is_active,
        collection_id: badgeForm.collection_id === "none" ? null : badgeForm.collection_id
      };
      
      const { data, error } = await supabase
        .from("badges")
        .update(badgeData)
        .eq("id", selectedBadge.id)
        .select()
        .single();

      if (error) throw error;

      setBadges(badges.map(b => b.id === selectedBadge.id ? data : b));
      setIsBadgeDialogOpen(false);
      setSelectedBadge(null);
      resetBadgeForm();
    } catch (error) {
      console.error("Error updating badge:", error);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", badgeId);

      if (error) throw error;

      setBadges(badges.filter(b => b.id !== badgeId));
    } catch (error) {
      console.error("Error deleting badge:", error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const ticketData = {
        ...ticketForm,
        user_id: user?.id,
      };

      const { data, error } = await supabase
        .from("tickets")
        .insert([ticketData])
        .select(`
          *,
          user:users!tickets_user_id_fkey(name, email),
          assigned_user:users!tickets_assigned_to_fkey(name, email)
        `)
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setIsTicketDialogOpen(false);
      resetTicketForm();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .update(ticketForm)
        .eq("id", selectedTicket.id)
        .select(`
          *,
          user:users!tickets_user_id_fkey(name, email),
          assigned_user:users!tickets_assigned_to_fkey(name, email)
        `)
        .single();

      if (error) throw error;

      setTickets(tickets.map(t => t.id === selectedTicket.id ? data : t));
      setIsTicketDialogOpen(false);
      setSelectedTicket(null);
      resetTicketForm();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;

      setTickets(tickets.filter(t => t.id !== ticketId));
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      email: "",
      name: "",
      role: "loan_officer",
      phone: "",
      selected_badges: [],
    });
  };

  const resetBadgeForm = () => {
    setBadgeForm({
      name: "",
      description: "",
      image_url: "",
      tier: "qualifying",
      rarity: "common",
      color: "#3b82f6",
      requirements: {},
      is_active: true,
      collection_id: "none",
    });
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      name: "",
      description: "",
      image_url: "",
      color: "#f3f4f6",
      is_active: true,
      sort_order: 0,
    });
  };

  const resetTicketForm = () => {
    setTicketForm({
      title: "",
      description: "",
      status: "open",
      priority: "medium",
      category: "general",
      assigned_to: "",
    });
  };

  const openUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || "",
        selected_badges: user.selected_badges || [],
      });
    } else {
      setSelectedUser(null);
      resetUserForm();
    }
    setIsUserDialogOpen(true);
  };

  const openBadgeDialog = (badge?: Badge) => {
    if (badge) {
      setSelectedBadge(badge);
      setBadgeForm({
        name: badge.name,
        description: badge.description,
        image_url: badge.image_url,
        tier: badge.tier,
        rarity: badge.rarity || "common",
        color: badge.color || "#3b82f6",
        requirements: badge.requirements,
        is_active: badge.is_active,
        collection_id: badge.collection_id || "none",
      });
    } else {
      setSelectedBadge(null);
      resetBadgeForm();
    }
    setIsBadgeDialogOpen(true);
  };

  const openCollectionDialog = (collection?: BadgeCollection) => {
    if (collection) {
      setSelectedCollection(collection);
      setCollectionForm({
        name: collection.name,
        description: collection.description,
        image_url: collection.image_url || "",
        color: collection.color || "#f3f4f6",
        is_active: collection.is_active,
        sort_order: collection.sort_order,
      });
    } else {
      setSelectedCollection(null);
      resetCollectionForm();
    }
    setIsCollectionDialogOpen(true);
  };

  const openCollectionBadgesDialog = async (collection: BadgeCollection) => {
    setSelectedCollection(collection);
    await fetchCollectionBadges(collection.id);
    setIsCollectionBadgesDialogOpen(true);
  };

  const openTicketDialog = (ticket?: Ticket) => {
    if (ticket) {
      setSelectedTicket(ticket);
      setTicketForm({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        assigned_to: ticket.assigned_to || "",
      });
    } else {
      setSelectedTicket(null);
      resetTicketForm();
    }
    setIsTicketDialogOpen(true);
  };

  if (!user || user.internalRole !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, badges, collections, tickets, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview
              users={users}
              badges={badges}
              tickets={tickets}
              sparkPointsTransactions={sparkPointsTransactions}
            />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers
              users={users}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterRole={filterRole}
              setFilterRole={setFilterRole}
              filterTier={filterTier}
              setFilterTier={setFilterTier}
              onEditUser={openUserDialog}
              onDeleteUser={handleDeleteUser}
              onCreateUser={() => openUserDialog()}
            />
          </TabsContent>

          <TabsContent value="badges">
            <AdminBadges
              badges={badges}
              collections={collections}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCollection={filterCollection}
              setFilterCollection={setFilterCollection}
              onEditBadge={openBadgeDialog}
              onDeleteBadge={handleDeleteBadge}
              onCreateBadge={() => openBadgeDialog()}
              onAwardBadge={() => setIsAwardBadgeDialogOpen(true)}
              onEditCollection={openCollectionDialog}
              onDeleteCollection={handleDeleteCollection}
              onCreateCollection={() => openCollectionDialog()}
              onManageBadges={openCollectionBadgesDialog}
            />
          </TabsContent>

          <TabsContent value="tickets">
            <AdminTickets
              tickets={tickets}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onEditTicket={openTicketDialog}
              onDeleteTicket={handleDeleteTicket}
              onCreateTicket={() => openTicketDialog()}
            />
          </TabsContent>

          <TabsContent value="quick-access">
            <AdminQuickAccessManager />
          </TabsContent>

          <TabsContent value="news">
            <AdminNewsManager />
          </TabsContent>

          <TabsContent value="ads">
            <AdminAdManager />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <UserDialog
          isOpen={isUserDialogOpen}
          onClose={() => setIsUserDialogOpen(false)}
          selectedUser={selectedUser}
          userForm={userForm}
          setUserForm={setUserForm}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        />

        <BadgeDialog
          isOpen={isBadgeDialogOpen}
          onClose={() => setIsBadgeDialogOpen(false)}
          selectedBadge={selectedBadge}
          badgeForm={badgeForm}
          setBadgeForm={setBadgeForm}
          collections={collections}
          onSubmit={selectedBadge ? handleUpdateBadge : handleCreateBadge}
        />

        <CollectionDialog
          isOpen={isCollectionDialogOpen}
          onClose={() => setIsCollectionDialogOpen(false)}
          selectedCollection={selectedCollection}
          collectionForm={collectionForm}
          setCollectionForm={setCollectionForm}
          onSubmit={selectedCollection ? handleUpdateCollection : handleCreateCollection}
        />

        <CollectionBadgesDialog
          isOpen={isCollectionBadgesDialogOpen}
          onClose={() => setIsCollectionBadgesDialogOpen(false)}
          collection={selectedCollection}
          allBadges={badges}
          collectionBadges={collectionBadges}
          onAddBadge={handleAddBadgeToCollection}
          onRemoveBadge={handleRemoveBadgeFromCollection}
        />

        <AwardBadgeDialog
          isOpen={isAwardBadgeDialogOpen}
          onClose={() => setIsAwardBadgeDialogOpen(false)}
          users={users}
          badges={badges}
          onAwardBadge={handleAwardBadge}
        />

        <TicketDialog
          isOpen={isTicketDialogOpen}
          onClose={() => setIsTicketDialogOpen(false)}
          selectedTicket={selectedTicket}
          ticketForm={ticketForm}
          setTicketForm={setTicketForm}
          onSubmit={selectedTicket ? handleUpdateTicket : handleCreateTicket}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;