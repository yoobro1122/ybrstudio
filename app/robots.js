import { getSettings } from '@/lib/settings';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function robots() {
  await getSettings();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/play/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
