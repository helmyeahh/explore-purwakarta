"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MiniMap } from "@/components/map/MiniMap";
import { useData } from "@/contexts/DataContext";
import { Search, MapPin, Navigation, Compass, Star, Sparkles, Map, Flame, Utensils } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIRecommendation } from "@/lib/ai";

export default function Home() {
  const router = useRouter();
  const { destinations } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiRecs, setAiRecs] = useState<(typeof destinations[0] & { aiReview?: string })[]>([]);

  useEffect(() => {
    // Try to load last AI result from session
    const saved = sessionStorage.getItem("explore_ai_result");
    if (saved) {
      const parsed = JSON.parse(saved) as AIRecommendation[];
      const matched = parsed.map(res => {
        const d = destinations.find(x => x.id === res.destinationId);
        return d ? { ...d, aiReview: res.aiReview } : null;
      }).filter(Boolean) as any[];
      setAiRecs(matched);
    }
  }, [destinations]);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting logics
  const topRated = [...destinations].sort((a, b) => b.rating_and_reviews.average_rating - a.rating_and_reviews.average_rating).slice(0, 4);
  const mostPopular = [...destinations].sort((a, b) => b.rating_and_reviews.total_reviews - a.rating_and_reviews.total_reviews).slice(0, 4);
  const culinary = [...destinations].filter(d => d.categories.includes("Kuliner")).sort((a, b) => b.rating_and_reviews.average_rating - a.rating_and_reviews.average_rating).slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(filteredDestinations.length > 0) {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const DestinationCarousel = ({ title, icon: Icon, items, isAi = false }: { title: string, icon: any, items: any[], isAi?: boolean }) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${isAi ? 'text-[#EA580C]' : 'text-[#2563EB]'}`} /> {title}
        </h2>
      </div>
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 no-scrollbar snap-x">
        {items.map(dest => (
          <Link href={`/destination/${dest.id}`} key={dest.id} className="snap-start shrink-0 w-[240px]">
            <Card className={`h-full group ${isAi ? 'border-[#EA580C]/30 shadow-orange-100' : ''}`}>
              <div className="h-32 bg-gray-200 rounded-t-2xl relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${dest.interactive?.main_photo || 'https://dummyimage.com/300x200/ccc/000'})` }}>
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 text-gray-900">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" /> {dest.rating_and_reviews.average_rating}
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#2563EB]">{dest.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">{dest.categories.join(" • ")}</p>
                {isAi && dest.aiReview && (
                  <p className="text-[10px] text-[#EA580C] italic line-clamp-2 leading-tight bg-orange-50 p-1 rounded">"{dest.aiReview}"</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex-1 pb-20 bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] pt-16 pb-20 px-4 text-white rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/3 -translate-y-1/3">
          <Compass className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Explore Purwakarta</h1>
          <p className="text-blue-100 mb-6">Find your perfect destination.</p>
          
          <form onSubmit={handleSearchSubmit} className="relative mb-6 shadow-xl">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tempat (misal: 'Waduk', 'Sate', 'Curug')..." 
              className="w-full bg-white text-gray-900 rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#EA580C] shadow-sm"
            />
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563EB] px-4 py-2 rounded-xl text-white font-medium hover:bg-blue-700 transition-colors">
              Cari
            </button>
          </form>

          <Button 
            onClick={() => router.push('/wizard')}
            variant="accent" 
            fullWidth 
            className="py-4 text-lg shadow-lg shadow-orange-500/20 group"
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            Atur Rencana Perjalanan (AI)
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 pt-8 relative z-20 space-y-10">
        
        {/* Search Results */}
        {searchQuery && (
          <div id="search-results" className="scroll-mt-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#2563EB]" /> Hasil Pencarian
            </h2>
            <div className="flex flex-col gap-3">
              {filteredDestinations.length > 0 ? filteredDestinations.map((dest) => (
                <Link href={`/destination/${dest.id}`} key={dest.id}>
                  <Card className="hover:border-[#2563EB]/30 transition-all duration-300">
                    <CardContent className="flex gap-3 p-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${dest.interactive?.main_photo || 'https://dummyimage.com/150x150/ccc/000'})` }} />
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{dest.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{dest.categories.join(", ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )) : (
                <p className="text-gray-500 text-center py-4">Tidak ada tempat yang ditemukan.</p>
              )}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {!searchQuery && aiRecs.length > 0 && (
          <DestinationCarousel title="Rekomendasi AI Anda" icon={Sparkles} items={aiRecs} isAi={true} />
        )}

        {/* Top Rated Carousel */}
        {!searchQuery && (
          <DestinationCarousel title="Berdasarkan Rating" icon={Star} items={topRated} />
        )}

        {/* Mini Interactive Map */}
        {!searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Map className="w-5 h-5 text-[#059669]" /> Peta Destinasi</h2>
              <Button variant="outline" className="py-1 px-3 text-xs rounded-full h-auto">Buka Peta</Button>
            </div>
            <MiniMap />
          </div>
        )}

        {/* Popular Carousel */}
        {!searchQuery && (
          <DestinationCarousel title="Paling Populer" icon={Flame} items={mostPopular} />
        )}

        {/* Culinary Recommendations */}
        {!searchQuery && culinary.length > 0 && (
          <DestinationCarousel title="Rekomendasi Kuliner" icon={Utensils} items={culinary} />
        )}

      </div>
    </main>
  );
}
