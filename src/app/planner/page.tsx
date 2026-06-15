import { Button } from "@/components/ui/Button";
import { RouteMap } from "@/components/map/RouteMap";
import { mockDestinations } from "@/lib/data";
import { Navigation, ArrowLeft, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

export default function PlannerPage() {
  const itinerary = [
    { time: "08:00 AM", ...mockDestinations[0] }, // Sate Maranggi
    { time: "11:00 AM", ...mockDestinations[1] }, // Jatiluhur
    { time: "07:30 PM", ...mockDestinations[2] }, // Sri Baduga
  ];

  const markers = itinerary.map((item) => ({
    id: item.id,
    position: [item.location.coordinates.latitude, item.location.coordinates.longitude] as [number, number],
    title: item.name,
  }));

  return (
    <main className="flex flex-col h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 shrink-0 z-20">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Your Perfect Day</h1>
          <p className="text-xs text-gray-500">Curated by AI based on your preferences</p>
        </div>
      </header>

      {/* Map Section */}
      <section className="h-64 shrink-0 bg-gray-200 relative z-10">
        <RouteMap markers={markers} />
      </section>

      {/* Timeline Section */}
      <section className="flex-1 overflow-y-auto px-4 py-6 relative">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-bold text-gray-900 mb-4">Itinerary Timeline</h2>
          
          <div className="relative pl-6 space-y-8 border-l-2 border-gray-200 ml-3">
            {itinerary.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute w-4 h-4 bg-[#2563EB] rounded-full -left-[35px] top-1 border-4 border-white shadow-sm" />
                
                <div className="mb-1">
                  <span className="text-sm font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded-md inline-block mb-2">
                    {item.time}
                  </span>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3 group">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                    <div className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded inline-block">
                      Est. {item.visit_info.estimated_price}
                    </div>
                  </div>
                  <button className="shrink-0 self-center p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-full transition-colors" title="Swap destination">
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Spacer for fixed button */}
        <div className="h-24"></div>
      </section>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-20">
        <div className="max-w-xl mx-auto">
          <Button variant="primary" icon={Navigation} fullWidth className="py-4 text-lg shadow-lg shadow-blue-500/30">
            Start Navigation
          </Button>
        </div>
      </div>
    </main>
  );
}
