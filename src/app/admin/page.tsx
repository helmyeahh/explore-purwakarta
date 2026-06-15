"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Save, Upload, MapPin, Lock } from "lucide-react";

// Dynamically import the PinDropMap with SSR disabled
const PinDropMap = dynamic(() => import("@/components/map/PinDropMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>,
});

const MOOD_TAGS = ["Healing", "Santai", "Keluarga", "Romantis", "Menikmati Sunset", "Petualangan", "Kuliner"];
const CATEGORIES = ["Alam", "Rekreasi Air", "Keluarga", "Sejarah", "Kuliner"];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [formData, setFormData] = useState({
    nama_tempat: "",
    deskripsi: "",
    kategori: [] as string[],
    mood_tags: [] as string[],
    alamat_lengkap: "",
    latitude: -6.538680,
    longitude: 107.443150,
    link_vr_360: "",
    jam_buka: "",
    jam_tutup: "",
    estimasi_harga_tiket: 0,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Incorrect password. Use 'admin123'");
  };

  const handleTagToggle = (tag: string, field: 'mood_tags' | 'kategori') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag) 
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const outputJson = {
      "id_tempat": `PWK-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      "nama_tempat": formData.nama_tempat,
      "kategori": formData.kategori,
      "deskripsi": formData.deskripsi,
      "lokasi": {
        "alamat_lengkap": formData.alamat_lengkap,
        "koordinat": {
          "latitude": formData.latitude,
          "longitude": formData.longitude
        }
      },
      "mood_tags": formData.mood_tags,
      "interaktif": {
        "link_vr_360": formData.link_vr_360,
        "foto_utama": "https://dummyimage.com/600x400/ccc/000",
        "galeri_foto": []
      },
      "informasi_kunjungan": {
        "jam_buka": formData.jam_buka,
        "jam_tutup": formData.jam_tutup,
        "estimasi_harga_tiket": Number(formData.estimasi_harga_tiket)
      },
      "rating_dan_review": {
        "rating_rata_rata": 0,
        "jumlah_review": 0
      }
    };

    console.log("JSON DATA GENERATED:", JSON.stringify(outputJson, null, 2));
    alert("Data berhasil disimpan! Cek console browser (F12) untuk melihat JSON.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4 text-[#2563EB]"><Lock className="w-12 h-12" /></div>
            <h1 className="text-xl font-bold text-center mb-6">Admin Dashboard</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" value="admin" disabled className="w-full bg-gray-100 border rounded-lg px-3 py-2 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="admin123" />
              </div>
              <Button type="submit" fullWidth>Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <h1 className="font-bold text-xl text-gray-900">Tambah Tempat Wisata</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">Informasi Dasar</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nama Tempat <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.nama_tempat} onChange={e => setFormData({...formData, nama_tempat: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2563EB] outline-none" placeholder="Contoh: Waduk Jatiluhur" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
                <textarea rows={3} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2563EB] outline-none" placeholder="Deskripsikan keunikan tempat ini..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">Kategori & Mood</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Kategori (Pilih minimal 1)</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className={`cursor-pointer px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${formData.kategori.includes(cat) ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                      <input type="checkbox" className="hidden" checked={formData.kategori.includes(cat)} onChange={() => handleTagToggle(cat, 'kategori')} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mood Tags (Checklist)</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map(tag => (
                    <label key={tag} className={`cursor-pointer px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${formData.mood_tags.includes(tag) ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                      <input type="checkbox" className="hidden" checked={formData.mood_tags.includes(tag)} onChange={() => handleTagToggle(tag, 'mood_tags')} />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">Lokasi & Peta</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                <input type="text" value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1"><MapPin className="w-4 h-4"/> Geser Pin untuk Menentukan Koordinat</label>
                <div className="h-64 mb-2">
                  <PinDropMap 
                    initialPosition={[formData.latitude, formData.longitude]} 
                    onPositionChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
                  />
                </div>
                <div className="flex gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span>Lat: {formData.latitude.toFixed(6)}</span>
                  <span>Lng: {formData.longitude.toFixed(6)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">Media & Operasional</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Link Google Street View (VR 360)</label>
                <input type="url" value={formData.link_vr_360} onChange={e => setFormData({...formData, link_vr_360: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://www.google.com/maps/embed?pb=..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Upload Foto Utama</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <span className="text-sm">Klik untuk upload file (.jpg, .png)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Buka</label>
                  <input type="time" value={formData.jam_buka} onChange={e => setFormData({...formData, jam_buka: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Tutup</label>
                  <input type="time" value={formData.jam_tutup} onChange={e => setFormData({...formData, jam_tutup: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estimasi Harga Tiket (Rp)</label>
                <input type="number" value={formData.estimasi_harga_tiket} onChange={e => setFormData({...formData, estimasi_harga_tiket: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="20000" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" variant="primary" icon={Save} fullWidth className="py-4 text-lg shadow-lg">
            Simpan Tempat Wisata
          </Button>
        </form>
      </main>
    </div>
  );
}
