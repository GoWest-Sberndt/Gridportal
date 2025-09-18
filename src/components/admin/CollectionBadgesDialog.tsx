import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

interface BadgeCollection {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface CollectionBadgesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collection: BadgeCollection | null;
  allBadges: Badge[];
  collectionBadges: Badge[];
  onAddBadge: (badgeId: string) => void;
  onRemoveBadge: (badgeId: string) => void;
}

const CollectionBadgesDialog: React.FC<CollectionBadgesDialogProps> = ({
  isOpen,
  onClose,
  collection,
  allBadges,
  collectionBadges,
  onAddBadge,
  onRemoveBadge,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const collectionBadgeIds = new Set(collectionBadges.map(b => b.id));
  const availableBadges = allBadges.filter(badge => 
    !collectionBadgeIds.has(badge.id) &&
    (badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     badge.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCollectionBadges = collectionBadges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Collection Badges</DialogTitle>
          <DialogDescription>
            Add or remove badges from "{collection?.name}" collection
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 h-[60vh]">
          {/* Current Collection Badges */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">Collection Badges ({collectionBadges.length})</h3>
            <div className="space-y-2 overflow-y-auto h-full">
              {filteredCollectionBadges.map((badge) => (
                <Card key={badge.id} className="p-3">
                  <div className="flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBadge(badge.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Available Badges */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Badges ({availableBadges.length})</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto h-full">
              {availableBadges.map((badge) => (
                <Card key={badge.id} className="p-3">
                  <div className="flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddBadge(badge.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionBadgesDialog;