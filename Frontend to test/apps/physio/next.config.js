const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: [
    "@physio-connect-frontend/shared-ui",
    "@physio-connect-frontend/shared-theme",
    "@physio-connect-frontend/shared-casl",
  ],
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};


module.exports = nextConfig;
