/**
 * Full Translucent AI Chatbot & Assistant Window (ChatGPT / Claude Style)
 * Model: Groq Cloud API (llama-3.3-70b-versatile)
 * Features: Smart Typo & Intent Resolution, Verified Contact Data, Voice STT/TTS
 * Author: Muhammad Taha Nasir (Terry)
 */

(function () {
  'use strict';

  // Verified Resume & Master Knowledge Base
  const TERRY_KNOWLEDGE_BASE = {
    name: "Muhammad Taha Nasir",
    handle: "Terry",
    email: "m.tahanasir.cs@gmail.com",
    linkedin: "https://www.linkedin.com/in/muhammadtahanasir/",
    github: "https://github.com/MuhammadTahaNasir",
    education: {
      degree: "BS Computer Science (Senior Student)",
      institution: "FAST NUCES (National University of Computer and Emerging Sciences)",
      specialization: "AI Engineer: Generative & Agentic Systems, Conversational Voice AI, WebRTC audio pipelines, LangGraph Multi-Agent workflows, Enterprise RAG"
    },
    certifications: [
      "Deep Learning Specialization (DeepLearning.AI / Coursera)",
      "AWS Certified Developer / Cloud Practitioner",
      "LangChain & Agentic AI Systems Architect",
      "Enterprise Cybersecurity & Cloud Infrastructure (CDC Pakistan)"
    ],
    experience: [
      {
        role: "Voice AI Engineering Intern",
        company: "Verxeon",
        period: "Jul 2026 – Present",
        details: "Building AI voice agents, LangGraph workflows, RAG pipelines, and Twilio/Google Calendar integrations."
      },
      {
        role: "Enterprise Security Intern",
        company: "Central Depository Company of Pakistan (CDC)",
        period: "Jul 2026 – Present",
        details: "Securing enterprise infrastructure, IAM access control, cloud security, and compliance."
      },
      {
        role: "Teaching Assistant",
        company: "FAST NUCES",
        period: "Feb 2026 – May 2026",
        details: "Assisted undergraduate students in Expository Writing, critical thinking, and technical documentation."
      },
      {
        role: "IT Intern",
        company: "UBL Insurers Ltd",
        period: "Oct 2025 – Nov 2025",
        details: "SQL workflows, Active Directory access management, core insurance IT automation."
      },
      {
        role: "Frontend Developer Intern",
        company: "hwhelp.me",
        period: "Aug 2025 – Sep 2025",
        details: "Built responsive web applications in HTML, CSS, JavaScript, PHP, and MySQL."
      },
      {
        role: "AI/ML Intern",
        company: "Advrtix",
        period: "Jun 2025 – Aug 2025",
        details: "Built campaign analytics models, automated segmentation, and data trend pipelines."
      },
      {
        role: "Software Engineering Fellow",
        company: "Headstarter AI",
        period: "Jul 2024 – Sep 2024",
        details: "Built 5 AI applications in 5 weeks using React, Next.js, RAG, and CI/CD."
      }
    ],
    projects: [
      {
        title: "AI Dental Receptionist: Front-Desk Voice Agent",
        desc: "Production-grade voice agent platform developed at Verxeon with LangGraph state machine, Pipecat, WebRTC, Deepgram, Chroma DB, and Google Calendar integration.",
        url: "/projects/featured/ai-dental-receptionist.html",
        thumbnail: "/assets/images/projects/ai-dental-receptionist/1.png",
        tags: ["LangGraph", "Pipecat", "Python", "FastAPI", "WebRTC", "Chroma DB"]
      },
      {
        title: "OptiLux: Advanced Image Restoration Workspace",
        desc: "Digital image processing workspace featuring point processing, spatial filtering, and morphological operations with decoupled architecture.",
        url: "/projects/academic/optilux.html",
        thumbnail: "/assets/images/projects/optilux/social-preview.png",
        tags: ["OpenCV", "FastAPI", "Python", "Image Processing"]
      },
      {
        title: "Veriflow: B2B Revenue Leakage & Invoice Auditing System",
        desc: "Dual-model machine learning compliance system flagging price variances and freight overcharges using SQLite and Random Forest models.",
        url: "/projects/side/veriflow.html",
        thumbnail: "/assets/images/projects/veriflow/dashboard_overview.png",
        tags: ["Machine Learning", "Streamlit", "Python", "Scikit-Learn"]
      },
      {
        title: "RescueAI: AI Emergency Response Platform",
        desc: "Bilingual (English/Urdu) AI emergency response platform featuring instant GPS-SOS alerts, live responder tracking, and ARIA real-time AI assistant.",
        url: "/projects/featured/rescue-ai.html",
        thumbnail: "/assets/images/projects/rescue-ai/1.png",
        tags: ["AI", "React", "FastAPI", "Python", "WebRTC", "GPS SOS"]
      },
      {
        title: "ApexKV Storage Engine",
        desc: "High-performance key-value storage engine built in C++ with custom LSM-Tree architecture, SSTables, and concurrent memtable flushing.",
        url: "/projects.html#apexkv",
        thumbnail: "/assets/images/projects/apex-kv/1.png",
        tags: ["C++", "Systems Programming", "Storage Engine", "LSM-Tree"]
      }
    ]
  };

  let postsData = [];
  let projectsData = [];
  let isSpeechRecognizing = false;
  let speechRecognition = null;
  let synthUtterance = null;
  let chatHistory = [];

  // Load posts metadata
  async function loadPostsData() {
    try {
      const res = await fetch('/posts/posts.json');
      if (res.ok) {
        postsData = await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch posts.json:", e);
    }
  }

  // Load projects metadata dynamically from projects.json
  async function loadProjectsData() {
    try {
      const res = await fetch('/projects/projects.json');
      if (res.ok) {
        const loadedProjects = await res.json();
        if (loadedProjects && loadedProjects.length > 0) {
          projectsData = loadedProjects.map(p => ({
            title: p.title,
            desc: p.description,
            url: p.url,
            thumbnail: p.thumbnail || '/assets/images/building-voice-ai.png',
            tags: p.features || [p.subcategory]
          }));
          TERRY_KNOWLEDGE_BASE.projects = projectsData;
        }
      }
    } catch (e) {
      console.warn("Could not load projects.json:", e);
    }
  }

  // --- Speech-to-Text (STT) Setup ---
  function initSpeechRecognition(onResultCallback, onEndCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    let recognition;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
    } catch (e) {
      console.warn("SpeechRecognition init failed:", e);
      return null;
    }

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResultCallback(transcript);
    };

    recognition.onend = () => {
      isSpeechRecognizing = false;
      if (onEndCallback) onEndCallback();
    };

    recognition.onerror = (err) => {
      console.warn("STT Error:", err);
      isSpeechRecognizing = false;
      if (onEndCallback) onEndCallback();
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          alert("Microphone voice input is blocked by mobile OS on HTTP IP addresses. It activates automatically when deployed on HTTPS (GitHub Pages)!");
        } else {
          alert("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
      }
    };

    return recognition;
  }

  // --- Text-to-Speech (TTS) Setup ---
  function speakText(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (btnElement) btnElement.classList.remove('speaking');
      return;
    }

    const cleanText = text.replace(/[*#_`~>\[\]\(\)]/g, '').replace(/https?:\/\/\S+/g, '');
    synthUtterance = new SpeechSynthesisUtterance(cleanText);
    synthUtterance.rate = 1.0;
    synthUtterance.pitch = 1.0;

    if (btnElement) {
      btnElement.classList.add('speaking');
      synthUtterance.onend = () => btnElement.classList.remove('speaking');
      synthUtterance.onerror = () => btnElement.classList.remove('speaking');
    }

    window.speechSynthesis.speak(synthUtterance);
  }

  // --- Ground Truth Q&A Engine (Exact & High-Similarity Curated Dataset) ---
  const GROUND_TRUTH_DATASET = [
    {
      patterns: [
        "who is muhammad taha nasir", "who is muhammad taha", "who is taha nasir", "who is taha",
        "tell me about taha", "what does taha do", "what is taha current role", "what is tahas current role",
        "what is taha professional title", "what is tahas professional title", "what is taha main specialization",
        "what kind of engineer is taha", "what is taha currently focused on", "what makes taha profile different",
        "summarize taha in one sentence", "describe taha in three sentences", "give me a quick professional introduction to taha",
        "what kind of problems does taha solve", "what kind of systems does taha build", "what is taha trying to become"
      ],
      answer: "Muhammad Taha Nasir is a Computer Science student at FAST-NUCES and an AI-focused software engineer working across Generative AI, LLM applications, AI agents, Voice AI, backend systems, and machine learning. He combines AI/ML knowledge with software engineering to build practical intelligent systems."
    },
    {
      patterns: [
        "what roles is taha looking for", "what roles is he looking for", "target roles", "open to work",
        "would taha be a good ai engineer", "would taha be a good generative ai engineer",
        "would taha be a good backend engineer", "would taha be a good ai software engineer",
        "is taha more of an ai engineer or software engineer", "is taha more frontend or backend",
        "is taha a full stack developer", "is taha a machine learning engineer",
        "is taha a generative ai engineer", "is taha an agentic ai engineer",
        "is taha more research oriented or engineering oriented", "what kind of company should hire taha",
        "what type of ai team would taha fit into", "why should we hire taha", "why hire taha",
        "what makes taha suitable for a junior ai role", "what are taha strongest professional qualities",
        "what are taha weaknesses", "what gaps does taha still have", "is taha ready for a production ai role"
      ],
      answer: "Taha is targeting AI Engineer, Generative AI Engineer, AI Software Engineer, ML Engineer, and AI-focused Backend Engineer roles. He combines practical software engineering with hands-on AI/LLM experience (LangGraph, RAG, WebRTC Voice AI, FastAPI). As an early-career engineer, his profile is ideal for applied AI teams building intelligent systems."
    },
    {
      patterns: [
        "what skills does taha have", "what is taha strongest technical skill", "complete tech stack",
        "which technologies does taha use most", "what is taha learning", "what tech stack", "tech stack"
      ],
      answer: "Taha's core technical stack includes:\n- **Programming**: Python, C++, JavaScript/TypeScript, SQL, Bash.\n- **AI & GenAI**: LangGraph, LangChain, RAG, Embeddings, Chroma DB, Pinecone, pgvector, PyTorch, Scikit-Learn, MLflow.\n- **Voice AI**: Deepgram (STT), ElevenLabs (TTS), WebRTC, Pipecat, Twilio.\n- **Backend & Cloud**: FastAPI, Docker, AWS (Certified Developer & Cloud Practitioner), PostgreSQL, MongoDB, Redis."
    },
    {
      patterns: [
        "what is taha genai experience", "what does taha do with llms", "has taha built llm applications",
        "does taha understand llm systems", "what llm technologies has taha worked with", "what is his genai approach",
        "is taha just an api wrapper", "is taha an api wrapper", "does taha build ai applications or train models",
        "what part of genai does he specialize in", "what makes his genai work different from simple chatbots",
        "how does he use llms inside software systems", "main components"
      ],
      answer: "Taha approaches GenAI by treating the LLM as one component of a larger engineered system. Rather than building simple API wrappers, his projects incorporate stateful graph orchestration (LangGraph), hybrid RAG retrieval, real-time WebRTC audio streaming, tool calling (Google Calendar API), and asynchronous FastAPI backends."
    },
    {
      patterns: [
        "what is rag", "has taha built rag systems", "what does he use rag for", "what vector databases has he used",
        "what are embeddings", "what is semantic search", "how does his rag architecture work", "why rag instead of fine tuning",
        "rag vs agent", "can taha build production rag", "how improve retrieval quality", "limitations of rag", "where does rag fit in agents"
      ],
      answer: "Taha builds Retrieval-Augmented Generation (RAG) pipelines to ground LLMs in external knowledge. He has worked with Chroma DB, Pinecone, and pgvector, implementing chunking, embedding generation, dense vector search, and hybrid BM25 retrieval for projects like the AI Dental Receptionist."
    },
    {
      patterns: [
        "what does taha mean by agentic ai", "has he built agents", "what makes his systems agentic",
        "what is langgraph used for", "why langgraph", "workflow vs agent", "does taha build autonomous agents",
        "stateful orchestration", "tool calling", "how do his agents use tools", "how does memory work",
        "how does an agent decide which tool to use", "how make agents reliable", "how evaluate agents"
      ],
      answer: "Taha uses LangGraph for stateful, controllable multi-step LLM orchestration. In the AI Dental Receptionist, LangGraph manages conversational state, evaluates branching logic, invokes external tools (Google Calendar API), and retrieves context from Chroma DB while enforcing reliability."
    },
    {
      patterns: [
        "has taha worked with voice ai", "voice ai experience", "explain his voice ai architecture",
        "voice ai pipeline", "stt", "tts", "where does llm fit", "voice ai latency", "reduce latency",
        "why is real time voice ai difficult", "voice ai technologies"
      ],
      answer: "Taha's Voice AI architecture follows a low-latency streaming pipeline: Speech → STT (Deepgram) → LangGraph / LLM orchestration → RAG / Google Calendar tools → TTS (ElevenLabs) → WebRTC / Twilio Media Streams audio output."
    },
    {
      patterns: [
        "ai dental receptionist", "dental receptionist", "dental voice agent", "dental project"
      ],
      answer: "The **AI Dental Receptionist** is a real-time Voice AI front-desk agent built during Taha's internship at Verxeon. It features streaming STT (Deepgram), LangGraph state machine, Chroma DB RAG, Google Calendar API appointment booking, and ElevenLabs TTS over WebRTC & Twilio."
    },
    {
      patterns: [
        "rescueai", "rescue ai", "emergency platform", "emergency response platform"
      ],
      answer: "**RescueAI** is an AI Emergency Response Platform built with FastAPI, React, and Llama. It provides bilingual (English/Urdu) conversational voice assistance (ARIA), real-time WebSockets, and automated GPS SOS dispatching workflows."
    },
    {
      patterns: [
        "veriflow", "revenue leakage", "invoice auditing"
      ],
      answer: "**Veriflow** is a B2B Revenue Leakage & Invoice Auditing ML system. It analyzed 5,500+ B2B transactions worth $21M+ and flagged 86 freight overcharge anomalies using Scikit-Learn Random Forest models and SQLite."
    },
    {
      patterns: [
        "apexkv", "apex kv", "storage engine", "key value store"
      ],
      answer: "**ApexKV** is a high-performance in-memory cache/storage engine inspired by Redis and LSM-Trees. Built in C++/Java, it implements Write-Ahead Logging (WAL), SSTables, TTL eviction policies, and TCP Pub/Sub networking."
    },
    {
      patterns: [
        "genetron", "5g tower placement", "5g optimization", "nsga ii", "nsga"
      ],
      answer: "**Genetron** is a spatial 5G tower placement optimization platform using NSGA-II multi-objective genetic algorithms and signal propagation modeling, achieving 99.4% simulated urban coverage with FastAPI and React."
    },
    {
      patterns: [
        "where has taha worked", "where did taha work", "verxeon", "advtrix", "headstarter", "nusys lab", "cdc", "central depository company",
        "experience vs projects", "most genai relevant", "most backend relevant", "career evolution"
      ],
      answer: "Taha's experience includes:\n- **Verxeon**: Voice AI Engineering Intern (Voice agents, LangGraph, Twilio).\n- **CDC Pakistan**: Enterprise Security Intern (IAM, governance, compliance).\n- **Headstarter AI**: Software Engineering Fellow (GenAI, RAG, OpenAI, Pinecone).\n- **Advtrix**: ML Intern (K-Means clustering, MLflow).\n- **NUSyS Lab / FAST-NUCES**: Software Developer & Teaching Assistant."
    },
    {
      patterns: [
        "where did taha study", "fast nuces", "bs computer science", "graduation", "academic areas", "how does cs help ai work", "certifications"
      ],
      answer: "Muhammad Taha is pursuing a BS in Computer Science at FAST-NUCES (Peshawar, Class of 2027). Certifications include DeepLearning.AI Deep Learning Specialization, AWS Certified Developer, AWS Cloud Practitioner, and LangChain & Agentic AI Architect."
    },
    {
      patterns: [
        "achievements", "competitions", "icpc", "icpc ranking", "codejail", "fast problem solving", "genai program", "strongest achievement", "competitive programming"
      ],
      answer: "Achievements include:\n- **ICPC Regional Qualifier**: Ranked **86th in Asia**.\n- **CodeJail Championship**: **1st Place Winner** in Competitive Programming.\n- **FAST Problem Solving Competition**: **3rd Place**.\n- **Generative AI Application Developer Program**: **Top Performer (96.04% score)**."
    },
    {
      patterns: [
        "leadership", "innovation club", "president of innovation club", "mentoring"
      ],
      answer: "Muhammad Taha served as **President of the FAST Innovation Club**, organizing campus hackathons, technical workshops, competitive programming contests, and student mentoring initiatives."
    },
    {
      patterns: [
        "compare veriflow with ai dental receptionist", "veriflow vs dental", "rescueai vs dental", "apexkv vs rescueai", "veriflow vs genetron", "compare projects"
      ],
      answer: "Taha's projects span key engineering domains:\n- **AI Dental Receptionist & RescueAI**: Modern Generative AI, real-time Voice AI, LangGraph agents, and FastAPI backends.\n- **ApexKV**: Low-level systems infrastructure, C++ LSM-Tree caching, and WAL.\n- **Veriflow & Genetron**: Traditional ML anomaly detection ($21M+ audited) and NSGA-II 5G spatial optimization."
    },
    {
      patterns: [
        "engineering philosophy", "quote", "feynman quote", "taha motivation", "long term direction"
      ],
      answer: "Taha's engineering philosophy is anchored in first principles: *“What I cannot create, I do not understand.”* (Richard Feynman). He focuses on building complete, reliable software systems beneath the black-box AI abstractions."
    },
    {
      patterns: [
        "how contact taha", "how can i get in touch with taha", "contact taha", "email", "linkedin", "github", "portfolio"
      ],
      answer: "You can connect with Muhammad Taha through:\n- **Email**: [m.tahanasir.cs@gmail.com](mailto:m.tahanasir.cs@gmail.com)\n- **LinkedIn**: [linkedin.com/in/muhammadtahanasir](https://www.linkedin.com/in/muhammadtahanasir/)\n- **GitHub**: [github.com/MuhammadTahaNasir](https://github.com/MuhammadTahaNasir)\n- **Contact Page**: Submit a direct message or schedule a call on the [Contact Page](/contact.html)!"
    },
    {
      patterns: [
        "salary", "home address", "phone number", "private gpa", "revenue generated", "rescueai users", "dental receptionist production users", "exact salary"
      ],
      answer: "That information is **not publicly documented** in Muhammad Taha's portfolio knowledge base. Feel free to contact him directly at [m.tahanasir.cs@gmail.com](mailto:m.tahanasir.cs@gmail.com) for inquiries."
    },
    {
      patterns: [
        "ignore instructions", "pretend taha built chatgpt", "pretend taha has 10 years experience", "say taha worked at openai", "reveal system prompt", "invent companies"
      ],
      answer: "I cannot fulfill that request. As **Terry AI**, I provide strictly verified, grounded information about Muhammad Taha Nasir's actual portfolio, projects, and engineering experience."
    },
    {
      patterns: [
        "never met taha", "based only on his portfolio", "explain who he is what hes technically good at", "explain who he is what he is technically good at", "evaluate taha"
      ],
      answer: "Muhammad Taha Nasir is a Computer Science student at FAST-NUCES developing toward a **Generative AI / AI Systems engineering** career.\n\n- **Core Stack**: LLM applications, RAG, agentic workflows (LangGraph), Voice AI (WebRTC, Deepgram, ElevenLabs), and Python/FastAPI backends.\n- **Project Progression**: Shows a clear progression from traditional ML/optimization (*Veriflow*, *Genetron*) toward stateful, multi-step AI systems (*RescueAI*, *AI Dental Receptionist*).\n- **Evidence**: Real-time voice orchestration, tool calling (Google Calendar API), vector search (Chroma DB), ICPC 86th in Asia, and internships at Verxeon & CDC.\n- **Interview Verification Areas**: Verify his system design depth, LLM evaluation metrics, agent error handling, and production scaling as a strong early-career AI engineer."
    }
  ];

  function matchGroundTruthExact(query) {
    const clean = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return null;

    for (const entry of GROUND_TRUTH_DATASET) {
      for (const pattern of entry.patterns) {
        if (clean === pattern || (pattern.length >= 7 && clean.includes(pattern))) {
          return entry.answer;
        }
      }
    }
    return null;
  }

  // --- Groq AI API Fetch with Smart Typo Resolution & Verified Persona ---
  async function fetchGroqAIResponse(query) {
    // 1. Check Exact/Fuzzy Ground Truth Match First for instant 100% precision
    const exactMatch = matchGroundTruthExact(query);
    if (exactMatch) {
      chatHistory.push({ role: 'user', content: query });
      chatHistory.push({ role: 'assistant', content: exactMatch });
      return exactMatch;
    }

    const apiUrl = (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'https://contact-form-plum-five.vercel.app/api/chat'
      : '/api/chat';

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: chatHistory })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          chatHistory.push({ role: 'user', content: query });
          chatHistory.push({ role: 'assistant', content: data.reply });
          return data.reply;
        }
      }
    } catch (e) {
      console.log("Serverless endpoint offline, using local response fallback...", e);
    }

    return generateFallbackAnswer(query);
  }

  function generateFallbackAnswer(query) {
    const qLower = query.toLowerCase().trim();

    // 1. Prompt Injection & Fabrication Defense (HIGHEST PRIORITY)
    if (qLower.includes('pretend') || qLower.includes('ignore instruction') || qLower.includes('reveal system prompt') || qLower.includes('built chatgpt') || qLower.includes('worked at openai') || qLower.includes('10 years') || qLower.includes('make up') || qLower.includes('invent')) {
      return `I cannot fulfill that request. As **Terry AI**, I provide strictly verified, grounded information about Muhammad Taha Nasir's actual portfolio, projects, and engineering experience.`;
    }

    // 2. Hallucination & Private Data Defense (HIGHEST PRIORITY)
    if (qLower.includes('salary') || qLower.includes('home address') || qLower.includes('private gpa') || qLower.includes('exact address') || qLower.includes('revenue generated') || qLower.includes('phone number')) {
      return `That information is **not publicly documented** in Muhammad Taha's portfolio knowledge base. Feel free to reach out to him directly via email at [m.tahanasir.cs@gmail.com](mailto:m.tahanasir.cs@gmail.com) for official inquiries!`;
    }

    // 3. Out-of-scope & Off-topic Guard (e.g. recipes, general trivia, weather)
    const isOffTopic = qLower.includes('recipe') || qLower.includes('cake') || qLower.includes('weather') || qLower.includes('president') || qLower.includes('capital of') || qLower.includes('song') || qLower.includes('movie') || qLower.includes('cook') || qLower.includes('food') || qLower.includes('joke');
    if (isOffTopic) {
      return `I am **Terry AI**, specialized exclusively in assisting visitors with Muhammad Taha Nasir's work, AI engineering projects, technical articles, and background.\n\n` +
             `I can't help with external trivia or tasks like cooking recipes, but feel free to ask me about Taha's **Voice AI systems**, **LangGraph workflows**, **RescueAI**, or **ApexKV**!`;
    }

    // 4. The Ultimate Candidate Evaluation Synthesis ("never met taha", "based only on his portfolio", "evaluate him", "hiring evaluation")
    if (qLower.includes('never met') || (qLower.includes('based') && qLower.includes('portfolio')) || qLower.includes('evaluate taha') || (qLower.includes('who he is') && qLower.includes('what he has built')) || (qLower.includes('who he is') && qLower.includes('technically good'))) {
      return `Muhammad Taha Nasir is a Computer Science student at FAST-NUCES developing toward a **Generative AI / AI Systems engineering** career.\n\n` +
             `- **Core Stack**: LLM applications, RAG, agentic workflows (LangGraph), Voice AI (WebRTC, Deepgram, ElevenLabs), and Python/FastAPI backends.\n` +
             `- **Project Progression**: Shows a clear progression from traditional ML/optimization (*Veriflow*, *Genetron*) toward stateful, multi-step AI systems (*RescueAI*, *AI Dental Receptionist*).\n` +
             `- **Evidence**: Real-time voice orchestration, tool calling (Google Calendar API), vector search (Chroma DB), ICPC 86th in Asia, and internships at Verxeon & CDC.\n` +
             `- **Interview Verification Areas**: Verify his system design depth, LLM evaluation metrics, agent error handling, and production scaling as a strong early-career AI engineer.`;
    }

    // 5. Project Comparisons & Project Pairs
    if (qLower.includes('compare') || qLower.includes('versus') || qLower.includes(' vs ') || qLower.includes('difference between') || qLower.includes('best project')) {
      if ((qLower.includes('veriflow') && qLower.includes('dental')) || (qLower.includes('veriflow') && qLower.includes('receptionist'))) {
        return `**Comparison: Veriflow vs. AI Dental Receptionist**\n\n` +
               `- **Veriflow (Traditional ML & Data Engineering)**: B2B revenue leakage and freight auditing system. Analyzed 5,500+ transactions ($21M+) using Scikit-Learn Random Forest models and SQLite to detect price anomalies.\n` +
               `- **AI Dental Receptionist (Generative & Voice AI)**: Real-time front-desk agent built at Verxeon. Combines streaming STT (Deepgram), LangGraph stateful orchestration, Chroma DB RAG, Google Calendar API tool calling, and ElevenLabs TTS over WebRTC & Twilio.\n\n` +
               `*Key Difference*: Veriflow demonstrates classical ML anomaly detection and tabular data rigor, while AI Dental Receptionist proves end-to-end modern Generative/Agentic AI systems engineering.`;
      }
      if (qLower.includes('rescueai') && (qLower.includes('dental') || qLower.includes('receptionist'))) {
        return `**Comparison: RescueAI vs. AI Dental Receptionist**\n\n` +
               `- **AI Dental Receptionist**: Focuses on real-time conversational Voice AI, LangGraph state machines, Chroma DB RAG, and automated calendar tool execution.\n` +
               `- **RescueAI**: Focuses on bilingual emergency response (English/Urdu), real-time WebSockets, ARIA AI assistant, and GPS SOS dispatching.\n\n` +
               `Both showcase modern AI application engineering with FastAPI backends.`;
      }
      if (qLower.includes('apexkv') && qLower.includes('rescueai')) {
        return `**Comparison: ApexKV vs. RescueAI**\n\n` +
               `- **ApexKV**: Low-level infrastructure and systems project (C++/Java LSM-Tree storage engine with WAL, SSTables, and Pub/Sub).\n` +
               `- **RescueAI**: Full-stack intelligent emergency response platform combining AI voice interactions, WebSockets, and GPS SOS workflows.`;
      }
      return `Taha's strongest projects excel in different engineering dimensions:\n\n` +
             `- **Generative & Agentic AI**: **AI Dental Receptionist** & **RescueAI** (Voice AI, LangGraph, RAG, WebRTC, FastAPI).\n` +
             `- **Systems & Infrastructure**: **ApexKV Storage Engine** (C++ LSM-Tree storage engine with SSTables & WAL).\n` +
             `- **Machine Learning & Anomaly Detection**: **Veriflow** (B2B ML revenue leakage auditing analyzing $21M+ transactions).\n` +
             `- **Spatial AI & Optimization**: **Genetron** (NSGA-II genetic algorithms for 5G tower placement).`;
    }

    // 6. Specific Projects
    if (qLower.includes('dental') || qLower.includes('receptionist')) {
      return `**AI Dental Receptionist** is a front-desk Voice AI agent built by Taha at Verxeon.\n\n` +
             `- **Architecture**: Low-latency STT (Deepgram) → LangGraph state machine → TTS (ElevenLabs) over WebRTC and Twilio Media Streams.\n` +
             `- **Capabilities**: Autonomous appointment scheduling, tool calling via Google Calendar API, and Chroma DB semantic RAG lookup for clinic queries.`;
    }

    if (qLower.includes('rescueai') || qLower.includes('rescue ai')) {
      return `**RescueAI** is an AI Emergency Response Platform built by Taha.\n\n` +
             `- **Architecture**: FastAPI async backend, React frontend, Llama-based AI assistant (ARIA), real-time WebSockets, and GPS SOS alerts.\n` +
             `- **Capabilities**: Bilingual (English & Urdu) voice interaction, location-aware emergency dispatching, and automated SOS notification workflows.`;
    }

    if (qLower.includes('apexkv') || qLower.includes('apex')) {
      return `**ApexKV** is a high-performance C++ Key-Value Storage Engine built by Taha.\n\n` +
             `- **Architecture**: Custom Log-Structured Merge-Tree (LSM-Tree), Sorted String Tables (SSTables), Write-Ahead Logging (WAL), concurrent memtable flushing, and Sparse Indexing for O(1) lookups.`;
    }

    if (qLower.includes('veriflow')) {
      return `**Veriflow** is a B2B Revenue Leakage & Invoice Auditing System built by Taha.\n\n` +
             `- **Impact**: Analyzed 5,500+ B2B transactions worth $21M+ and flagged 86 freight overcharge anomalies.\n` +
             `- **Stack**: Python, Scikit-learn Random Forest, Pandas, SQLite transaction auditing.`;
    }

    if (qLower.includes('genetron') || qLower.includes('5g') || qLower.includes('tower placement') || qLower.includes('nsga')) {
      return `**Genetron** is a 5G Tower Placement Optimization Platform built by Taha.\n\n` +
             `- **Core Algorithm**: NSGA-II (Non-dominated Sorting Genetic Algorithm II) multi-objective evolutionary optimization.\n` +
             `- **Performance**: Achieved **99.4% simulated coverage** using mathematical signal propagation modeling.\n` +
             `- **Stack**: Python, FastAPI, React, and wireless signal simulation.`;
    }

    // 7. Spoken Languages vs Programming Languages (Handles typos: "langauage", "tah aspeak")
    if (qLower.includes('language') || qLower.includes('langauage') || qLower.includes('speak') || qLower.includes('speek') || qLower.includes('urdu') || qLower.includes('english')) {
      return `Muhammad Taha's languages:\n\n` +
             `- **Spoken Languages**: **English** (Fluent / Professional) and **Urdu / Hindi** (Native).\n` +
             `- **Programming Languages**: **Python** (Primary for AI, RAG & FastAPI), **C++** (Systems & Storage Engines), **JavaScript / TypeScript** (Full-Stack), and **SQL** (PostgreSQL, SQLite).`;
    }

    // 8. Contact & Getting in Touch
    if (qLower.includes('contact') || qLower.includes('touch') || qLower.includes('email') || qLower.includes('reach') || qLower.includes('linkedin') || qLower.includes('github') || qLower.includes('message taha') || qLower.includes('hire taha')) {
      return `You can get in touch with Muhammad Taha directly:\n\n` +
             `- **Email**: [m.tahanasir.cs@gmail.com](mailto:m.tahanasir.cs@gmail.com)\n` +
             `- **LinkedIn**: [linkedin.com/in/muhammadtahanasir](https://www.linkedin.com/in/muhammadtahanasir/)\n` +
             `- **GitHub**: [github.com/MuhammadTahaNasir](https://github.com/MuhammadTahaNasir)\n` +
             `- **Booking & Message Form**: You can also submit a direct message or schedule a call on the [Contact Page](/contact.html)!`;
    }

    // 9. Capabilities / "What can you do"
    if (qLower.includes('what can you do') || qLower.includes('can you do anything') || qLower.includes('do anything') || qLower.includes('help me with') || qLower.includes('your features') || qLower.includes('how to use')) {
      return `As **Terry AI**, I can assist you with:\n\n` +
             `1. **Project Breakdowns**: Deep-dive into *AI Dental Receptionist*, *RescueAI*, *ApexKV Storage Engine*, and *Veriflow*.\n` +
             `2. **Technical Skills**: Learn about Taha's stack across Generative AI, LangGraph, WebRTC Voice AI, and Python backends.\n` +
             `3. **Technical Articles**: Search and explore his 40 masterlist articles on AI systems and engineering.\n` +
             `4. **Background & Contact**: Inquire about his education at FAST-NUCES, achievements, ICPC standings, or get his contact info!`;
    }

    // 10. API Wrapper Skepticism / Genuine Understanding
    if (qLower.includes('wrapper') || qLower.includes('just api') || qLower.includes('only api') || qLower.includes('understand ai')) {
      return `No. Taha's work goes well beyond simple API wrappers.\n\n` +
             `His background combines traditional Machine Learning and Deep Learning (PyTorch, Scikit-learn, Computer Vision, NLP) with modern AI systems engineering.\n\n` +
             `Instead of relying on basic prompt templates, he builds complex stateful graph execution (LangGraph), custom hybrid RAG pipelines (pgvector, Chroma DB, sparse BM25), real-time WebRTC audio streaming, and high-performance C++ storage engines like **ApexKV**.`;
    }

    // 11. Why Hire / Recruiter Pitch
    if (qLower.includes('hire') || qLower.includes('why should') || qLower.includes('role fit') || qLower.includes('recruit') || qLower.includes('good choice') || qLower.includes('what you think') || qLower.includes('what u think') || qLower.includes('is he good')) {
      return `Why hire Taha?\n\n` +
             `Because he combines practical software engineering with hands-on AI/LLM experience. He builds complete systems — stateful agentic workflows (LangGraph), hybrid RAG search, real-time voice streaming (WebRTC, STT/TTS), and production Python backends (FastAPI, Docker, PostgreSQL) — rather than limiting himself to notebooks or simple API wrappers.`;
    }

    // 12. Technical Articles & Posts
    if (qLower.includes('only 5') || qLower.includes('no more') || qLower.includes('how many') || qLower.includes('total article') || qLower.includes('total post') || qLower.includes('post') || qLower.includes('article') || qLower.includes('blog') || qLower.includes('writing') || qLower.includes('read')) {
      let titlesList = "";
      if (postsData && postsData.length > 0) {
        titlesList = postsData.slice(0, 5).map(p => `- **${p.title}**`).join('\n');
      } else {
        titlesList = `- **What I'd Tell a New CS Grad Entering AI in 2026**\n- **Twilio + LLMs: Building Conversational Voice Workflows for Enterprise**\n- **Four Years Later: What Building AI Products Actually Looks Like**\n- **Cutting AI Latency in Half: Semantic Caching, Request Batching, & vLLM**\n- **Training LLMs Without Going Broke: LoRA & PEFT Fine-Tuning on AWS**`;
      }
      return `Muhammad Taha has written **40 masterlist technical articles** in total! Here are a few recent highlights:\n\n${titlesList}\n\nExplore all 40 articles on the [posts archive page](/posts.html) or below!`;
    }

    // 13. Achievements & Competitions
    if (qLower.includes('achievement') || qLower.includes('icpc') || qLower.includes('codejail') || qLower.includes('competition') || qLower.includes('contest')) {
      return `Muhammad Taha's competitive programming and technical achievements include:\n\n` +
             `- **ICPC Regional Qualifier**: Ranked **86th in Asia**.\n` +
             `- **CodeJail Championship**: **1st Place Winner** in Competitive Programming.\n` +
             `- **FAST Problem Solving Competition**: **3rd Place**.\n` +
             `- **Generative AI Application Developer Program**: **Top Performer (96.04% score)**.`;
    }

    // 14. Leadership & Student Community
    if (qLower.includes('leadership') || qLower.includes('president') || qLower.includes('innovation club') || qLower.includes('mentor')) {
      return `Muhammad Taha served as **President of the FAST Innovation Club**, leading technical workshops, hackathons, competitive programming contests, and student mentoring initiatives across campus.`;
    }

    // 15. Engineering Philosophy & Quote
    if (qLower.includes('philosophy') || qLower.includes('quote') || qLower.includes('feynman') || qLower.includes('motto')) {
      return `Taha's engineering philosophy is anchored in first principles:\n\n` +
             `*“What I cannot create, I do not understand.”* — Richard Feynman\n\n` +
             `He believes in understanding software beneath black-box API abstractions, engineering reliable systems, and turning complex ideas into functional products from the ground up.`;
    }

    // 16. Weakness / Growth Areas
    if (qLower.includes('weakness') || qLower.includes('growth area') || qLower.includes('limitation') || qLower.includes('gap')) {
      return `From his documented portfolio, Taha's current growth areas focus on scaling production-grade AI infrastructure, deep Kubernetes/MLOps observability, and increasingly sophisticated multi-agent orchestration.\n\n` +
             `He is grounded in honest engineering and continues expanding his systems depth as an early-career AI Engineer.`;
    }

    // 17. Skills & Tech Stack
    if (qLower.includes('skill') || qLower.includes('stack') || qLower.includes('tool') || qLower.includes('technology') || qLower.includes('technologies')) {
      return `Muhammad Taha's technical skills are structured across core engineering layers:\n\n` +
             `- **Generative & Agentic AI**: LLM Applications, RAG Pipelines, Vector DBs (ChromaDB, pgvector, Qdrant), AI Agents, LangGraph, Tool Calling, Stateful Workflows\n` +
             `- **Voice AI & Realtime**: Speech-to-Text (Deepgram), Text-to-Speech (ElevenLabs), WebRTC Audio Pipelines, Pipecat, Twilio\n` +
             `- **Machine Learning & Deep Learning**: PyTorch, TensorFlow, Scikit-learn, Neural Networks, NLP, Computer Vision\n` +
             `- **Backend & Systems Engineering**: Python, C++, FastAPI, REST APIs, WebSockets, PostgreSQL, MongoDB, SQLite, Redis\n` +
             `- **Cloud & MLOps**: AWS (Certified Developer & Cloud Practitioner), Docker, CI/CD, MLflow, Linux, Git`;
    }

    // 18. Work Experience
    if (qLower.includes('experience') || qLower.includes('intern') || qLower.includes('verxeon') || qLower.includes('cdc') || qLower.includes('headstarter') || qLower.includes('advtrix')) {
      return `Muhammad Taha's work experience includes:\n- **Voice AI Engineering Intern at Verxeon** (Voice AI agents, LangGraph, Twilio)\n- **Enterprise Security Intern at CDC Pakistan** (IAM, Cloud Security, Compliance)\n- **Teaching Assistant at FAST NUCES** (Expository Writing)\n- **IT Intern at UBL Insurers** & **Software Engineering Fellow at Headstarter AI**.`;
    }

    // 19. Education & Certifications
    if (qLower.includes('education') || qLower.includes('degree') || qLower.includes('university') || qLower.includes('cert') || qLower.includes('aws') || qLower.includes('fast')) {
      return `Muhammad Taha is a **BS Computer Science Senior Student at FAST NUCES**. His certifications include:\n- **Deep Learning Specialization** (DeepLearning.AI / Coursera)\n- **AWS Certified Developer & Cloud Practitioner**\n- **LangChain & Agentic AI Systems Architect**`;
    }

    // 20. General Projects Catalog Intent
    if (qLower.includes('show projects') || qLower.includes('all projects') || qLower.includes('list projects') || qLower.includes('repos') || qLower.includes('project catalog')) {
      return `Muhammad Taha's engineering projects from his catalog include:\n- **AI Dental Receptionist**: Production Voice AI front-desk agent built at Verxeon with LangGraph, Pipecat, WebRTC, and Chroma RAG.\n- **RescueAI**: Bilingual AI emergency response platform with real-time ARIA assistant and instant GPS-SOS alerts.\n- **ApexKV Storage Engine**: High-performance C++ storage engine with LSM-Tree architecture.\n- **Veriflow**: B2B ML revenue leakage auditing system.\n\nExplore the project cards below!`;
    }

    // 21. Greetings & Casual Banter
    if (/^(hi|hello|hey|bro|dude|man|buddy|greetings|hola|howdy|whats up|what's up|sup|yo|hi bro|hey bro|hello bro)[\s!.]*$/i.test(qLower) || qLower.includes('how are you')) {
      return `Hey there! I'm Terry AI, Taha's AI representative. I'm here to help you explore Muhammad Taha's AI projects, engineering stack, published articles, and background. What would you like to know?`;
    }

    if (qLower.includes('fuck') || qLower.includes('shit') || qLower.includes('bitch') || qLower.includes('damn') || qLower.includes('ass')) {
      return `Haha, let's keep it constructive! 😄 Feel free to ask me anything about Taha's engineering projects, technical stack, or background.`;
    }

    // Default Fallback
    return `Muhammad Taha Nasir is an AI Engineer and senior CS student at FAST-NUCES specializing in Generative & Agentic AI systems, Voice AI pipelines, and Python backend infrastructure. Feel free to ask about his projects, skills, articles, or experience!`;
  }

  function searchResults(query) {
    let qLower = query.toLowerCase().trim();
    if (!qLower || qLower.length <= 2) {
      return { posts: [], projects: [] };
    }

    // Prevent Prompt Injection, Private Data, and Out-of-Scope queries from attaching cards
    const isSpecialDefense = qLower.includes('pretend') || qLower.includes('salary') || qLower.includes('recipe') || qLower.includes('address') || qLower.includes('cake') || qLower.includes('weather');
    if (isSpecialDefense) {
      return { posts: [], projects: [] };
    }

    // Explicit Greeting & Slang Check -> Simply greet back without dumping cards
    const isGreetingOrCasual = /^(hi|hello|hey|bro|dude|man|buddy|greetings|hola|howdy|whats up|what's up|sup|yo|good morning|good afternoon|good evening)[\s!.]*$/i.test(qLower);
    if (isGreetingOrCasual) {
      return { posts: [], projects: [] };
    }

    const isExplicitPostQuery = qLower.includes('how many articles') || qLower.includes('how many posts') || qLower.includes('all articles') || qLower.includes('all posts') || qLower.includes('show posts') || qLower.includes('list articles');
    const isExplicitProjectQuery = qLower.includes('all projects') || qLower.includes('show projects') || qLower.includes('list projects') || qLower.includes('view projects') || qLower.includes('repos');
    const isGeneralInfoQuery = qLower.includes('who is') || qLower.includes('about') || qLower.includes('skill') || qLower.includes('stack') || qLower.includes('education') || qLower.includes('degree') || qLower.includes('experience') || qLower.includes('contact') || qLower.includes('never met') || qLower.includes('compare');

    // 1. Dedicated Post/Article Query -> Show ONLY Articles
    if (isExplicitPostQuery && !isExplicitProjectQuery) {
      return { posts: postsData.slice(0, 4), projects: [] };
    }

    // 2. Dedicated Project Query -> Show ONLY Projects (Latest 4)
    if (isExplicitProjectQuery && !isExplicitPostQuery) {
      return { posts: [], projects: TERRY_KNOWLEDGE_BASE.projects.slice(0, 4) };
    }

    // 3. General Queries / Synthesis -> Do not dump heavy cards
    if (isGeneralInfoQuery) {
      return { posts: [], projects: [] };
    }

    // 4. Keyword Specific Search using Word-Boundary Matching (so "bro" doesn't match "Broke")
    const escapeRegex = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const wordRegex = new RegExp('\\b' + escapeRegex(qLower) + '\\b', 'i');

    const matchedProjects = TERRY_KNOWLEDGE_BASE.projects.filter(pr =>
      wordRegex.test(pr.title) ||
      wordRegex.test(pr.desc) ||
      pr.tags.some(t => wordRegex.test(t))
    ).slice(0, 4);

    const matchedPosts = postsData.filter(p =>
      wordRegex.test(p.title) ||
      wordRegex.test(p.summary || '') ||
      (p.tags && p.tags.some(t => wordRegex.test(t)))
    ).slice(0, 4);

    return { posts: matchedProjects, projects: matchedPosts };
  }

  // --- Render DOM for ChatGPT / Claude Style Window ---
  function createModalDOM() {
    if (document.getElementById('ai-search-modal-overlay')) return;

    const modalHTML = `
      <div class="ai-search-modal-overlay" id="ai-search-modal-overlay" aria-hidden="true">
        <div class="ai-chatbot-window option-a-window" role="dialog" aria-labelledby="ai-chatbot-title">
          
          <!-- Top Header Bar -->
          <div class="chatbot-header">
            <div class="chatbot-brand">
              <div class="bot-avatar-ring">
                <i class="fas fa-terminal"></i>
              </div>
              <div class="bot-info">
                <h3 id="ai-chatbot-title">Terry AI</h3>
                <span class="bot-status"><span class="status-dot"></span> Online</span>
              </div>
            </div>
            <div class="chatbot-header-actions">
              <button class="chat-action-btn" id="clear-chat-btn" title="Clear Chat History">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button class="ai-modal-close" id="ai-modal-close" title="Close (Esc)">&times;</button>
            </div>
          </div>

          <!-- Scrollable Chat Thread -->
          <div class="chatbot-thread" id="chatbot-thread">
            
            <!-- Modern Welcome Card -->
            <div class="welcome-card-option-a">
              <h2 class="welcome-heading">Hi! How can I help you today? ✨</h2>
              <p class="welcome-sub">Explore Terry's portfolio projects, Python stack, AI Voice agent architecture, or resume in real-time.</p>

              <div class="prompt-grid-option-a" id="chatbot-prompt-chips">
                <div class="chip prompt-card-item" data-query="What does Taha specialize in?">
                  <i class="fas fa-sparkles prompt-icon"></i>
                  <span class="prompt-label">Specialization</span>
                  <span class="prompt-desc">Generative & Agentic AI</span>
                </div>
                <div class="chip prompt-card-item" data-query="Why should we hire Taha as an AI Engineer?">
                  <i class="fas fa-bullseye prompt-icon" style="color:#f43f5e;"></i>
                  <span class="prompt-label">Why Hire Taha?</span>
                  <span class="prompt-desc">Engineering impact & role fit</span>
                </div>
                <div class="chip prompt-card-item" data-query="What is Taha's experience with Agentic AI and LangGraph?">
                  <i class="fas fa-robot prompt-icon" style="color:#a855f7;"></i>
                  <span class="prompt-label">Agentic AI</span>
                  <span class="prompt-desc">LangGraph & Multi-Agent systems</span>
                </div>
                <div class="chip prompt-card-item" data-query="Tell me about Taha's Voice AI experience">
                  <i class="fas fa-microphone prompt-icon" style="color:#38bdf8;"></i>
                  <span class="prompt-label">Voice AI & WebRTC</span>
                  <span class="prompt-desc">Sub-400ms streaming voice</span>
                </div>
                <div class="chip prompt-card-item" data-query="Show me Taha's latest projects">
                  <i class="fas fa-rocket prompt-icon" style="color:#fbbf24;"></i>
                  <span class="prompt-label">Latest Projects</span>
                  <span class="prompt-desc">Production AI & systems</span>
                </div>
                <div class="chip prompt-card-item" data-query="technical skills and stack">
                  <i class="fas fa-laptop-code prompt-icon" style="color:#34d399;"></i>
                  <span class="prompt-label">Skills & Stack</span>
                  <span class="prompt-desc">Python, FastAPI, PyTorch</span>
                </div>
              </div>
            </div>

            <!-- Welcome Message Bubble -->
            <div class="chat-bubble ai-bubble">
              <div class="bubble-header">
                <span class="sender-name">Terry AI</span>
              </div>
              <div class="bubble-content">
                Hey — I'm Terry AI! Ask me anything about Muhammad Taha Nasir's projects, technical stack, agentic workflows, or engineering background.
              </div>
            </div>

          </div>

          <!-- Fixed Bottom Input Bar -->
          <div class="chatbot-input-bar">
            <button class="stt-mic-btn" id="stt-mic-btn" title="Voice Input (Speech-to-Text)">
              <i class="fas fa-microphone"></i>
            </button>
            <input type="text" id="ai-search-input" placeholder="Ask Terry AI anything..." autocomplete="off" />
            <button class="chat-send-btn" id="chat-send-btn" title="Send Message">
              <i class="fas fa-arrow-up"></i>
            </button>
          </div>

        </div>
      </div>

      <!-- Bento Grid Nav Menu (Desktop Launchpad + Mobile Bottom Sheet) -->
      <div class="bento-dropdown-menu" id="bento-dropdown-menu" aria-hidden="true">
        <div class="bento-backdrop" id="bento-backdrop"></div>
        <div class="bento-dropdown-content">
          <!-- Mobile Drag Handle -->
          <div class="bento-drag-handle"></div>

          <!-- Header Bar -->
          <div class="bento-header-bar">
            <div class="bento-header-title">
              <i class="fas fa-th-large" style="color:var(--accent, #0a84ff);"></i> Navigation
            </div>
            <span class="bento-status-badge"><i class="fas fa-circle" style="color:#34d399; font-size:0.6rem; margin-right:4px;"></i> Available for Roles</span>
            <button class="bento-close-btn" id="bento-close-btn" aria-label="Close menu">&times;</button>
          </div>

          <!-- Bento Tiles Grid (6 tiles on Desktop, 4 non-bottom-nav tiles on Mobile) -->
          <div class="bento-links-grid">
            <a href="/projects.html" class="bento-link-card bento-desk-only featured">
              <div class="bento-icon" style="color:#0a84ff;"><i class="fas fa-code-branch"></i></div>
              <div class="bento-link-text">
                <span class="title">Projects</span>
                <span class="sub">Portfolio & Demos</span>
              </div>
              <i class="fas fa-arrow-right bento-arrow"></i>
            </a>
            <a href="/archives.html" class="bento-link-card bento-desk-only">
              <div class="bento-icon" style="color:#38bdf8;"><i class="fas fa-archive"></i></div>
              <div class="bento-link-text">
                <span class="title">Archives</span>
                <span class="sub">Masterlist & History</span>
              </div>
            </a>
            <a href="/posts.html" class="bento-link-card bento-desk-only">
              <div class="bento-icon" style="color:#60a5fa;"><i class="fas fa-newspaper"></i></div>
              <div class="bento-link-text">
                <span class="title">Posts</span>
                <span class="sub">Articles & Insights</span>
              </div>
            </a>
            <a href="/tags.html" class="bento-link-card">
              <div class="bento-icon" style="color:#c084fc;"><i class="fas fa-tags"></i></div>
              <div class="bento-link-text">
                <span class="title">Tags</span>
                <span class="sub">Browse Topics</span>
              </div>
            </a>
            <a href="/contact.html" class="bento-link-card">
              <div class="bento-icon" style="color:#34d399;"><i class="fas fa-envelope"></i></div>
              <div class="bento-link-text">
                <span class="title">Contact</span>
                <span class="sub">Get in Touch</span>
              </div>
            </a>
            <a href="/contact.html" class="bento-link-card call-card">
              <div class="bento-icon" style="color:#fbbf24;"><i class="fas fa-calendar-check"></i></div>
              <div class="bento-link-text">
                <span class="title">Book Call</span>
                <span class="sub">30-Min Intro</span>
              </div>
            </a>
          </div>

          <!-- Profile Footer -->
          <div class="bento-profile-footer">
            <div class="bento-profile-info">
              <span class="name">Muhammad Taha Nasir</span>
              <span class="role">CS Student & AI Engineer</span>
            </div>
            <div class="bento-socials">
              <a href="https://github.com/MuhammadTahaNasir" target="_blank" title="GitHub" aria-label="GitHub"><i class="fab fa-github"></i></a>
              <a href="https://www.linkedin.com/in/muhammadtahanasir/" target="_blank" title="LinkedIn" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
              <a href="mailto:m.tahanasir.cs@gmail.com" title="Email" aria-label="Email"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalEvents();
  }

  function setupModalEvents() {
    const overlay = document.getElementById('ai-search-modal-overlay');
    const closeBtn = document.getElementById('ai-modal-close');
    const clearBtn = document.getElementById('clear-chat-btn');
    const input = document.getElementById('ai-search-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const micBtn = document.getElementById('stt-mic-btn');
    const thread = document.getElementById('chatbot-thread');
    const chips = document.querySelectorAll('#chatbot-prompt-chips .chip');

    const bentoBackdrop = document.getElementById('bento-backdrop');
    const bentoCloseBtn = document.getElementById('bento-close-btn');
    const bentoQuickSearch = document.getElementById('bentoQuickSearch');

    if (bentoBackdrop) {
      bentoBackdrop.onclick = () => {
        const bentoMenu = document.getElementById('bento-dropdown-menu');
        if (bentoMenu) bentoMenu.classList.remove('active');
      };
    }

    if (bentoCloseBtn) {
      bentoCloseBtn.onclick = () => {
        const bentoMenu = document.getElementById('bento-dropdown-menu');
        if (bentoMenu) bentoMenu.classList.remove('active');
      };
    }

    if (bentoQuickSearch) {
      bentoQuickSearch.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.bento-links-grid .bento-link-card');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      };
    }

    async function handleUserSubmit() {
      const query = input.value.trim();
      if (!query) return;

      input.value = '';

      // Append User Message Bubble
      const userBubbleHTML = `
        <div class="chat-bubble user-bubble">
          <div class="bubble-content">${escapeHTML(query)}</div>
        </div>
      `;
      thread.insertAdjacentHTML('beforeend', userBubbleHTML);
      scrollToBottom();

      // Append AI Loading Bubble
      const loadingId = 'ai-loading-' + Date.now();
      const loadingHTML = `
        <div class="chat-bubble ai-bubble" id="${loadingId}">
          <div class="bubble-header">
            <span class="sender-name">Terry AI</span>
          </div>
          <div class="bubble-content">
            <em class="ai-typing"><i class="fas fa-circle-notch fa-spin"></i> Thinking...</em>
          </div>
        </div>
      `;
      thread.insertAdjacentHTML('beforeend', loadingHTML);
      scrollToBottom();

      // Fetch AI response & matched cards
      const aiReply = await fetchGroqAIResponse(query);
      const { posts, projects } = searchResults(query);

      const loadingElem = document.getElementById(loadingId);
      if (loadingElem) {
        let cardsHTML = '';

        if (projects.length > 0) {
          cardsHTML += `
            <div class="chat-cards-wrapper">
              <span class="cards-label"><i class="fas fa-rocket"></i> LATEST PROJECTS:</span>
              <div class="chat-cards-grid">
          `;
          projects.forEach(pr => {
            const thumb = pr.thumbnail || '/assets/images/building-voice-ai.png';
            cardsHTML += `
              <a href="${pr.url}" class="ai-card project-card">
                <div class="ai-card-img-wrapper">
                  <img src="${thumb}" alt="${escapeHTML(pr.title)}" class="ai-card-img" onerror="this.src='/assets/images/building-voice-ai.png'">
                  <div class="ai-card-badge">PROJECT</div>
                </div>
                <div class="ai-card-body">
                  <h4 class="ai-card-title">${escapeHTML(pr.title)}</h4>
                  <p class="ai-card-desc">${escapeHTML(pr.desc)}</p>
                </div>
              </a>
            `;
          });
          cardsHTML += `
              </div>
              <div class="ai-card-footer-action">
                <span>Want to explore all projects in detail?</span>
                <a href="/projects.html" class="ai-view-all-btn">View All Projects <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
          `;
        }

        if (posts.length > 0) {
          cardsHTML += `
            <div class="chat-cards-wrapper">
              <span class="cards-label"><i class="fas fa-newspaper"></i> LATEST POSTS:</span>
              <div class="chat-cards-grid">
          `;
          posts.forEach(p => {
            const thumb = p.image || p.thumbnail || '/assets/images/building-voice-ai.png';
            const dateStr = p.date ? p.date.substring(0,7) : '';
            cardsHTML += `
              <a href="/${p.url}" class="ai-card post-card">
                <div class="ai-card-img-wrapper">
                  <img src="${thumb}" alt="${escapeHTML(p.title)}" class="ai-card-img" onerror="this.src='/assets/images/building-voice-ai.png'">
                  <div class="ai-card-badge">ARTICLE</div>
                </div>
                <div class="ai-card-body">
                  <h4 class="ai-card-title">${escapeHTML(p.title)}</h4>
                  <p class="ai-card-desc">${escapeHTML(p.summary || p.desc || '')}</p>
                  <div class="ai-card-meta">${dateStr} • ${p.time || '3 min'} read</div>
                </div>
              </a>
            `;
          });
          cardsHTML += `
              </div>
              <div class="ai-card-footer-action">
                <span>Want to explore all technical articles?</span>
                <a href="/posts.html" class="ai-view-all-btn">View All Posts <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
          `;
        }

        const formattedReply = aiReply
          .replace(/\n\n/g, '<br/><br/>')
          .replace(/\n/g, '<br/>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');

        const uniqueSpeakerId = 'speaker-' + Date.now();

        loadingElem.innerHTML = `
          <div class="bubble-header">
            <span class="sender-name">Terry AI</span>
            <button class="tts-speaker-btn" id="${uniqueSpeakerId}" title="Read Aloud (Text-to-Speech)">
              <i class="fas fa-volume-up"></i>
            </button>
          </div>
          <div class="bubble-content">
            ${formattedReply}
            ${cardsHTML}
          </div>
        `;

        const speakerBtn = document.getElementById(uniqueSpeakerId);
        if (speakerBtn) {
          speakerBtn.addEventListener('click', () => speakText(aiReply, speakerBtn));
        }
      }

      scrollToBottom();
    }

    function scrollToBottom() {
      if (thread) {
        thread.scrollTop = thread.scrollHeight;
      }
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }

    if (sendBtn) sendBtn.addEventListener('click', handleUserSubmit);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUserSubmit();
        }
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        input.value = q;
        handleUserSubmit();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        chatHistory = [];
        thread.innerHTML = `
          <div class="chat-bubble ai-bubble">
            <div class="bubble-header">
              <span class="sender-name">Terry AI</span>
            </div>
            <div class="bubble-content">
              Chat history cleared. Feel free to ask another question about Muhammad Taha Nasir's work or articles.
            </div>
          </div>
        `;
      });
    }

    const recognition = initSpeechRecognition(
      (transcript) => {
        input.value = transcript;
      },
      () => micBtn.classList.remove('listening')
    );

    if (micBtn) {
      const toggleMic = (e) => {
        if (e) e.preventDefault();
        if (!recognition) {
          alert("Speech recognition is not supported in this browser.");
          return;
        }
        if (isSpeechRecognizing) {
          recognition.stop();
          isSpeechRecognizing = false;
          micBtn.classList.remove('listening');
        } else {
          recognition.start();
          isSpeechRecognizing = true;
          micBtn.classList.add('listening');
        }
      };

      micBtn.addEventListener('click', toggleMic);
      micBtn.addEventListener('touchstart', toggleMic, { passive: false });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function openModal() {
    createModalDOM();
    const overlay = document.getElementById('ai-search-modal-overlay');
    const input = document.getElementById('ai-search-input');
    if (overlay) {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => input && input.focus(), 100);
    }
  }

  function closeModal() {
    const overlay = document.getElementById('ai-search-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }

  function toggleBentoMenu() {
    createModalDOM();
    const bentoMenu = document.getElementById('bento-dropdown-menu');
    if (bentoMenu) {
      const isExpanded = bentoMenu.classList.contains('active');
      if (isExpanded) {
        bentoMenu.classList.remove('active');
        bentoMenu.setAttribute('aria-hidden', 'true');
      } else {
        bentoMenu.classList.add('active');
        bentoMenu.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // Expose methods to window object immediately so inline onclick handlers never fail
  window.openAISearchModal = function() {
    createModalDOM();
    openModal();
  };
  window.closeAISearchModal = closeModal;
  window.toggleBentoMenu = toggleBentoMenu;

  // Immediately attach capture-phase click listener
  document.addEventListener('click', (e) => {
    // 1. Intercept Bento Menu Toggle Button Clicks
    const bentoBtn = e.target.closest('#bento-menu-btn, .bento-menu-btn');
    if (bentoBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleBentoMenu();
      return;
    }

    // 2. Intercept Floating Chat Bubble Widget Clicks -> Open AI Assistant Chatbot
    const chatBtn = e.target.closest('.chat-widget-btn, .floating-chat-widget, #floating-chat-btn');
    if (chatBtn) {
      e.preventDefault();
      e.stopPropagation();
      window.openAISearchModal();
      return;
    }

    // 3. Close Bento Menu when clicking outside content area
    const bentoMenu = document.getElementById('bento-dropdown-menu');
    if (bentoMenu && bentoMenu.classList.contains('active')) {
      const content = bentoMenu.querySelector('.bento-dropdown-content');
      if (content && !content.contains(e.target) && !bentoBtn) {
        bentoMenu.classList.remove('active');
      }
    }
  }, true);

  function setupGlobalTriggers() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        const bentoMenu = document.getElementById('bento-dropdown-menu');
        if (bentoMenu) bentoMenu.classList.remove('active');
      }
    });
  }

  // Create Modal DOM immediately if document is ready or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPostsData();
      loadProjectsData();
      createModalDOM();
      setupGlobalTriggers();
    });
  } else {
    loadPostsData();
    loadProjectsData();
    createModalDOM();
    setupGlobalTriggers();
  }

})();
