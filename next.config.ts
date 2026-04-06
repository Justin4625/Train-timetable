import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const repoName = 'Train-timetable'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',

  basePath: isProduction ? `/${repoName}` : '',
  assetPrefix: isProduction ? `/${repoName}` : '',

  reactCompiler: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
