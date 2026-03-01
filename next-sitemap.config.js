/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://native-real.com',
  generateRobotsTxt: true,
  outDir: 'public',
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/orbit/' }],
  },
}
