import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scene } from "@shared/schema";

interface PendingHotspot {
  yaw: number;
  pitch: number;
}

interface HotspotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetSceneId: number, label?: string, type?: 'arrow' | 'info' | 'drone') => void;
  pendingHotspot: PendingHotspot | null;
  availableScenes: Scene[];
}

export function HotspotConfigModal({
  isOpen,
  onClose,
  onConfirm,
  pendingHotspot,
  availableScenes
}: HotspotConfigModalProps) {
  const [selectedTargetScene, setSelectedTargetScene] = useState<string>("");
  const [hotspotLabel, setHotspotLabel] = useState("");
  const [hotspotType, setHotspotType] = useState<'arrow' | 'info' | 'drone'>('arrow');

  const handleConfirm = () => {
    if (!selectedTargetScene) return;
    
    onConfirm(parseInt(selectedTargetScene), hotspotLabel || undefined, hotspotType);
    
    // Reset form
    setSelectedTargetScene("");
    setHotspotLabel("");
    setHotspotType('arrow');
  };

  const handleClose = () => {
    setSelectedTargetScene("");
    setHotspotLabel("");
    setHotspotType('arrow');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-96 max-w-full mx-4">
        <DialogHeader>
          <DialogTitle>Add Navigation Hotspot</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="target-scene" className="text-sm font-medium text-slate-700">
              Link to Scene
            </Label>
            <Select value={selectedTargetScene} onValueChange={setSelectedTargetScene}>
              <SelectTrigger>
                <SelectValue placeholder="Select a scene..." />
              </SelectTrigger>
              <SelectContent>
                {availableScenes.map((scene) => (
                  <SelectItem key={scene.id} value={scene.id.toString()}>
                    {scene.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="hotspot-type" className="text-sm font-medium text-slate-700">
              Hotspot Type
            </Label>
            <Select value={hotspotType} onValueChange={(value: 'arrow' | 'info' | 'drone') => setHotspotType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hotspot type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arrow">🔗 Navigation Arrow</SelectItem>
                <SelectItem value="info">ℹ️ Information Point</SelectItem>
                <SelectItem value="drone">🚁 Drone View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hotspot-label" className="text-sm font-medium text-slate-700">
              Hotspot Label (Optional)
            </Label>
            <Input
              id="hotspot-label"
              placeholder="e.g. Go to Kitchen"
              value={hotspotLabel}
              onChange={(e) => setHotspotLabel(e.target.value)}
            />
          </div>
          
          {pendingHotspot && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-mono">
                    Yaw: {Math.round(pendingHotspot.yaw * 180 / Math.PI)}°
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span></span>
                  <span className="font-mono">
                    Pitch: {Math.round(pendingHotspot.pitch * 180 / Math.PI)}°
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!selectedTargetScene}
          >
            Add Hotspot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
