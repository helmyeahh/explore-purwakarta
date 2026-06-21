"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MiniMap } from "@/components/map/MiniMap";
import { useData } from "@/contexts/DataContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Search, MapPin, Navigation, Star, Sparkles, Map, Flame, Utensils, Mountain, Droplets, HeartPulse, History, Filter, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIRecommendation } from "@/lib/ai";
import { calculateDistance } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  "Alam": Mountain,
  "Rekreasi Air": Droplets,
  "Keluarga": HeartPulse,
  "Sejarah": History,
  "Kuliner": Utensils,
};

export default function Home() {
  const router = useRouter();
  const { destinations, categories } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Jarak" | "Harga" | "Rating" | "Populer" | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [aiRecs, setAiRecs] = useState<(typeof destinations[0] & { aiReview?: string })[]>([]);

  useEffect(() => {
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

  const handleFilterClick = (filter: "Jarak" | "Harga" | "Rating" | "Populer") => {
    if (filter === "Jarak" && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setActiveFilter("Jarak");
          },
          (err) => {
            alert("Izin lokasi dibutuhkan untuk filter Jarak.");
            console.error(err);
          }
        );
      } else {
        alert("Geolocation tidak didukung di browser ini.");
      }
    } else {
      setActiveFilter(activeFilter === filter ? null : filter);
    }
  };

  const { filteredDestinations, topRated, mostPopular, nearest } = React.useMemo(() => {
    let filtered = destinations.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.categories || []).some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (userLocation) {
      filtered = filtered.map(d => ({
        ...d,
        calculatedDistance: calculateDistance(userLocation.lat, userLocation.lon, d.location.coordinates.latitude, d.location.coordinates.longitude)
      }));
    }

    if (activeFilter === "Rating") {
      filtered.sort((a, b) => (b.rating_and_reviews?.average_rating || 0) - (a.rating_and_reviews?.average_rating || 0));
    } else if (activeFilter === "Populer") {
      filtered.sort((a, b) => (b.rating_and_reviews?.total_reviews || 0) - (a.rating_and_reviews?.total_reviews || 0));
    } else if (activeFilter === "Jarak" && userLocation) {
      filtered.sort((a: any, b: any) => a.calculatedDistance - b.calculatedDistance);
    } else if (activeFilter === "Harga") {
      filtered.sort((a, b) => {
        const priceA = typeof a.visit_info?.estimated_price === 'number' ? a.visit_info.estimated_price : 0;
        const priceB = typeof b.visit_info?.estimated_price === 'number' ? b.visit_info.estimated_price : 0;
        return priceA - priceB;
      });
    }

    const tr = [...destinations].sort((a, b) => (b.rating_and_reviews?.average_rating || 0) - (a.rating_and_reviews?.average_rating || 0)).slice(0, 4);
    const mp = [...destinations].sort((a, b) => (b.rating_and_reviews?.total_reviews || 0) - (a.rating_and_reviews?.total_reviews || 0)).slice(0, 4);
    const nr = userLocation ? [...filtered].sort((a: any, b: any) => a.calculatedDistance - b.calculatedDistance).slice(0, 4) : [];

    return { filteredDestinations: filtered.slice(0, 24), topRated: tr, mostPopular: mp, nearest: nr };
  }, [destinations, searchQuery, activeFilter, userLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(filteredDestinations.length > 0) {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const DestinationCarousel = ({ title, items, showDistance = false }: { title: string, items: any[], showDistance?: boolean }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-[#0B1F15]">{title}</h2>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider">LIHAT SEMUA</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(dest => (
          <Link href={`/destination/${dest.id}`} key={dest.id} className="group">
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 rounded-2xl bg-white p-3 flex flex-col">
              <div className="h-40 rounded-xl overflow-hidden relative mb-3 shrink-0">
                <img src={dest.interactive?.main_photo || 'https://dummyimage.com/600x400/ccc/000'} loading="lazy" decoding="async" className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" alt={dest.name} />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-[#0B1F15] shadow-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> {dest.rating_and_reviews?.average_rating || 0}
                </div>
              </div>
              <div className="px-1 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold tracking-wider text-green-700 uppercase flex items-center gap-1">
                    {dest.categories?.[0] && categoryIcons[dest.categories[0]] && React.createElement(categoryIcons[dest.categories[0]], { className: "w-3 h-3" })}
                    {dest.categories?.[0] || "Umum"}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#0B1F15] mb-1.5 group-hover:text-green-800 transition-colors line-clamp-1">{dest.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{dest.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-[#0B1F15]">Mulai Rp {Number(dest.visit_info?.estimated_price || 0).toLocaleString('id-ID')}</span>
                  {showDistance && dest.calculatedDistance !== undefined ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {dest.calculatedDistance.toFixed(1)} km</span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {dest.distance || "5km"}</span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Top Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 lg:px-12 py-6 flex items-center justify-between text-white border-b border-white/10">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Explore Purwakarta</h1>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium opacity-90">
          <Link href="/" className="hover:opacity-100 border-b border-white pb-1">Discovery</Link>
          <Link href="/wizard" className="hover:opacity-100">AI Planner</Link>
          <Link href="/map" className="hover:opacity-100">Interactive Map</Link>
          <Link href="/contribute" className="hover:opacity-100">Community</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block"><GoogleLoginButton /></div>
          <Button onClick={() => router.push('/wizard')} className="bg-forest-primary hover:bg-forest-light text-white border border-white/20 rounded-full px-6 py-2 text-sm shadow-none">Plan Trip</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-48 px-4 text-white overflow-hidden bg-forest-primary">
        {/* Subtle Background Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-forest-dark via-forest-primary to-forest-dark opacity-90" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Circular Gold Icon Placeholder */}
          <div className="w-12 h-12 rounded-full border border-yellow-400/30 flex items-center justify-center mb-8">
            <Compass className="w-6 h-6 text-yellow-400" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight">
            Temukan Purwakarta<br/>Sesuai Mood-mu
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 font-light">
            Jelajahi keindahan alam, kekayaan sejarah, dan cita rasa autentik. Mulai petualanganmu hari ini.
          </p>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative mb-6">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tempat (misal: 'Waduk', 'Sate')..." 
              className="w-full bg-white text-gray-900 rounded-full px-6 py-4 pl-12 sm:pl-14 pr-24 sm:pr-32 focus:outline-none focus:ring-2 focus:ring-green-800 shadow-xl"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-forest-primary px-5 sm:px-8 py-2 sm:py-2.5 rounded-full text-white text-sm sm:text-base font-medium hover:bg-forest-light transition-colors">
              Cari
            </button>
          </form>

          {/* Filters */}
          <div className="flex gap-3 justify-center mb-12">
            {["Jarak", "Harga", "Rating", "Populer"].map((filter) => (
              <button 
                key={filter}
                type="button"
                onClick={() => handleFilterClick(filter as any)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-2 ${activeFilter === filter ? 'bg-white text-forest-primary border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                {filter === "Jarak" && <MapPin className="w-3.5 h-3.5" />}
                {filter === "Rating" && <Star className="w-3.5 h-3.5" />}
                {filter === "Populer" && <Flame className="w-3.5 h-3.5" />}
                {filter}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-6">Eksplorasi Kategori</p>
          <div className="flex justify-center gap-8 md:gap-16">
            {categories.slice(0, 5).map(cat => {
              const Icon = categoryIcons[cat] || MapPin;
              return (
                <button 
                  key={cat} 
                  onClick={() => setSearchQuery(cat)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-300">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20 pb-24">
        
        {/* Overlapping Call to Action */}
        <div className="-mt-16 mb-20">
          <Card className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-none flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
            <div>
              <h3 className="text-3xl font-serif font-bold text-[#0B1F15] mb-3">Siap Menjelajahi Pesona Purwakarta?</h3>
              <p className="text-gray-500 max-w-xl">Biarkan AI kami merancang rencana perjalanan yang sempurna untukmu, mulai dari kuliner legendaris hingga alam yang menenangkan.</p>
            </div>
            <Button onClick={() => router.push('/wizard')} className="bg-forest-primary hover:bg-forest-light rounded-full px-8 py-4 shrink-0 shadow-xl shadow-green-900/20">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" /> Mulai Rencana Pintar Anda
            </Button>
          </Card>
        </div>

        {/* Search Results */}
        {(searchQuery || activeFilter) && (
          <div id="search-results" className="scroll-mt-24 mb-16">
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#0B1F15] flex items-center gap-3">
              <Search className="w-6 h-6 text-green-700" /> Hasil Pencarian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDestinations.length > 0 ? filteredDestinations.map((dest: any) => (
                <Link href={`/destination/${dest.id}`} key={dest.id}>
                  <Card className="h-full border-none shadow-sm hover:shadow-md transition-all rounded-xl p-3 flex flex-col gap-3">
                    <div className="h-32 rounded-lg bg-gray-200 overflow-hidden shrink-0"><img src={dest.interactive?.main_photo || 'https://dummyimage.com/300x200/ccc/000'} loading="lazy" decoding="async" className="object-cover w-full h-full" alt={dest.name} /></div>
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 line-clamp-1">{dest.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{(dest.categories || []).join(", ")}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                        <span className="text-xs font-bold text-yellow-600 flex items-center"><Star className="w-3 h-3 fill-current mr-1" />{dest.rating_and_reviews?.average_rating || 0}</span>
                        {dest.calculatedDistance !== undefined && (
                          <span className="text-xs text-gray-500 font-medium flex items-center"><Navigation className="w-3 h-3 mr-1" />{dest.calculatedDistance.toFixed(1)} km</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              )) : (
                <p className="text-gray-500 text-center py-8 col-span-full">Tidak ada tempat yang ditemukan.</p>
              )}
            </div>
          </div>
        )}

        {/* Categories / Sections */}
        {!(searchQuery || activeFilter) && (
          <>
            {aiRecs.length > 0 ? (
              <DestinationCarousel title="Rekomendasi AI Khusus Untukmu" items={aiRecs} />
            ) : (
              <DestinationCarousel title="Cocok dengan mood alam-mu" items={destinations.filter(d => d.categories.includes("Alam")).slice(0, 4)} />
            )}

            <DestinationCarousel title="Paling Hits di Purwakarta" items={mostPopular} />
            
            {nearest.length > 0 && (
              <DestinationCarousel title="Terdekat dari Lokasimu" items={nearest} showDistance={true} />
            )}

            {/* Terdekat Simple Cards (Based on design) */}
            <div className="mb-16">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F15] mb-6">Terdekat dari Lokasimu</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Curug Cipurut", dist: "1.2 km", icon: Mountain },
                  { name: "Taman Sri Baduga", dist: "2.5 km", icon: MapPin },
                  { name: "Pusat Kuliner", dist: "3.0 km", icon: Utensils },
                  { name: "Museum Diorama", dist: "3.8 km", icon: History }
                ].map((item, i) => (
                  <Card key={i} className="p-6 text-center hover:border-green-700 transition-colors cursor-pointer rounded-xl">
                    <item.icon className="w-8 h-8 mx-auto mb-3 text-[#0B1F15]" />
                    <h4 className="font-bold text-sm text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.dist} dari Anda</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Rating Tertinggi Simple Cards */}
            <div className="mb-16">
              <h2 className="text-2xl font-serif font-bold text-[#0B1F15] mb-6">Rating Tertinggi di Sekitarmu</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topRated.slice(0, 3).map(dest => (
                  <Card key={dest.id} className="p-4 flex items-center gap-4 hover:border-green-700 cursor-pointer rounded-full">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0"><img src={dest.interactive?.main_photo || 'https://dummyimage.com/100x100/ccc/000'} loading="lazy" decoding="async" className="object-cover w-full h-full" alt={dest.name} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-yellow-600 flex items-center"><Star className="w-3 h-3 fill-current mr-0.5" />{dest.rating_and_reviews?.average_rating || 0}</span>
                        <span className="text-[10px] text-gray-400">({dest.rating_and_reviews?.total_reviews || 0} ulasan)</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-gray-900 mb-0.5">{dest.name}</h4>
                      <p className="text-xs text-gray-500">{dest.categories?.[0] || "Umum"} • 1.2km</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#0B1F15]">Eksplorasi Peta</h2>
                <Link href="/map" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider">BUKA PETA PENUH</Link>
              </div>
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative">
                <MiniMap />
                <div className="absolute bottom-6 right-6 z-20">
                  <Button onClick={() => router.push('/map')} className="bg-forest-primary rounded-full px-6 text-sm hover:bg-forest-light shadow-lg"><Map className="w-4 h-4 mr-2" /> Buka Peta Penuh</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Placeholder */}
      <footer className="bg-forest-primary text-white py-16 px-6 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">Explore<br/>Purwakarta</h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">© 2024 Pesona Purwakarta Tourism. Explore the heart of West Java.</p>
          </div>
          <div className="flex gap-12 text-sm text-gray-300">
            <div className="flex flex-col gap-3"><span className="text-white font-medium mb-1">Destinations</span></div>
            <div className="flex flex-col gap-3"><span className="text-white font-medium mb-1">Travel Guides</span></div>
            <div className="flex flex-col gap-3"><span className="text-white font-medium mb-1">Local Wisdom</span></div>
            <div className="flex flex-col gap-3"><span className="text-white font-medium mb-1">Contact Support</span></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
