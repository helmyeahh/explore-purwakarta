"use client";

import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, User as UserIcon, Medal, Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, setUser } = useData();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">Anda harus login untuk melihat halaman ini.</p>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  const handleSave = () => {
    setUser({ ...user, name: newName });
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-lake-blue text-white p-4 pb-12 rounded-b-[30px]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white/20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profil Saya</h1>
        </div>
        
        <div className="flex flex-col items-center mt-4">
          <img 
            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white mb-3"
          />
          {isEditing ? (
            <div className="flex flex-col items-center gap-2">
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="text-gray-900 px-3 py-1 rounded text-center font-bold"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Simpan</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {user.name} 
                <button onClick={() => setIsEditing(true)} className="text-sm text-blue-200 underline">Edit</button>
              </h2>
              <p className="text-blue-100">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-10 space-y-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                <Medal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Explorer Level 1</h3>
                <p className="text-xs text-gray-500">Badge Gamifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="font-bold text-gray-900 mt-6 mb-2">Menu Profil</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="hover:bg-blue-50 cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="font-semibold text-sm">Ulasan Saya</span>
            </CardContent>
          </Card>
          <Link href="/contribute">
            <Card className="hover:bg-blue-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <MapPin className="w-8 h-8 text-green-500" />
                <span className="font-semibold text-sm">Kontribusi Tempat</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {user.role === 'admin' && (
          <div className="mt-8">
            <Link href="/gcr">
              <Button fullWidth variant="accent">Masuk Dashboard Admin</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
