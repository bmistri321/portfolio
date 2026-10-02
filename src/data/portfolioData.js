export const portfolioData = {
  personal: {
    name: "Bishal Mistri",
    title: "Full Stack Software Engineer & Cloud Architect",
    tagline: "Engineering resilient web applications, high-throughput microservices, and elegant developer tools.",
    status: {
      available: true,
      text: "Available for new opportunities & consulting",
      type: "status-available"
    },
    location: "India / Remote Worldwide",
    email: "contact@bishalmistri.com",
    github: "https://github.com/bishalmistri",
    linkedin: "https://linkedin.com/in/bishalmistri",
    twitter: "https://twitter.com/bishalmistri",
    resumeUrl: "#contact",
    stats: [
      { label: "Years Experience", value: "4+" },
      { label: "Production Apps", value: "20+" },
      { label: "Cloud Uptime Target", value: "99.99%" },
      { label: "Code Commits", value: "1,500+" }
    ]
  },

  about: {
    heading: "About Me",
    subheading: "Architecting scalable systems with precision and craft",
    bio: [
      "I am a passionate Full Stack Software Engineer focused on designing and building robust, maintainable, and highly performant web applications. My engineering philosophy combines clean code principles with modern architectural patterns to deliver seamless user experiences and scalable infrastructure.",
      "With hands-on expertise spanning modern frontend frameworks like React and Next.js to backend distributed systems in Node.js, Python, and cloud platforms like Google Cloud and AWS, I bridge the gap between intuitive UI design and heavy-duty backend engineering."
    ],
    principles: [
      {
        title: "Performance First",
        description: "Zero unnecessary bloat. Optimized Core Web Vitals, micro-caching, and sub-100ms render targets."
      },
      {
        title: "Resilient Architecture",
        description: "Fault-tolerant microservices, declarative infrastructure, and automated CI/CD deployment pipelines."
      },
      {
        title: "Intuitive UX & Clean Code",
        description: "Crafting interfaces that feel weightless and responsive, supported by strongly typed, self-documenting codebases."
      }
    ]
  },

  skills: {
    heading: "Technical Skills",
    subheading: "Technologies and toolsets leveraged in production",
    categories: [
      {
        id: "frontend",
        name: "Frontend Development",
        icon: "Code",
        items: [
          { name: "React.js", level: "Expert", tags: ["Hooks", "Context", "Concurrent"] },
          { name: "TypeScript", level: "Advanced", tags: ["Type Safety", "Generics"] },
          { name: "Next.js", level: "Advanced", tags: ["App Router", "SSR", "SSG"] },
          { name: "Modern CSS / Tailwind", level: "Expert", tags: ["Design Systems", "Animations"] },
          { name: "State Management", level: "Advanced", tags: ["Zustand", "Redux Toolkit"] },
          { name: "HTML5 / Semantic Web", level: "Expert", tags: ["Accessibility (a11y)", "SEO"] }
        ]
      },
      {
        id: "backend",
        name: "Backend & Systems",
        icon: "Server",
        items: [
          { name: "Node.js & Express", level: "Expert", tags: ["REST APIs", "Async IO"] },
          { name: "Python / FastAPI", level: "Advanced", tags: ["Microservices", "Data APIs"] },
          { name: "GraphQL & REST", level: "Advanced", tags: ["Schema Design", "Subscriptions"] },
          { name: "Authentication", level: "Advanced", tags: ["OAuth 2.0", "JWT", "RBAC"] },
          { name: "WebSockets & Realtime", level: "Advanced", tags: ["Socket.io", "Event Streams"] }
        ]
      },
      {
        id: "database",
        name: "Database & Storage",
        icon: "Database",
        items: [
          { name: "PostgreSQL", level: "Advanced", tags: ["Indexing", "Query Plan", "Prisma"] },
          { name: "MongoDB", level: "Advanced", tags: ["Aggregation", "Mongoose"] },
          { name: "Redis", level: "Advanced", tags: ["Caching", "Pub/Sub", "Rate Limiting"] },
          { name: "BigQuery / SQL", level: "Proficient", tags: ["Analytics", "Data Warehousing"] }
        ]
      },
      {
        id: "cloud",
        name: "Cloud & DevOps",
        icon: "Cloud",
        items: [
          { name: "Google Cloud Platform", level: "Advanced", tags: ["Cloud Run", "GCS", "IAM"] },
          { name: "Docker & Containers", level: "Advanced", tags: ["Multi-stage builds", "Compose"] },
          { name: "CI/CD Automation", level: "Advanced", tags: ["GitHub Actions", "Vercel"] },
          { name: "Linux / Shell", level: "Advanced", tags: ["Zsh", "Bash Scripting", "SSH"] },
          { name: "Monitoring & Observability", level: "Proficient", tags: ["Logs", "Metrics", "Health Checks"] }
        ]
      }
    ]
  },

  projects: [
    {
      id: "varcle-cloud-analytics",
      title: "Varcle Cloud Analytics Dashboard",
      category: "Full Stack",
      featured: true,
      description: "A real-time data visualization platform providing live telemetry, latency tracking, and autonomous anomaly detection across multi-cloud infrastructure.",
      impact: "Reduced infrastructure incident diagnosis time by 45% with sub-second real-time event streaming.",
      techStack: ["React", "TypeScript", "Node.js", "Redis Pub/Sub", "Chart.js", "Docker"],
      liveUrl: "https://bishalmistri.com/#projects",
      githubUrl: "https://github.com/bishalmistri/varcle-analytics",
      imageAlt: "Varcle Cloud Analytics live data streaming and telemetry dashboard interface",
      badge: "Production Ready"
    },
    {
      id: "antigravity-dev-toolkit",
      title: "Antigravity Cloud IDE Extension",
      category: "Tools & AI",
      featured: true,
      description: "A developer productivity suite featuring floating AI context menus, real-time code refactoring suggestions, and zero-latency terminal commands.",
      impact: "Adopted by 500+ active developers with an average 30% boost in daily coding velocity.",
      techStack: ["TypeScript", "React", "WebSockets", "Vite", "Lucide Icons"],
      liveUrl: "https://bishalmistri.com/#projects",
      githubUrl: "https://github.com/bishalmistri/antigravity-toolkit",
      imageAlt: "Antigravity developer toolkit showing floating context menus and code intelligence",
      badge: "Open Source"
    },
    {
      id: "nexus-commerce-api",
      title: "Nexus High-Throughput E-Commerce Engine",
      category: "Backend & Systems",
      featured: true,
      description: "A resilient headless e-commerce microservice architecture handling high concurrent traffic with distributed locks, optimistic concurrency, and Stripe webhooks.",
      impact: "Successfully handled 10,000+ simulated concurrent checkouts during load tests with zero race conditions.",
      techStack: ["Node.js", "Express", "PostgreSQL", "Prisma", "Redis", "Stripe API"],
      liveUrl: "https://bishalmistri.com/#projects",
      githubUrl: "https://github.com/bishalmistri/nexus-commerce",
      imageAlt: "Nexus commerce backend architecture diagram and transactional performance monitor",
      badge: "High Concurrency"
    },
    {
      id: "pulse-distributed-cache",
      title: "Pulse Distributed Memory Key-Value Store",
      category: "Distributed Systems",
      featured: false,
      description: "A lightweight in-memory cache daemon built with custom LRU eviction algorithms, consistent hashing for node rebalancing, and TCP socket multiplexing.",
      impact: "Benchmarked at 120,000 requests/sec with average p99 latency under 1.2ms.",
      techStack: ["Python", "FastAPI", "C-extensions", "Docker", "Linux IO"],
      liveUrl: "https://bishalmistri.com/#projects",
      githubUrl: "https://github.com/bishalmistri/pulse-cache",
      imageAlt: "Pulse distributed key-value store benchmarking charts and clustering visualization",
      badge: "Core Systems"
    }
  ],

  experience: [
    {
      role: "Lead Full Stack Engineer & Consultant",
      company: "Independent / Tech Ventures",
      period: "2023 - Present",
      location: "Remote",
      description: "Directing end-to-end full stack web architecture, advising startups on scalable cloud infrastructure, and building high-performance modern web applications.",
      highlights: [
        "Architected and shipped 6+ commercial web platforms using React, Node.js, and GCP.",
        "Engineered automated CI/CD pipelines reducing deployment friction and rollback rates to near zero.",
        "Optimized client-side rendering pipelines achieving 95+ Google Lighthouse scores across Core Web Vitals."
      ],
      technologies: ["React", "TypeScript", "Node.js", "GCP", "PostgreSQL", "Docker"]
    },
    {
      role: "Senior Software Engineer",
      company: "Cloud & Digital Solutions",
      period: "2021 - 2023",
      location: "Hybrid / India",
      description: "Spearheaded frontend and backend development for enterprise SaaS portals and data aggregation tools.",
      highlights: [
        "Led a team of 4 engineers in migrating a legacy monolith to a decoupled Next.js & microservices stack.",
        "Integrated real-time streaming dashboards supporting thousands of live websocket connections.",
        "Mentored junior developers, instituted strict code review standards, and authored technical design specs."
      ],
      technologies: ["JavaScript", "React", "Express", "Redis", "MongoDB", "Tailwind CSS"]
    }
  ],

  education: [
    {
      degree: "Bachelor of Technology in Computer Science & Engineering",
      institution: "State Technological University",
      period: "Graduated with Honors",
      focus: "Data Structures, Distributed Algorithms, Cloud Systems & Database Engineering"
    }
  ],

  terminalCommands: {
    help: "Available commands: bio, skills, projects, contact, experience, stack, clear, sudo hire",
    bio: "Bishal Mistri: Full Stack Software Engineer & Cloud Architect. Building reliable systems with high aesthetic standards.",
    skills: "React, TypeScript, Next.js, Node.js, Python, PostgreSQL, Redis, GCP, Docker, REST/GraphQL.",
    projects: "1. Varcle Cloud Analytics | 2. Antigravity Cloud IDE | 3. Nexus Commerce API | 4. Pulse Cache",
    contact: "Email: contact@bishalmistri.com | GitHub: @bishalmistri | LinkedIn: in/bishalmistri",
    experience: "4+ years engineering modern web apps, distributed backends, and cloud microservices.",
    stack: "React 19 + Vite + Vanilla CSS Glassmorphism + Lucide Icons + Strict SEO Architecture",
    "sudo hire": "ACCESS GRANTED: Bishal is currently open for exciting full-time roles & high-impact contracts! Shoot an email to contact@bishalmistri.com."
  }
};
