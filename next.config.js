/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/2',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
