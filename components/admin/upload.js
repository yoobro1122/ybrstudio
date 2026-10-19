export async function uploadImage(sb, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from('images').upload(path, file, { cacheControl: '31536000' });
  if (error) throw error;
  return sb.storage.from('images').getPublicUrl(path).data.publicUrl;
}
