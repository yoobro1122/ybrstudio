import { cache } from 'react';
import { serverClient } from './supabase';
import { mergeSettings } from './settings-shared';
import { setPrimaryDomain } from './seo';

export { mergeSettings, luminance, contrast } from './settings-shared';

export const getSettings = cache(async () => {
  try {
    const { data } = await serverClient().from('site_settings').select('data').eq('id', 1).maybeSingle();
    const s = mergeSettings(data?.data);
    setPrimaryDomain(s.primaryDomain);
    return s;
  } catch {
    return mergeSettings(null);
  }
});
