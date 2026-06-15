import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MiniMap } from "@/components/map/MiniMap";
import { mockDestinations } from "@/lib/data";
import { Search, MapPin, Navigation, Compass, Star } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const categories = ["Night Street Food", "Nature Escapes", "Family Friendly", "Photo Spots", "Heritage"];

  return (
    <main className="flex-1 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] pt-16 pb-24 px-4 text-white rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/3 -translate-y-1/3">
          <Compass className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Explore Purwakarta</h1>
          <p className="text-blue-100 mb-8">Your personal AI travel companion.</p>
          
          <Card className="p-2 shadow-xl bg-white/10 backdrop-blur-md border-white/20">
            <div className="flex flex-col gap-3 p-2">
              <label className="text-sm font-medium text-white px-1">
                Hi! What kind of holiday are you looking for in Purwakarta today?
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. A relaxing day with family..." 
                  className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                />
                <Link href="/planner" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#EA580C] p-2 rounded-lg text-white hover:bg-[#C2410C] transition-colors">
                  <Search className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* Geolocation Button */}
        <Button variant="secondary" icon={Navigation} fullWidth className="py-4 text-lg">
          Find Spots Near Me
        </Button>

        {/* Category Carousel */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-900">Quick Filters</h2>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-3 no-scrollbar snap-x">
            {categories.map((category) => (
              <button 
                key={category}
                className="snap-start shrink-0 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50 transition-colors shadow-sm"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Interactive Map */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Popular Around You</h2>
            <Link href="/planner" className="text-sm font-semibold text-[#2563EB]">View Map</Link>
          </div>
          <MiniMap />
        </div>

        {/* Top Destinations */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-900">Top Rated Spots</h2>
          <div className="flex flex-col gap-4">
            {mockDestinations.map((dest) => (
              <Link href={`/destination/${dest.id}`} key={dest.id}>
                <Card className="group hover:border-[#2563EB]/30 transition-all duration-300">
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 to-gray-100 flex items-center justify-center">
                        <MapPin className="text-gray-400 w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#2563EB] transition-colors">{dest.name}</h3>
                        <div className="flex items-center gap-1 bg-orange-50 text-[#EA580C] px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          {dest.rating_and_reviews.average_rating}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{dest.categories.join(" • ")}</p>
                      <div className="flex gap-2">
                        {dest.mood_tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] bg-green-50 text-[#059669] px-2 py-1 rounded-md font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
