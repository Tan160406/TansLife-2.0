import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, fullData } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured. Please add GEMINI_API_KEY under Secrets in the Settings menu of AI Studio." 
      });
    }

    // Create a dense summary of the current user data to give context to Gemini
    const userContext = `
The user is a student using TansLife 2.0.
User Name: ${fullData?.settings?.userName || "Student"}
Current Date/Time: ${new Date().toLocaleString()}
Weather setting: ${fullData?.settings?.weatherLocation || "Not set"}
User Statistics:
- XP: ${fullData?.userXP || 0}
- Level: ${fullData?.userLevel || 1}

Current subjects count: ${fullData?.subjects?.length || 0}
Subjects:
${(fullData?.subjects || []).map((s: any) => `- ${s.name}: Attendance ${s.attendancePresent}/${s.attendanceTotal} (${s.attendanceTotal ? Math.round(s.attendancePresent / s.attendanceTotal * 100) : 100}%), Marks ${s.internalMarks}/${s.internalTotal}, Progress ${s.syllabusProgress}%`).join("\n")}

Active Assignments Count: ${(fullData?.assignments || []).filter((a: any) => a.status !== 'Submitted').length}
Assignments:
${(fullData?.assignments || []).map((a: any) => `- [${a.status}] ${a.title} (${a.priority} priority, deadline: ${a.deadline}, progress: ${a.progress}%)`).join("\n")}

Upcoming Exams:
${(fullData?.exams || []).map((e: any) => `- ${e.title}: Date ${e.date}, coverage ${e.syllabusCoverage}%, confidence ${e.confidence}, Expected ${e.expectedGrade}`).join("\n")}

Daily habits:
${(fullData?.habits || []).map((h: any) => `- ${h.name}: Active streak ${h.streak} days, total completions: ${h.history?.length || 0}`).join("\n")}

Goals:
${(fullData?.goals || []).map((g: any) => `- [${g.type}] ${g.title}: Progress ${g.progress}% (Completed: ${g.completed})`).join("\n")}

Mood Log (Recent):
${(fullData?.moodLogs || []).slice(-5).map((m: any) => `- ${m.date}: Mood scale ${m.mood} (Notes: ${m.notes || "None"})`).join("\n")}

Financial summary:
- Total Transactions: ${(fullData?.finances || []).length}
`;

    const systemInstruction = `You are the ultimate digital brain and Smart Life Butler for TansLife 2.0.
You excel at academic schedules, productivity audits, wellness coaching, and task prioritization.
Help the student manage their workload, balance breaks, suggest dynamic study revision steps, verify overloaded weeks, and plan finances.
Keep answers highly scannable, direct, visually well-structured with Markdown, using rich and warm emoji.
Ensure you address the user's specific query below in context of their current life status provided.`;

    const contents = [
      { text: `User's current state:\n${userContext}` },
      { text: `User request:\n${message}` }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini." });
  }
});

// Weather mockup endpoint
app.get("/api/weather", async (req, res) => {
  const location = req.query.location?.toString() || "New York";
  
  try {
    // 1. Geocode location using Open-Meteo's public geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geoData = (await geoRes.json()) as any;
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }
    
    const { latitude, longitude, name } = geoData.results[0];
    
    // 2. Fetch current weather using Open-Meteo's current weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    const weatherData = (await weatherRes.json()) as any;
    
    if (!weatherData.current_weather) {
      throw new Error("No weather data found");
    }
    
    const { temperature, weathercode, windspeed } = weatherData.current_weather;
    
    // Map Open-Meteo weather codes to our condition types
    let condition = "Sunny";
    let icon = "sun";
    
    if (weathercode === 0) {
      condition = "Sunny";
      icon = "sun";
    } else if ([1, 2].includes(weathercode)) {
      condition = "Partly Cloudy";
      icon = "cloud-sun";
    } else if ([3, 45, 48].includes(weathercode)) {
      condition = "Cloudy";
      icon = "cloud";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weathercode)) {
      condition = "Rainy";
      icon = "cloud-rain";
    } else if ([71, 73, 75, 77, 85, 86].includes(weathercode)) {
      condition = "Snowy";
      icon = "cloud-rain";
    } else {
      condition = "Cloudy";
      icon = "cloud";
    }
    
    const tempC = Math.round(temperature);
    const tempF = Math.round((temperature * 9 / 5) + 32);

    res.json({
      temp: tempC,
      tempF: tempF,
      condition,
      icon,
      location: name,
      humidity: 60,
      windSpeed: Math.round(windspeed)
    });
  } catch (error) {
    console.warn("Real weather fetch failed, using fallback:", error);
    
    // Deterministic mock weather based on input city characters
    const cityCode = location.length;
    let temp = 22 + (cityCode % 12) - (cityCode % 5);
    let condition = "Sunny";
    let icon = "sun";

    if (cityCode % 5 === 0) {
      condition = "Rainy";
      icon = "cloud-rain";
      temp -= 4;
    } else if (cityCode % 3 === 0) {
      condition = "Partly Cloudy";
      icon = "cloud-sun";
    } else if (cityCode % 7 === 0) {
      condition = "Windy";
      icon = "wind";
    }

    const tempF = Math.round((temp * 9 / 5) + 32);

    res.json({
      temp,
      tempF,
      condition,
      icon,
      location,
      humidity: 40 + (temp % 20),
      windSpeed: 10 + (cityCode % 15)
    });
  }
});

// Configure Vite or Static Assets
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => { // Express v5 compatible '*' patterns or general fallbacks
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TansLife 2.0] Server running on http://localhost:${PORT}`);
  });
}

initServer().catch(err => {
  console.error("Failed to start server", err);
});
