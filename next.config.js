/**
 * @type {import('next').NextConfig}
 */

const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/react',
  '@fullcalendar/timegrid',
  '@fullcalendar/daygrid',
  '@fullcalendar/interaction',
  '@fullcalendar/list',
]);

module.exports = withTM({
  reactStrictMode: false,
  optimizeFonts: false,
  images: {
    domains: ['https://kevii.azurewebsites.net/'],
  },
});
