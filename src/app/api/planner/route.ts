import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { input, destinations } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Determine number of days from input dates (e.g. "12 Okt - 14 Okt (3 Hari)")
    let numDays = 1;
    if (input.dates && input.dates.includes("Hari")) {
      const match = input.dates.match(/(\d+)\s+Hari/);
      if (match) numDays = parseInt(match[1]);
    }
    
    // limit max days to 3 for the prompt
    numDays = Math.min(numDays, 3);

    const prompt = `
      You are an expert travel AI. 
      The user is planning a trip to Purwakarta with the following preferences:
      - Group size: ${input.groupSize}
      - Current Mood: ${(input.mood || []).join(", ")}
      - Duration: ${numDays} days
      
      Here is the list of available destinations in JSON:
      ${JSON.stringify(destinations.map((d: any) => ({ id: d.id, name: d.name, categories: d.categories, mood_tags: d.mood_tags })), null, 2)}
      
      Based on the user's preferences, create a ${numDays}-day itinerary.
      For each day, select 2 destinations from the list.
      
      Return ONLY a valid JSON object matching this schema exactly (no markdown formatting, no code blocks):
      {
        "title": "A catchy title for the trip (e.g., Ketenangan Purwakarta)",
        "days": [
          {
            "day": 1,
            "title": "Short title for the day (e.g., Kedatangan & Eksplorasi)",
            "activities": [
              { "time": "09:00", "destinationId": "...", "description": "Short description of what to do here." },
              { "time": "13:00", "destinationId": "...", "description": "Short description for lunch/afternoon." }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up potential markdown blocks
    if (text.startsWith("```json")) text = text.replace(/^```json/, "");
    if (text.startsWith("```")) text = text.replace(/^```/, "");
    if (text.endsWith("```")) text = text.replace(/```$/, "");
    text = text.trim();
    
    const itinerary = JSON.parse(text);
    
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("AI Planner Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI plan." },
      { status: 500 }
    );
  }
}
