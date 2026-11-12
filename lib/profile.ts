// ─────────────────────────────────────────────────────────────────────────────
//  Website content for Hong Thai Tran.
//  The AI digital twin's knowledge lives separately in lib/twin.ts +
//  lib/twin-knowledge.json (sourced from the digital_twin project).
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: "Thai Tran",
  initials: "TT",
  avatar: "/avatar.png", // in public/ — set to "" to fall back to initials
  title: "Aspiring AI Forward Deployed Engineer · Senior Mobile Developer",
  tagline: "I deploy AI systems that work in production.",
  available: true,
  location: "Ho Chi Minh City, Vietnam",
  email: "pf2707@gmail.com",
  phone: "+84 77 303 6794", // shown on the telephone in the studio; "" hides the phone
  languages: "EN / VI / 中文",

  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "100%", label: "Job Success" },
    { value: "Top Rated", label: "On Upwork" },
  ],

  about: [
    "I'm working toward becoming an AI Forward Deployed Engineer: someone who works side by side with customers, understands their real problems, and ships AI solutions that run inside their products and workflows. With over 10 years of hands-on experience, I've delivered production apps used by thousands of users across iOS and Android — fluently across Flutter, native Swift / SwiftUI, and Kotlin.",
    "Client-facing delivery is where I'm headed. Recent work includes a website with a digital twin for an aesthetic business (DiVY Aesthetic Lab) and a detection system for mis-printed strokes on Japanese cartons. I build with Claude Code, Cursor, and n8n, orchestrating sub-agents and multi-agent teams to move fast without sacrificing reliability.",
    "Originally from Ho Chi Minh City, Vietnam, and Top Rated on Upwork with a 100% Job Success Score. Outside of work you'll find me watching football, playing games, and having coffee in quiet places.",
  ],

  experience: [
    {
      period: "2026 — Present",
      role: "AI Agentic Engineer & AI Forward Deployed Engineer",
      org: "Independent",
      summary:
        "Delivered client-facing AI work, including DiVY Aesthetic Lab (website + digital twin on an agent harness) and a Carton mis-printing detection system. Built Mobile Agent Kit — a Claude plugin with 4 specialized agents covering testing, code review, crash triage, and release automation. Shipped a voice-enabled AI finance app and multiplayer survival game, plus end-to-end n8n sales and content workflows.",
    },
    {
      period: "2013 — 2026",
      role: "Senior Mobile Developer",
      org: "Beowulf Network Inc · Full-time",
      summary:
        "Built Flutter / Dart cross-platform apps: Defiato (DeFi staking & yield farming), Fan8 (live events platform), a Contact Center video/voice SDK, and FinNote (expense management). Built native Objective-C / Swift apps and frameworks: Quickom (decentralized communication platform), the Quickom call-center SDK, Drivor (driver-hiring system), and more. Led a legacy Objective-C → Swift migration for ~30% better performance.",
    },
  ],

  skills: [
    {
      group: "Forward Deployed Engineering",
      items: [
        "Client Discovery",
        "Solution Deployment",
        "Production Handoff",
        "Stakeholder Communication",
        "Rapid Prototyping",
        "Client-facing Delivery",
      ],
    },
    {
      group: "AI Agents & Orchestration",
      items: [
        "AI Agents",
        "Agent Harness",
        "Multi-agent Orchestration",
        "Claude Code",
        "Claude Plugins & Skills",
        "Cursor",
        "MCP",
        "Prompt Engineering",
        "LLM Integration",
        "OpenRouter",
        "Gemini",
        "Voice AI",
      ],
    },
    {
      group: "Automation & Workflows",
      items: ["n8n", "Workflow Automation", "Sales & Lead Pipelines", "Social Content Pipelines"],
    },
    {
      group: "Mobile Development",
      items: [
        "Flutter",
        "Dart",
        "Swift",
        "SwiftUI",
        "Objective-C",
        "Kotlin",
        "Java",
        "iOS",
        "Android",
        "macOS",
        "MVVM",
        "Swift Package Manager",
        "Animation",
        "Legacy Migration",
      ],
    },
    {
      group: "Web & Backend",
      items: ["Next.js", "React", "Node.js", "REST API", "GraphQL", "WireGuard", "SIP / XMPP", "Git"],
    },
    {
      group: "Firebase & Monetization",
      items: ["Firebase", "Firestore", "Firebase Auth", "Stripe", "RevenueCat", "In-App Purchases"],
    },
  ],

  // Latest AI certificates — hung as framed certificates on the studio wall.
  certificates: [
    {
      title: "AI FDE: The Forward Deployed Engineer & Agentic AI Architect",
      issuer: "Udemy",
      instructor: "Ed Donner",
      date: "2026-11-05",
    },
    {
      title: "AI Builder: Create Agents, Voice Agents & Automations in n8n",
      issuer: "Udemy",
      instructor: "Ligency, Ed Donner",
      date: "2026-07-21",
    },
    {
      title: "AI Coder: Complete Claude Code & Coding Agents Course",
      issuer: "Udemy",
      instructor: "Ligency, Ed Donner",
      date: "2026-06-27",
      note: "Claude Code, Cursor, Copilot and Codex — building Skills, MCP servers, sub-agents and agent teams.",
    },
  ],

  // How many projects to show per group before the "View all" toggle reveals the rest.
  featuredPerGroup: 3,
  projects: [
    // ── Forward Deployed Engineering ─────────────────────────────
    {
      category: "fde" as const,
      icon: "🧭",
      name: "DiVY Aesthetic Lab",
      description:
        "A deployed website for an aesthetic client, including a digital twin built on an agent harness.",
    },
    {
      category: "fde" as const,
      icon: "🔍",
      name: "Carton Mis-printing Detection",
      description:
        "A detection system that spots mis-printed strokes on Japanese cartons.",
    },
    {
      category: "fde" as const,
      icon: "🎭",
      name: "Rehearse with AI",
      description:
        "A website offering rehearsal sessions with AI agents before important real-life situations.",
    },
    {
      category: "fde" as const,
      icon: "🪪",
      name: "Digital Twin CV",
      description:
        "A digital CV with a built-in twin that answers questions about my personal and professional background.",
    },
    // ── AI Agentic Engineering ───────────────────────────────────
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
        "A full working expense tracker that takes natural voice input and stores and retrieves data through LLMs.",
    },
    {
      category: "ai" as const,
      icon: "🎬",
      name: "Marketing Video Creation",
      description:
        "A website to create, edit, merge and split marketing videos.",
    },
    {
      category: "ai" as const,
      icon: "📣",
      name: "Social Media Cross-Posting",
      description:
        "An n8n workflow that cross-posts content to multiple social media platforms.",
    },
    {
      category: "ai" as const,
      icon: "📇",
      name: "Sales & Lead Management",
      description:
        "An n8n workflow for sales and lead management.",
    },
    {
      category: "ai" as const,
      icon: "💼",
      name: "Upwork Copilot",
      description:
        "An AI agent built on an Upwork MCP that helps freelancers work smarter and skip ghost or low-quality jobs that burn Connects.",
    },
    {
      category: "ai" as const,
      icon: "🎮",
      name: "Justice Scale",
      description:
        "A full multiplayer survival mobile game with a backend built by a coding agent.",
    },
    // ── Senior Mobile Development ────────────────────────────────
    {
      category: "mobile" as const,
      icon: "📸",
      name: "StorySnooper",
      description:
        "An Instagram profile crawler built natively in SwiftUI on a public API.",
    },
    {
      category: "mobile" as const,
      icon: "🚙",
      name: "Cruisr",
      description:
        "A cruiser-tracking app built in SwiftUI, using RevenueCat for the paywall.",
    },
    {
      category: "mobile" as const,
      icon: "🛒",
      name: "Matework",
      description:
        "A mobile and web platform for trading goods, built from scratch in Flutter with Firebase services.",
    },
    {
      category: "mobile" as const,
      icon: "📈",
      name: "Uptrdr",
      description:
        "A cross-platform vehicle trading exchange built with Flutter, Firebase and Node.js, with a strong focus on animation.",
    },
    {
      category: "mobile" as const,
      icon: "🚘",
      name: "CarHome",
      description:
        "A Romanian car smart-assistant app: refactored for speed, bugs fixed, new features and Stripe payments, with ~50% better performance.",
    },
    {
      category: "mobile" as const,
      icon: "📰",
      name: "NeptunDeep",
      description:
        "Refactored a legacy in-house report and news app to a 100% performance upgrade, mixing Objective-C and Swift.",
    },
    {
      category: "mobile" as const,
      icon: "🏨",
      name: "Okini",
      description:
        "Added features to a Japanese hotel booking app, built with Flutter, animation and Stripe payments.",
    },
    {
      category: "mobile" as const,
      icon: "🎥",
      name: "YouvMe",
      description:
        "Stabilized a social video challenge app built with Swift, MVVM and SPM.",
    },
    {
      category: "mobile" as const,
      icon: "👗",
      name: "wt+",
      description:
        "Shipped major updates to a Malaysian fashion app after migrating it off a deprecated Flutter version.",
    },
    {
      category: "mobile" as const,
      icon: "💬",
      name: "Daz",
      description:
        "Studied open-source chat apps (FluffyChat, Element-X) to improve UI/UX and add new features.",
    },
    {
      category: "mobile" as const,
      icon: "🔐",
      name: "DatagramVPN",
      description:
        "High-performance iOS, Android, macOS and Windows VPN apps on WireGuard tunnels, serving 500+ monthly active users.",
    },
    {
      category: "mobile" as const,
      icon: "📹",
      name: "Quickom",
      description:
        "A decentralized video conferencing app, built in Swift and later migrated to Flutter.",
    },
    {
      category: "mobile" as const,
      icon: "🌐",
      name: "UTSNetwork",
      description:
        "A marketplace app for hotel, resort and flight booking, built in Flutter with Stripe payments.",
    },
    {
      category: "mobile" as const,
      icon: "📊",
      name: "Defiato",
      description:
        "A DeFi staking, yield-farming and financial services app for crypto users, built in Flutter.",
    },
    {
      category: "mobile" as const,
      icon: "🗣️",
      name: "VoxyPAD",
      description:
        "P2P calling with fast whiteboard collaboration, written in Objective-C using SIP and XMPP (2014).",
    },
    {
      category: "mobile" as const,
      icon: "💚",
      name: "Zalo",
      description:
        "Joined the VNG team as the first developer to implement and publish the first version of the Zalo app.",
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
