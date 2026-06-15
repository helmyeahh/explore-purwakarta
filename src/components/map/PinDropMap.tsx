"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PinDropMapProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

export default function PinDropMap({ position, onPositionChange }: PinDropMapProps) {
  const [localPos, setLocalPos] = useState<L.LatLng>(new L.LatLng(position[0], position[1]));
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    setLocalPos(new L.LatLng(position[0], position[1]));
  }, [position[0], position[1]]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setLocalPos(newPos);
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onPositionChange],
  );

  function MapEvents() {
    useMapEvents({
      click(e) {
        setLocalPos(e.latlng);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  // To re-center the map if localPos changes drastically, we could use a custom hook, 
  // but for simplicity, we just bind the Marker to localPos.
  // The MapContainer's center prop only sets INITIAL center in Leaflet, so we add a map hook.
  function UpdateCenter({ position }: { position: L.LatLng }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 relative z-10">
      <MapContainer
        center={localPos}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <UpdateCenter position={localPos} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={localPos}
          ref={markerRef}
          icon={customIcon}
        />
      </MapContainer>
    </div>
  );
}
