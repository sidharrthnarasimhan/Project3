import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingCard from "@/components/billing/BillingCard";
import BillingForm from "@/components/billing/BillingForm";
import EmptyState from "@/components/common/EmptyState";
import { differenceInDays } from "date-fns";

export default function Billing() {
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["billingTools"],
    queryFn: () => base44.entities.BillingTool.list("-created_at"),
  });

  const handleAdd = () => {
    setEditingTool(null);
    setShowForm(true);
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleDelete = async (tool) => {
    if (window.confirm(`Are you sure you want to delete ${tool.tool_name}?`)) {
      await base44.entities.BillingTool.delete(tool.id);
      queryClient.invalidateQueries({ queryKey: ["billingTools"] });
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTool) {
        await base44.entities.BillingTool.update(editingTool.id, data);
      } else {
        await base44.entities.BillingTool.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ["billingTools"] });
      setShowForm(false);
      setEditingTool(null);
    } catch (error) {
      console.error('Error saving billing tool:', error);
      alert('Failed to save billing tool: ' + error.message);
    }
  };

  // Calculate statistics
  const totalMonthlyCost = tools.reduce((sum, tool) => sum + (tool.cost_per_month || 0), 0);
  const activeTools = tools.filter(t => {
    const daysUntilExpiry = differenceInDays(new Date(t.expiry_date), new Date());
    return t.status === 'active' && daysUntilExpiry >= 0;
  });
  const expiringSoon = tools.filter(t => {
    const daysUntilExpiry = differenceInDays(new Date(t.expiry_date), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });
  const expired = tools.filter(t => {
    const daysUntilExpiry = differenceInDays(new Date(t.expiry_date), new Date());
    return daysUntilExpiry < 0;
  });

  // Filter tools based on active tab
  const getFilteredTools = () => {
    switch (activeTab) {
      case "active":
        return activeTools;
      case "expiring":
        return expiringSoon;
      case "expired":
        return expired;
      default:
        return tools;
    }
  };

  const filteredTools = getFilteredTools();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Startup OS Billing
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Monitor and manage all tool subscriptions
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Tools</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {tools.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Cost</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  ${totalMonthlyCost.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {expiringSoon.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Expired</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {expired.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tools ({tools.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeTools.length})</TabsTrigger>
            <TabsTrigger value="expiring">
              Expiring Soon ({expiringSoon.length})
            </TabsTrigger>
            <TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTools.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title={
                  activeTab === "all"
                    ? "No tools added"
                    : `No ${activeTab} tools`
                }
                description={
                  activeTab === "all"
                    ? "Get started by adding your first tool subscription"
                    : `There are no ${activeTab} tools at the moment`
                }
                action={
                  activeTab === "all" && (
                    <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tool
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <BillingCard
                    key={tool.id}
                    tool={tool}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BillingForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTool(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTool}
      />
    </div>
  );
}
