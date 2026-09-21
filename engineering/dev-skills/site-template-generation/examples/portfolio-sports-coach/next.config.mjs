/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no server at runtime. The content file is read at build
  // time, so a content change is a rebuild.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
