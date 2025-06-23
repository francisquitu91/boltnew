import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Navigation, Info, Plane } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface HotspotToolbarProps {
  isEditMode: boolean;
  onDragStart: (iconType: string) => void;
  onDragEnd: () => void;
}

const HOTSPOT_ICONS = {
  arrow: { icon: Navigation, label: 'Navigation', color: '#3b82f6' },
  info: { icon: Info, label: 'Information', color: '#f59e0b' },
  drone: { icon: Plane, label: 'Drone View', color: '#10b981' },
};

export function HotspotToolbar({ isEditMode, onDragStart, onDragEnd }: HotspotToolbarProps) {
  const { primaryColor, setPrimaryColor } = useTheme();
  const [showThemePanel, setShowThemePanel] = useState(false);

  if (!isEditMode) return null;

  return (
    <>
      {/* Floating Toolbar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 p-3 flex items-center space-x-2">
          {Object.entries(HOTSPOT_ICONS).map(([key, { icon: IconComponent, label, color }]) => (
            <div
              key={key}
              draggable
              onDragStart={() => onDragStart(key)}
              onDragEnd={onDragEnd}
              className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-slate-300 transition-all duration-200 hover:scale-110"
              style={{ borderColor: color }}
              title={`Drag to add ${label} hotspot`}
            >
              <IconComponent size={20} style={{ color }} />
            </div>
          ))}
          
          <div className="w-px h-8 bg-slate-200 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full p-0"
            onClick={() => setShowThemePanel(!showThemePanel)}
          >
            <Palette size={20} />
          </Button>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-xs text-slate-500 bg-white/80 rounded-full px-3 py-1 inline-block">
            Drag icons to panorama to add hotspots
          </p>
        </div>
      </div>

      {/* Theme Customization Panel */}
      {showThemePanel && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Theme Customization</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary-color" className="text-xs font-medium text-slate-600">
                  Primary Color
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-8 p-1 border-slate-300"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Quick Colors</Label>
                <div className="flex space-x-2 mt-1">
                  {[
                    '#3b82f6', // Blue
                    '#10b981', // Emerald
                    '#f59e0b', // Amber
                    '#ef4444', // Red
                    '#8b5cf6', // Purple
                    '#06b6d4', // Cyan
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemePanel(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}