"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useData } from "@/contexts/DataContext";
import { Destination } from "@/lib/data";
import { 
  Save, Upload, MapPin, Lock, LayoutDashboard, Map as MapIcon, 
  MessageSquare, Tags, History, Trash2, Edit, Check, X 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

// Dynamically import the PinDropMap with SSR disabled
const PinDropMap = dynamic(() => import("@/components/map/PinDropMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>,
});

// Mock Analytics Data
const visitorData = [
  { name: "Mon", visitors: 4000 }, { name: "Tue", visitors: 3000 },
  { name: "Wed", visitors: 2000 }, { name: "Thu", visitors: 2780 },
  { name: "Fri", visitors: 1890 }, { name: "Sat", visitors: 6390 },
  { name: "Sun", visitors: 7490 },
];
const demographicData = [
  { name: "Jakarta", value: 60 }, { name: "Bandung", value: 20 },
  { name: "Purwakarta", value: 10 }, { name: "Lainnya", value: 10 },
];
const moodData = [
  { name: "Kuliner", value: 70 }, { name: "Keluarga", value: 45 },
  { name: "Healing", value: 30 }, { name: "Romantis", value: 20 },
];
const COLORS = ["#2563EB", "#059669", "#EA580C", "#9CA3AF"];

export default function AdminDashboard() {
  const { 
    destinations, addDestination, updateDestination, deleteDestination,
    categories, addCategory, removeCategory,
    moodTags, addMoodTag, removeMoodTag,
    logs
  } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // CRUD State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    nama_tempat: "", deskripsi: "", kategori: [] as string[], mood_tags: [] as string[],
    alamat_lengkap: "", latitude: -6.538680, longitude: 107.443150,
    link_vr_360: "", foto_utama: "", jam_buka: "08:00", jam_tutup: "17:00", estimasi_harga_tiket: 0,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [newCategory, setNewCategory] = useState("");
  const [newMoodTag, setNewMoodTag] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Incorrect password. Use 'admin123'");
  };

  const handleTagToggle = (tag: string, field: 'mood_tags' | 'kategori') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag) ? prev[field].filter(t => t !== tag) : [...prev[field], tag]
    }));
  };

  const editDest = (dest: Destination) => {
    setIsEditing(true);
    setEditingId(dest.id);
    setFormData({
      nama_tempat: dest.name, deskripsi: dest.description, kategori: dest.categories, mood_tags: dest.mood_tags,
      alamat_lengkap: dest.location.address, latitude: dest.location.coordinates.latitude, longitude: dest.location.coordinates.longitude,
      link_vr_360: dest.interactive?.vr_link || "", foto_utama: dest.interactive?.main_photo || "",
      jam_buka: dest.visit_info.open_hours, jam_tutup: dest.visit_info.close_hours || "17:00",
      estimasi_harga_tiket: Number(dest.visit_info.estimated_price) || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDest: Destination = {
      id: isEditing && editingId ? editingId : `PWK-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: formData.nama_tempat,
      categories: formData.kategori,
      description: formData.deskripsi,
      location: {
        address: formData.alamat_lengkap,
        coordinates: { latitude: formData.latitude, longitude: formData.longitude }
      },
      mood_tags: formData.mood_tags,
      interactive: {
        vr_link: formData.link_vr_360,
        main_photo: formData.foto_utama || "https://dummyimage.com/600x400/ccc/000",
      },
      visit_info: {
        open_hours: formData.jam_buka,
        close_hours: formData.jam_tutup,
        estimated_price: formData.estimasi_harga_tiket
      },
      rating_and_reviews: { average_rating: 4.0, total_reviews: 0 },
      facilities: ["Parking", "Toilet"],
      distance: "1.0 km"
    };

    if (isEditing && editingId) {
      updateDestination(editingId, newDest);
    } else {
      addDestination(newDest);
    }

    alert("Data berhasil disimpan!");
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4 text-[#2563EB]"><Lock className="w-12 h-12" /></div>
            <h1 className="text-xl font-bold text-center mb-6">Admin Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><h3 className="text-gray-500 text-sm">Pengunjung Hari Ini</h3><p className="text-2xl font-bold text-gray-900">7,490</p></CardContent></Card>
        <Card><CardContent className="p-4"><h3 className="text-gray-500 text-sm">Pengunjung Bulan Ini</h3><p className="text-2xl font-bold text-gray-900">124,500</p></CardContent></Card>
        <Card><CardContent className="p-4"><h3 className="text-gray-500 text-sm">Total Destinasi</h3><p className="text-2xl font-bold text-[#2563EB]">{destinations.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><h3 className="text-gray-500 text-sm">Review Menunggu</h3><p className="text-2xl font-bold text-[#EA580C]">5</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-bold mb-4">Traffic Pengunjung (Mingguan)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="visitors" stroke="#2563EB" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="font-bold mb-4">Demografi Asal Pengunjung (%)</h2>
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demographicData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {demographicData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="font-bold mb-4">Pencarian Mood Terpopuler</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCRUD = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <h2 className="font-bold text-lg mb-4">Daftar Tempat Wisata</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Nama Tempat</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map(dest => (
                  <tr key={dest.id} className="border-b">
                    <td className="px-4 py-3 font-medium text-gray-900">{dest.name}</td>
                    <td className="px-4 py-3">{dest.categories.join(", ")}</td>
                    <td className="px-4 py-3">{dest.rating_and_reviews.average_rating}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button onClick={() => editDest(dest)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => deleteDestination(dest.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-lg">{isEditing ? "Edit Tempat" : "Tambah Tempat Baru"}</h2>
              {isEditing && <Button type="button" variant="outline" onClick={() => {setIsEditing(false); setFormData(initialFormState);}}>Batal Edit</Button>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nama Tempat <span className="text-red-500">*</span></label>
              <input required type="text" value={formData.nama_tempat} onChange={e => setFormData({...formData, nama_tempat: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea rows={3} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <label key={cat} className={`cursor-pointer px-3 py-1.5 rounded-md border text-sm ${formData.kategori.includes(cat) ? 'bg-[#2563EB] text-white' : 'bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={formData.kategori.includes(cat)} onChange={() => handleTagToggle(cat, 'kategori')} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mood Tags</label>
              <div className="flex flex-wrap gap-2">
                {moodTags.map(tag => (
                  <label key={tag} className={`cursor-pointer px-3 py-1.5 rounded-md border text-sm ${formData.mood_tags.includes(tag) ? 'bg-[#059669] text-white' : 'bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={formData.mood_tags.includes(tag)} onChange={() => handleTagToggle(tag, 'mood_tags')} />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1"><MapPin className="w-4 h-4"/> Titik Koordinat Peta</label>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.latitude} 
                    onChange={e => setFormData({...formData, latitude: Number(e.target.value)})} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.longitude} 
                    onChange={e => setFormData({...formData, longitude: Number(e.target.value)})} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>

              <div className="h-64 mb-2">
                <PinDropMap 
                  position={[formData.latitude, formData.longitude]} 
                  onPositionChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
                />
              </div>
              <p className="text-xs text-gray-500">
                Anda dapat mengetik koordinat secara manual atau menggeser pin pada peta. Titik ini akan langsung tampil di Peta Homepage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Foto Utama URL</label>
                <input type="url" value={formData.foto_utama} onChange={e => setFormData({...formData, foto_utama: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link VR 360 (iframe src)</label>
                <input type="url" value={formData.link_vr_360} onChange={e => setFormData({...formData, link_vr_360: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" variant="primary" icon={Save} fullWidth className="py-4 text-lg">{isEditing ? "Simpan Perubahan" : "Simpan Tempat Baru"}</Button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h1 className="font-bold text-xl text-gray-900">Explore Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard className="w-5 h-5"/> Overview</button>
          <button onClick={() => setActiveTab("crud")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'crud' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'}`}><MapIcon className="w-5 h-5"/> Manajemen Tempat</button>
          <button onClick={() => setActiveTab("reviews")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'reviews' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'}`}><MessageSquare className="w-5 h-5"/> Moderasi Review</button>
          <button onClick={() => setActiveTab("tags")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'tags' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'}`}><Tags className="w-5 h-5"/> Kategori & Tag</button>
          <button onClick={() => setActiveTab("logs")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'logs' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'}`}><History className="w-5 h-5"/> Riwayat Aktivitas</button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "crud" && renderCRUD()}
        
        {activeTab === "reviews" && (
          <Card><CardContent className="p-5">
            <h2 className="font-bold text-lg mb-4">Antrean Review</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-xl flex justify-between items-center bg-gray-50">
                <div><p className="font-bold text-sm">"Tempatnya kotor dan pelayanannya buruk!" - Anonymous</p><p className="text-xs text-red-500">Flagged for negative sentiment</p></div>
                <div className="flex gap-2"><Button variant="outline" className="px-3"><Check className="w-4 h-4 text-green-600"/></Button><Button variant="outline" className="px-3"><X className="w-4 h-4 text-red-600"/></Button></div>
              </div>
            </div>
          </CardContent></Card>
        )}

        {activeTab === "tags" && (
          <div className="space-y-6">
            <Card><CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg">Manajemen Kategori</h2>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <span key={cat} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">{cat} <button onClick={() => removeCategory(cat)}><X className="w-3 h-3 text-red-500"/></button></span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm"><input type="text" value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="border rounded-lg px-3 py-2 flex-1" placeholder="Kategori baru"/><Button onClick={() => {if(newCategory) {addCategory(newCategory); setNewCategory("")}}}>Tambah</Button></div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h2 className="font-bold text-lg">Manajemen Mood Tags</h2>
              <div className="flex gap-2 flex-wrap">
                {moodTags.map(tag => (
                  <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{tag} <button onClick={() => removeMoodTag(tag)}><X className="w-3 h-3 text-red-500"/></button></span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm"><input type="text" value={newMoodTag} onChange={e=>setNewMoodTag(e.target.value)} className="border rounded-lg px-3 py-2 flex-1" placeholder="Mood baru"/><Button onClick={() => {if(newMoodTag) {addMoodTag(newMoodTag); setNewMoodTag("")}}}>Tambah</Button></div>
            </CardContent></Card>
          </div>
        )}

        {activeTab === "logs" && (
          <Card><CardContent className="p-5">
            <h2 className="font-bold text-lg mb-4">Riwayat Sistem</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => <div key={i} className="p-2 bg-gray-50 border-b">{log}</div>)}
              {logs.length === 0 && <p className="text-gray-500">Belum ada aktivitas.</p>}
            </div>
          </CardContent></Card>
        )}
      </main>
    </div>
  );
}
