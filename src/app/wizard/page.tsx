"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  User, Users, UserPlus, 
  Leaf, Building, Tent, Coffee,
  CalendarDays, Share2, Bookmark, ArrowRightLeft, Trash2, ArrowLeft,
  Sparkles
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { getAIRecommendations, AIItinerary } from "@/lib/ai";
import Link from "next/link";
import { useEffect } from "react";

export default function AIWizardPage() {
  const router = useRouter();
  const { destinations, categories, moodTags } = useData();
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<AIItinerary | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [input, setInput] = useState<{
    groupSize: string;
    mood: string[];
    dates: string;
  }>({
    groupSize: "Duo",
    mood: [],
    dates: "",
  });

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setInput(prev => ({ ...prev, dates: `${startDate} - ${endDate} (${diffDays} Hari)` }));
      }
    }
  }, [startDate, endDate]);

  const toggleMood = (mood: string) => {
    if (input.mood.includes(mood)) {
      setInput(prev => ({ ...prev, mood: prev.mood.filter(m => m !== mood) }));
    } else {
      setInput(prev => ({ ...prev, mood: [...prev.mood, mood] }));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setItinerary(null);
    try {
      const result = await getAIRecommendations(
        { ...input, category: input.mood[0] || "Alam" }, 
        destinations
      );
      setItinerary(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans flex flex-col md:flex-row">
      {/* Left Pane: Form */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-white border-r border-gray-200 shrink-0 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 md:p-10 flex-1">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-forest-primary mb-8 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>

          <h1 className="text-3xl font-serif font-bold text-[#0B1F15] mb-10 leading-tight">
            Rencanakan Perjalanan Anda
          </h1>

          {/* Group Size */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Siapa Yang Ikut?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "Solo", icon: User },
                { id: "Duo", icon: Users },
                { id: "Ramai", icon: UserPlus },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setInput(prev => ({ ...prev, groupSize: opt.id }))}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    input.groupSize === opt.id 
                      ? 'border-forest-primary bg-green-50/50 text-forest-primary ring-1 ring-forest-primary' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <opt.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-bold">{opt.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Moods */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Minat & Suasana</label>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...categories, ...moodTags])).map((tag) => {
                const isSelected = input.mood.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleMood(tag)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-forest-primary border-forest-primary text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="mb-10">
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Kapan Anda Pergi?</label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white font-medium text-gray-900"
                />
              </div>
              <span className="text-gray-400 font-bold">-</span>
              <div className="relative flex-1">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input 
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-primary focus:outline-none bg-white font-medium text-gray-900"
                />
              </div>
            </div>
            {input.dates && <p className="text-xs text-green-700 mt-3 font-medium bg-green-50 px-3 py-2 rounded-lg inline-block">Estimasi Waktu: {input.dates.split('(')[1].replace(')', '')}</p>}
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            fullWidth 
            className="bg-forest-primary hover:bg-forest-dark text-white py-4 rounded-xl text-lg font-bold shadow-lg"
          >
            {loading ? "Memproses..." : <><Sparkles className="w-5 h-5 mr-2" /> Generate Itinerary</>}
          </Button>
        </div>
      </div>

      {/* Right Pane: Results */}
      <div className="flex-1 h-screen overflow-y-auto bg-gray-50/50 p-6 md:p-10 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-forest-primary animate-spin mb-6" />
            <h2 className="text-2xl font-serif font-bold text-[#0B1F15] mb-2">Meracik Itinerary...</h2>
            <p className="text-gray-500">Kecerdasan buatan sedang menyusun jadwal terbaik Anda.</p>
          </div>
        ) : itinerary ? (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-700">
            {/* Header Result */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                  {itinerary.days.length}-Day Escape
                </span>
                <h2 className="text-3xl font-serif font-bold text-[#0B1F15] mb-2">{itinerary.title}</h2>
                <p className="text-gray-500 font-medium">{input.groupSize} • {input.mood.join(" & ") || "Bebas"}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-10">
              {itinerary.days.map((day) => (
                <div key={day.day}>
                  <h3 className="font-bold text-forest-primary flex items-center gap-2 mb-6">
                    <CalendarDays className="w-5 h-5 text-green-700" />
                    Hari {day.day}: {day.title}
                  </h3>

                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                    {day.activities.map((act, i) => {
                      const dest = destinations.find(d => d.id === act.destinationId);
                      return (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          {/* Timeline Dot */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-forest-primary text-white border-4 border-white font-bold text-xs shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
                            {act.time}
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] ml-auto md:ml-0">
                            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white overflow-hidden">
                              <div className="flex flex-col sm:flex-row h-full">
                                <div className="w-full sm:w-1/3 h-32 sm:h-auto overflow-hidden shrink-0 relative"><img src={dest?.interactive?.main_photo || 'https://dummyimage.com/200x200'} loading="lazy" decoding="async" className="absolute inset-0 object-cover w-full h-full" alt={dest?.name} /></div>
                                <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                                  <h4 className="font-bold text-[#0B1F15] mb-1">{dest?.name || 'Destinasi Misteri'}</h4>
                                  <p className="text-xs text-gray-500 mb-3 leading-relaxed flex-1 line-clamp-3">
                                    {act.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                    {dest ? (
                                      <span className="text-xs font-bold text-yellow-600">
                                        Rp {(dest.visit_info.estimated_price && !['Gratis', 'Free', 0].includes(dest.visit_info.estimated_price as any)) ? (dest.visit_info.estimated_price.toString().replace(/\D/g, '') || "0") : "0"} / orang
                                      </span>
                                    ) : <span />}
                                    <div className="flex gap-2 text-gray-400">
                                      <button className="hover:text-blue-600"><ArrowRightLeft className="w-4 h-4" /></button>
                                      <button className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-300 mb-2">Belum Ada Rencana</h2>
            <p className="text-gray-400 max-w-sm">Isi formulir di sebelah kiri dan biarkan AI menyusun jadwal liburan yang tak terlupakan untuk Anda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
