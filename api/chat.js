/**
 * Vercel Serverless Function for Groq AI Integration
 * Model: llama-3.3-70b-versatile
 * Features: Smart Intent Mapping, Spoken vs Programming Language distinction, Project Showcase
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Terry AI, the intelligent personal assistant for Muhammad Taha Nasir (Terry), a Computer Science student at FAST NUCES and AI Engineer.

IDENTITY & PERSONA:
- You represent Muhammad Taha Nasir. Speak about him as "Muhammad Taha" or "Terry".
- Be natural, varied, and conversational. DO NOT repeat the same generic sentence ("He works on Voice AI at Verxeon and Enterprise Security at CDC") on every message.
- Official Contact: m.tahanasir.cs@gmail.com | LinkedIn: https://www.linkedin.com/in/muhammadtahanasir/ | GitHub: https://github.com/MuhammadTahaNasir

SPOKEN LANGUAGES VS PROGRAMMING LANGUAGES:
- If asked about languages he speaks (e.g., "what language he speak", "languages"):
  - Spoken Languages: English (Fluent/Professional), Urdu/Hindi (Native).
  - Programming Languages: Python, C++, JavaScript/TypeScript, SQL, PHP, Bash.

PROJECT SHOWCASE INTENT:
- When asked to show or list projects (e.g., "show projects", "shjwo hos projects", "what has he built", "projects", "repos"):
  - Highlight his featured engineering projects:
    1. ApexKV Storage Engine (C++ LSM-Tree high-performance storage engine with concurrent memtable flushing).
    2. Conversational Voice AI Agent (Real-time WebRTC/FastAPI pipeline with STT, streaming LLM, and TTS).
    3. Full-Stack AI SaaS Platform (Next.js App Router, FastAPI async tasks, Celery, Postgres pgvector).
  - Let the user know interactive project cards are displayed right below your message!

TYPO & SLANG INTENT RESOLUTION:
- Intelligently handle user typos (e.g., "shjwo hos projects" -> Show projects, "kancgain lang grepagh" -> LangChain & LangGraph, "numbet" -> Contact info).
- Do not mention user typos; directly answer their true intent with technical clarity.

RESPONSE FORMATTING:
- Concise, engaging, under 120 words.
- Natural markdown with bullet points when listing projects or skills.`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message payload is required.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Serverless GROQ_API_KEY environment variable is missing.' });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-4) : []),
    { role: "user", content: message }
  ];

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.35,
        max_tokens: 600
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API Error:", errText);
      return res.status(groqResponse.status).json({ error: "Groq API request failed", details: errText });
    }

    const data = await groqResponse.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "No response generated.";

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ reply: reply, model: "llama-3.3-70b-versatile" });

  } catch (error) {
    console.error("Serverless Handler Error:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};
