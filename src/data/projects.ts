export interface Project {
  id: number;
  title: string;
  category: string;
  stack: string[];
  keyMetric: string;
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  image: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Voice Healthcare Agent",
    category: "Real-Time Voice AI",
    stack: ["FastAPI", "Groq Whisper v3", "Qwen-TTS", "Gemini API", "ChromaDB", "WebSockets", "Docker", "GCP"],
    keyMetric: "Sub-3s latency \u00b7 89% triage accuracy \u00b7 73% hallucination reduction",
    description: "Conversational medical triage system processing patient audio in real-time with sub-3-second end-to-end response latency.",
    image: "/images/projects/voice-agent.jpg",
  },
  {
    id: 2,
    title: "Multi-Agent AI System",
    category: "Autonomous Agentic Framework",
    stack: ["LangGraph", "LangChain", "OpenAI API", "React.js", "Docker", "GCP"],
    keyMetric: "95% autonomous task completion across 200+ scenario types",
    description: "Multi-agent orchestration framework with planning, tool use, and memory coordination across 200+ scenario types.",
    liveUrl: "https://multi-ai-agent11.netlify.app",
    image: "/images/projects/multi-agent.jpg",
  },
  {
    id: 3,
    title: "AI Root Cause Analyzer",
    category: "SRE Automation",
    stack: ["FastAPI", "Gemini API", "ChromaDB", "PostgreSQL", "SSE", "Next.js", "Docker"],
    keyMetric: "65% MTTR reduction \u00b7 85% pattern accuracy",
    description: "Automated incident root cause analysis reducing mean time to resolution by 65% through pattern matching.",
    image: "/images/projects/root-cause.jpg",
  },
  {
    id: 4,
    title: "Enterprise RAG Chatbot",
    category: "Document Intelligence",
    stack: ["LangChain", "FAISS", "Weaviate", "OpenAI API", "Flask", "Node.js", "MongoDB"],
    keyMetric: "92% contextual accuracy \u00b7 15 min \u2192 12s retrieval \u00b7 85% hallucination reduction",
    description: "Enterprise document intelligence with hybrid retrieval, reranking, and hallucination guardrails.",
    liveUrl: "https://docmind122.netlify.app",
    image: "/images/projects/rag-chatbot.jpg",
  },
  {
    id: 5,
    title: "Real-Time Retail Intelligence",
    category: "Computer Vision",
    stack: ["YOLOv8", "OpenCV", "Python", "Multi-Camera"],
    keyMetric: "Real-time multi-feed \u00b7 cross-camera deduplication",
    description: "Multi-camera retail analytics with person detection, cross-camera tracking, and deduplication.",
    image: "/images/projects/retail-cv.jpg",
  },
  {
    id: 6,
    title: "Heart Disease Risk Prediction",
    category: "ML Classification",
    stack: ["Scikit-learn", "XGBoost", "FastAPI", "Docker"],
    keyMetric: "90.2% accuracy \u00b7 91.8% Recall \u00b7 ROC-AUC 0.956",
    description: "Clinical risk stratification model with interpretable feature importance and confidence calibration.",
    liveUrl: "https://heart-disease-classification-cptr.onrender.com",
    image: "/images/projects/heart-ml.jpg",
  },
  {
    id: 7,
    title: "MLOps Pipeline",
    category: "Model Lifecycle Engineering",
    stack: ["MLflow", "Docker", "GitHub Actions", "Scikit-learn"],
    keyMetric: "Automated tracking, versioning, CI/CD",
    description: "End-to-end ML pipeline with automated experiment tracking, model versioning, and deployment.",
    image: "/images/projects/mlops.jpg",
  },
];

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  year: string;
}

export const certificates: Certificate[] = [
  { id: 1, title: "Generative AI with Vertex AI", issuer: "Google Cloud Skills Boost", year: "2025" },
  { id: 2, title: "Career Essentials in Generative AI", issuer: "Microsoft & LinkedIn", year: "2025" },
  { id: 3, title: "Artificial Intelligence & Machine Learning", issuer: "SmartBridge", year: "2025" },
  { id: 4, title: "Python for Data Science", issuer: "IBM", year: "2025" },
];

export interface Skill {
  name: string;
  tier: 1 | 2 | 3;
  description: string;
}

export const skills: Skill[] = [
  { name: "LangGraph", tier: 1, description: "Agent workflow orchestration framework" },
  { name: "LangChain", tier: 1, description: "LLM application framework" },
  { name: "RAG", tier: 1, description: "Retrieval-Augmented Generation systems" },
  { name: "Vector DBs", tier: 1, description: "Vector database management" },
  { name: "FastAPI", tier: 1, description: "High-performance Python web framework" },
  { name: "Python", tier: 1, description: "Primary programming language" },
  { name: "OpenAI", tier: 2, description: "GPT models and API integration" },
  { name: "Gemini", tier: 2, description: "Google multimodal AI models" },
  { name: "YOLOv8", tier: 2, description: "Real-time object detection" },
  { name: "Docker", tier: 2, description: "Containerization platform" },
  { name: "GCP", tier: 2, description: "Google Cloud Platform services" },
  { name: "React", tier: 2, description: "Frontend UI library" },
  { name: "Next.js", tier: 2, description: "React framework for production" },
  { name: "MLflow", tier: 3, description: "ML experiment tracking" },
  { name: "MongoDB", tier: 3, description: "NoSQL document database" },
  { name: "PostgreSQL", tier: 3, description: "Relational database" },
  { name: "GitHub Actions", tier: 3, description: "CI/CD automation" },
  { name: "Cursor", tier: 3, description: "AI-powered code editor" },
  { name: "Copilot", tier: 3, description: "AI pair programming" },
  { name: "MCP", tier: 2, description: "Model Context Protocol" },
  { name: "ChromaDB", tier: 2, description: "Vector database" },
  { name: "FAISS", tier: 2, description: "Facebook AI Similarity Search" },
  { name: "Weaviate", tier: 2, description: "Vector search engine" },
  { name: "Flask", tier: 2, description: "Python micro web framework" },
  { name: "Node.js", tier: 2, description: "JavaScript runtime" },
  { name: "WebSockets", tier: 2, description: "Real-time bidirectional communication" },
  { name: "SSE", tier: 2, description: "Server-Sent Events" },
  { name: "OpenCV", tier: 2, description: "Computer vision library" },
];

export const skillCategories = [
  { title: "Core LLM Stack", skills: "LangGraph \u00b7 LangChain \u00b7 OpenAI \u00b7 Gemini / Vertex AI \u00b7 MCP" },
  { title: "RAG & Vector Search", skills: "ChromaDB \u00b7 FAISS \u00b7 Weaviate \u00b7 Hybrid BM25 \u00b7 Reranking" },
  { title: "Voice & Real-Time AI", skills: "Groq Whisper v3 \u00b7 Qwen-TTS \u00b7 WebSockets \u00b7 SSE" },
  { title: "MLOps", skills: "MLflow \u00b7 Docker \u00b7 GitHub Actions \u00b7 GCP \u00b7 CI/CD" },
  { title: "Full-Stack", skills: "FastAPI \u00b7 React.js \u00b7 Next.js \u00b7 Node.js \u00b7 PostgreSQL \u00b7 MongoDB" },
  { title: "Computer Vision", skills: "YOLOv8 \u00b7 OpenCV \u00b7 Multi-Camera \u00b7 Real-Time Analytics" },
  { title: "AI Dev Tools", skills: "Cursor \u00b7 GitHub Copilot \u00b7 Codex \u00b7 Windsurf" },
];
