import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BadgeForm {
  name: string;
  description: string;
  image_url: string;
  tier: string;
  rarity: string;
  color: string;
  requirements: any;
  is_active: boolean;
  collection_id: string;
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
}

interface BadgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBadge: Badge | null;
  badgeForm: BadgeForm;
  setBadgeForm: (form: BadgeForm) => void;
  collections: BadgeCollection[];
  onSubmit: () => void;
}

const BadgeDialog: React.FC<BadgeDialogProps> = ({
  isOpen,
  onClose,
  selectedBadge,
  badgeForm,
  setBadgeForm,
  collections,
  onSubmit,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `badge-${Date.now()}.${fileExt}`;
      const filePath = `badges/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('badge-images')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('badge-images')
        .getPublicUrl(filePath);

      setBadgeForm({
        ...badgeForm,
        image_url: publicUrl
      });

      setPreviewImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setBadgeForm({
      ...badgeForm,
      image_url: ""
    });
    setPreviewImage(null);
  };

  const rarityOptions = [
    { value: "common", label: "Common", color: "#9ca3af" },
    { value: "rare", label: "Rare", color: "#3b82f6" },
    { value: "epic", label: "Epic", color: "#8b5cf6" },
    { value: "legendary", label: "Legendary", color: "#f59e0b" }
  ];

  const colorOptions = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedBadge ? "Edit Badge" : "Create Badge"}</DialogTitle>
          <DialogDescription>
            {selectedBadge ? "Update badge information" : "Add a new badge to the system"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="badge_name">Name</Label>
              <Input
                id="badge_name"
                value={badgeForm.name}
                onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                placeholder="Enter badge name"
              />
            </div>
            
            <div>
              <Label htmlFor="badge_description">Description</Label>
              <Textarea
                id="badge_description"
                value={badgeForm.description}
                onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                placeholder="Enter badge description"
                rows={3}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Badge Image</Label>
            
            {/* Current Image Preview */}
            {(badgeForm.image_url || previewImage) && (
              <div className="relative inline-block">
                <img
                  src={previewImage || badgeForm.image_url}
                  alt="Badge preview"
                  className="w-24 h-24 object-contain border-2 border-gray-200 rounded-lg bg-white p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Upload Options */}
            <div className="flex gap-4">
              {/* File Upload */}
              <div className="flex-1">
                <Label htmlFor="image_upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploading ? "Uploading..." : "Click to upload PNG image"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                  </div>
                </Label>
                <Input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              {/* URL Input */}
              <div className="flex-1">
                <Label htmlFor="badge_image_url">Or enter image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="badge_image_url"
                    value={badgeForm.image_url}
                    onChange={(e) => setBadgeForm({...badgeForm, image_url: e.target.value})}
                    placeholder="https://example.com/badge.png"
                  />
                  {badgeForm.image_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewImage(badgeForm.image_url)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Badge Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="badge_tier">Tier</Label>
              <Select value={badgeForm.tier} onValueChange={(value) => setBadgeForm({...badgeForm, tier: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualifying">Qualifying</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="badge_rarity">Rarity</Label>
              <Select value={badgeForm.rarity} onValueChange={(value) => setBadgeForm({...badgeForm, rarity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  {rarityOptions.map((rarity) => (
                    <SelectItem key={rarity.value} value={rarity.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: rarity.color }}
                        />
                        {rarity.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Badge Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    badgeForm.color === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBadgeForm({...badgeForm, color})}
                  title={color}
                />
              ))}
            </div>
            {badgeForm.color && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Selected:</span>
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ backgroundColor: badgeForm.color }}
                />
                <span className="text-sm font-mono">{badgeForm.color}</span>
              </div>
            )}
          </div>

          {/* Collection Selection */}
          <div>
            <Label htmlFor="badge_collection">Collection</Label>
            <Select value={badgeForm.collection_id || "none"} onValueChange={(value) => setBadgeForm({...badgeForm, collection_id: value === "none" ? "" : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="badge_active"
              checked={badgeForm.is_active}
              onCheckedChange={(checked) => setBadgeForm({...badgeForm, is_active: checked as boolean})}
            />
            <Label htmlFor="badge_active">Active</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={uploading}>
            {selectedBadge ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeDialog;