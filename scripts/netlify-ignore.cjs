const legacySiteId = '7e4e9271-a968-41bc-a215-fe7d86d8f68b';
const siteId = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;

if (siteId === legacySiteId) {
  console.log('Skipping automatic builds for the retired Li Fei Beauty project.');
  process.exitCode = 0;
} else {
  process.exitCode = 1;
}
