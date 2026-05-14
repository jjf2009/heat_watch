import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/earthengine", "onnxruntime-node"],
};


export default nextConfig;
