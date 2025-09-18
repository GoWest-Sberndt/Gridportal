import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tier: string;
  requirements: any;
  is_active: boolean;
  created_at: string;
}

interface AwardBadgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  badges: Badge[];
  onAwardBadge: (userId: string, badgeId: string, reason: string) => void;
}

const AwardBadgeDialog: React.FC<AwardBadgeDialogProps> = ({
  isOpen,
  onClose,
  users,
  badges,
  onAwardBadge,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [reason, setReason] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [badgeSearch, setBadgeSearch] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(badgeSearch.toLowerCase()) ||
    badge.description.toLowerCase().includes(badgeSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (selectedUser && selectedBadge) {
      onAwardBadge(selectedUser.id, selectedBadge.id, reason);
      setSelectedUser(null);
      setSelectedBadge(null);
      setReason("");
      setUserSearch("");
      setBadgeSearch("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedBadge(null);
    setReason("");
    setUserSearch("");
    setBadgeSearch("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Award Badge to User</DialogTitle>
          <DialogDescription>
            Select a user and badge to award
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            {/* User Selection */}
            <div className="flex flex-col min-h-0">
              <Label className="text-base font-semibold mb-3">Select User</Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2">
                {filteredUsers.map((user) => (
                  <Card 
                    key={user.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Badge Selection */}
            <div className="flex flex-col min-h-0">
              <Label className="text-base font-semibold mb-3">Select Badge</Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search badges..."
                  value={badgeSearch}
                  onChange={(e) => setBadgeSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2">
                {filteredBadges.map((badge) => (
                  <Card 
                    key={badge.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedBadge?.id === badge.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="h-8 w-8 object-contain"
                      />
                      <div>
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-sm text-gray-500">{badge.tier}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 space-y-4">
            <div>
              <Label htmlFor="award_reason">Reason for Award (Optional)</Label>
              <Textarea
                id="award_reason"
                placeholder="Enter reason for awarding this badge..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
            
            {selectedUser && selectedBadge && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Award className="h-6 w-6 text-blue-600" />
                  <img
                    src={selectedBadge.image_url}
                    alt={selectedBadge.name}
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <div className="font-medium">
                      Awarding "{selectedBadge.name}" to {selectedUser.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedBadge.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedUser || !selectedBadge}
          >
            Award Badge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AwardBadgeDialog;