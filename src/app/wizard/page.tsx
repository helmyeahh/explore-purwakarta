"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Users, User, UserPlus, Sparkles, Map, Camera, Heart, Trees, Compass, Utensils } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { getMockAIRecommendations } from "@/lib/ai";

export default function AIWizardPage() {
  const router = useRouter();
  const { destinations, categories, moodTags } = useData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    groupSize: "",
    category: "",
    mood: "",
  });

  const handleNext = async (key: string, value: string) => {
    const updatedInput = { ...input, [key]: value };
    setInput(updatedInput);

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final Step - Generate Recommendations
      setLoading(true);
      
      // Call Mock AI
      const recommendations = await getMockAIRecommendations(updatedInput, destinations);
      
      // Store result in sessionStorage so Planner page can read it
      sessionStorage.setItem("explore_ai_result", JSON.stringify(recommendations));
      
      router.push("/planner");
    }
  };

  if (loading) {
    return (
      <main className="h-screen bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex flex-col items-center justify-center text-white px-4">
        <Sparkles className="w-16 h-16 mb-6 animate-pulse text-[#EA580C]" />
        <h2 className="text-2xl font-bold mb-2">Meracik Perjalanan Sempurna...</h2>
        <p className="text-blue-200 text-center max-w-sm">
          AI kami sedang memilih destinasi terbaik berdasarkan lokasi, suasana hati, dan jumlah rombongan Anda.
        </p>
      </main>
    );
  }

  return (
    <main className="h-screen bg-[#F9FAFB] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] text-blue-100/50 pointer-events-none">
        <Compass className="w-96 h-96" />
      </div>

      <header className="px-4 py-6 z-10">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push("/")} className="p-2 bg-white rounded-full shadow-sm text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 max-w-lg mx-auto w-full z-10 flex flex-col pt-8">
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full w-12 transition-colors ${s <= step ? 'bg-[#EA580C]' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Berapa orang yang akan pergi?</h1>
            <p className="text-gray-500 mb-8">Pilih jumlah rombongan Anda agar kami bisa merekomendasikan tempat yang sesuai.</p>
            
            <div className="grid grid-cols-1 gap-4">
              <Card onClick={() => handleNext('groupSize', 'Sendiri / Berdua')} className="hover:border-[#2563EB] hover:ring-1 ring-[#2563EB]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-[#2563EB]"><User className="w-6 h-6" /></div>
                  <span className="font-bold text-lg">Sendiri / Berdua</span>
                </CardContent>
              </Card>
              <Card onClick={() => handleNext('groupSize', 'Keluarga Kecil')} className="hover:border-[#2563EB] hover:ring-1 ring-[#2563EB]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-full text-[#059669]"><Users className="w-6 h-6" /></div>
                  <span className="font-bold text-lg">Keluarga Kecil (3-5 Orang)</span>
                </CardContent>
              </Card>
              <Card onClick={() => handleNext('groupSize', 'Rombongan Besar')} className="hover:border-[#2563EB] hover:ring-1 ring-[#2563EB]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-orange-50 p-3 rounded-full text-[#EA580C]"><UserPlus className="w-6 h-6" /></div>
                  <span className="font-bold text-lg">Rombongan Besar (&gt;5 Orang)</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kategori Destinasi</h1>
            <p className="text-gray-500 mb-8">Pilih jenis wisata yang paling Anda sukai hari ini.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <Card key={cat} onClick={() => handleNext('category', cat)} className="hover:border-[#2563EB] hover:ring-1 ring-[#2563EB]">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-32">
                    <div className="bg-gray-50 p-3 rounded-full text-gray-700">
                      {i % 3 === 0 ? <Trees className="w-6 h-6" /> : i % 2 === 0 ? <Map className="w-6 h-6" /> : <Utensils className="w-6 h-6"/>}
                    </div>
                    <span className="font-bold text-sm">{cat}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bagaimana mood Anda?</h1>
            <p className="text-gray-500 mb-8">Ini membantu AI mencocokkan tempat dengan nuansa yang Anda cari.</p>
            
            <div className="flex flex-wrap gap-3">
              {moodTags.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleNext('mood', mood)}
                  className="bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-gray-700 hover:border-[#EA580C] hover:text-[#EA580C] hover:bg-orange-50 transition-all shadow-sm flex items-center gap-2"
                >
                  {mood === "Romantis" ? <Heart className="w-4 h-4" /> : mood === "Kuliner" ? <Utensils className="w-4 h-4"/> : <Camera className="w-4 h-4" />}
                  {mood}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
