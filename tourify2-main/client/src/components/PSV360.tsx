import React, { useEffect, useRef } from "react";
import { Viewer } from "photo-sphere-viewer";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";

const IMAGE_URL =
  "https://images.unsplash.com/photo-1505252772853-08ed4d526ceb?q=80&w=1460&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const PSV360: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const psvInstance = useRef<any>(null);

  useEffect(() => {
    if (viewerRef.current && !psvInstance.current) {
      psvInstance.current = new Viewer({
        container: viewerRef.current,
        panorama: IMAGE_URL,
        navbar: [],
        mousewheel: false,
        touchmoveTwoFingers: false,
        minFov: 90, // Zoom out equilibrado, sin deformar
        maxFov: 90, // Zoom out equilibrado, sin deformar
        defaultLat: 0,
        moveInertia: false,
        size: { width: window.innerWidth, height: window.innerHeight },
      });
      // Bloquear interacción vertical y zoom
      psvInstance.current.on("position-updated", (e: any, position: any) => {
        if (position.latitude !== 0) {
          psvInstance.current.rotate({ longitude: position.longitude, latitude: 0 });
        }
      });
      // Movimiento automático suave
      let longitude = 0;
      let direction = 1;
      const animate = () => {
        if (psvInstance.current) {
          longitude += 0.0007 * direction; // velocidad muy suave
          if (longitude > Math.PI / 6 || longitude < -Math.PI / 6) direction *= -1;
          psvInstance.current.rotate({ longitude, latitude: 0 });
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (psvInstance.current) {
        psvInstance.current.destroy();
        psvInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    />
  );
};

export default PSV360;
