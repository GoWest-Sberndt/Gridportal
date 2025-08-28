import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  Filter,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseHelpers } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PITSystemProps {
  onClose: () => void;
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  loan_number?: string;
  client_name?: string;
  attachments: any[];
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigned_user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface TicketComment {
  id: string;
  comment: string;
  is_internal: boolean;
  attachments: any[];
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  department: string;
}

export default function PITSystem({ onClose }: PITSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [activeView, setActiveView] = useState<
    "create" | "list" | "assigned" | "admin" | "view"
  >("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketStats, setTicketStats] = useState<any>(null);
  const [assignedTicketStats, setAssignedTicketStats] = useState<any>(null);
  const [allTicketStats, setAllTicketStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    loanNumber: "",
    clientName: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyAsSafire, setReplyAsSafire] = useState(false);

  // Filters and Sorting
  const [filters, setFilters] = useState({
    status: "active", // Changed default to exclude resolved tickets
    category: "all",
    priority: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("oldest"); // Default sort by oldest first

  // Check if user is admin
  const isAdmin =
    user?.internalRole === "admin" || user?.internalRole === "manager";

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadTickets();
    loadAssignedTickets();
    loadTicketStats();
    loadAssignedTicketStats();
    if (isAdmin) {
      loadAllTickets();
      loadAllTicketStats();
      loadAllUsers();
    }
  }, [isAdmin]);

  const loadCategories = async () => {
    try {
      const categoriesData = await supabaseHelpers.getPITCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Show more detailed error information
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to load categories",
        description: `Error: ${errorMessage}. Using default categories.`,
        variant: "destructive",
      });
      // Set default categories as fallback
      setCategories([
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
          id: "general_inquiry",
          name: "General Inquiry",
          description:
            "General questions and requests that don't fit other categories",
          department: "General",
        },
      ]);
    }
  };

  const loadTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const ticketsData = await supabaseHelpers.getUserTickets(user.id);
      setTickets(ticketsData || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
      // Show more detailed error information
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to load tickets",
        description: `Error: ${errorMessage}. Please try refreshing the page or contact support if the issue persists.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const assignedTicketsData = await supabaseHelpers.getAssignedTickets(
        user.id,
      );
      setAssignedTickets(assignedTicketsData || []);
    } catch (error) {
      console.error("Error loading assigned tickets:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Set empty array as fallback
      setAssignedTickets([]);

      toast({
        title: "Failed to load assigned tickets",
        description: `Error: ${errorMessage}. The tickets table may not be set up properly. Please contact your administrator.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTicketStats = async () => {
    if (!user) return;

    try {
      const stats = await supabaseHelpers.getTicketStats(user.id);
      setTicketStats(stats);
    } catch (error) {
      console.error("Error loading ticket stats:", error);
      // Set default stats as fallback
      setTicketStats({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        high_priority: 0,
        by_category: {},
      });
    }
  };

  const loadAssignedTicketStats = async () => {
    if (!user) return;

    try {
      const stats = await supabaseHelpers.getAssignedTicketStats(user.id);
      setAssignedTicketStats(stats);
    } catch (error) {
      console.error("Error loading assigned ticket stats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Set default stats as fallback
      setAssignedTicketStats({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        high_priority: 0,
        by_category: {},
      });

      // Only show toast if it's a significant error
      if (
        errorMessage.includes("relation") ||
        errorMessage.includes("does not exist")
      ) {
        toast({
          title: "Database Setup Issue",
          description:
            "The tickets table may not be properly configured. Please contact your administrator.",
          variant: "destructive",
        });
      }
    }
  };

  const loadAllTickets = async () => {
    if (!user || !isAdmin) return;

    setLoading(true);
    try {
      const allTicketsData = await supabaseHelpers.getAllTickets();
      setAllTickets(allTicketsData || []);
    } catch (error) {
      console.error("Error loading all tickets:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to load all tickets",
        description: `Error: ${errorMessage}. Please try refreshing the page or contact support if the issue persists.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllTicketStats = async () => {
    if (!user || !isAdmin) return;

    try {
      const stats = await supabaseHelpers.getTicketStats();
      setAllTicketStats(stats);
    } catch (error) {
      console.error("Error loading all ticket stats:", error);
      // Set default stats as fallback
      setAllTicketStats({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        high_priority: 0,
        by_category: {},
      });
    }
  };

  const loadAllUsers = async () => {
    if (!user || !isAdmin) return;

    try {
      const users = await supabaseHelpers.getUsers();
      setAllUsers(users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setAllUsers([]);
    }
  };

  const loadTicketComments = async (ticketId: string) => {
    try {
      const comments = await supabaseHelpers.getTicketComments(ticketId);
      setTicketComments(comments || []);
    } catch (error) {
      console.error("Error loading ticket comments:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket comments",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Upload attachments if any
      const uploadedAttachments = [];
      for (const file of attachments) {
        try {
          const url = await supabaseHelpers.uploadTicketAttachment(
            file,
            "temp",
          );
          uploadedAttachments.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: url,
          });
        } catch (error) {
          console.error("Error uploading attachment:", error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload ${file.name}, but ticket will still be created`,
            variant: "destructive",
          });
        }
      }

      // Create ticket
      const ticket = await supabaseHelpers.createTicket({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        loanNumber: formData.loanNumber || undefined,
        clientName: formData.clientName || undefined,
        attachments: uploadedAttachments,
        userId: user.id,
      });

      toast({
        title: "Success",
        description: "Ticket created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        loanNumber: "",
        clientName: "",
      });
      setAttachments([]);

      // Refresh tickets and stats
      loadTickets();
      loadAssignedTickets();
      loadTicketStats();
      loadAssignedTicketStats();
      if (isAdmin) {
        loadAllTickets();
        loadAllTicketStats();
      }
      setActiveView("list");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !user || !newComment.trim()) return;

    try {
      // Check if the current user is the assigned user and update status to in_progress
      const isAssignedUser = selectedTicket.assigned_user?.id === user.id;

      if (replyAsSafire && isAdmin) {
        // Create a special comment as Safire Home Lending with system user
        const { data: systemUser, error: systemUserError } = await supabase
          .from("users")
          .select("*")
          .eq("email", "system@safirehome.com")
          .single();

        let systemUserId = "safire-system";
        if (systemUserError || !systemUser) {
          // Create system user if it doesn't exist
          try {
            const { data: newSystemUser, error: createError } = await supabase
              .from("users")
              .insert({
                id: "safire-system",
                name: "Safire Home Lending",
                email: "system@safirehome.com",
                role: "System",
                internal_role: "admin",
                status: "active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (!createError && newSystemUser) {
              systemUserId = newSystemUser.id;
            }
          } catch (createSystemUserError) {
            console.warn("Could not create system user, using fallback ID");
          }
        } else {
          systemUserId = systemUser.id;
        }

        await supabaseHelpers.addTicketComment({
          ticketId: selectedTicket.id,
          userId: systemUserId,
          comment: newComment,
          isInternal: false,
        });
      } else {
        await supabaseHelpers.addTicketComment({
          ticketId: selectedTicket.id,
          userId: user.id,
          comment: newComment,
          isInternal: false,
        });
      }

      // If the assigned user is replying, automatically set status to in_progress
      if (isAssignedUser && selectedTicket.status === "open") {
        await supabaseHelpers.updateTicket(selectedTicket.id, {
          status: "in_progress",
        });

        // Update local state
        setSelectedTicket({
          ...selectedTicket,
          status: "in_progress",
        });
      }

      setNewComment("");
      setReplyAsSafire(false);
      loadTicketComments(selectedTicket.id);

      // Refresh tickets and stats
      loadTickets();
      loadAssignedTickets();
      loadTicketStats();
      loadAssignedTicketStats();
      if (isAdmin) {
        loadAllTickets();
        loadAllTicketStats();
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleTicketAction = async (
    action: "satisfied" | "not_satisfied" | "clarification" | "in_progress",
  ) => {
    if (!selectedTicket || !user) return;

    try {
      let newStatus = selectedTicket.status;
      let comment = "";
      let priority = selectedTicket.priority;
      const isAssignedUser = selectedTicket.assigned_user?.id === user.id;

      switch (action) {
        case "satisfied":
          newStatus = "resolved";
          comment = "User marked as satisfied - ticket resolved";
          break;
        case "not_satisfied":
          newStatus = "in_progress";
          comment =
            "User is not satisfied - ticket escalated for further review";
          // Escalate priority if not already urgent
          if (priority === "low") priority = "medium";
          else if (priority === "medium") priority = "high";
          else if (priority === "high") priority = "urgent";
          break;
        case "clarification":
          newStatus = "in_progress";
          comment =
            "User requested clarification - awaiting additional information";
          break;
        case "in_progress":
          newStatus = "in_progress";
          comment = isAssignedUser
            ? "Assigned user marked ticket as in progress"
            : "Ticket status updated to in progress";
          break;
      }

      // Update ticket status and priority
      await supabaseHelpers.updateTicket(selectedTicket.id, {
        status: newStatus,
        priority: priority,
        resolved_by: action === "satisfied" ? user.id : undefined,
      });

      // Add system comment
      await supabaseHelpers.addTicketComment({
        ticketId: selectedTicket.id,
        userId: user.id,
        comment: comment,
        isInternal: false,
      });

      // Update local state
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus,
        priority: priority,
      });

      // Reload comments and tickets
      loadTicketComments(selectedTicket.id);
      loadTickets();
      loadAssignedTickets();
      loadTicketStats();
      loadAssignedTicketStats();
      if (isAdmin) {
        loadAllTickets();
        loadAllTicketStats();
      }

      const actionMessages = {
        satisfied: "Ticket marked as resolved",
        not_satisfied: "Ticket escalated for further review",
        clarification: "Clarification requested",
        in_progress: "Ticket marked as in progress",
      };

      toast({
        title: "Success",
        description: actionMessages[action],
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    }
  };

  const viewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadTicketComments(ticket.id);
    setActiveView("view");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle size={14} />;
      case "high":
        return <AlertCircle size={14} />;
      case "medium":
        return <Info size={14} />;
      case "low":
        return <CheckCircle size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const sortTickets = (ticketsToSort: Ticket[]) => {
    const sorted = [...ticketsToSort];
    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return sorted.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
        );
      case "status":
        const statusOrder = { open: 4, in_progress: 3, resolved: 2, closed: 1 };
        return sorted.sort(
          (a, b) => statusOrder[b.status] - statusOrder[a.status],
        );
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const filteredTickets = sortTickets(
    tickets.filter((ticket) => {
      if (filters.status && filters.status !== "all") {
        if (filters.status === "active") {
          // "active" means not resolved or closed
          if (ticket.status === "resolved" || ticket.status === "closed")
            return false;
        } else if (ticket.status !== filters.status) {
          return false;
        }
      }
      if (
        filters.category &&
        filters.category !== "all" &&
        ticket.category !== filters.category
      )
        return false;
      if (
        filters.priority &&
        filters.priority !== "all" &&
        ticket.priority !== filters.priority
      )
        return false;
      if (
        filters.search &&
        !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    }),
  );

  const filteredAssignedTickets = sortTickets(
    assignedTickets.filter((ticket) => {
      if (filters.status && filters.status !== "all") {
        if (filters.status === "active") {
          // "active" means not resolved or closed
          if (ticket.status === "resolved" || ticket.status === "closed")
            return false;
        } else if (ticket.status !== filters.status) {
          return false;
        }
      }
      if (
        filters.category &&
        filters.category !== "all" &&
        ticket.category !== filters.category
      )
        return false;
      if (
        filters.priority &&
        filters.priority !== "all" &&
        ticket.priority !== filters.priority
      )
        return false;
      if (
        filters.search &&
        !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    }),
  );

  const filteredAllTickets = sortTickets(
    allTickets.filter((ticket) => {
      if (filters.status && filters.status !== "all") {
        if (filters.status === "active") {
          // "active" means not resolved or closed
          if (ticket.status === "resolved" || ticket.status === "closed")
            return false;
        } else if (ticket.status !== filters.status) {
          return false;
        }
      }
      if (
        filters.category &&
        filters.category !== "all" &&
        ticket.category !== filters.category
      )
        return false;
      if (
        filters.priority &&
        filters.priority !== "all" &&
        ticket.priority !== filters.priority
      )
        return false;
      if (
        filters.search &&
        !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    }),
  );

  const handleForceClose = async () => {
    if (!selectedTicket || !user || !isAdmin) return;

    try {
      // Force close the ticket
      await supabaseHelpers.updateTicket(selectedTicket.id, {
        status: "closed",
        resolved_by: user.id,
      });

      // Add system comment
      await supabaseHelpers.addTicketComment({
        ticketId: selectedTicket.id,
        userId: user.id,
        comment: "Ticket force closed by administrator",
        isInternal: false,
      });

      // Update local state
      setSelectedTicket({
        ...selectedTicket,
        status: "closed",
      });

      // Reload comments and tickets
      loadTicketComments(selectedTicket.id);
      loadTickets();
      loadAssignedTickets();
      loadTicketStats();
      loadAssignedTicketStats();
      if (isAdmin) {
        loadAllTickets();
        loadAllTicketStats();
      }

      toast({
        title: "Success",
        description: "Ticket force closed successfully",
      });
    } catch (error) {
      console.error("Error force closing ticket:", error);
      toast({
        title: "Error",
        description: "Failed to force close ticket",
        variant: "destructive",
      });
    }
  };

  const handleAssignTicket = async (
    ticketId: string,
    assignedUserId: string,
  ) => {
    if (!user || !isAdmin) return;

    setAssigningTicket(ticketId);
    try {
      const assignedUser = assignedUserId
        ? allUsers.find((u) => u.id === assignedUserId)
        : null;

      // Update ticket assignment
      await supabaseHelpers.updateTicket(ticketId, {
        assigned_to: assignedUserId || null,
        status: assignedUserId ? "in_progress" : "open",
      });

      // Add system comment
      await supabaseHelpers.addTicketComment({
        ticketId: ticketId,
        userId: user.id,
        comment: assignedUserId
          ? `Ticket assigned to ${assignedUser?.name || "user"} by administrator`
          : `Ticket unassigned by administrator`,
        isInternal: false,
      });

      // Reload tickets and stats
      loadTickets();
      loadAssignedTickets();
      loadTicketStats();
      loadAssignedTicketStats();
      if (isAdmin) {
        loadAllTickets();
        loadAllTicketStats();
      }

      // Update selected ticket if it's the one being assigned
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: assignedUserId ? "in_progress" : "open",
          assigned_user: assignedUser || undefined,
        });
        loadTicketComments(ticketId);
      }

      toast({
        title: "Success",
        description: assignedUserId
          ? `Ticket assigned to ${assignedUser?.name || "user"} successfully`
          : "Ticket unassigned successfully",
      });
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } finally {
      setAssigningTicket(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#032F60] rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Performance & Issues Ticketing
              </h2>
              <p className="text-sm text-gray-600">
                Submit and track support requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView("list")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeView === "list"
                    ? "bg-white text-[#032F60] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setActiveView("assigned")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeView === "assigned"
                    ? "bg-white text-[#032F60] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Assigned to Me
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveView("admin")}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    activeView === "admin"
                      ? "bg-white text-[#032F60] shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Admin View
                </button>
              )}
              <button
                onClick={() => setActiveView("create")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeView === "create"
                    ? "bg-white text-[#032F60] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                New Ticket
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === "create" && (
            <div className="h-full overflow-auto p-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus size={20} />
                      Create New Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Brief description of the issue"
                          required
                        />
                      </div>

                      {/* Category and Priority */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={
                                    category.id || `category-${category.name}`
                                  }
                                >
                                  <div>
                                    <div className="font-medium">
                                      {category.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {category.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <Select
                            value={formData.priority}
                            onValueChange={(
                              value: "low" | "medium" | "high" | "urgent",
                            ) =>
                              setFormData((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Loan Number and Client Name */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loan Number (Optional)
                          </label>
                          <Input
                            value={formData.loanNumber}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                loanNumber: e.target.value,
                              }))
                            }
                            placeholder="e.g., LN-2024-001"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Name (Optional)
                          </label>
                          <Input
                            value={formData.clientName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                clientName: e.target.value,
                              }))
                            }
                            placeholder="Client name if applicable"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Detailed description of the issue, steps to reproduce, expected vs actual behavior, etc."
                          rows={6}
                          required
                        />
                      </div>

                      {/* File Attachments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload
                              size={24}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-sm text-gray-600 mb-2">
                              Drag and drop files here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                              Supported: Images, PDFs, Documents (Max 10MB each)
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Choose Files
                            </Button>
                          </div>
                        </div>

                        {/* Attachment List */}
                        {attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  {file.type.startsWith("image/") ? (
                                    <Image
                                      size={16}
                                      className="text-blue-500"
                                    />
                                  ) : (
                                    <FileText
                                      size={16}
                                      className="text-gray-500"
                                    />
                                  )}
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveView("list")}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-yellow-400 hover:bg-yellow-500 text-[#032F60] font-bold"
                        >
                          {submitting ? "Creating..." : "Create Ticket"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "list" && (
            <div className="h-full flex flex-col">
              {/* Stats Cards */}
              {ticketStats && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    My Submitted Tickets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#032F60]">
                          {ticketStats.total}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {ticketStats.open}
                        </div>
                        <div className="text-xs text-gray-500">Open</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {ticketStats.in_progress}
                        </div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {ticketStats.resolved}
                        </div>
                        <div className="text-xs text-gray-500">Resolved</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {ticketStats.high_priority}
                        </div>
                        <div className="text-xs text-gray-500">
                          High Priority
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        placeholder="Search tickets by title, description, or ticket number..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id || `category-${category.name}`}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tickets List */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60]"></div>
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {tickets.length === 0
                          ? "No tickets yet"
                          : "No tickets match your filters"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {tickets.length === 0
                          ? "Create your first support ticket to get started"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                      {tickets.length === 0 && (
                        <Button
                          onClick={() => setActiveView("create")}
                          className="bg-[#032F60] hover:bg-[#1a4a73]"
                        >
                          <Plus size={16} className="mr-2" />
                          Create First Ticket
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => viewTicket(ticket)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                      {ticket.ticket_number}
                                    </span>
                                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                                      {ticket.title}
                                    </h3>
                                  </div>
                                  <Badge
                                    className={`text-xs ${getPriorityColor(ticket.priority)}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {getPriorityIcon(ticket.priority)}
                                      {ticket.priority.toUpperCase()}
                                    </div>
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${getStatusColor(ticket.status)}`}
                                  >
                                    {ticket.status
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {ticket.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {categories.find(
                                      (c) => c.id === ticket.category,
                                    )?.name || ticket.category}
                                  </div>
                                  {ticket.user && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      Created by: {ticket.user.name}
                                    </div>
                                  )}
                                  {ticket.loan_number && (
                                    <div className="flex items-center gap-1">
                                      <FileText size={12} />
                                      {ticket.loan_number}
                                    </div>
                                  )}
                                  {ticket.client_name && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      {ticket.client_name}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(
                                      ticket.created_at,
                                    ).toLocaleDateString()}
                                  </div>
                                  {ticket.attachments &&
                                    ticket.attachments.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Paperclip size={12} />
                                        {ticket.attachments.length} file
                                        {ticket.attachments.length !== 1
                                          ? "s"
                                          : ""}
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Assignment Dropdown */}
                                <div
                                  className="flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Select
                                    value={
                                      ticket.assigned_user?.id || "unassigned"
                                    }
                                    onValueChange={(value) =>
                                      handleAssignTicket(
                                        ticket.id,
                                        value === "unassigned" ? "" : value,
                                      )
                                    }
                                    disabled={assigningTicket === ticket.id}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue placeholder="Assign to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        <span className="text-gray-500">
                                          Unassigned
                                        </span>
                                      </SelectItem>
                                      {allUsers.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {assigningTicket === ticket.id && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#032F60]"></div>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeView === "assigned" && (
            <div className="h-full flex flex-col">
              {/* Stats Cards */}
              {assignedTicketStats && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Tickets Assigned to Me
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#032F60]">
                          {assignedTicketStats.total}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {assignedTicketStats.open}
                        </div>
                        <div className="text-xs text-gray-500">Open</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {assignedTicketStats.in_progress}
                        </div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {assignedTicketStats.resolved}
                        </div>
                        <div className="text-xs text-gray-500">Resolved</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {assignedTicketStats.high_priority}
                        </div>
                        <div className="text-xs text-gray-500">
                          High Priority
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        placeholder="Search assigned tickets..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id || `category-${category.name}`}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assigned Tickets List */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60]"></div>
                    </div>
                  ) : filteredAssignedTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {assignedTickets.length === 0
                          ? "No tickets assigned to you"
                          : "No assigned tickets match your filters"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {assignedTickets.length === 0
                          ? "You don't have any tickets assigned to you at the moment"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAssignedTickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => viewTicket(ticket)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                      {ticket.ticket_number}
                                    </span>
                                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                                      {ticket.title}
                                    </h3>
                                  </div>
                                  <Badge
                                    className={`text-xs ${getPriorityColor(ticket.priority)}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {getPriorityIcon(ticket.priority)}
                                      {ticket.priority.toUpperCase()}
                                    </div>
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${getStatusColor(ticket.status)}`}
                                  >
                                    {ticket.status
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {ticket.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {categories.find(
                                      (c) => c.id === ticket.category,
                                    )?.name || ticket.category}
                                  </div>
                                  {ticket.user && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      Created by: {ticket.user.name}
                                    </div>
                                  )}
                                  {ticket.loan_number && (
                                    <div className="flex items-center gap-1">
                                      <FileText size={12} />
                                      {ticket.loan_number}
                                    </div>
                                  )}
                                  {ticket.client_name && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      {ticket.client_name}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(
                                      ticket.created_at,
                                    ).toLocaleDateString()}
                                  </div>
                                  {ticket.attachments &&
                                    ticket.attachments.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Paperclip size={12} />
                                        {ticket.attachments.length} file
                                        {ticket.attachments.length !== 1
                                          ? "s"
                                          : ""}
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Assignment Dropdown */}
                                <div
                                  className="flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Select
                                    value={
                                      ticket.assigned_user?.id || "unassigned"
                                    }
                                    onValueChange={(value) =>
                                      handleAssignTicket(
                                        ticket.id,
                                        value === "unassigned" ? "" : value,
                                      )
                                    }
                                    disabled={assigningTicket === ticket.id}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue placeholder="Assign to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        <span className="text-gray-500">
                                          Unassigned
                                        </span>
                                      </SelectItem>
                                      {allUsers.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {assigningTicket === ticket.id && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#032F60]"></div>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeView === "admin" && isAdmin && (
            <div className="h-full flex flex-col">
              {/* Stats Cards */}
              {allTicketStats && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    All Tickets (Admin View)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#032F60]">
                          {allTicketStats.total}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {allTicketStats.open}
                        </div>
                        <div className="text-xs text-gray-500">Open</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {allTicketStats.in_progress}
                        </div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {allTicketStats.resolved}
                        </div>
                        <div className="text-xs text-gray-500">Resolved</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {allTicketStats.high_priority}
                        </div>
                        <div className="text-xs text-gray-500">
                          High Priority
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        placeholder="Search all tickets..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id || `category-${category.name}`}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* All Tickets List */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032F60]"></div>
                    </div>
                  ) : filteredAllTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {allTickets.length === 0
                          ? "No tickets in the system"
                          : "No tickets match your filters"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {allTickets.length === 0
                          ? "No tickets have been created yet"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAllTickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => viewTicket(ticket)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                      {ticket.ticket_number}
                                    </span>
                                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                                      {ticket.title}
                                    </h3>
                                  </div>
                                  <Badge
                                    className={`text-xs ${getPriorityColor(ticket.priority)}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {getPriorityIcon(ticket.priority)}
                                      {ticket.priority.toUpperCase()}
                                    </div>
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${getStatusColor(ticket.status)}`}
                                  >
                                    {ticket.status
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {ticket.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {categories.find(
                                      (c) => c.id === ticket.category,
                                    )?.name || ticket.category}
                                  </div>
                                  {ticket.user && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      Created by: {ticket.user.name}
                                    </div>
                                  )}
                                  {ticket.assigned_user && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      Assigned to: {ticket.assigned_user.name}
                                    </div>
                                  )}
                                  {ticket.loan_number && (
                                    <div className="flex items-center gap-1">
                                      <FileText size={12} />
                                      {ticket.loan_number}
                                    </div>
                                  )}
                                  {ticket.client_name && (
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      {ticket.client_name}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(
                                      ticket.created_at,
                                    ).toLocaleDateString()}
                                  </div>
                                  {ticket.attachments &&
                                    ticket.attachments.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Paperclip size={12} />
                                        {ticket.attachments.length} file
                                        {ticket.attachments.length !== 1
                                          ? "s"
                                          : ""}
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Assignment Dropdown */}
                                <div
                                  className="flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Select
                                    value={
                                      ticket.assigned_user?.id || "unassigned"
                                    }
                                    onValueChange={(value) =>
                                      handleAssignTicket(
                                        ticket.id,
                                        value === "unassigned" ? "" : value,
                                      )
                                    }
                                    disabled={assigningTicket === ticket.id}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue placeholder="Assign to..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">
                                        <span className="text-gray-500">
                                          Unassigned
                                        </span>
                                      </SelectItem>
                                      {allUsers.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {assigningTicket === ticket.id && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#032F60]"></div>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeView === "view" && selectedTicket && (
            <div className="h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveView("list")}
                        className="p-1"
                      >
                        ← Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded">
                          {selectedTicket.ticket_number}
                        </span>
                        <h2 className="text-xl font-bold text-gray-800">
                          {selectedTicket.title}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        className={`${getPriorityColor(selectedTicket.priority)}`}
                      >
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(selectedTicket.priority)}
                          {selectedTicket.priority.toUpperCase()}
                        </div>
                      </Badge>
                      <Badge
                        className={`${getStatusColor(selectedTicket.status)}`}
                      >
                        {selectedTicket.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {categories.find(
                          (c) => c.id === selectedTicket.category,
                        )?.name || selectedTicket.category}
                      </span>
                      {selectedTicket.assigned_user && (
                        <span className="text-sm text-blue-600">
                          Assigned to: {selectedTicket.assigned_user.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Created{" "}
                        {new Date(
                          selectedTicket.created_at,
                        ).toLocaleDateString()}
                      </div>
                      {selectedTicket.loan_number && (
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          Loan: {selectedTicket.loan_number}
                        </div>
                      )}
                      {selectedTicket.client_name && (
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          Client: {selectedTicket.client_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments &&
                  selectedTicket.attachments.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Attachments
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-100 rounded"
                          >
                            {attachment.type?.startsWith("image/") ? (
                              <Image size={16} className="text-blue-500" />
                            ) : (
                              <FileText size={16} className="text-gray-500" />
                            )}
                            <span className="text-sm">{attachment.name}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye size={14} />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Comments Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Comments & Updates
                  </h3>
                </div>

                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <div className="space-y-4">
                        {ticketComments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No comments yet. Be the first to add an update!
                          </div>
                        ) : (
                          ticketComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback>
                                  {comment.user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {comment.user.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      comment.created_at,
                                    ).toLocaleString()}
                                  </span>
                                  {comment.is_internal && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Internal
                                    </Badge>
                                  )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {comment.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Ticket Actions */}
                {selectedTicket.status !== "resolved" &&
                  selectedTicket.status !== "closed" && (
                    <div className="p-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                        How would you like to proceed with this ticket?
                      </h4>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {/* Show different actions based on user role */}
                        {selectedTicket.assigned_user?.id === user?.id ? (
                          // Actions for assigned user
                          <>
                            {selectedTicket.status === "open" && (
                              <Button
                                onClick={() =>
                                  handleTicketAction("in_progress")
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                <Clock size={16} className="mr-2" />
                                Mark In Progress
                              </Button>
                            )}
                            <Button
                              onClick={() => handleTicketAction("satisfied")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Mark as Resolved
                            </Button>
                          </>
                        ) : (
                          // Actions for ticket creator
                          <>
                            <Button
                              onClick={() => handleTicketAction("satisfied")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <CheckCircle size={16} className="mr-2" />
                              I'm Satisfied
                            </Button>
                            <Button
                              onClick={() =>
                                handleTicketAction("not_satisfied")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white"
                              size="sm"
                            >
                              <AlertCircle size={16} className="mr-2" />
                              I'm Not Satisfied Yet
                            </Button>
                            <Button
                              onClick={() =>
                                handleTicketAction("clarification")
                              }
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              size="sm"
                            >
                              <Info size={16} className="mr-2" />I Need
                              Clarification
                            </Button>
                          </>
                        )}
                        {isAdmin && (
                          <Button
                            onClick={handleForceClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                            size="sm"
                          >
                            <X size={16} className="mr-2" />
                            Force Close
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                {/* Add Comment */}
                <div className="p-6 border-t border-gray-200">
                  {/* Show message if ticket is not assigned */}
                  {!selectedTicket.assigned_user && !isAdmin ? (
                    <div className="text-center py-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-800">
                          <AlertCircle size={20} />
                          <span className="font-medium">
                            Comments are locked until this ticket is assigned
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-2">
                          An administrator will assign this ticket to the
                          appropriate team member soon.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment or update..."
                          rows={3}
                          className="mb-3"
                        />
                        <div className="flex items-center justify-between">
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="replyAsSafire"
                                checked={replyAsSafire}
                                onChange={(e) =>
                                  setReplyAsSafire(e.target.checked)
                                }
                                className="rounded"
                              />
                              <label
                                htmlFor="replyAsSafire"
                                className="text-sm text-gray-600"
                              >
                                Reply as Safire Home Lending
                              </label>
                            </div>
                          )}
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            size="sm"
                            className="bg-[#032F60] hover:bg-[#1a4a73]"
                          >
                            <Send size={14} className="mr-2" />
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
