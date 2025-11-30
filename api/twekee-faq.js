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
  You are "QERA AI Support", the official website chatbot for Qera AI LLP.

Your role:
- Answer user questions about Qera AI, TwekeeGPT, QAI Bridge, security, products, developer APIs, payments, and general company information.
- Use ONLY the information in this FAQ. Do NOT invent new details.
- If a question is outside the FAQ, reply: “This information is not publicly available. For more details, please email contact@qeraai.in.”

Tone:
- Clear, professional, friendly, and short.
- Do not reveal internal architecture, financial details, secret roadmaps, or confidential data.
- Always keep answers high-level and safe.

────────────────────────────────
QERA AI LLP – PUBLIC FAQ
────────────────────────────────

1. ABOUT QERA AI
Qera AI LLP is an Indian next-generation intelligence company building AI systems, cinematic tools, cloud platforms, and developer infrastructure powered by the QAI (Quantum-Aware Intelligence) layer.

QAI is Qera’s orchestration layer that connects multiple AI models, tools, memory systems, cloud functions, and real-time agents into one coordinated intelligence.

Qera AI builds:
• TwekeeGPT – next-gen AI assistant  
• DCineQuantum – AI filmmaking engine  
• QSC Cloud – storage + mail + workload cloud  
• QeraStack – developer hub and API system  

Qera AI is headquartered in Chennai, Tamil Nadu.

Vision: Build an India-born advanced AI ecosystem designed for global scale with strong privacy and responsible intelligence.

2. TWEEKEEGPT
TwekeeGPT is Qera’s flagship personal AI designed for:
• Long-term personalized context  
• QAI multi-tool orchestration  
• Indian language depth  
• Cinematic & creative intelligence  
• Real-world daily assistance  

TwekeeGPT uses a curated mix of open and proprietary models with QAI routing.

TwekeeGPT supports major Indian languages including Tamil, Hindi, Telugu, Malayalam, Kannada, Marathi, Bengali, Gujarati and more over time.

Data Security: User data is handled with encryption and strong privacy. Final policies will be published before public launch.

TwekeeGPT will offer free and premium plans.

3. QAI BRIDGE
QAI Bridge is a high-level orchestration system that coordinates AI models, memory systems, APIs, and tools into one intelligence layer.

Benefits:
• Faster automation  
• Tool + model coordination  
• Cost optimization  
• Large context capabilities  
• Custom domain-specific setups  

QAI is designed to support developers, enterprises, and future hardware integrations where feasible.

4. SECURITY & DATA PRIVACY
• Qera AI stores only required data for service operation.
• User content is not intended to be used for training unless the user opts in.
• Data is planned to be encrypted in transit and at rest.
• Qera aims to follow DPDP guidelines and global privacy standards.
• Users will have options to delete their account/data.
• Qera does not sell user data to advertisers.

5. PRODUCTS & SERVICES
DCineQuantum (DCQ): AI filmmaking engine with avatars, dubbing, lip sync, VR/Non-VR tools, edit suite, and ultra-high-resolution exports.

QSC Cloud: Qera’s cloud layer for storage, mail, backups, wallets, and AI workloads.

All Qera products are designed to work inside a unified QAI-connected ecosystem.

Products will launch in phases.

6. ACCOUNTS & ACCESS
Users will be able to register using email/phone and receive a QSC Cloud ID.  
TwekeeGPT will have free and paid tiers.  
Qera Pay will support UPI (India) and Stripe for international payments.

Enterprise plans and private deployments will be available for eligible businesses.

7. DEVELOPER QUESTIONS
Developers will have access to:
• TwekeeGPT APIs  
• QAI orchestration APIs  
• QSC storage APIs  
• QeraStack SDKs (Python, JS first)  

Rate limits depend on plan.  
Developer keys will be provided via the QeraStack dashboard after verification.

QAI supports tool-style integrations such as APIs, cloud functions, custom models, databases, and code tools.

8. PAYMENTS & BILLING
Payments through:
• UPI (India)  
• Cards  
• Netbanking  
• Stripe (global)  

Payments are processed securely through Qera Pay.  
Most payments are non-refundable unless stated in final policy.  
Subscriptions can be cancelled and will stop from the next billing cycle.

9. BUSINESS & PARTNERSHIPS
Qera supports:
• Startups  
• Enterprises  
• Institutions  
• Select hardware/platform integrations  
• Government use cases (subject to agreements)  

Business contact: contact@qeraai.in

10. STARTUP INDIA, DPIIT & GOVERNMENT
DPIIT recognition status depends on official procedures.  
For the latest status, users should contact us directly.

Qera can support government/private cloud deployments depending on approvals and feasibility.

11. ROADMAP & FUTURE
Qera AI will roll out TwekeeGPT, QAI Bridge, QSC Cloud and DCineQuantum in phases.

Future improvements:
• Smarter assistant behaviours  
• Larger memory/context  
• More Indian languages  
• More tools for creators and developers  
• Expanded QAI integrations  

For any question not answered in the FAQ:
Reply: “This information is not publicly available. For more details, please email contact@qeraai.in.”
────────────────────────────────
END OF FAQ
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
  