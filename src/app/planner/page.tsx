"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RouteMap } from "@/components/map/RouteMap";
import { useData } from "@/contexts/DataContext";
import { AIRecommendation } from "@/lib/ai";
import { Navigation, ArrowLeft, View } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const router = useRouter();
  const { destinations } = useData();
  const [results, setResults] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("explore_ai_result");
    if (saved) {
      setResults(JSON.parse(saved));
    } else {
      // Fallback if no wizard was run
      if (destinations.length >= 3) {
        setResults([
          { destinationId: destinations[0].id, distance: "2.5 km", aiReview: "Pilihan terbaik untuk memulai hari." },
          { destinationId: destinations[1].id, distance: "5.0 km", aiReview: "Cocok untuk bersantai di siang hari." },
          { destinationId: destinations[2].id, distance: "1.2 km", aiReview: "Sempurna untuk mengakhiri perjalanan Anda." }
        ]);
      }
    }
  }, [destinations]);

  // Map the results back to full destination objects
  const itinerary = results.map(res => {
    const dest = destinations.find(d => d.id === res.destinationId);
    return dest ? { ...dest, aiRecommendation: res } : null;
  }).filter(Boolean) as (typeof destinations[0] & { aiRecommendation: AIRecommendation })[];

  const markers = itinerary.map((item) => ({
    id: item.id,
    position: [item.location.coordinates.latitude, item.location.coordinates.longitude] as [number, number],
    title: item.name,
  }));

  const openGoogleMaps = () => {
    alert("Navigating to Google Maps...");
  };

  return (
    <main className="flex flex-col h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 shrink-0 z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">AI Recommendations</h1>
          <p className="text-xs text-gray-500">Tailored perfectly for your mood</p>
        </div>
      </header>

      {/* Map Section */}
      <section className="h-64 shrink-0 bg-gray-200 relative z-10">
        <RouteMap markers={markers} />
      </section>

      {/* Timeline Section */}
      <section className="flex-1 overflow-y-auto px-4 py-6 relative">
        <div className="max-w-xl mx-auto space-y-4">
          
          {itinerary.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.interactive?.main_photo || 'https://dummyimage.com/150x150/ccc/000'})` }} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                    <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded">
                      {item.aiRecommendation.distance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.categories.join(", ")}</p>
                  
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 mb-3">
                    <p className="text-xs text-[#EA580C] italic leading-tight">
                      &quot;{item.aiRecommendation.aiReview}&quot;
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/destination/${item.id}`} className="flex-1">
                      <Button variant="outline" fullWidth className="py-2 text-xs h-auto">
                        <View className="w-3 h-3 mr-1" /> Details
                      </Button>
                    </Link>
                    <Button variant="primary" className="flex-1 py-2 text-xs h-auto" onClick={openGoogleMaps}>
                      <Navigation className="w-3 h-3 mr-1" /> Route
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
        
        {/* Spacer for fixed button */}
        <div className="h-24"></div>
      </section>
    </main>
  );
}
