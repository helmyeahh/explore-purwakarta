import { mockDestinations } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Clock, Banknote, Car, Droplets, MapPin, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Since we are mocking, we can just use params directly as an async promise in next 15, or standard in next 14.
// For Next.js App Router dynamic routes with latest conventions, params is a Promise.
export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const destination = mockDestinations.find((d) => d.id === resolvedParams.id);

  if (!destination) {
    notFound();
  }

  // Map facility names to icons roughly
  const getFacilityIcon = (facility: string) => {
    const f = facility.toLowerCase();
    if (f.includes("parking")) return <Car className="w-4 h-4" />;
    if (f.includes("toilet") || f.includes("water")) return <Droplets className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <main className="bg-[#F9FAFB] min-h-screen pb-24">
      {/* Header / VR 360 Box */}
      <section className="relative bg-gray-900 w-full aspect-video rounded-b-[32px] overflow-hidden shadow-lg z-10">
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="bg-white/20 backdrop-blur-md p-2 rounded-full inline-block text-white hover:bg-white/40 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>
        
        {/* VR Placeholder / iframe */}
        {destination.interactive?.vr_link ? (
          <iframe 
            src={destination.interactive.vr_link}
            className="w-full h-full border-0" 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            No VR view available
          </div>
        )}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 text-xs font-medium flex items-center gap-2 pointer-events-none">
          Swipe to explore in 360°
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-4 -mt-4 relative z-20">
        
        {/* Title and Tags Card */}
        <Card className="mb-6 border-none shadow-md">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{destination.name}</h1>
              <div className="bg-[#059669] text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 fill-current" />
                {destination.rating_and_reviews.average_rating}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{destination.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {destination.mood_tags.map(tag => (
                <span key={tag} className="bg-blue-50 text-[#2563EB] text-xs font-medium px-2.5 py-1 rounded-md border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Essential Info */}
        <h2 className="text-lg font-bold text-gray-900 mb-3 ml-1">Essential Info</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-orange-50 p-2 rounded-lg text-[#EA580C]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Opening Hours</p>
                <p className="text-sm font-bold text-gray-900">{destination.visit_info.open_hours} - {destination.visit_info.close_hours}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="bg-green-50 p-2 rounded-lg text-[#059669]">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Est. Price</p>
                <p className="text-sm font-bold text-gray-900">{destination.visit_info.estimated_price}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities & Distance */}
        <Card className="mb-8">
          <CardContent className="p-4 flex justify-between items-center divide-x divide-gray-100">
            <div className="flex-1 px-2">
              <p className="text-xs text-gray-500 font-medium mb-2 text-center">Facilities</p>
              <div className="flex justify-center gap-3 text-gray-700">
                {destination.facilities.slice(0, 3).map((f, i) => (
                  <div key={i} title={f} className="bg-gray-50 p-1.5 rounded-md border border-gray-100">
                    {getFacilityIcon(f)}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 px-2 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Distance</p>
              <div className="flex items-center justify-center gap-1 text-[#2563EB] font-bold text-lg">
                <MapPin className="w-5 h-5" />
                {destination.distance}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="flex items-center justify-between mb-4 ml-1">
          <h2 className="text-lg font-bold text-gray-900">Traveler Reviews</h2>
          <span className="text-sm text-gray-500">({destination.rating_and_reviews.total_reviews})</span>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-0.5">Budi Santoso</h4>
                <div className="flex text-[#EA580C] mb-1">
                  <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                </div>
                <p className="text-sm text-gray-600">Great place! The atmosphere was exactly what I needed for a weekend getaway. Definitely coming back.</p>
              </div>
            </div>
            
            <Button variant="outline" icon={MessageSquare} fullWidth>
              Write Your Experience
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-2">*Login required to post a review</p>
          </CardContent>
        </Card>
      </div>

    </main>
  );
}
