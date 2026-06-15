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
  initialPosition?: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

export default function PinDropMap({ initialPosition = [-6.538680, 107.443150], onPositionChange }: PinDropMapProps) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(initialPosition[0], initialPosition[1]));
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onPositionChange],
  );

  function MapEvents() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={customIcon}
        />
      </MapContainer>
    </div>
  );
}
