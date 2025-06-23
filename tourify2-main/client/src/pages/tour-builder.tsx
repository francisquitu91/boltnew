import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PhotoSphereViewer } from "@/components/tour-builder/PhotoSphereViewer";
import { HotspotConfigModal } from "@/components/tour-builder/HotspotConfigModal";
import { 
  Box, 
  Edit, 
  Play, 
  Plus, 
  Trash2, 
  Share, 
  Download, 
  MousePointer, 
  Maximize, 
  Info,
  X
} from "lucide-react";
import type { Scene } from "@shared/schema";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { uploadToSupabase } from '@/lib/uploadToSupabase';

interface PendingHotspot {
  yaw: number;
  pitch: number;
}

interface Marker {
  id: string;
  yaw: number;
  pitch: number;
  config: {
    data: {
      targetSceneId: number;
      label?: string;
      type?: 'arrow' | 'info' | 'drone';
    };
  };
}

export default function TourBuilder() {
  // State management
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [pendingHotspot, setPendingHotspot] = useState<PendingHotspot | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  
  // Form state for new scenes
  const [newSceneName, setNewSceneName] = useState("");
  const [newSceneFile, setNewSceneFile] = useState<File | null>(null);
  const [newScenePanorama, setNewScenePanorama] = useState(""); // Will store the object URL
  
  // Logo customization state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const { toast } = useToast();

  // Initialize with a default tour (for MVP, using tour ID 1)
  const tourId = 1;

  // Fetch scenes
  const { data: fetchedScenes, isLoading } = useQuery({
    queryKey: ['/api/tours', tourId, 'scenes'],
    queryFn: async () => {
      const response = await fetch(`/api/tours/${tourId}/scenes`);
      if (response.ok) {
        return await response.json();
      }
      // If tour doesn't exist, create it first
      if (response.status === 404) {
        await apiRequest('POST', '/api/tours', {
          name: 'My Virtual Tour',
          description: 'A virtual tour created with VirtuTour Builder'
        });
        return [];
      }
      throw new Error('Failed to fetch scenes');
    }
  });

  // Update local scenes state when data is fetched
  useEffect(() => {
    if (fetchedScenes) {
      setScenes(fetchedScenes);
      if (fetchedScenes.length > 0 && !currentSceneId) {
        setCurrentSceneId(fetchedScenes[0].id);
      }
    }
  }, [fetchedScenes, currentSceneId]);

  // Create scene mutation
  const createSceneMutation = useMutation({
    mutationFn: async (sceneData: { name: string; panorama: string }) => {
      const response = await apiRequest('POST', `/api/tours/${tourId}/scenes`, sceneData);
      return response.json();
    },
    onSuccess: (newScene) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', tourId, 'scenes'] });
      setNewSceneName("");
      setNewSceneFile(null);
      setNewScenePanorama("");
      setCurrentSceneId(newScene.id);
      toast({
        title: "Scene added successfully!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Failed to add scene",
        description: "Please check the image URL and try again.",
        variant: "destructive"
      });
    }
  });

  // Update scene mutation
  const updateSceneMutation = useMutation({
    mutationFn: async ({ sceneId, sceneData }: { sceneId: number; sceneData: Partial<Scene> }) => {
      const response = await apiRequest('PUT', `/api/scenes/${sceneId}`, sceneData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', tourId, 'scenes'] });
    }
  });

  // Delete scene mutation
  const deleteSceneMutation = useMutation({
    mutationFn: async (sceneId: number) => {
      await apiRequest('DELETE', `/api/scenes/${sceneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours', tourId, 'scenes'] });
      // If deleted scene was current, switch to another scene
      const remainingScenes = scenes.filter(s => s.id !== currentSceneId);
      if (remainingScenes.length > 0) {
        setCurrentSceneId(remainingScenes[0].id);
      } else {
        setCurrentSceneId(null);
      }
      toast({
        title: "Scene deleted successfully",
        variant: "default"
      });
    }
  });

  const activeScene = scenes.find(s => s.id === currentSceneId);

  const handleAddScene = async () => {
    if (!newSceneName.trim() || !newSceneFile) {
      toast({
        title: "Please fill in all fields",
        description: "Both scene name and panorama image are required.",
        variant: "destructive"
      });
      return;
    }
    // Subir imagen a Supabase Storage antes de crear la escena
    const ext = newSceneFile.name.split('.').pop();
    const fileName = `${Date.now()}_${newSceneFile.name.replace(/\s+/g, '_')}`;
    const publicUrl = await uploadToSupabase(newSceneFile, 'scenes', fileName);
    if (!publicUrl) {
      toast({
        title: "Failed to upload image",
        description: "There was a problem uploading the image to storage.",
        variant: "destructive"
      });
      return;
    }
    createSceneMutation.mutate({
      name: newSceneName,
      panorama: publicUrl
    });
  };

  const handleViewerClick = (yaw: number, pitch: number) => {
    if (!isEditMode) return;
    setPendingHotspot({ yaw, pitch });
  };

  const handleConfirmHotspot = (targetSceneId: number, label?: string, type?: 'arrow' | 'info' | 'drone') => {
    if (!pendingHotspot || !activeScene) return;

    const newMarker: Marker = {
      id: `marker_${Date.now()}`,
      yaw: pendingHotspot.yaw,
      pitch: pendingHotspot.pitch,
      config: {
        data: {
          targetSceneId,
          label,
          type: type || 'arrow'
        }
      }
    };

    const updatedMarkers = [...(activeScene.markers as Marker[] || []), newMarker];
    
    updateSceneMutation.mutate({
      sceneId: activeScene.id,
      sceneData: { markers: updatedMarkers }
    });

    setPendingHotspot(null);
    toast({
      title: "Hotspot added successfully!",
      variant: "default"
    });
  };

  const handleMarkerClick = (markerId: string) => {
    if (isEditMode) return;
    
    const marker = (activeScene?.markers as Marker[] || []).find(m => m.id === markerId);
    if (marker) {
      setCurrentSceneId(marker.config.data.targetSceneId);
    }
  };

  // Maneja la subida del logo a Supabase al publicar el tour
  const handlePublishTour = async () => {
    let finalLogoUrl = logoUrl;
    if (logoFile) {
      const ext = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
      const publicUrl = await uploadToSupabase(logoFile, 'logos', fileName);
      if (publicUrl) {
        finalLogoUrl = publicUrl;
        setLogoUrl(publicUrl);
      } else {
        toast({
          title: "Failed to upload logo",
          description: "There was a problem uploading the logo to storage.",
          variant: "destructive"
        });
        return;
      }
    }
    setIsPublishOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tour builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Box className="text-primary-foreground text-sm" size={16} />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">VirtuTour Builder</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Create immersive 360° experiences</p>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b border-slate-200">
          <div className="bg-slate-100 rounded-lg p-1 flex">
            <Button
              variant={isEditMode ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setIsEditMode(true)}
            >
              <Edit size={16} className="mr-2" />
              Edit Mode
            </Button>
            <Button
              variant={!isEditMode ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setIsEditMode(false)}
            >
              <Play size={16} className="mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Add Scene Section */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Scene</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="scene-name" className="text-xs font-medium text-slate-600">
                Scene Name
              </Label>
              <Input
                id="scene-name"
                placeholder="e.g. Living Room"
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="panorama-file" className="text-xs font-medium text-slate-600">
                360° Image (Local File)
              </Label>
              <Input
                id="panorama-file"
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setNewSceneFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setNewScenePanorama(url);
                  } else {
                    setNewScenePanorama("");
                  }
                }}
              />
              {newScenePanorama && (
                <img src={newScenePanorama} alt="Preview" className="mt-2 w-full h-32 object-cover rounded border" />
              )}
            </div>
            <div>
              <Label htmlFor="logo-file" className="text-xs font-medium text-slate-600">
                Logo (PNG, SVG, etc.)
              </Label>
              <Input
                id="logo-file"
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="text-sm"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setLogoUrl(url);
                  } else {
                    setLogoUrl("");
                  }
                }}
              />
              {logoUrl && (
                <img src={logoUrl} alt="Logo Preview" className="mt-2 h-12 object-contain rounded bg-white p-1 border" />
              )}
            </div>
            <Button
              onClick={handleAddScene}
              disabled={createSceneMutation.isPending}
              className="w-full"
              size="sm"
            >
              {createSceneMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Scene
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Scene List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Scenes</h3>
              <Badge variant="secondary" className="text-xs">
                {scenes.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {scenes.map((scene) => (
                <Card
                  key={scene.id}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    scene.id === currentSceneId
                      ? "bg-primary/10 border-primary/20"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentSceneId(scene.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={scene.panorama}
                        alt={`${scene.name} panorama thumbnail`}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0xMiAxNkwyMCAyNEwyOCAxNiIgc3Ryb2tlPSIjOTQ0Mzc0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{scene.name}</h4>
                        <p className="text-xs text-slate-500">
                          {(scene.markers as Marker[] || []).length} hotspots
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {scene.id === currentSceneId && (
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-slate-400 hover:text-slate-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSceneMutation.mutate(scene.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={handlePublishTour}>
              <Share size={16} className="mr-2" />
              Publish Tour
            </Button>
            <Button variant="secondary" size="sm" className="px-3">
              <Download size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {activeScene?.name || ""}
              </h2>
            </div>
          </div>
        </div>

        {/* 360° Viewer Container */}
        <div className="flex-1 relative bg-slate-900">
          {activeScene ? (
            <PhotoSphereViewer
              src={activeScene.panorama}
              markers={(activeScene.markers as Marker[] || [])}
              onClick={handleViewerClick}
              onSelectMarker={handleMarkerClick}
              editMode={isEditMode}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
            </div>
          )}
        </div>
      </div>

      {/* Hotspot Configuration Modal */}
      <HotspotConfigModal
        isOpen={!!pendingHotspot}
        onClose={() => setPendingHotspot(null)}
        onConfirm={handleConfirmHotspot}
        pendingHotspot={pendingHotspot}
        availableScenes={scenes.filter(s => s.id !== currentSceneId)}
      />
      {/* Publish Tour Immersive Dialog */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="p-0 max-w-full w-screen h-screen bg-black/95 flex flex-col justify-end items-center overflow-hidden">
          {/* Logo en la esquina superior derecha si está cargado */}
          {logoUrl && (
            <div className="absolute top-6 right-8 z-30">
              <img src={logoUrl} alt="Tour Logo" className="h-24 w-auto max-w-xs object-contain drop-shadow-lg bg-white/80 rounded-lg p-2" />
            </div>
          )}
          <div className="absolute inset-0 z-0 pb-40">
            {currentSceneId && (
              <PhotoSphereViewer
                src={scenes.find(s => s.id === currentSceneId)?.panorama || ''}
                markers={(scenes.find(s => s.id === currentSceneId)?.markers as Marker[] || [])}
                onClick={() => {}}
                onSelectMarker={(markerId) => {
                  const marker = (scenes.find(s => s.id === currentSceneId)?.markers as Marker[] || []).find(m => m.id === markerId);
                  if (marker) setCurrentSceneId(marker.config.data.targetSceneId);
                }}
                editMode={false}
                navbar={false} // Deshabilita la barra de herramientas en modo Publish Tour
              />
            )}
          </div>
          {/* Carrusel de escenas mejorado y sin fondo opaco */}
          <div className="relative z-10 w-full flex justify-center pb-8 pointer-events-none">
            <div className="carousel-no-shadow rounded-2xl px-2 py-4 w-[90vw] max-w-7xl flex flex-col items-center pointer-events-auto border border-white/20">
              <Carousel opts={{ align: 'center' }}>
                <CarouselPrevious />
                <CarouselContent>
                  {scenes.map((scene) => (
                    <CarouselItem key={scene.id} className="basis-1/6 flex justify-center">
                      <div className="relative group flex flex-col items-center">
                        <button
                          className={`focus:outline-none border-4 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-900/60 hover:scale-110 ${scene.id === currentSceneId ? 'border-emerald-400 scale-110 ring-2 ring-emerald-300' : 'border-transparent opacity-80 hover:opacity-100'}`}
                          onClick={() => setCurrentSceneId(scene.id)}
                          style={{ width: 200, height: 120, perspective: '800px' }}
                        >
                          <img
                            src={scene.panorama}
                            alt={scene.name}
                            className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:rotate-y-6 group-hover:scale-105"
                            style={{ transform: 'rotateY(0deg)' }}
                          />
                          {/* Nombre del escenario sobre la imagen al hacer hover */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-lg font-bold text-white drop-shadow-lg px-2 py-1 rounded-lg bg-black/40">{scene.name}</span>
                          </div>
                        </button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
