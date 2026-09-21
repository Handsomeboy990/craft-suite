/** @type {import('next').NextConfig} */
const nextConfig = {
  // Not a static export. The back office writes the content file, stores the
  // uploads and holds the messages, so the site needs a server process:
  // `npm run build` then `npm start`.
  //
  // For a container, add `output: 'standalone'` and copy `.next/static` and
  // `public` next to `.next/standalone/server.js`, which is the deployment note
  // in the README. It is left out here so that `npm start` works as it reads.
  images: {
    // Uploaded media is served by the /media route from the data directory,
    // which is a stream the optimizer has no advantage over here.
    unoptimized: true,
  },
};

export default nextConfig;
