"use client";

import dynamic from "next/dynamic";
import { useData } from "@/contexts/DataContext";

const MapViewer = dynamic(() => import("./MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-2xl">
      Loading map...
    </div>
  ),
});

export function MiniMap() {
  const { destinations } = useData();
  const center: [number, number] = [-6.538680, 107.443150]; // Purwakarta center

  const markers = destinations.map(dest => ({
    id: dest.id,
    position: [dest.location.coordinates.latitude, dest.location.coordinates.longitude] as [number, number],
    title: dest.name,
  }));

  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
      <MapViewer center={center} zoom={12} markers={markers} interactive={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
