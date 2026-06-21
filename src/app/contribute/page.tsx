"use client";

import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { MapPin, Image as ImageIcon, Info, ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContributePage() {
  const router = useRouter();
  const { user, addContribution } = useData();
  const [formData, setFormData] = useState({
    name: "",
    category: "Alam",
    description: "",
    price: "",
    coordinates: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Silakan login terlebih dahulu");

    addContribution({
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      categories: [formData.category],
      location: {
        address: "Purwakarta", // Default
        coordinates: {
          latitude: parseFloat(formData.coordinates.split(',')[0]) || -6.556,
          longitude: parseFloat(formData.coordinates.split(',')[1]) || 107.443,
        }
      },
      visit_info: {
        open_hours: "08:00",
        close_hours: "17:00",
        estimated_price: formData.price,
      },
      submittedBy: user.name,
      status: "pending",
      interactive: {
        main_photo: "https://dummyimage.com/600x400/ccc/000",
        gallery: []
      },
      facilities: [],
      mood_tags: [],
      rating_and_reviews: {
        average_rating: 0,
        total_reviews: 0
      }
    });

    alert("Terima kasih! Kontribusi Anda sedang menunggu persetujuan Admin.");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans pb-24 relative">
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-500 hover:text-[#0B1F15] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-[#0B1F15] font-serif tracking-widest text-sm uppercase">Community</span>
        <div className="w-20" />
      </nav>

      {/* Header */}
      <section className="bg-forest-dark pt-32 pb-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-forest-primary to-forest-dark opacity-80" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Send className="w-6 h-6 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Bagikan Tempat Favoritmu</h1>
          <p className="text-gray-300 font-light">Bantu kami memperkaya panduan Explore Purwakarta dengan merekomendasikan destinasi yang belum ada di daftar kami.</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
        {!user ? (
          <Card className="text-center p-12 border-none shadow-xl rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#0B1F15] mb-2">Login Diperlukan</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Anda harus masuk dengan akun Google untuk dapat mengirimkan kontribusi tempat baru. Ini membantu kami menjaga kualitas data.</p>
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
          </Card>
        ) : (
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gray-50 p-6 md:p-8 border-b border-gray-100 flex items-center gap-4">
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border border-gray-200" />
                <div>
                  <p className="text-sm text-gray-500">Berkontribusi sebagai</p>
                  <p className="font-bold text-[#0B1F15]">{user.name}</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nama Tempat</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white transition-shadow" 
                    placeholder="Contoh: Sate Maranggi Haji Yetty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Kategori Utama</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white appearance-none"
                  >
                    <option>Alam</option>
                    <option>Sejarah</option>
                    <option>Kuliner</option>
                    <option>Keluarga</option>
                    <option>Rekreasi Air</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Deskripsi Singkat</label>
                  <textarea 
                    required 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white resize-none" 
                    rows={4}
                    placeholder="Ceritakan keunikan tempat ini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Titik Koordinat (Latitude, Longitude)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.coordinates}
                      onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                      className="w-full pl-12 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white" 
                      placeholder="-6.540649870774661, 107.44176248680495"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Estimasi Harga (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white" 
                    placeholder="Contoh: Rp 20.000 / Gratis"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" fullWidth className="bg-forest-primary text-white hover:bg-forest-light py-4 rounded-xl text-lg shadow-lg">
                    Kirim Kontribusi
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-4">Data yang dikirim akan ditinjau oleh Admin sebelum ditampilkan ke publik.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
