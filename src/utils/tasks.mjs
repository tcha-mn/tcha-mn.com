import fs from 'node:fs';
import os from 'node:os';

const tasksIntegration = () => {
  let config;
  return {
    name: 'AstroWind:tasks',

    hooks: {
      'astro:config:done': async ({ config: cfg }) => {
        config = cfg;
      },

      'astro:build:done': async () => {
        try {
          const outDir = config.outDir;
          const publicDir = config.publicDir;
          const sitemapName = 'sitemap-index.xml';
          const sitemapFile = new URL(sitemapName, outDir);
          const robotsTxtFile = new URL('robots.txt', publicDir);
          const robotsTxtFileInOut = new URL('robots.txt', outDir);

          const hasIntegration =
            Array.isArray(config?.integrations) &&
            config.integrations?.find((e) => e?.name === '@astrojs/sitemap') !== undefined;
          const sitemapExists = fs.existsSync(sitemapFile);

          if (hasIntegration && sitemapExists) {
            const robotsTxt = fs.existsSync(robotsTxtFile) ? fs.readFileSync(robotsTxtFile, 'utf8') : '';
            const sitemapUrl = new URL(sitemapName, String(new URL(config.base, config.site)));
            const pattern = /^Sitemap:(.*)$/m;

            let updatedRobots = '';
            if (!pattern.test(robotsTxt)) {
              const separator = robotsTxt.trim().length ? `${os.EOL}${os.EOL}` : '';
              updatedRobots = `${robotsTxt}${separator}Sitemap: ${sitemapUrl}`;
            } else {
              updatedRobots = robotsTxt.replace(pattern, `Sitemap: ${sitemapUrl}`);
            }

            fs.writeFileSync(robotsTxtFileInOut, updatedRobots, {
              encoding: 'utf8',
              flags: 'w',
            });
          }
        } catch (error) {
          console.warn('[tasks] Failed to update robots.txt sitemap entry', error);
        }
      },
    },
  };
};

export default tasksIntegration;
