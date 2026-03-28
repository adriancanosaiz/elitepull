import type { NextConfig } from "next";

function getSupabaseRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "https",
      hostname: "**.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return patterns;
  }

  try {
    const parsedUrl = new URL(supabaseUrl);

    patterns.unshift({
      protocol: parsedUrl.protocol.replace(":", "") as "http" | "https",
      hostname: parsedUrl.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    return patterns;
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: getSupabaseRemotePatterns(),
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [96, 160, 220, 320, 420, 560, 700, 980],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
