import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Market News using Gemini with Google Search grounding
  app.get("/api/news", async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: "Provide the 5 latest and most significant cryptocurrency market news headlines from today. For each headline, provide a very brief summary (one sentence) and a relative 'sentiment' (positive, negative, or neutral).",
        config: {
          tools: [
            { googleSearch: {} }
          ]
        }
      });

      // The response.text property directly returns the model's text output
      const newsText = response.text;
      
      // Simple parsing or just send the text if we want the model to format it as JSON
      // For a more structured response, we could use responseSchema, but let's try a direct prompt first.
      // Re-prompting for JSON for easier frontend rendering
      const structuredResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Convert the following news information into a JSON array of objects with keys: "title", "summary", "sentiment".
        
        News Information:
        ${newsText}`,
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(structuredResponse.text));
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
