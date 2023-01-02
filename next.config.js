/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/react',
    '@fullcalendar/timegrid',
    '@fullcalendar/daygrid',
    '@fullcalendar/interaction',
    '@fullcalendar/list',
  ],
};

module.exports = nextConfig({
  reactStrictMode: false,
  optimizeFonts: false,
  images: {
    domains: [
      'https://vbs-kevii.vercel.app/',
      'https://vbs-hikoya.vercel.app',
      'https://kevii-vbs.herokuapp.com/',
      'https://kevii.azurewebsites.net/',
    ],
  },
});
