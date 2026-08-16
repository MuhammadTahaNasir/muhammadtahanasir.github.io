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

  // --- Groq AI API Fetch with Smart Typo Resolution & Verified Persona ---
  async function fetchGroqAIResponse(query) {
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

    // Article Count Query / Follow-up ("only 5?", "no more?", "how many posts?")
    if (qLower.includes('only 5') || qLower.includes('no more') || qLower.includes('how many') || qLower.includes('total article') || qLower.includes('total post')) {
      return `Muhammad Taha has written **40 masterlist technical articles** in total! The titles listed above are just a few recent highlights. You can explore all 40 articles on the posts archive page ([posts.html](/posts.html)) or by clicking "View All Posts" below!`;
    }

    // Technical Articles & Posts (Real titles from posts.json)
    if (qLower.includes('post') || qLower.includes('article') || qLower.includes('blog') || qLower.includes('notes') || qLower.includes('writing') || qLower.includes('read')) {
      let titlesList = "";
      if (postsData && postsData.length > 0) {
        titlesList = postsData.slice(0, 5).map(p => `- **${p.title}**`).join('\n');
      } else {
        titlesList = `- **What I'd Tell a New CS Grad Entering AI in 2026**\n- **Twilio + LLMs: Building Conversational Voice Workflows for Enterprise**\n- **Four Years Later: What Building AI Products Actually Looks Like**\n- **Cutting AI Latency in Half: Semantic Caching, Request Batching, & vLLM**\n- **Training LLMs Without Going Broke: LoRA & PEFT Fine-Tuning on AWS**`;
      }
      return `Muhammad Taha has written **40 masterlist technical articles** in total! Here are a few recent highlights:\n\n${titlesList}\n\nExplore all 40 articles below or visit posts.html!`;
    }

    // API Wrapper Skepticism / Genuine Understanding
    if (qLower.includes('wrapper') || qLower.includes('just api') || qLower.includes('only api') || qLower.includes('understand ai')) {
      return `No. Taha's work goes well beyond simple API wrappers.\n\n` +
             `His background combines traditional Machine Learning and Deep Learning (PyTorch, Scikit-learn, Computer Vision, NLP) with modern AI systems engineering.\n\n` +
             `Instead of relying on basic prompt templates, he builds complex stateful graph execution (LangGraph), custom hybrid RAG pipelines (pgvector, Chroma DB, sparse BM25), real-time WebRTC audio streaming, and high-performance C++ storage engines like **ApexKV**.`;
    }

    // Why Hire / Recruiter Pitch
    if (qLower.includes('hire') || qLower.includes('why should') || qLower.includes('role fit') || qLower.includes('recruit')) {
      return `Why hire Taha?\n\n` +
             `Because he combines practical software engineering with hands-on AI/LLM experience. He builds complete systems — stateful agentic workflows (LangGraph), hybrid RAG search, real-time voice streaming (WebRTC, STT/TTS), and production Python backends (FastAPI, Docker, PostgreSQL) — rather than limiting himself to notebooks or simple API wrappers.`;
    }

    // Best Project / Project Comparisons
    if (qLower.includes('best project') || qLower.includes('compare project') || qLower.includes('impressive project') || qLower.includes('which project')) {
      return `Taha's strongest projects excel in different dimensions:\n\n` +
             `- **Generative & Agentic AI**: **AI Dental Receptionist** & **RescueAI** (Voice AI, LangGraph, RAG, real-time WebRTC, FastAPI backend).\n` +
             `- **Systems & Infrastructure**: **ApexKV Storage Engine** (C++ LSM-Tree storage engine with SSTables & WAL).\n` +
             `- **Machine Learning & Anomaly Detection**: **Veriflow** (B2B ML revenue leakage auditing analyzing $21M+ transactions).\n\n` +
             `For AI Engineering roles, **AI Dental Receptionist** and **RescueAI** best demonstrate his current direction!`;
    }

    // Achievements & Competitions
    if (qLower.includes('achievement') || qLower.includes('icpc') || qLower.includes('codejail') || qLower.includes('competition') || qLower.includes('contest')) {
      return `Muhammad Taha's competitive programming and technical achievements include:\n\n` +
             `- **ICPC Regional Qualifier**: Ranked **86th in Asia**.\n` +
             `- **CodeJail Championship**: **1st Place Winner** in Competitive Programming.\n` +
             `- **FAST Problem Solving Competition**: **3rd Place**.\n` +
             `- **Generative AI Application Developer Program**: **Top Performer (96.04% score)**.`;
    }

    // Leadership & Student Community
    if (qLower.includes('leadership') || qLower.includes('president') || qLower.includes('innovation club') || qLower.includes('mentor')) {
      return `Muhammad Taha served as **President of the FAST Innovation Club**, leading technical workshops, hackathons, competitive programming contests, and student mentoring initiatives across campus.`;
    }

    // Engineering Philosophy & Favorite Quote
    if (qLower.includes('philosophy') || qLower.includes('quote') || qLower.includes('feynman') || qLower.includes('motto')) {
      return `Taha's engineering philosophy is anchored in first principles:\n\n` +
             `*“What I cannot create, I do not understand.”* — Richard Feynman\n\n` +
             `He believes in understanding software beneath black-box API abstractions, engineering reliable systems, and turning complex ideas into functional products from the ground up.`;
    }

    // Weakness / Growth Areas (Honest & Grounded)
    if (qLower.includes('weakness') || qLower.includes('growth area') || qLower.includes('limitation')) {
      return `From his documented portfolio, Taha's current growth areas focus on scaling production-grade AI infrastructure, deep Kubernetes/MLOps observability, and increasingly sophisticated multi-agent orchestration.\n\n` +
             `He is grounded in honest engineering and continues expanding his systems depth as an early-career AI Engineer.`;
    }

    // Project Specific - RescueAI
    if (qLower.includes('rescueai') || qLower.includes('rescue')) {
      return `**RescueAI** is an AI Emergency Response Platform built by Taha.\n\n` +
             `- **Architecture**: FastAPI async backend, React frontend, Llama-based AI assistant (ARIA), real-time WebSockets, and GPS SOS alerts.\n` +
             `- **Capabilities**: Bilingual (English & Urdu) voice interaction, location-aware emergency dispatching, and automated SOS notification workflows.\n` +
             `Check out the project card below!`;
    }

    // Project Specific - AI Dental Receptionist
    if (qLower.includes('dental') || qLower.includes('receptionist')) {
      return `**AI Dental Receptionist** is a front-desk Voice AI agent built by Taha at Verxeon.\n\n` +
             `- **Architecture**: Low-latency STT (Deepgram) → LangGraph state machine → TTS (ElevenLabs) over WebRTC and Twilio Media Streams.\n` +
             `- **Capabilities**: Autonomous appointment scheduling, tool calling via Google Calendar API, and Chroma DB semantic RAG lookup for clinic queries.`;
    }

    // Project Specific - ApexKV
    if (qLower.includes('apexkv') || qLower.includes('apex')) {
      return `**ApexKV** is a high-performance C++ Key-Value Storage Engine built by Taha.\n\n` +
             `- **Architecture**: Custom Log-Structured Merge-Tree (LSM-Tree), Sorted String Tables (SSTables), Write-Ahead Logging (WAL), concurrent memtable flushing, and Sparse Indexing for O(1) lookups.`;
    }

    // Project Specific - Veriflow
    if (qLower.includes('veriflow')) {
      return `**Veriflow** is a B2B Revenue Leakage & Invoice Auditing System built by Taha.\n\n` +
             `- **Impact**: Analyzed 5,500+ B2B transactions worth $21M+ and flagged 86 freight overcharge anomalies.\n` +
             `- **Stack**: Python, Scikit-learn Random Forest, Pandas, SQLite transaction auditing.`;
    }

    // Job Availability & Target Roles
    if (qLower.includes('role') || qLower.includes('available') || qLower.includes('remote') || qLower.includes('looking for') || qLower.includes('job')) {
      return `Taha is actively targetting **AI Engineer**, **Generative & Agentic AI Engineer**, and **AI Software Engineer** roles.\n\n` +
             `- **Availability**: Open for full-time positions, contracts, and remote opportunities worldwide.\n` +
             `- **Ideal Fit**: Engineering teams building LLM products, RAG search engines, Voice AI, and stateful agentic backend infrastructure.`;
    }

    // Why Hire / Recruiter Pitch
    if (qLower.includes('hire') || qLower.includes('why should') || qLower.includes('role fit') || qLower.includes('recruit')) {
      return `Taha's strongest combination is **AI Systems + Backend Engineering**.\n\n` +
             `Unlike developers who treat LLMs as simple API endpoints, Taha builds the complete system around the model — stateful agentic workflows (LangGraph), hybrid RAG search, real-time voice streaming (WebRTC, STT/TTS), and production Python backends (FastAPI, Docker, PostgreSQL).\n\n` +
             `His production experience as a Voice AI Engineering Intern at **Verxeon** and projects like **AI Dental Receptionist**, **RescueAI**, and **ApexKV** prove he delivers end-to-end engineered software.`;
    }

    // Agentic AI & LangGraph
    if (qLower.includes('agentic') || qLower.includes('agent') || qLower.includes('langgraph')) {
      return `Taha's work with **Agentic AI** centers around stateful multi-step execution, cyclic graph state machines (LangGraph), tool calling, and contextual retrieval.\n\n` +
             `He designs autonomous workflows where an LLM retrieves context, evaluates dynamic conditions, executes external tools (e.g. Google Calendar API, databases), and manages memory state. Check out his **AI Dental Receptionist** and LangGraph masterlist articles below!`;
    }

    // Voice AI & Realtime Pipelines
    if (qLower.includes('voice') || qLower.includes('webrtc') || qLower.includes('pipecat') || qLower.includes('deepgram')) {
      return `Taha specializes in low-latency **Conversational Voice AI** pipelines combining speech-to-text (Deepgram), LLM streaming, and text-to-speech (ElevenLabs) over WebSockets and WebRTC.\n\n` +
             `At **Verxeon**, he developed front-desk Voice AI agents integrated with Pipecat and Twilio Media Streams. Explore his Voice AI projects below!`;
    }

    // Skills & Tech Stack (Layered positioning)
    if (qLower.includes('skill') || qLower.includes('stack') || qLower.includes('tool') || qLower.includes('technology') || qLower.includes('technologies')) {
      return `Muhammad Taha's technical skills are structured across core engineering layers:\n\n` +
             `- **Generative & Agentic AI**: LLM Applications, RAG Pipelines, Vector DBs (ChromaDB, pgvector, Qdrant), AI Agents, LangGraph, Tool Calling, Stateful Workflows\n` +
             `- **Voice AI & Realtime**: Speech-to-Text (Deepgram), Text-to-Speech (ElevenLabs), WebRTC Audio Pipelines, Pipecat, Twilio\n` +
             `- **Machine Learning & Deep Learning**: PyTorch, TensorFlow, Scikit-learn, Neural Networks, NLP, Computer Vision\n` +
             `- **Backend & Systems Engineering**: Python, C++, FastAPI, REST APIs, WebSockets, PostgreSQL, MongoDB, SQLite, Redis\n` +
             `- **Cloud & MLOps**: AWS (Certified Developer & Cloud Practitioner), Docker, CI/CD, MLflow, Linux, Git`;
    }

    // RAG & Knowledge Retrieval
    if (qLower.includes('rag') || qLower.includes('retrieval') || qLower.includes('vector') || qLower.includes('pgvector') || qLower.includes('chroma') || qLower.includes('embedding')) {
      return `Muhammad Taha specializes in **Retrieval-Augmented Generation (RAG)** and Enterprise Knowledge Systems. He builds hybrid search pipelines combining dense vector embeddings (Chroma DB/pgvector/Qdrant) with sparse BM25 retrieval. Check out his **AI Dental Receptionist** (Chroma DB) and masterlist articles on Advanced RAG below!`;
    }

    // Technical Articles & Posts
    if (qLower.includes('post') || qLower.includes('article') || qLower.includes('blog') || qLower.includes('notes') || qLower.includes('writing') || qLower.includes('read')) {
      return `Muhammad Taha has authored in-depth technical posts covering Model Context Protocol (MCP), WebRTC Audio Streaming, Local LLMs with Ollama/vLLM, RAG Architectures, and C++ LSM-Tree Storage Engines. Explore his latest posts below!`;
    }

    // Projects Catalog
    if (qLower.includes('project') || qLower.includes('built') || qLower.includes('code') || qLower.includes('repo') || qLower.includes('saas') || qLower.includes('app')) {
      return `Muhammad Taha's engineering projects from his catalog include:\n- **AI Dental Receptionist**: Production Voice AI front-desk agent built at Verxeon with LangGraph, Pipecat, WebRTC, and Chroma RAG.\n- **RescueAI**: Bilingual AI emergency response platform with real-time ARIA assistant and instant GPS-SOS alerts.\n- **ApexKV Storage Engine**: High-performance C++ storage engine with LSM-Tree architecture.\n- **Veriflow**: B2B ML revenue leakage auditing system.\n\nExplore the project cards below!`;
    }

    // Education & Certifications
    if (qLower.includes('education') || qLower.includes('degree') || qLower.includes('university') || qLower.includes('cert') || qLower.includes('aws') || qLower.includes('fast')) {
      return `Muhammad Taha is a **BS Computer Science Senior Student at FAST NUCES**. His certifications include:\n- **Deep Learning Specialization** (DeepLearning.AI / Coursera)\n- **AWS Certified Developer & Cloud Practitioner**\n- **LangChain & Agentic AI Systems Architect**`;
    }

    // Work Experience
    if (qLower.includes('experience') || qLower.includes('intern') || qLower.includes('job') || qLower.includes('work') || qLower.includes('verxeon') || qLower.includes('cdc')) {
      return `Muhammad Taha's work experience includes:\n- **Voice AI Engineering Intern at Verxeon** (Voice AI agents, LangGraph, Twilio)\n- **Enterprise Security Intern at CDC Pakistan** (IAM, Cloud Security, Compliance)\n- **Teaching Assistant at FAST NUCES** (Expository Writing)\n- **IT Intern at UBL Insurers** & **Software Engineering Fellow at Headstarter AI**.`;
    }

    // Greetings & Casual Inquiries
    if (/^(hi|hello|hey|bro|dude|man|buddy|greetings|hola|howdy|whats up|what's up|sup|yo|hi bro|hey bro|hello bro)[\s!.]*$/i.test(qLower) || qLower.includes('how are you') || qLower.includes('do you need') || qLower.includes('can you help')) {
      return `Hey there! I'm Terry AI, Taha's AI representative. I'm here to help you explore Muhammad Taha's AI projects, engineering stack, published articles, and background. What would you like to know?`;
    }

    // Bot Identity ("who are you", "who are u", "what are you")
    if (qLower.includes('who are you') || qLower.includes('who are u') || qLower.includes('who r u') || qLower.includes('what are you') || qLower.includes('your name') || qLower.includes('are you ai') || qLower.includes('are you real')) {
      return `I'm **Terry AI**, an AI representative created for Muhammad Taha Nasir's portfolio. I can answer questions about his Voice AI systems, agentic workflows (LangGraph), full-stack AI engineering, technical articles, and career background.`;
    }

    // Opinion / Candidate Evaluation ("what you think about taha", "is taha a good choice", "is he good")
    if (qLower.includes('what you think') || qLower.includes('what u think') || qLower.includes('good choice') || qLower.includes('is he good') || qLower.includes('recommend taha') || qLower.includes('should i work with')) {
      return `Taha is a dedicated, hands-on **AI Engineer** who excels at building end-to-end production systems.\n\n` +
             `Unlike developers who stop at basic LLM prompts, Taha designs full architectures — low-latency Voice AI (WebRTC, Deepgram, ElevenLabs), cyclic agentic state graphs (LangGraph), hybrid RAG search, and high-performance C++ storage engines (ApexKV). He is reliable, first-principles driven, and delivers real-world software.`;
    }

    // Profanity / Casual Banter Filter
    if (qLower.includes('fuck') || qLower.includes('shit') || qLower.includes('bitch') || qLower.includes('damn') || qLower.includes('ass')) {
      return `Haha, let's keep it constructive! 😄 Feel free to ask me anything about Taha's engineering projects, technical stack, or background.`;
    }

    // Bio & Story ("who is taha", "about taha", "tell me about taha")
    if (qLower.includes('who is') || qLower.includes('story') || qLower.includes('bio') || qLower.includes('about taha') || qLower.includes('about terry') || qLower.includes('tell me about')) {
      return `**Muhammad Taha Nasir** is a Senior Computer Science student at FAST-NUCES and an **AI Engineer focused on Generative & Agentic Systems**.\n\n` +
             `*“Building intelligent AI systems that reason, retrieve, act, and interact.”*\n\n` +
             `He specializes in designing AI-powered systems — from LLM and RAG pipelines to agentic workflows (LangGraph), real-time Voice AI applications (WebRTC, Deepgram, ElevenLabs), and the Python backend engineering needed to turn them into production applications.`;
    }

    // Default Fallback
    return `Muhammad Taha Nasir is an AI Engineer and senior CS student at FAST-NUCES specializing in Generative & Agentic AI systems, Voice AI pipelines, and Python backend infrastructure. Feel free to ask about his projects, skills, articles, or experience!`;
  }

  function searchResults(query) {
    let qLower = query.toLowerCase().trim();
    if (!qLower || qLower.length <= 2) {
      // Prevent 2-letter substrings like "hi", "in", "it", "to" from matching random text
      return { posts: [], projects: [] };
    }

    // Explicit Greeting & Slang Check -> Simply greet back without dumping cards
    const isGreetingOrCasual = /^(hi|hello|hey|bro|dude|man|buddy|greetings|hola|howdy|whats up|what's up|sup|yo|good morning|good afternoon|good evening)[\s!.]*$/i.test(qLower);
    if (isGreetingOrCasual) {
      return { posts: [], projects: [] };
    }

    const isExplicitPostQuery = qLower.includes('post') || qLower.includes('article') || qLower.includes('blog') || qLower.includes('archive') || qLower.includes('note');
    const isExplicitProjectQuery = qLower.includes('project') || qLower.includes('proj') || qLower.includes('built') || qLower.includes('repo') || qLower.includes('apexkv') || qLower.includes('saas');
    const isGeneralInfoQuery = qLower.includes('who is') || qLower.includes('about') || qLower.includes('skill') || qLower.includes('stack') || qLower.includes('education') || qLower.includes('degree') || qLower.includes('experience') || qLower.includes('contact');

    // 1. Dedicated Post/Article Query -> Show ONLY Articles
    if (isExplicitPostQuery && !isExplicitProjectQuery) {
      return { posts: postsData.slice(0, 4), projects: [] };
    }

    // 2. Dedicated Project Query -> Show ONLY Projects (Latest 4)
    if (isExplicitProjectQuery && !isExplicitPostQuery) {
      return { posts: [], projects: TERRY_KNOWLEDGE_BASE.projects.slice(0, 4) };
    }

    // 3. General Bio / Skills / Education / Contact -> Show ONLY text response (no heavy cards)
    if (isGeneralInfoQuery && !isExplicitProjectQuery && !isExplicitPostQuery) {
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
