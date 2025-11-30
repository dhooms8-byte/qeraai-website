// api/twekee-faq.js
// Vercel-style serverless function for Twekee FAQ (backend skeleton)

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed" });
    }
  
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
  
      if (!apiKey) {
        // We will fix this when we add the key in Vercel later
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not set on the server" });
      }
  
      const { message, history = [] } = req.body || {};
  
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing 'message' field in request body" });
      }
  
      // 👉 Later we’ll paste your full public FAQ here
      const SYSTEM_PROMPT = `
  You are "Twekee", the official QERA AI Support assistant on the Qera AI LLP website.
  Use only the public FAQ knowledge that I will paste here later.
  If you are not sure about an answer, say that the information is not publicly available and suggest emailing contact@qeraai.in.
      `.trim();
  
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message }
          ],
          temperature: 0.2
        })
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error("OpenRouter error:", text);
        return res.status(502).json({ error: "OpenRouter request failed" });
      }
  
      const data = await response.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "I’m Twekee. I had trouble generating a response just now. Please try again.";
  
      return res.status(200).json({ reply });
    } catch (err) {
      console.error("Twekee FAQ backend error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  