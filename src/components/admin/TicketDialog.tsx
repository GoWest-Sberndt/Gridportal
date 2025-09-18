import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TicketForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assigned_to: string;
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
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Ticket | null;
  ticketForm: TicketForm;
  setTicketForm: (form: TicketForm) => void;
  onSubmit: () => void;
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  isOpen,
  onClose,
  selectedTicket,
  ticketForm,
  setTicketForm,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedTicket ? "Edit Ticket" : "Create Ticket"}</DialogTitle>
          <DialogDescription>
            {selectedTicket ? "Update ticket information" : "Create a new support ticket"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ticket_title">Title</Label>
            <Input
              id="ticket_title"
              value={ticketForm.title}
              onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="ticket_description">Description</Label>
            <Textarea
              id="ticket_description"
              value={ticketForm.description}
              onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticket_status">Status</Label>
              <Select value={ticketForm.status} onValueChange={(value) => setTicketForm({...ticketForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ticket_priority">Priority</Label>
              <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="ticket_category">Category</Label>
            <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({...ticketForm, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {selectedTicket ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;