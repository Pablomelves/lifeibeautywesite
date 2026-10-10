export async function submitStoreForm(name: 'lifei-contact' | 'lifei-newsletter', fields: Record<string, string>) {
  const response = await fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ ...fields, 'form-name': name }), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Your message could not be submitted. Please try again.');
}
