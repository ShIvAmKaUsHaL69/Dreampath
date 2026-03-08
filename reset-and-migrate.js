const mysql = require('mysql2/promise');
(async () => {
  const p = mysql.createPool({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'dreampath' });
  
  // Clean up duplicate roadmaps for user 2
  const [roadmaps] = await p.execute('SELECT id, career_id, title FROM roadmaps WHERE user_id = 2 ORDER BY id');
  console.log('Roadmaps for user 2:', JSON.stringify(roadmaps, null, 2));
  
  // Keep only the latest roadmap per career_id, delete duplicates
  const seen = new Set();
  for (const r of roadmaps) {
    if (seen.has(r.career_id)) {
      await p.execute('DELETE FROM roadmaps WHERE id = ?', [r.id]);
      console.log('  Deleted duplicate roadmap:', r.id, r.title);
    } else {
      seen.add(r.career_id);
    }
  }
  
  process.exit(0);
})();
