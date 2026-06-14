const nextConfig = {
  reactStrictMode: true,
  // Mark MongoDB as external for server components (moved from experimental in Next.js 16)
  serverExternalPackages: ['mongodb'],
  // Empty turbopack config to silence warning and allow webpack config
  turbopack: {},
  // Webpack configuration for handling Node.js built-in modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
