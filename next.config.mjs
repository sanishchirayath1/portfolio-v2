/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // No images on this site. Kept disabled to enforce the constraint.
    unoptimized: true,
  },
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_DEPLOY_ENV: process.env.VERCEL_ENV ?? "local",
  },
};

export default nextConfig;
