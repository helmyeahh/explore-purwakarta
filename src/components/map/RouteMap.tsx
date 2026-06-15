"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("./MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
      Loading route map...
    </div>
  ),
});

interface RouteMapProps {
  markers: Array<{ id: string; position: [number, number]; title: string }>;
}

export function RouteMap({ markers }: RouteMapProps) {
  const center: [number, number] = markers.length > 0 ? markers[0].position : [-6.538680, 107.443150];

  return (
    <div className="w-full h-full relative">
      <MapViewer center={center} zoom={13} markers={markers} interactive={true} />
    </div>
  );
}
