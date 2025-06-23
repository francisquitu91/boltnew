import { useEffect, useRef, useCallback } from "react";

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

interface PhotoSphereViewerProps {
  src: string;
  markers: Marker[];
  onClick: (yaw: number, pitch: number) => void;
  onSelectMarker: (markerId: string) => void;
  editMode: boolean;
  navbar?: false | string[]; // Permitir deshabilitar la navbar
}

export function PhotoSphereViewer({ 
  src, 
  markers, 
  onClick, 
  onSelectMarker, 
  editMode,
  navbar = ['zoom', 'fullscreen'] // por defecto igual que antes
}: PhotoSphereViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const isLoadingRef = useRef(false);

  const createHotspotIcon = useCallback((type: string = 'arrow') => {
    if (type === 'arrow') {
      // Flecha: SVG externa nueva
      return 'https://www.svgrepo.com/show/510797/arrow-circle-right.svg';
    }
    if (type === 'info') {
      // Info: SVG externa
      return 'https://www.svgrepo.com/show/24584/info-icon.svg';
    }
    if (type === 'drone') {
      // Drone: SVG externa
      return 'https://www.svgrepo.com/show/399369/drone.svg';
    }
    // Fallback: info icon
    return 'https://www.svgrepo.com/show/24584/info-icon.svg';
  }, []);

  const destroyViewer = useCallback(() => {
    if (viewerRef.current) {
      try {
        if (viewerRef.current.container && viewerRef.current.container.parentNode) {
          viewerRef.current.destroy();
        }
      } catch (error) {
        // Silently handle destruction errors
      }
      viewerRef.current = null;
    }
  }, []);

  const loadPhotoSphereViewer = useCallback(async () => {
    if (!containerRef.current || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      destroyViewer();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      const { Viewer } = await import("@photo-sphere-viewer/core");
      const { MarkersPlugin } = await import("@photo-sphere-viewer/markers-plugin");
      await import("@photo-sphere-viewer/core/index.css");
      await import("@photo-sphere-viewer/markers-plugin/index.css");
      if (!containerRef.current) {
        isLoadingRef.current = false;
        return;
      }
      // Si navbar es false, no se muestra ninguna barra
      viewerRef.current = new Viewer({
        container: containerRef.current,
        panorama: src,
        plugins: [
          [MarkersPlugin, {
            markers: markers.map(marker => ({
              id: marker.id,
              position: { yaw: marker.yaw, pitch: marker.pitch },
              image: createHotspotIcon(marker.config.data.type || 'arrow'),
              size: { width: 32, height: 32 },
              anchor: 'center center',
              tooltip: marker.config.data.label || `Go to scene ${marker.config.data.targetSceneId}`,
              data: marker.config.data
            }))
          }]
        ],
        navbar: navbar === false ? [] : navbar // <--- aquí: si navbar es false, pasa array vacío
      });

      // Handle click events
      viewerRef.current.addEventListener('click', (e: any) => {
        if (editMode && e.data.rightclick === false) {
          onClick(e.data.yaw, e.data.pitch);
        }
      });

      // Handle marker selection
      const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);
      markersPlugin.addEventListener('select-marker', (e: any) => {
        if (!editMode) {
          onSelectMarker(e.marker.id);
        }
      });

    } catch (error) {
      console.error('Failed to load PhotoSphereViewer:', error);
      // Fallback to a simple image display
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div class="text-center text-white">
              <p class="mb-4">PhotoSphere Viewer failed to load</p>
              <img src="${src}" alt="Panorama" class="max-w-full max-h-full object-contain" />
            </div>
          </div>
        `;
      }
    }
    
    isLoadingRef.current = false;
  }, [src, markers, editMode, onClick, onSelectMarker, destroyViewer, createHotspotIcon]);

  // Update markers when they change
  useEffect(() => {
    if (viewerRef.current) {
      try {
        const markersPlugin = viewerRef.current.getPlugin('MarkersPlugin');
        markersPlugin.clearMarkers();
        markersPlugin.setMarkers(markers.map(marker => ({
          id: marker.id,
          position: { yaw: marker.yaw, pitch: marker.pitch },
          image: createHotspotIcon(marker.config.data.type || 'arrow'),
          size: { width: 32, height: 32 },
          anchor: 'center center',
          tooltip: marker.config.data.label || `Go to scene ${marker.config.data.targetSceneId}`,
          data: marker.config.data
        })));
      } catch (error) {
        // If updating markers fails, reload the viewer
        loadPhotoSphereViewer();
      }
    }
  }, [markers, loadPhotoSphereViewer, createHotspotIcon]);

  // Load viewer when src changes
  useEffect(() => {
    loadPhotoSphereViewer();
  }, [loadPhotoSphereViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyViewer();
    };
  }, [destroyViewer]);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full${navbar === false ? ' hide-navbar' : navbar ? ' show-navbar-outside' : ''}`}
      style={{ minHeight: '400px' }}
    />
  );
}