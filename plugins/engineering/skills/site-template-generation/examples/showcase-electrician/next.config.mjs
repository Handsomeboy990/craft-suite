// Shared configuration: ../_shared/config/next-config.mjs. transpilePackages
// is written here because it is what lets Next compile the shared package at
// all: the package ships TypeScript source.
import { siteNextConfig } from 'site-template-shared/config/next-config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...siteNextConfig,
  transpilePackages: ['site-template-shared'],
};

export default nextConfig;
