import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface CollectionForm {
  name: string;
  description: string;
  image_url: string;
  color: string;
  is_active: boolean;
  sort_order: number;
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

interface CollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollection: BadgeCollection | null;
  collectionForm: CollectionForm;
  setCollectionForm: (form: CollectionForm) => void;
  onSubmit: () => void;
}

const CollectionDialog: React.FC<CollectionDialogProps> = ({
  isOpen,
  onClose,
  selectedCollection,
  collectionForm,
  setCollectionForm,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCollection ? "Edit Collection" : "Create Collection"}</DialogTitle>
          <DialogDescription>
            {selectedCollection ? "Update collection information" : "Add a new badge collection to the system"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="collection_name">Name</Label>
            <Input
              id="collection_name"
              value={collectionForm.name}
              onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="collection_description">Description</Label>
            <Textarea
              id="collection_description"
              value={collectionForm.description}
              onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="collection_image_url">Image URL</Label>
            <Input
              id="collection_image_url"
              value={collectionForm.image_url}
              onChange={(e) => setCollectionForm({...collectionForm, image_url: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="collection_color">Color (Hex)</Label>
            <div className="flex gap-2">
              <Input
                id="collection_color"
                value={collectionForm.color}
                onChange={(e) => setCollectionForm({...collectionForm, color: e.target.value})}
                placeholder="#f3f4f6"
              />
              <div 
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: collectionForm.color || '#f3f4f6' }}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="collection_sort_order">Sort Order</Label>
            <Input
              id="collection_sort_order"
              type="number"
              value={collectionForm.sort_order}
              onChange={(e) => setCollectionForm({...collectionForm, sort_order: parseInt(e.target.value) || 0})}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="collection_active"
              checked={collectionForm.is_active}
              onCheckedChange={(checked) => setCollectionForm({...collectionForm, is_active: checked as boolean})}
            />
            <Label htmlFor="collection_active">Active</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {selectedCollection ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDialog;