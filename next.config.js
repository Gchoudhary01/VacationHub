/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "loremflickr.com" },
    { protocol: "https", hostname: "live.staticflickr.com" },
    { protocol: "https", hostname: "farm66.staticflickr.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
},
};

module.exports = nextConfig;
