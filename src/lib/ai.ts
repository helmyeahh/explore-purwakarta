import { Destination } from "./data";

export interface AIWizardInput {
  groupSize: string;
  category: string;
  mood: string[];
  dates: string;
  location?: { lat: number; lng: number };
}

export interface Activity {
  time: string;
  destinationId: string;
  description: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface AIItinerary {
  title: string;
  days: DayPlan[];
}

export async function getMockAIRecommendations(
  input: AIWizardInput,
  destinations: Destination[]
): Promise<AIItinerary> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Determine number of days from input dates (e.g. "12 Okt - 14 Okt (3 Hari)")
  let numDays = 1;
  if (input.dates && input.dates.includes("Hari")) {
    const match = input.dates.match(/(\d+)\s+Hari/);
    if (match) numDays = parseInt(match[1]);
  }

  // MOCK LOGIC: pick random destinations
  let pool = destinations;
  
  if (input.mood.length > 0) {
    const filtered = destinations.filter(d => 
      d.mood_tags.some(m => input.mood.includes(m))
    );
    if (filtered.length > 0) pool = filtered;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  
  const days: DayPlan[] = [];
  let destIndex = 0;

  for (let i = 1; i <= numDays; i++) {
    const d1 = shuffled[destIndex % shuffled.length];
    const d2 = shuffled[(destIndex + 1) % shuffled.length];
    destIndex += 2;

    days.push({
      day: i,
      title: i === 1 ? "Kedatangan & Eksplorasi Awal" : i === numDays ? "Perpisahan & Belanja" : "Petualangan Utama",
      activities: [
        {
          time: "09:00",
          destinationId: d1.id,
          description: `Nikmati pagi hari dengan mengunjungi ${d1.name}. Sangat cocok untuk ${input.groupSize} dengan suasana ${input.mood.join(" & ") || "santai"}.`
        },
        {
          time: "13:00",
          destinationId: d2.id,
          description: `Setelah makan siang, lanjutkan perjalanan ke ${d2.name} untuk pengalaman tak terlupakan.`
        }
      ]
    });
  }

  return {
    title: "Eksplorasi Purwakarta",
    days
  };
}

export async function getAIRecommendations(
  input: AIWizardInput,
  destinations: Destination[]
): Promise<AIItinerary> {
  try {
    const res = await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, destinations }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch from real API, falling back to mock.");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("AI API failed, using mock...", err);
    return getMockAIRecommendations(input, destinations);
  }
}
