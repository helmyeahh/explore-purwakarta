"use client";

import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  LayoutDashboard, ClipboardCheck, Users, LogOut, 
  Eye, CheckCircle2, XCircle, Mountain, ClipboardList, PlusCircle, MessageSquare, Search, Trash2, Edit, ShieldAlert
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function GCRPage() {
  const { 
    destinations, 
    pendingContributions, 
    approveContribution, 
    rejectContribution,
    updateDestination,
    deleteDestination,
    addDestination,
    categories,
    moodTags,
    admins,
    loggedAdmin,
    loginAdmin,
    logoutAdmin,
    addAdmin,
    deleteAdmin
  } = useData();
  
  // Login State
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "moderation" | "users">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection & Mode State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"none" | "review_pending" | "edit_published" | "create_new">("none");

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    coordinates: "",
    main_photo: "",
    vr_link: "",
    selectedCategories: [] as string[],
    selectedMoods: [] as string[]
  });

  // Admin Form State
  const [newAdminForm, setNewAdminForm] = useState({ username: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.username === loginForm.username && a.password === loginForm.password);
    if (admin) {
      loginAdmin(admin);
      setLoginError("");
    } else {
      setLoginError("Username atau password salah.");
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminForm.username && newAdminForm.password) {
      addAdmin({
        id: `admin-${Date.now()}`,
        username: newAdminForm.username,
        password: newAdminForm.password
      });
      setNewAdminForm({ username: "", password: "" });
    }
  };

  // Calculate total reviews using actual data
  const totalReviews = destinations.reduce((sum, dest) => sum + (dest.rating_and_reviews?.total_reviews || 0), 0);

  // Combine and filter data
  const combinedData = useMemo(() => {
    const pending = pendingContributions.map(d => ({ ...d, adminStatus: "pending" as const }));
    const published = destinations.map(d => ({ ...d, adminStatus: "published" as const }));
    let all = [...pending, ...published];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(d => d.name.toLowerCase().includes(q) || d.categories.some(c => c.toLowerCase().includes(q)));
    }
    return all;
  }, [destinations, pendingContributions, searchQuery]);

  const selectedItem = combinedData.find(c => c.id === selectedItemId);

  const handleSelectToReview = (id: string) => {
    const item = pendingContributions.find(c => c.id === id);
    if (item) {
      setSelectedItemId(id);
      setEditMode("review_pending");
      setEditForm({
        name: item.name,
        description: item.description,
        coordinates: `${item.location.coordinates.latitude}, ${item.location.coordinates.longitude}`,
        main_photo: item.interactive?.main_photo || "",
        vr_link: item.interactive?.vr_link || "",
        selectedCategories: item.categories || [],
        selectedMoods: item.mood_tags || []
      });
    }
  };

  const handleSelectToEdit = (id: string) => {
    const item = destinations.find(c => c.id === id);
    if (item) {
      setSelectedItemId(id);
      setEditMode("edit_published");
      setEditForm({
        name: item.name,
        description: item.description,
        coordinates: `${item.location.coordinates.latitude}, ${item.location.coordinates.longitude}`,
        main_photo: item.interactive?.main_photo || "",
        vr_link: item.interactive?.vr_link || "",
        selectedCategories: item.categories || [],
        selectedMoods: item.mood_tags || []
      });
    }
  };

  const handleCreateNew = () => {
    setSelectedItemId(null);
    setEditMode("create_new");
    setEditForm({
      name: "",
      description: "",
      coordinates: "",
      main_photo: "",
      vr_link: "",
      selectedCategories: [],
      selectedMoods: []
    });
  };

  const toggleCategory = (cat: string) => {
    setEditForm(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(cat) 
        ? prev.selectedCategories.filter(c => c !== cat)
        : [...prev.selectedCategories, cat]
    }));
  };

  const toggleMood = (mood: string) => {
    setEditForm(prev => ({
      ...prev,
      selectedMoods: prev.selectedMoods.includes(mood) 
        ? prev.selectedMoods.filter(m => m !== mood)
        : [...prev.selectedMoods, mood]
    }));
  };

  const handleSave = () => {
    const editPayload = {
      name: editForm.name,
      description: editForm.description,
      categories: editForm.selectedCategories,
      mood_tags: editForm.selectedMoods,
      location: {
        address: selectedItem?.location?.address || "Purwakarta",
        coordinates: {
          latitude: parseFloat(editForm.coordinates.split(',')[0]) || -6.55,
          longitude: parseFloat(editForm.coordinates.split(',')[1]) || 107.44
        }
      },
      interactive: {
        ...selectedItem?.interactive,
        main_photo: editForm.main_photo,
        vr_link: editForm.vr_link
      }
    };

    if (editMode === "review_pending" && selectedItemId) {
      approveContribution(selectedItemId, editPayload as any);
    } else if (editMode === "edit_published" && selectedItemId && selectedItem) {
      updateDestination(selectedItemId, {
        ...selectedItem,
        ...editPayload
      } as any);
    } else if (editMode === "create_new") {
      const newId = `PWK-NEW-${Date.now()}`;
      addDestination({
        id: newId,
        ...editPayload,
        visit_info: { open_hours: "08:00", estimated_price: 0 },
        rating_and_reviews: { average_rating: 0, total_reviews: 0 },
        facilities: []
      } as any);
    }
    
    setEditMode("none");
    setSelectedItemId(null);
  };

  const handleDelete = (id: string, isPending: boolean) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) {
      if (isPending) {
        rejectContribution(id);
      } else {
        deleteDestination(id);
      }
      if (selectedItemId === id) {
        setEditMode("none");
        setSelectedItemId(null);
      }
    }
  };

  // If NOT Logged In
  if (!loggedAdmin) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <ShieldAlert className="w-12 h-12 text-forest-primary mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-bold text-[#0B1F15]">Admin Access Only</h1>
              <p className="text-gray-500 text-sm mt-2">Silakan masukkan kredensial Anda untuk melanjutkan ke Grand Control Room (GCR).</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-primary focus:outline-none"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              
              <Button type="submit" className="w-full bg-forest-primary hover:bg-forest-dark text-white py-6 mt-4">
                Masuk ke GCR
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-forest-primary transition-colors">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Logged In
  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white p-6 shrink-0 md:min-h-screen border-r border-gray-100 flex flex-col">
        <div className="mb-10">
          <h1 className="font-serif font-bold text-2xl tracking-tight text-forest-primary leading-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> GCR
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-1">Grand Control Room</p>
          <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600">Logged as <strong className="text-forest-primary">{loggedAdmin.username}</strong></span>
          </div>
        </div>
        
        <nav className="space-y-1">
          <button 
            onClick={() => { setActiveTab("dashboard"); setEditMode("none"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "dashboard" ? 'bg-[#EAF3EE] text-forest-primary' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> 
            Dashboard
          </button>
          
          <button 
            onClick={() => { setActiveTab("moderation"); setEditMode("none"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "moderation" ? 'bg-[#EAF3EE] text-forest-primary' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Moderasi Destinasi
            {pendingContributions.length > 0 && (
              <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{pendingContributions.length}</span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab("users"); setEditMode("none"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all ${activeTab === "users" ? 'bg-[#EAF3EE] text-forest-primary' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users className="w-5 h-5" />
            Kelola Admin
          </button>
        </nav>

        <div className="mt-auto pt-10 border-t border-gray-100">
          <button onClick={logoutAdmin} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#0B1F15] mb-2">
            {activeTab === "dashboard" ? "Dashboard Overview" : 
             activeTab === "moderation" ? "Pengelolaan & Moderasi Destinasi" : "Manajemen Admin"}
          </h2>
          <p className="text-gray-500">
            {activeTab === "dashboard" ? "Welcome back, Admin. Here's what's happening today." : 
             activeTab === "moderation" ? "Pusat kontrol seluruh data tempat wisata di Purwakarta." : "Kelola akses login untuk Grand Control Room."}
          </p>
        </header>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-700">
                    <Mountain className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Destinasi</p>
                <h3 className="text-3xl font-serif font-bold text-[#0B1F15]">{destinations.length}</h3>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden relative">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-orange-500" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Menunggu Moderasi</p>
                <h3 className="text-3xl font-serif font-bold text-[#0B1F15]">{pendingContributions.length}</h3>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Kontribusi Baru (Minggu Ini)</p>
                <h3 className="text-3xl font-serif font-bold text-[#0B1F15]">{(pendingContributions.length || 0) + 2}</h3>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Review</p>
                <h3 className="text-3xl font-serif font-bold text-[#0B1F15]">{totalReviews.toLocaleString()}</h3>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === "moderation" && (
          <>
            {editMode === "none" ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari destinasi atau kategori..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-primary focus:outline-none"
                />
              </div>
              <Button className="bg-forest-primary hover:bg-forest-dark shrink-0" onClick={handleCreateNew}>
                <PlusCircle className="w-4 h-4 mr-2" /> Tambah Destinasi
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-10">
              <div className="overflow-auto max-h-[65vh]">
                <table className="w-full text-sm text-left relative">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold">Nama Tempat</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Kontributor</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {combinedData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">Tidak ada data ditemukan.</td>
                      </tr>
                    ) : (
                      combinedData.map((item) => (
                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedItemId === item.id ? 'bg-[#EAF3EE]/50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0"><img src={item.interactive?.main_photo || 'https://dummyimage.com/100x100'} loading="lazy" decoding="async" className="object-cover w-full h-full" alt={item.name} /></div>
                              <span className="font-bold text-[#0B1F15]">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.adminStatus === "pending" ? (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">Pending</span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">Published</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{item.submittedBy || "Admin / Sistem"}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              {item.adminStatus === "pending" ? (
                                <>
                                  <button onClick={() => handleSelectToReview(item.id)} className="text-blue-500 hover:text-blue-700" title="Review">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(item.id, true)} className="text-red-500 hover:text-red-700" title="Tolak">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleSelectToEdit(item.id)} className="text-gray-500 hover:text-gray-900" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(item.id, false)} className="text-red-500 hover:text-red-700" title="Hapus">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            ) : (
            /* Active Moderation / Edit Screen */
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90">
                  <h3 className="text-xl font-serif font-bold text-[#0B1F15]">
                    {editMode === "review_pending" ? "Moderasi Draf: " + selectedItem?.name : 
                     editMode === "edit_published" ? "Edit Destinasi: " + selectedItem?.name : 
                     "Buat Destinasi Baru"}
                  </h3>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100 font-bold" onClick={() => setEditMode("none")}>
                      &larr; Kembali
                    </Button>
                    <Button className="bg-forest-primary hover:bg-forest-dark text-white font-bold" onClick={handleSave}>
                      {editMode === "review_pending" ? "Setujui & Publikasi" : "Simpan Perubahan"}
                    </Button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${editMode === "review_pending" ? "xl:grid-cols-2" : ""} gap-0 items-stretch`}>
                  
                  {/* Left Side: USER DRAFT (Only for review) */}
                  {editMode === "review_pending" && selectedItem && (
                    <div className="p-6 md:p-8 border-b xl:border-b-0 xl:border-r border-gray-100 bg-gray-50/30">
                      <div className="flex items-center gap-3 mb-8">
                        <h4 className="font-bold text-gray-500 tracking-widest uppercase text-sm">USER DRAFT</h4>
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">Pending Review</span>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Title</label>
                          <div className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-gray-600 font-medium">
                            {selectedItem.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Description</label>
                          <div className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-gray-600 leading-relaxed min-h-[120px]">
                            {selectedItem.description}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">Location</label>
                          <div className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-gray-600">
                            {selectedItem.location.coordinates.latitude}, {selectedItem.location.coordinates.longitude}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Side: ADMIN EDIT */}
                  <div className="p-6 md:p-8 relative overflow-hidden bg-white">
                    {editMode === "review_pending" && <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />}
                    <div className="flex items-center gap-3 mb-8">
                      <h4 className="font-bold text-forest-primary tracking-widest uppercase text-sm">
                        {editMode === "review_pending" ? "ADMIN EDIT / LIVE PREVIEW" : "INFORMASI DESTINASI"}
                      </h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Title</label>
                          <input 
                            type="text" 
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0B1F15] font-bold focus:ring-2 focus:ring-forest-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Description</label>
                          <textarea 
                            value={editForm.description}
                            onChange={e => setEditForm({...editForm, description: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0B1F15] leading-relaxed min-h-[120px] focus:ring-2 focus:ring-forest-primary focus:outline-none transition-all resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">URL Foto Utama</label>
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={editForm.main_photo}
                            onChange={e => setEditForm({...editForm, main_photo: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0B1F15] focus:ring-2 focus:ring-forest-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-2">URL Embed Google Street View</label>
                          <input 
                            type="text" 
                            placeholder="<iframe src='...' />"
                            value={editForm.vr_link}
                            onChange={e => setEditForm({...editForm, vr_link: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0B1F15] focus:ring-2 focus:ring-forest-primary focus:outline-none transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-2">Titik Koordinat (Latitude, Longitude)</label>
                          <input 
                            type="text" 
                            value={editForm.coordinates}
                            onChange={e => setEditForm({...editForm, coordinates: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0B1F15] focus:ring-2 focus:ring-forest-primary focus:outline-none transition-all"
                            placeholder="-6.540649870774661, 107.44176248680495"
                          />
                        </div>

                        {/* Pills Selection */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-3">Kategori Minat</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                  editForm.selectedCategories.includes(cat)
                                    ? "bg-forest-primary border-forest-primary text-white"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-3">Suasana (Mood)</label>
                          <div className="flex flex-wrap gap-2">
                            {moodTags.map(mood => (
                              <button
                                key={mood}
                                onClick={() => toggleMood(mood)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                  editForm.selectedMoods.includes(mood)
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                {mood}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Users / Kelola Admin Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-serif font-bold text-xl text-[#0B1F15] mb-4">Tambahkan Admin Baru</h3>
                <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Username</label>
                    <input 
                      type="text" 
                      value={newAdminForm.username}
                      onChange={e => setNewAdminForm({...newAdminForm, username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Password</label>
                    <input 
                      type="password" 
                      value={newAdminForm.password}
                      onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest-primary focus:outline-none"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-forest-primary hover:bg-forest-dark shrink-0 w-full md:w-auto h-10">
                    <PlusCircle className="w-4 h-4 mr-2" /> Tambah Admin
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 font-bold">Username Admin</th>
                    <th className="px-6 py-4 font-bold">Password (Disembunyikan)</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0B1F15] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                        {admin.username}
                        {admin.username === loggedAdmin.username && (
                          <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">••••••••</td>
                      <td className="px-6 py-4 text-right">
                        {admin.username !== 'heru' && admin.id !== loggedAdmin.id && (
                          <button onClick={() => deleteAdmin(admin.id)} className="text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
