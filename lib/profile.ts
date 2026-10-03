// ─────────────────────────────────────────────────────────────────────────────
//  Website content for Hong Thai Tran.
//  The AI digital twin's knowledge lives separately in lib/twin.ts +
//  lib/twin-knowledge.json (sourced from the digital_twin project).
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: "Thai Tran",
  initials: "TT",
  avatar: "/avatar.png", // in public/ — set to "" to fall back to initials
  title: "AI Agentic Engineer & Senior Mobile Developer",
  tagline: "I ship reliable apps and intelligent agents.",
  available: true,
  location: "Ho Chi Minh City, Vietnam",
  email: "pf2707@gmail.com",
  languages: "EN / VI / 中文",

  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "100%", label: "Job Success" },
    { value: "Top Rated", label: "On Upwork" },
  ],

  about: [
    "I help businesses turn ideas into reliable, high-performing mobile apps. With over 10 years of hands-on experience, I've delivered production apps used by thousands of users across iOS and Android — fluently across Flutter, native Swift / SwiftUI, and Kotlin.",
    "These days I work as an AI Agentic Engineer: I design, orchestrate, and deploy intelligent agent teams that dramatically accelerate development — building custom plugins, skills, sub-agents, and multi-agent orchestrators with Claude Code, Cursor, and n8n automations.",
    "Originally from Ho Chi Minh City, Vietnam, and Top Rated on Upwork with a 100% Job Success Score. Outside of work you'll find me watching football, playing games, and having coffee in quiet places.",
  ],

  experience: [
    {
      period: "2026 — Present",
      role: "AI Agentic Engineer & n8n Automation Developer",
      org: "Independent",
      summary:
        "Built Mobile Agent Kit — a Claude plugin with 4 specialized agents covering testing, code review, crash triage, and release automation. Shipped a voice-enabled AI finance app and multiplayer survival game, plus end-to-end n8n sales and content workflows.",
    },
    {
      period: "2020 — Present",
      role: "Senior Software Engineer · Mobile Cross-Platform",
      org: "Beowulf Network Inc · Full-time",
      summary:
        "Flutter / Dart cross-platform apps: Defiato (DeFi staking & yield farming), Fan8 (live events platform), a Contact Center video/voice SDK, and FinNote (expense management).",
    },
    {
      period: "2013 — Present",
      role: "Senior Software Engineer · iOS Developer",
      org: "Beowulf Network Inc · Full-time",
      summary:
        "Native Objective-C / Swift apps and frameworks: Quickom (decentralized communication platform), the Quickom call-center SDK, Drivor (driver-hiring system), and more. Led a legacy Objective-C → Swift migration for ~30% better performance.",
    },
  ],

  skills: [
    { group: "Mobile", items: ["Flutter", "Swift", "SwiftUI", "Kotlin", "iOS", "Android"] },
    { group: "Languages", items: ["Dart", "Swift", "Objective-C", "Kotlin", "Java"] },
    { group: "AI & Automation", items: ["AI Agents", "Claude Code", "n8n", "MCP", "Voice Agents"] },
    { group: "Backend & Tools", items: ["RESTful API", "GraphQL", "Firebase", "Git", "In-App Purchases"] },
  ],

  // How many projects to show per group before the "View all" toggle reveals the rest.
  featuredPerGroup: 3,
  projects: [
    // ── AI & Agents ──────────────────────────────────────────────
    {
      category: "ai" as const,
      icon: "🤖",
      name: "Mobile Agent Kit",
      description:
        "A Claude plugin integrating 4 specialized AI agents across the mobile app lifecycle: automated testing, code review, crash triage, and release automation.",
    },
    {
      category: "ai" as const,
      icon: "🎙️",
      name: "Recallify",
      description:
        "A voice-enabled, AI-powered expense & finance tracker (web + mobile) with a robust API backend.",
    },
    {
      category: "ai" as const,
      icon: "🔗",
      name: "n8n Automations",
      description:
        "Production automation workflows on n8n: an end-to-end Sales & Lead Management system and an AI content pipeline that publishes across multiple social platforms.",
    },
    {
      category: "ai" as const,
      icon: "📊",
      name: "AI Trading Platforms",
      description:
        "Three experimental stock-market trading platforms built with Claude Agent Teams (GSD, GasTown) — a comparative study of multi-agent architectures on cost and performance.",
    },
    // ── Mobile Apps ──────────────────────────────────────────────
    {
      category: "mobile" as const,
      icon: "📈",
      name: "Defiato",
      description:
        "A trending cross-platform DeFi staking, yield-farming and financial services app (Flutter) supporting a large base of active crypto users.",
    },
    {
      category: "mobile" as const,
      icon: "📞",
      name: "Quickom",
      description:
        "Decentralized communication platform with 1-1 video/voice calling and a reusable call-center SDK, built in native Objective-C / Swift.",
    },
    {
      category: "mobile" as const,
      icon: "🎮",
      name: "Justice Scale",
      description:
        "A multiplayer survival mobile game featuring real-time voice and video calling across iOS and Android.",
    },
    {
      category: "mobile" as const,
      icon: "🔐",
      name: "Multi-platform VPN",
      description:
        "High-performance iOS / Android / macOS / Windows VPN apps on WireGuard tunnels (Swift/SwiftUI + Flutter) serving 500+ monthly active users.",
    },
    {
      category: "mobile" as const,
      icon: "🎤",
      name: "Fan8",
      description:
        "An online live-events platform built in Flutter — streaming, fan interaction, and real-time engagement.",
    },
    {
      category: "mobile" as const,
      icon: "💰",
      name: "FinNote",
      description:
        "A personal expense & income management app delivering clean, reliable money tracking across iOS and Android.",
    },
    {
      category: "mobile" as const,
      icon: "🚗",
      name: "Drivor",
      description:
        "A driver-hiring system connecting drivers and customers, built with a focus on reliability and smooth UX.",
    },
    {
      category: "mobile" as const,
      icon: "☎️",
      name: "Contact Center SDK",
      description:
        "A reusable Flutter SDK embedding video/voice call-center capabilities into third-party apps.",
    },
    {
      category: "mobile" as const,
      icon: "🚘",
      name: "Smart Car Assistant",
      description:
        "Refactored and optimized a Car Smart Assistant app (Swift / SwiftUI, Stripe) for the Romanian market — ~50% better performance.",
    },
  ],

  socials: [
    { label: "in", title: "LinkedIn", href: "https://www.linkedin.com/in/thai-tran-6ba43133/" },
    { label: "gh", title: "GitHub", href: "https://github.com/pf2707" },
    { label: "up", title: "Upwork", href: "https://www.upwork.com/freelancers/~019029ad78bbb29f34" },
    { label: "@", title: "Email", href: "mailto:pf2707@gmail.com" },
  ],
};

export type Profile = typeof profile;
