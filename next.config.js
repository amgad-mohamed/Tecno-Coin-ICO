/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent optional pretty-printer from being bundled/resolved
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pino-pretty": false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        "utf-8-validate": false,
        bufferutil: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
