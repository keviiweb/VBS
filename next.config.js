/**
 * @type {import('next').NextConfig}
 */

const withTM = require("next-transpile-modules")([
  "@fullcalendar/common",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/list",
]);

module.exports = withTM({
  reactStrictMode: false,
  images: {
    domains: [
      "https://vbs-kevii.vercel.app/",
      "https://vbs-hikoya.vercel.app",
      "https://kevii-vbs.herokuapp.com/",
    ],
  },
});
