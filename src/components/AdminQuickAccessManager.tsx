import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, ExternalLink, Globe, Mail, Calculator, Calendar, Settings, Users, FileText, BarChart, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AdminQuickAccessTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
  icon_type: 'icon' | 'image';
  image_url?: string;
  background_color: string;
  is_global: boolean;
  is_editable: boolean;
  created_by?: string;
}

const AdminQuickAccessManager = () => {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<AdminQuickAccessTool | null>(null);
  const [tools, setTools] = useState<AdminQuickAccessTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    icon: 'Globe',
    icon_type: 'icon' as 'icon' | 'image',
    image_url: '',
    background_color: '#032F60',
    is_global: true,
    is_editable: false
  });

  // Color options (8 predefined colors)
  const colorOptions = [
    '#032F60', // Dark Blue
    '#5DADE2', // Light Blue
    '#E74C3C', // Red
    '#27AE60', // Green
    '#F39C12', // Orange
    '#9B59B6', // Purple
    '#34495E', // Dark Gray
    '#1ABC9C'  // Teal
  ];

  // Icon options using Lucide React icons
  const iconOptions = [
    { name: 'Globe', component: Globe },
    { name: 'Mail', component: Mail },
    { name: 'Calculator', component: Calculator },
    { name: 'Calendar', component: Calendar },
    { name: 'Settings', component: Settings },
    { name: 'Users', component: Users },
    { name: 'FileText', component: FileText },
    { name: 'BarChart', component: BarChart }
  ];

  // Load all tools from database
  const loadTools = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quick_access_tools')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setTools(data || []);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('admin_quick_access_tools_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quick_access_tools'
        }, 
        () => {
          loadTools();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAddTool = async () => {
    if (!newTool.name || !newTool.url || !user) return;

    try {
      const { error } = await supabase
        .from('quick_access_tools')
        .insert([{
          name: newTool.name,
          url: newTool.url,
          icon: newTool.icon,
          icon_type: newTool.icon_type,
          image_url: newTool.image_url || null,
          background_color: newTool.background_color,
          is_global: newTool.is_global,
          is_editable: newTool.is_editable,
          created_by: user.id
        }]);

      if (error) throw error;

      resetForm();
      setShowAddDialog(false);
      loadTools();
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const handleEditTool = (tool: AdminQuickAccessTool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      url: tool.url,
      icon: tool.icon || 'Globe',
      icon_type: tool.icon_type,
      image_url: tool.image_url || '',
      background_color: tool.background_color,
      is_global: tool.is_global,
      is_editable: tool.is_editable
    });
    setShowAddDialog(true);
  };

  const handleUpdateTool = async () => {
    if (!editingTool || !newTool.name || !newTool.url) return;

    try {
      const { error } = await supabase
        .from('quick_access_tools')
        .update({
          name: newTool.name,
          url: newTool.url,
          icon: newTool.icon,
          icon_type: newTool.icon_type,
          image_url: newTool.image_url || null,
          background_color: newTool.background_color,
          is_global: newTool.is_global,
          is_editable: newTool.is_editable,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTool.id);

      if (error) throw error;

      resetForm();
      setShowAddDialog(false);
      setEditingTool(null);
      loadTools();
    } catch (error) {
      console.error('Error updating tool:', error);
    }
  };

  const handleRemoveTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_access_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTools();
    } catch (error) {
      console.error('Error removing tool:', error);
    }
  };

  const resetForm = () => {
    setNewTool({
      name: '',
      url: '',
      icon: 'Globe',
      icon_type: 'icon',
      image_url: '',
      background_color: '#032F60',
      is_global: true,
      is_editable: false
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewTool({
          ...newTool,
          image_url: e.target?.result as string,
          icon_type: 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderToolIcon = (tool: AdminQuickAccessTool) => {
    if (tool.icon_type === 'image' && tool.image_url) {
      return (
        <img
          src={tool.image_url}
          alt={tool.name}
          className="w-full h-full object-cover rounded-full"
        />
      );
    } else {
      const IconComponent = iconOptions.find(opt => opt.name === tool.icon)?.component || Globe;
      return <IconComponent size={20} className="text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-gray-600">Loading Quick Access tools...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quick Access Tools Management</h1>
        <p className="text-gray-600">Manage global Quick Access tools that appear for all users. Users can still add their own personal tools.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Global Quick Access Tools ({tools.length})</span>
            <Button 
              onClick={() => {
                resetForm();
                setEditingTool(null);
                setShowAddDialog(true);
              }}
              className="bg-[#032F60] hover:bg-[#1a4a73]"
            >
              <Plus size={16} className="mr-2" />
              Add Tool
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div key={tool.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: tool.background_color }}
                  >
                    {renderToolIcon(tool)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{tool.name}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <ExternalLink size={10} />
                      {tool.url}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.is_global ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tool.is_global ? 'Global' : 'Personal'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.is_editable ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tool.is_editable ? 'User Editable' : 'Admin Only'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTool(tool)}
                    className="flex-1"
                  >
                    <Edit size={12} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveTool(tool.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Tool Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? 'Edit Quick Access Tool' : 'Add Quick Access Tool'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tool Name</label>
              <Input
                placeholder="e.g., CRM System"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">URL</label>
              <Input
                placeholder="https://example.com"
                value={newTool.url}
                onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Visibility</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTool.is_global}
                      onChange={(e) => setNewTool({ ...newTool, is_global: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Show to all users</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTool.is_editable}
                      onChange={(e) => setNewTool({ ...newTool, is_editable: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Users can edit/remove</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Icon Type</label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={newTool.icon_type === 'icon' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewTool({ ...newTool, icon_type: 'icon' })}
                  className="flex-1"
                >
                  Use Icon
                </Button>
                <Button
                  type="button"
                  variant={newTool.icon_type === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewTool({ ...newTool, icon_type: 'image' })}
                  className="flex-1"
                >
                  Upload Image
                </Button>
              </div>
              
              {newTool.icon_type === 'icon' ? (
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((iconOption) => {
                    const IconComponent = iconOption.component;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setNewTool({ ...newTool, icon: iconOption.name })}
                        className={`w-10 h-10 rounded border-2 flex items-center justify-center hover:bg-gray-50 ${
                          newTool.icon === iconOption.name ? 'border-[#032F60] bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <IconComponent size={16} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="admin-image-upload"
                    />
                    <label htmlFor="admin-image-upload" className="cursor-pointer">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended: Square image, 64x64px or larger</p>
                    </label>
                  </div>
                  {newTool.image_url && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={newTool.image_url}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Background Color</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTool({ ...newTool, background_color: color })}
                    className={`w-10 h-10 rounded-full border-4 ${
                      newTool.background_color === color ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-md overflow-hidden"
                  style={{ backgroundColor: newTool.background_color }}
                >
                  {newTool.icon_type === 'image' && newTool.image_url ? (
                    <img
                      src={newTool.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (() => {
                      const IconComponent = iconOptions.find(opt => opt.name === newTool.icon)?.component || Globe;
                      return <IconComponent size={16} className="text-white" />;
                    })()
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{newTool.name || 'Tool Name'}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <ExternalLink size={10} />
                    {newTool.url || 'URL'}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {newTool.is_global && (
                      <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">Global</span>
                    )}
                    {newTool.is_editable && (
                      <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">Editable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingTool(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingTool ? handleUpdateTool : handleAddTool}
                disabled={!newTool.name || !newTool.url}
                className="flex-1 bg-[#032F60] hover:bg-[#1a4a73]"
              >
                <Save size={16} className="mr-2" />
                {editingTool ? 'Update' : 'Add'} Tool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuickAccessManager;