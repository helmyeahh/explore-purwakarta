import { Destination } from "./data";

export interface AIWizardInput {
  groupSize: string;
  category: string;
  mood: string;
  location?: { lat: number; lng: number };
}

export interface AIRecommendation {
  destinationId: string;
  distance: string;
  aiReview: string;
}

export async function getMockAIRecommendations(
  input: AIWizardInput,
  destinations: Destination[]
): Promise<AIRecommendation[]> {
  // Simulate Gemini API network delay (2.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // In a real scenario, we'd send input to Gemini API:
  // "I have a user at coords X. They want a place for ${input.groupSize}, category ${input.category}, mood ${input.mood}. Pick 3 from this list..."

  // MOCK LOGIC: Just pick up to 3 random destinations that roughly match the mood or category
  const filtered = destinations.filter(
    (d) =>
      d.mood_tags.includes(input.mood) || d.categories.includes(input.category)
  );
  
  // Fallback to all destinations if filters are too strict
  const pool = filtered.length >= 3 ? filtered : destinations;

  // Shuffle and pick 3
  const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

  // Generate mock AI reviews based on inputs
  return selected.map((dest, i) => {
    let review = "";
    if (input.mood === "Romantis") {
      review = `Sangat cocok untuk makan malam romantis bersama pasangan. Suasananya tenang dan indah.`;
    } else if (input.mood === "Keluarga" || input.groupSize !== "Berdua") {
      review = `Tempat yang luas dan ramah anak. Sempurna untuk rombongan keluarga besar.`;
    } else {
      review = `Sesuai dengan keinginan Anda untuk bersantai. Tempat ini menawarkan pengalaman visual yang luar biasa.`;
    }

    return {
      destinationId: dest.id,
      distance: dest.distance || `${(Math.random() * 10 + 1).toFixed(1)} km`,
      aiReview: review,
    };
  });
}
