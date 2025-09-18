import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserForm {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tier: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  upline_id: string;
  selected_badges: string[];
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tier: string;
  spark_points: number;
  created_at: string;
  last_login: string;
  is_active: boolean;
  profile_image_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  upline_id?: string;
  selected_badges?: string[];
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  userForm: UserForm;
  setUserForm: (form: UserForm) => void;
  onSubmit: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onClose,
  selectedUser,
  userForm,
  setUserForm,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{selectedUser ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {selectedUser ? "Update user information" : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loan_officer">Loan Officer</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={userForm.first_name}
              onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={userForm.last_name}
              onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select value={userForm.tier} onValueChange={(value) => setUserForm({...userForm, tier: value})}>
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={userForm.phone}
              onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {selectedUser ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;