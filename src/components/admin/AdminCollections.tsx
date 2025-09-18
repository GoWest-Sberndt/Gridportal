import React from "react";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

interface AdminCollectionsProps {
  collections: BadgeCollection[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEditCollection: (collection: BadgeCollection) => void;
  onDeleteCollection: (collectionId: string) => void;
  onCreateCollection: () => void;
  onManageBadges: (collection: BadgeCollection) => void;
}

const AdminCollections: React.FC<AdminCollectionsProps> = ({
  collections,
  searchTerm,
  setSearchTerm,
  onEditCollection,
  onDeleteCollection,
  onCreateCollection,
  onManageBadges,
}) => {
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <Button onClick={onCreateCollection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="h-16 w-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: collection.color || '#f3f4f6' }}
                >
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onManageBadges(collection)}
                    title="Manage Badges"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditCollection(collection)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCollection(collection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{collection.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {collection.badge_count || 0} badges
                </Badge>
                <Badge variant={collection.is_active ? "default" : "destructive"}>
                  {collection.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCollections;