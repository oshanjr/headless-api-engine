/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow rendering of tenant logos from any dynamic domain
      },
    ],
  },
  // ENABLE UNIVERSAL CORS ACCESS FOR HEADLESS EXTERNAL CLIENT ARCHITECTURES
  async headers() {
    return [
      {
        source: "/api/:path*", // Target all API routes organically
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Using "*" allows ANY domain across external servers natively. 
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

module.exports = nextConfig;
