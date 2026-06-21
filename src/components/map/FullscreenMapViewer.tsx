"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Destination } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapBoundsListener({ destinations, setVisiblePins }: { destinations: Destination[], setVisiblePins: (d: Destination[]) => void }) {
  const map = useMapEvents({
    moveend: () => updatePins(),
    zoomend: () => updatePins(),
  });

  const updatePins = () => {
    const bounds = map.getBounds();
    let inside = destinations.filter(d => 
      bounds.contains([d.location.coordinates.latitude, d.location.coordinates.longitude])
    );
    inside.sort((a, b) => b.rating_and_reviews.total_reviews - a.rating_and_reviews.total_reviews);
    setVisiblePins(inside.slice(0, 5));
  };

  useEffect(() => {
    updatePins(); 
  }, [destinations, map]);

  return null;
}

export default function FullscreenMapViewer({ destinations }: { destinations: Destination[] }) {
  const [visiblePins, setVisiblePins] = useState<Destination[]>([]);
  const center: [number, number] = [-6.538680, 107.443150];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsListener destinations={destinations} setVisiblePins={setVisiblePins} />
      
      {visiblePins.map((dest) => (
        <Marker key={dest.id} position={[dest.location.coordinates.latitude, dest.location.coordinates.longitude]} icon={customIcon}>
          <Popup>
            <div className="w-48">
              <div className="h-24 bg-gray-200 rounded-t-lg overflow-hidden mb-2 relative"><img src={dest.interactive?.main_photo || 'https://dummyimage.com/200x100/ccc/000'} loading="lazy" decoding="async" className="absolute inset-0 object-cover w-full h-full" alt={dest.name} /></div>
              <h3 className="font-bold text-sm mb-1">{dest.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{dest.categories.join(", ")}</p>
              <Link href={`/destination/${dest.id}`}>
                <Button size="sm" fullWidth className="h-7 text-xs">Lihat Detail</Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
