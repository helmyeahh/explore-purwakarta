"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, Map } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataContext";

const FullscreenMapViewer = dynamic(() => import("@/components/map/FullscreenMapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 font-medium">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-forest-primary animate-spin mb-4" />
      Memuat peta interaktif...
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const { destinations } = useData();

  return (
    <main className="h-screen w-full flex flex-col relative bg-[#F9FAFB]">
      <header className="absolute top-0 z-50 w-full p-4 lg:p-6 pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
          <button 
            onClick={() => router.push("/")}
            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-[#0B1F15] hover:bg-white transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium pr-2 hidden md:inline">Kembali</span>
          </button>
          
          <div className="bg-forest-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <Map className="w-5 h-5 text-yellow-400" />
            <span className="font-serif font-bold tracking-widest text-sm uppercase">Peta Interaktif</span>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full h-full relative z-0">
        <FullscreenMapViewer destinations={destinations} />
      </div>
    </main>
  );
}
