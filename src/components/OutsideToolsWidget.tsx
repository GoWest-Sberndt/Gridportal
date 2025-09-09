import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Upload, ExternalLink, Globe, Mail, Calculator, Calendar, Settings, Users, FileText, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAccessTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
  icon_type: 'icon' | 'image';
  image_url?: string;
  background_color: string;
  is_global?: boolean;
  is_editable?: boolean;
  created_by?: string;
}

const QuickAccessWidget = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [tools, setTools] = useState<QuickAccessTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    icon: 'Globe',
    icon_type: 'icon' as 'icon' | 'image',
    image_url: '',
    background_color: '#032F60'
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

  // Load tools from database
  const loadTools = async () => {
    try {
      setLoading(true);
      
      // If no user (like in storyboards), show mock data
      if (!user) {
        const mockTools: QuickAccessTool[] = [
          {
            id: 'mock-1',
            name: 'CRM System',
            url: 'https://example.com/crm',
            icon: 'Users',
            icon_type: 'icon',
            background_color: '#032F60',
            is_global: true,
            is_editable: false
          },
          {
            id: 'mock-2',
            name: 'Calculator',
            url: 'https://calculator.net',
            icon: 'Calculator',
            icon_type: 'icon',
            background_color: '#27AE60',
            is_global: true,
            is_editable: false
          },
          {
            id: 'mock-3',
            name: 'Email',
            url: 'https://gmail.com',
            icon: 'Mail',
            icon_type: 'icon',
            background_color: '#E74C3C',
            is_global: false,
            is_editable: true,
            created_by: 'mock-user'
          }
        ];
        setTools(mockTools);
        setLoading(false);
        return;
      }
      
      // Get global tools and user's personal tools
      const { data, error } = await supabase
        .from('quick_access_tools')
        .select('*')
        .or(`is_global.eq.true,created_by.eq.${user?.id}`)
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
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('quick_access_tools_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quick_access_tools',
          filter: `or(is_global.eq.true,created_by.eq.${user.id})`
        }, 
        () => {
          loadTools();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleAddTool = async () => {
    if (!newTool.name || !newTool.url) return;

    // If no user (like in storyboards), just show a demo message
    if (!user) {
      alert('Demo mode: In the real app, this tool would be saved to your account!');
      setNewTool({
        name: '',
        url: '',
        icon: 'Globe',
        icon_type: 'icon',
        image_url: '',
        background_color: '#032F60'
      });
      setShowAddDialog(false);
      return;
    }

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
          is_global: false,
          is_editable: true,
          created_by: user.id
        }]);

      if (error) throw error;

      setNewTool({
        name: '',
        url: '',
        icon: 'Globe',
        icon_type: 'icon',
        image_url: '',
        background_color: '#032F60'
      });
      setShowAddDialog(false);
      loadTools();
    } catch (error) {
      console.error('Error adding tool:', error);
    }
  };

  const handleRemoveTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_access_tools')
        .delete()
        .eq('id', id)
        .eq('created_by', user?.id); // Only allow users to delete their own tools

      if (error) throw error;
      loadTools();
    } catch (error) {
      console.error('Error removing tool:', error);
    }
  };

  const handleToolClick = (url: string) => {
    window.open(url, '_blank');
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

  const renderToolIcon = (tool: QuickAccessTool) => {
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
      return <IconComponent size={16} className="text-white" />;
    }
  };

  // Check if user can remove a tool (only their own non-global tools)
  const canRemoveTool = (tool: QuickAccessTool) => {
    return !tool.is_global && tool.created_by === user?.id;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#032F60] to-[#1a4a73] rounded-lg shadow-md p-4">
        <div className="text-white text-sm">Loading Quick Access...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#032F60] to-[#1a4a73] rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="cursor-pointer hover:bg-black/10 transition-colors p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <span className="font-bold text-sm">Quick Access</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 font-normal">
              {tools.length} tools
            </span>
            <div className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown size={16} className="text-blue-200" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated Drawer */}
      <div className={`bg-white transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="p-4 border-t border-blue-100">
          <div className="space-y-3">
            {/* Tools Grid - 4 columns */}
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <div key={tool.id} className="relative group">
                  <button
                    onClick={() => handleToolClick(tool.url)}
                    className="w-full aspect-square rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 overflow-hidden border-2 border-white/20"
                    style={{ backgroundColor: tool.background_color }}
                    title={tool.name}
                  >
                    {renderToolIcon(tool)}
                  </button>
                  
                  {/* Remove button for user-created tools only */}
                  {canRemoveTool(tool) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTool(tool.id);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-red-600"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  )}
                  
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-700 font-medium truncate block">
                      {tool.name}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Add New Tool Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="w-full aspect-square rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#032F60] hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                >
                  <Plus size={16} className="text-gray-400" />
                </button>
                <span className="text-xs text-gray-500 mt-2 font-medium">Add Tool</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Tool Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Quick Access Tool</DialogTitle>
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
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
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
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTool}
                disabled={!newTool.name || !newTool.url}
                className="flex-1 bg-[#032F60] hover:bg-[#1a4a73]"
              >
                Add Tool
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickAccessWidget;