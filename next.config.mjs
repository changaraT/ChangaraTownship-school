/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/exam-results", destination: "/api/academic/results" },
      { source: "/api/exam-results/:id", destination: "/api/academic/results/:id" },
      { source: "/api/exams", destination: "/api/academic" },
      { source: "/api/exams/:id", destination: "/api/academic/:id" },
      { source: "/api/fees", destination: "/api/finance" },
      { source: "/api/fees/:id", destination: "/api/finance/:id" },
      { source: "/api/fee-structure", destination: "/api/finance/structure" },
      { source: "/api/fee-structure/:id", destination: "/api/finance/structure/:id" },
      { source: "/api/announcements", destination: "/api/comms/announcements" },
      { source: "/api/announcements/:id", destination: "/api/comms/announcements/:id" },
      { source: "/api/messages", destination: "/api/comms" },
      { source: "/api/messages/:path*", destination: "/api/comms/:path*" },
      { source: "/api/stats", destination: "/api/admin" },
      { source: "/api/health", destination: "/api/admin" },
      { source: "/api/parents", destination: "/api/admin" }
    ];
  }
};

export default nextConfig;
