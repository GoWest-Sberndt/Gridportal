import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Search,
  RotateCcw,
  Archive,
  Trash2,
  Reply,
  Forward,
  Star,
  Calendar,
  Users,
  Settings,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "your-client-id-here",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: [
    "User.Read",
    "Mail.Read",
    "Mail.ReadWrite",
    "Mail.Send",
    "Calendars.Read",
    "Contacts.Read",
  ],
};

// Custom authentication provider for Microsoft Graph
class MSALAuthenticationProvider implements AuthenticationProvider {
  private msalInstance: PublicClientApplication;

  constructor(msalInstance: PublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  async getAccessToken(): Promise<string> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    try {
      const response = await this.msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await this.msalInstance.acquireTokenPopup(request);
        return response.accessToken;
      }
      throw error;
    }
  }
}

interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  body?: string;
  receivedDateTime?: string;
  importance?: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

interface CalendarEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  location?: string;
  organizer?: string;
}

interface Contact {
  id: string;
  displayName: string;
  emailAddresses: Array<{ address: string; name?: string }>;
  jobTitle?: string;
  companyName?: string;
}

const Microsoft365Workspace: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [msalInstance, setMsalInstance] =
    useState<PublicClientApplication | null>(null);
  const [graphClient, setGraphClient] = useState<Client | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});

  // Initialize MSAL instance
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const pca = new PublicClientApplication(msalConfig);
        await pca.initialize();
        setMsalInstance(pca);

        // Check if user is already signed in
        const accounts = pca.getAllAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          const authProvider = new MSALAuthenticationProvider(pca);
          const client = Client.initWithMiddleware({ authProvider });
          setGraphClient(client);
          await loadUserData(client);
        }
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
        setConnectionError("Failed to initialize Microsoft authentication");
      }
    };

    initializeMsal();
  }, []);

  // Folders with dynamic counts
  const folders: Folder[] = [
    {
      id: "inbox",
      name: "Inbox",
      count: folderCounts.inbox || 0,
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "sentitems",
      name: "Sent Items",
      count: folderCounts.sentitems || 0,
      icon: <Reply className="w-4 h-4" />,
    },
    {
      id: "drafts",
      name: "Drafts",
      count: folderCounts.drafts || 0,
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "archive",
      name: "Archive",
      count: folderCounts.archive || 0,
      icon: <Archive className="w-4 h-4" />,
    },
    {
      id: "deleteditems",
      name: "Deleted Items",
      count: folderCounts.deleteditems || 0,
      icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  // Load user data from Microsoft Graph
  const loadUserData = useCallback(
    async (client: Client) => {
      try {
        setIsLoading(true);

        // Load user profile
        const profile = await client.api("/me").get();
        setUserProfile(profile);

        // Load emails from inbox
        await loadEmails(client, selectedFolder);

        // Load folder counts
        await loadFolderCounts(client);

        // Load calendar events (next 10 events)
        const events = await client
          .api("/me/events")
          .top(10)
          .orderby("start/dateTime")
          .get();

        const formattedEvents: CalendarEvent[] = events.value.map(
          (event: any) => ({
            id: event.id,
            subject: event.subject,
            start: event.start.dateTime,
            end: event.end.dateTime,
            location: event.location?.displayName,
            organizer: event.organizer?.emailAddress?.name,
          }),
        );
        setCalendarEvents(formattedEvents);

        // Load contacts (first 50)
        const contactsResponse = await client.api("/me/contacts").top(50).get();

        const formattedContacts: Contact[] = contactsResponse.value.map(
          (contact: any) => ({
            id: contact.id,
            displayName: contact.displayName,
            emailAddresses: contact.emailAddresses || [],
            jobTitle: contact.jobTitle,
            companyName: contact.companyName,
          }),
        );
        setContacts(formattedContacts);
      } catch (error) {
        console.error("Error loading user data:", error);
        setConnectionError("Failed to load user data from Microsoft 365");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFolder],
  );

  // Load emails from specific folder
  const loadEmails = useCallback(async (client: Client, folderId: string) => {
    try {
      let endpoint = "/me/messages";
      if (folderId !== "inbox") {
        endpoint = `/me/mailFolders/${folderId}/messages`;
      }

      const response = await client
        .api(endpoint)
        .top(50)
        .select(
          "id,subject,from,receivedDateTime,isRead,hasAttachments,bodyPreview,importance",
        )
        .orderby("receivedDateTime desc")
        .get();

      const formattedEmails: Email[] = response.value.map((email: any) => {
        const receivedDate = new Date(email.receivedDateTime);
        const now = new Date();
        const diffHours = Math.floor(
          (now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60),
        );

        let timestamp = "";
        if (diffHours < 1) {
          timestamp = "Just now";
        } else if (diffHours < 24) {
          timestamp = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays < 7) {
            timestamp = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
          } else {
            timestamp = receivedDate.toLocaleDateString();
          }
        }

        return {
          id: email.id,
          subject: email.subject || "(No Subject)",
          sender: email.from?.emailAddress?.name || "Unknown Sender",
          senderEmail: email.from?.emailAddress?.address || "",
          preview: email.bodyPreview || "",
          timestamp,
          isRead: email.isRead,
          isStarred: email.importance === "high",
          hasAttachments: email.hasAttachments,
          receivedDateTime: email.receivedDateTime,
          importance: email.importance,
        };
      });

      setEmails(formattedEmails);
    } catch (error) {
      console.error("Error loading emails:", error);
      setConnectionError("Failed to load emails");
    }
  }, []);

  // Load folder message counts
  const loadFolderCounts = useCallback(async (client: Client) => {
    try {
      const folders = await client
        .api("/me/mailFolders")
        .select("id,displayName,totalItemCount")
        .get();

      const counts: Record<string, number> = {};
      folders.value.forEach((folder: any) => {
        const folderId = folder.displayName.toLowerCase().replace(/\s+/g, "");
        counts[folderId] = folder.totalItemCount;
      });

      setFolderCounts(counts);
    } catch (error) {
      console.error("Error loading folder counts:", error);
    }
  }, []);

  // Load emails when folder changes
  useEffect(() => {
    if (isConnected && graphClient) {
      loadEmails(graphClient, selectedFolder);
    }
  }, [selectedFolder, isConnected, graphClient, loadEmails]);

  const handleConnect = async () => {
    if (!msalInstance) {
      setConnectionError("Microsoft authentication not initialized");
      return;
    }

    setIsLoading(true);
    setConnectionError(null);

    try {
      // Sign in with Microsoft
      const response = await msalInstance.loginPopup(loginRequest);

      if (response.account) {
        // Create Graph client
        const authProvider = new MSALAuthenticationProvider(msalInstance);
        const client = Client.initWithMiddleware({ authProvider });
        setGraphClient(client);

        // Load user data
        await loadUserData(client);
        setIsConnected(true);
      }
    } catch (error: any) {
      console.error("Microsoft 365 connection failed:", error);
      if (error.errorCode === "user_cancelled") {
        setConnectionError("Sign-in was cancelled");
      } else {
        setConnectionError(
          "Failed to connect to Microsoft 365. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (msalInstance) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
        });
      }
    }

    setIsConnected(false);
    setEmails([]);
    setSelectedEmail(null);
    setConnectionError(null);
    setGraphClient(null);
    setUserProfile(null);
    setCalendarEvents([]);
    setContacts([]);
    setFolderCounts({});
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);

    // Mark as read if not already read
    if (!email.isRead && graphClient) {
      try {
        await graphClient
          .api(`/me/messages/${email.id}`)
          .patch({ isRead: true });

        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e)),
        );
      } catch (error) {
        console.error("Failed to mark email as read:", error);
      }
    }

    // Load full email body if not already loaded
    if (!email.body && graphClient) {
      try {
        const fullEmail = await graphClient
          .api(`/me/messages/${email.id}`)
          .select("body")
          .get();

        setSelectedEmail((prev) =>
          prev
            ? {
                ...prev,
                body: fullEmail.body?.content || "No content available",
              }
            : null,
        );
      } catch (error) {
        console.error("Failed to load email body:", error);
      }
    }
  };

  const handleRefresh = async () => {
    if (isConnected && graphClient) {
      setIsLoading(true);
      try {
        await loadEmails(graphClient, selectedFolder);
        await loadFolderCounts(graphClient);
      } catch (error) {
        console.error("Failed to refresh emails:", error);
        setConnectionError("Failed to refresh emails");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Microsoft 365 Email
            </h1>
            <p className="text-gray-600">
              Connect your Microsoft 365 account to access your emails directly
              from Safire Dashboard.
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Connect to Microsoft 365</CardTitle>
              <CardDescription>
                Sign in with your Microsoft 365 account to access your emails,
                calendar, and contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{connectionError}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Current user: {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  You'll be redirected to Microsoft to sign in with your
                  Microsoft 365 account.
                </p>
                {!import.meta.env.VITE_MICROSOFT_CLIENT_ID && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-700">
                        <p className="font-medium">Configuration Required</p>
                        <p>
                          Please set VITE_MICROSOFT_CLIENT_ID in your
                          environment variables to enable Microsoft 365
                          integration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleConnect}
                disabled={
                  isLoading || !import.meta.env.VITE_MICROSOFT_CLIENT_ID
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  "Connect Microsoft 365"
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                <p>
                  By connecting, you agree to allow Safire Dashboard to access
                  your Microsoft 365 data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Microsoft 365 Email
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Connected as{" "}
                {userProfile?.mail ||
                  userProfile?.userPrincipalName ||
                  user?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RotateCcw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Folders */}
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-gray-100 ${
                    selectedFolder === folder.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {folder.icon}
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{folder.count}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Quick Actions
              </p>
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-gray-100 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Calendar</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {calendarEvents.length}
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-gray-100 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Contacts</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {contacts.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="w-96 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900 capitalize">
                {selectedFolder}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredEmails.length} emails
              </span>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    } ${!email.isRead ? "bg-blue-25" : ""}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p
                            className={`text-sm truncate ${
                              !email.isRead
                                ? "font-semibold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {email.sender}
                          </p>
                          {email.isStarred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                          {email.hasAttachments && (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        <p
                          className={`text-sm truncate mb-1 ${
                            !email.isRead
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {email.preview}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {email.timestamp}
                        </p>
                      </div>
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 bg-white">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        <strong>From:</strong> {selectedEmail.sender} &lt;
                        {selectedEmail.senderEmail}&gt;
                      </span>
                      <span>
                        <strong>To:</strong> {user?.email}
                      </span>
                      <span>{selectedEmail.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <Forward className="w-4 h-4 mr-1" />
                      Forward
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  {selectedEmail.body ? (
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedEmail.preview}
                      </p>
                      {isLoading && (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span className="text-sm">
                            Loading full email content...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEmail.hasAttachments && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <Paperclip className="w-4 h-4" />
                        <span>Attachments</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                          </div>
                          <span>Attachments available - click to download</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select an email to read</p>
                <p className="text-sm">
                  Choose an email from the list to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Microsoft365Workspace;
