const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = async () => {
  const metaPath = path.join(process.cwd(), 'test', '.pg-testcontainer.json');
  if (!fs.existsSync(metaPath)) return;
  const { id } = JSON.parse(fs.readFileSync(metaPath, 'utf8') || '{}');
  if (!id) return;
  try { execSync(`docker rm -f ${id}`, { stdio: 'inherit' }); } catch {}
  try { fs.unlinkSync(metaPath); } catch {}
};
