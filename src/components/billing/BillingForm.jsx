import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BillingForm({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    tool_name: "",
    plan: "",
    cost_per_month: "",
    expiry_date: "",
    contact_person: "",
    contact_email: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tool_name: initialData.tool_name || "",
        plan: initialData.plan || "",
        cost_per_month: initialData.cost_per_month || "",
        expiry_date: initialData.expiry_date || "",
        contact_person: initialData.contact_person || "",
        contact_email: initialData.contact_email || "",
        status: initialData.status || "active",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        tool_name: "",
        plan: "",
        cost_per_month: "",
        expiry_date: "",
        contact_person: "",
        contact_email: "",
        status: "active",
        notes: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      cost_per_month: parseFloat(formData.cost_per_month),
    });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Tool" : "Add New Tool"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tool_name">Tool Name *</Label>
              <Input
                id="tool_name"
                value={formData.tool_name}
                onChange={(e) => handleChange("tool_name", e.target.value)}
                placeholder="e.g., GitHub, Slack, AWS"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Input
                id="plan"
                value={formData.plan}
                onChange={(e) => handleChange("plan", e.target.value)}
                placeholder="e.g., Pro, Enterprise"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_month">Cost per Month ($) *</Label>
              <Input
                id="cost_per_month"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_month}
                onChange={(e) => handleChange("cost_per_month", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange("expiry_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email *</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional information about this tool..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {initialData ? "Save Changes" : "Add Tool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
