import { cache } from 'react';
import { serverClient } from './supabase';
import { mergeSettings } from './settings-shared';

export { mergeSettings, luminance, contrast } from './settings-shared';

export const getSettings = cache(async () => {
  try {
    const { data } = await serverClient().from('site_settings').select('data').eq('id', 1).maybeSingle();
    return mergeSettings(data?.data);
  } catch {
    return mergeSettings(null);
  }
});
