import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Award, Package, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tier: string;
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

interface AdminBadgesProps {
  badges: Badge[];
  collections: BadgeCollection[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCollection: string;
  setFilterCollection: (collection: string) => void;
  onEditBadge: (badge: Badge) => void;
  onDeleteBadge: (badgeId: string) => void;
  onCreateBadge: () => void;
  onAwardBadge: () => void;
  onEditCollection: (collection: BadgeCollection) => void;
  onDeleteCollection: (collectionId: string) => void;
  onCreateCollection: () => void;
  onManageBadges: (collection: BadgeCollection) => void;
}

const AdminBadges: React.FC<AdminBadgesProps> = ({
  badges,
  collections,
  searchTerm,
  setSearchTerm,
  filterCollection,
  setFilterCollection,
  onEditBadge,
  onDeleteBadge,
  onCreateBadge,
  onAwardBadge,
  onEditCollection,
  onDeleteCollection,
  onCreateCollection,
  onManageBadges,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("badges");

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollection = filterCollection === "all" || 
      (filterCollection === "none" && !badge.collection_id) ||
      badge.collection_id === filterCollection;
    
    return matchesSearch && matchesCollection;
  });

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCollectionName = (collectionId?: string) => {
    if (!collectionId) return "No Collection";
    const collection = collections.find(c => c.id === collectionId);
    return collection?.name || "Unknown Collection";
  };

  return (
    <div className="space-y-6 bg-white">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {activeSubTab === "badges" && (
              <>
                <Button onClick={onAwardBadge} variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Award Badge
                </Button>
                <Button onClick={onCreateBadge}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
              </>
            )}
            {activeSubTab === "collections" && (
              <Button onClick={onCreateCollection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Collection
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="badges" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Select value={filterCollection} onValueChange={setFilterCollection}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="none">No Collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => (
              <Card key={badge.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <img
                      src={badge.image_url}
                      alt={badge.name}
                      className="h-16 w-16 object-contain"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditBadge(badge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBadge(badge.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{badge.tier}</Badge>
                      <Badge variant={badge.is_active ? "default" : "destructive"}>
                        {badge.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Collection: {getCollectionName(badge.collection_id)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
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
                        <Settings className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBadges;