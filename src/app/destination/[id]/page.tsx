"use client";

import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Clock, Banknote, Car, Droplets, MapPin, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const extractIframeSrc = (input: string) => {
  if (!input) return "";
  if (input.trim().toLowerCase().startsWith("<iframe")) {
    const match = input.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return match[1];
  }
  return input;
};
export default function DestinationPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { destinations, user, addReview } = useData();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const destination = destinations.find((d) => d.id === params.id);

  if (!destination) {
    return <div className="p-8 text-center">Destination not found.</div>;
  }

  const getFacilityIcon = (facility: string) => {
    const f = facility.toLowerCase();
    if (f.includes("parking")) return <Car className="w-4 h-4" />;
    if (f.includes("toilet") || f.includes("water")) return <Droplets className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const handleReviewSubmit = () => {
    if (!user) return;
    if (!reviewText.trim()) return;

    addReview(destination.id, {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userPhoto: user.picture,
      rating,
      text: reviewText,
      date: new Date().toLocaleDateString("id-ID")
    });
    
    setReviewText("");
    setShowReviewForm(false);
  };

  return (
    <main className="bg-[#F9FAFB] min-h-screen pb-24 font-sans">
      {/* Top Navbar Area for internal pages */}
      <nav className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-colors border border-white/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-serif tracking-widest text-sm uppercase drop-shadow-md">Explore Purwakarta</span>
        <div className="w-11" /> {/* Spacer */}
      </nav>

      {/* Header / VR 360 Box */}
      <section className="relative bg-forest-dark w-full aspect-4/3 md:aspect-21/9 overflow-hidden z-10">
        {destination.interactive?.vr_link ? (
          <iframe 
            src={extractIframeSrc(destination.interactive.vr_link)}
            className="w-full h-full border-0" 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full text-white/50 relative">
            <img src={destination.interactive?.main_photo || 'https://dummyimage.com/1200x800/ccc/000'} loading="lazy" decoding="async" className="absolute inset-0 object-cover w-full h-full" alt={destination.name} />
            <div className="bg-black/30 absolute inset-0 w-full h-full" />
          </div>
        )}
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white/90 text-xs font-medium flex items-center gap-2 pointer-events-none tracking-widest uppercase border border-white/20">
          Geser untuk 360° View
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* Title and Tags Card */}
        <Card className="mb-8 border-none shadow-xl bg-white rounded-none md:rounded-xl">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {destination.categories.map(cat => (
                    <span key={cat} className="text-[10px] font-bold tracking-wider text-green-700 uppercase border border-green-200 px-2 py-1 rounded-sm">
                      {cat}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1F15] leading-tight">{destination.name}</h1>
              </div>
              <div className="bg-forest-primary text-white px-4 py-2 rounded-lg text-lg font-bold flex items-center gap-2 shrink-0 shadow-lg">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                {destination.rating_and_reviews.average_rating}
              </div>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{destination.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {destination.mood_tags.map(tag => (
                <span key={tag} className="bg-gray-50 text-gray-600 text-xs font-medium px-4 py-2 rounded-full border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Essential Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-none shadow-sm rounded-xl">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-forest-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jam Operasional</p>
                <p className="text-lg font-serif font-bold text-[#0B1F15]">{destination.visit_info.open_hours} - {destination.visit_info.close_hours || "Selesai"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm rounded-xl">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-forest-primary shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimasi Biaya</p>
                <p className="text-lg font-serif font-bold text-[#0B1F15]">{destination.visit_info.estimated_price}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities & Distance */}
        <Card className="mb-12 border-none shadow-sm rounded-xl">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 md:divide-x divide-gray-100">
            <div className="flex-1 w-full md:px-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 md:text-center">Fasilitas Tersedia</p>
              <div className="flex md:justify-center gap-4 text-forest-primary">
                {destination.facilities?.map((f, i) => (
                  <div key={i} title={f} className="bg-gray-50 p-3 rounded-full border border-gray-100 hover:bg-green-50 transition-colors">
                    {getFacilityIcon(f)}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full md:px-6 md:text-center border-t md:border-t-0 pt-6 md:pt-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Jarak dari Anda</p>
              <div className="flex items-center md:justify-center gap-2 text-forest-primary font-serif font-bold text-2xl">
                <MapPin className="w-6 h-6 text-green-700" />
                {destination.distance || "5.0 km"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#0B1F15]">Ulasan Pengunjung</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{destination.rating_and_reviews.total_reviews} Ulasan</span>
          </div>
          
          <Card className="border-none shadow-sm rounded-xl mb-6">
            <CardContent className="p-8">
              {/* Reviews List */}
              <div className="space-y-8 mb-8">
                {destination.reviews?.map((review) => (
                  <div key={review.id} className="flex gap-5 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                    <img src={review.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}`} alt="User" className="w-12 h-12 rounded-full shrink-0 border border-gray-200" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <div className="flex text-yellow-400 mb-3">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Dummy Review if empty */}
                {(!destination.reviews || destination.reviews.length === 0) && (
                  <div className="flex gap-5 pb-8 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900">Budi Santoso</h4>
                        <span className="text-xs text-gray-400">Hari ini</span>
                      </div>
                      <div className="flex text-yellow-400 mb-3">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                      </div>
                      <p className="text-gray-600 leading-relaxed">Tempat yang luar biasa! Suasananya pas untuk liburan akhir pekan. Pasti kembali lagi ke sini bersama keluarga.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {user ? (
                showReviewForm ? (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-[#0B1F15] mb-4">Bagikan Pengalaman Anda</h4>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                          <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Ceritakan detail yang menarik..."
                      className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-forest-primary bg-white resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>Batal</Button>
                      <Button onClick={handleReviewSubmit} className="bg-forest-primary text-white hover:bg-forest-light">Kirim Ulasan</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)} fullWidth className="py-4 border-2 border-dashed border-gray-300 text-gray-500 hover:text-forest-primary hover:border-forest-primary hover:bg-green-50">
                    <MessageSquare className="w-5 h-5 mr-2" /> Tulis Pengalaman Anda
                  </Button>
                )
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-4">Silakan login terlebih dahulu untuk memberikan ulasan pada tempat ini.</p>
                  <div className="flex justify-center">
                    <GoogleLoginButton />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
