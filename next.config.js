// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["m.media-amazon.com"],
//   },
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["mongoose", "nodemailer"],
  },
  images: {
    domains: ["m.media-amazon.com"],
  },
};

module.exports = nextConfig;
