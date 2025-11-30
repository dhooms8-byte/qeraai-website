export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }
  
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }
  
      const apiKey = process.env.OPENROUTER_API_KEY;
  
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://qeraai.in",
          "X-Title": "Qera AI - Twekee",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: "You are Twekee, India's first QAI assistant." },
            { role: "user", content: prompt }
          ]
        }),
      });
  
      const data = await response.json();
      const answer = data?.choices?.[0]?.message?.content || "No answer received.";
  
      res.status(200).json({ answer });
  
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error. Try again." });
    }
  }
  