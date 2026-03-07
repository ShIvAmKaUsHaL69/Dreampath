// Comprehensive API endpoint tester for DreamPath
// Run with: npx tsx database/test-endpoints.ts

async function test() {
  const BASE = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  async function check(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`  ❌ ${name}: ${err.message}`);
      failures.push(`${name}: ${err.message}`);
      failed++;
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  async function readBody(res: Response): Promise<string> {
    try { return await res.text(); } catch { return '(body already read)'; }
  }

  // ── AUTH ───────────────────────────────────
  console.log('\n🔑 AUTH ENDPOINTS');

  let adminToken = '';
  let adminRefreshToken = '';
  await check('POST /api/auth/login (admin)', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dreampath.com', password: 'Admin@123' }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.token, 'No token');
    assert(data.user.role === 'superadmin', 'Not superadmin');
    adminToken = data.token;
    adminRefreshToken = data.refreshToken;
  });

  await check('POST /api/auth/login (wrong password → 401)', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dreampath.com', password: 'wrong' }),
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  let studentToken = '';
  let studentId = 0;
  const testEmail = `test_${Date.now()}@test.com`;
  await check('POST /api/auth/register (new student)', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Student', email: testEmail, password: 'Test@123', grade: 10, stream: 'science', goalIntensity: 'serious', interests: ['Mathematics', 'Physics'], hobbies: ['Coding'], skills: ['Problem Solving'] }),
    });
    const body = await res.json();
    assert(res.status === 201, `Status ${res.status}: ${JSON.stringify(body)}`);
    assert(body.token, 'No token');
    assert(body.user.role === 'student', 'Not student');
    studentToken = body.token;
    studentId = body.user.id;
  });

  await check('POST /api/auth/register (duplicate → 409)', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Dup', email: 'admin@dreampath.com', password: 'Test@123' }),
    });
    assert(res.status === 409, `Expected 409, got ${res.status}`);
  });

  await check('GET /api/auth/me', async () => {
    const res = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.user.name === 'Test Student', `Name: ${data.user.name}`);
    assert(data.user.interests.length === 2, `Interests: ${data.user.interests.length}`);
    assert(data.user.hobbies.length === 1, `Hobbies: ${data.user.hobbies.length}`);
    assert(data.user.skills.length === 1, `Skills: ${data.user.skills.length}`);
  });

  await check('GET /api/auth/me (no token → 401)', async () => {
    const res = await fetch(`${BASE}/api/auth/me`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await check('POST /api/auth/refresh', async () => {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: adminRefreshToken }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.token, 'No new token');
  });

  // ── TASKS ─────────────────────────────────
  console.log('\n📋 TASKS');

  let taskId = 0;
  await check('POST /api/tasks (create)', async () => {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ title: 'Study Math', description: 'Complete chapter 5', category: 'study', priority: 'high', dueDate: '2026-04-01' }),
    });
    const body = await res.json();
    assert(res.status === 201, `Status ${res.status}: ${JSON.stringify(body)}`);
    taskId = body.id;
  });

  await check('POST /api/tasks (create 2nd)', async () => {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ title: 'Practice Coding', category: 'skill', priority: 'medium' }),
    });
    assert(res.status === 201, `Status ${res.status}`);
  });

  await check('GET /api/tasks', async () => {
    const res = await fetch(`${BASE}/api/tasks`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.tasks.length >= 2, `Tasks: ${data.tasks.length}`);
  });

  await check('PUT /api/tasks/[id] (complete)', async () => {
    const res = await fetch(`${BASE}/api/tasks/${taskId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ completed: true }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('DELETE /api/tasks/[id]', async () => {
    const cr = await fetch(`${BASE}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ title: 'Delete Me' }),
    });
    const cd = await cr.json();
    const res = await fetch(`${BASE}/api/tasks/${cd.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(res.ok, `Status ${res.status}`);
  });

  // ── CAREERS ───────────────────────────────
  console.log('\n🏢 CAREERS');

  await check('GET /api/careers', async () => {
    const res = await fetch(`${BASE}/api/careers`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.careers.length >= 8, `Careers: ${data.careers.length}`);
    assert(data.careers[0].skillsRequired?.length > 0, 'No skills on first career');
  });

  await check('GET /api/careers?search=software', async () => {
    const res = await fetch(`${BASE}/api/careers?search=software`);
    const data = await res.json();
    assert(data.careers.length >= 1, `Found: ${data.careers.length}`);
  });

  await check('GET /api/careers/software-engineer', async () => {
    const res = await fetch(`${BASE}/api/careers/software-engineer`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.career.title === 'Software Engineer', `Title: ${data.career.title}`);
    assert(data.career.skillsRequired.length > 0, 'No skills');
  });

  await check('GET /api/careers/nonexistent → 404', async () => {
    const res = await fetch(`${BASE}/api/careers/nonexistent-xyz`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // ── COMMUNITY ─────────────────────────────
  console.log('\n👥 COMMUNITY');

  let postId = 0;
  await check('POST /api/community/posts', async () => {
    const res = await fetch(`${BASE}/api/community/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ content: 'Hello from endpoint test!', tags: ['test'] }),
    });
    const body = await res.json();
    assert(res.status === 201, `Status ${res.status}: ${JSON.stringify(body)}`);
    postId = body.id;
  });

  await check('GET /api/community/posts', async () => {
    const res = await fetch(`${BASE}/api/community/posts`);
    const data = await res.json();
    assert(data.posts.length >= 1, `Posts: ${data.posts.length}`);
    assert(data.posts[0].authorName, 'No author');
  });

  await check('POST /api/community/posts/[id]/like', async () => {
    const res = await fetch(`${BASE}/api/community/posts/${postId}/like`, {
      method: 'POST', headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    assert(data.liked === true, 'Not liked');
  });

  await check('POST /api/community/posts/[id]/like (unlike)', async () => {
    const res = await fetch(`${BASE}/api/community/posts/${postId}/like`, {
      method: 'POST', headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    assert(data.liked === false, 'Should be unliked');
  });

  await check('POST /api/community/posts/[id]/comments', async () => {
    const res = await fetch(`${BASE}/api/community/posts/${postId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ content: 'Nice post!' }),
    });
    assert(res.status === 201, `Status ${res.status}`);
  });

  // ── RESOURCES ─────────────────────────────
  console.log('\n📚 RESOURCES');

  await check('GET /api/resources', async () => {
    const res = await fetch(`${BASE}/api/resources`);
    const data = await res.json();
    assert(data.resources.length >= 4, `Resources: ${data.resources.length}`);
  });

  await check('GET /api/resources?type=video', async () => {
    const res = await fetch(`${BASE}/api/resources?type=video`);
    const data = await res.json();
    assert(data.resources.length >= 1, 'No video resources');
  });

  // ── ANALYTICS & ACHIEVEMENTS ──────────────
  console.log('\n📊 ANALYTICS & ACHIEVEMENTS');

  await check('GET /api/analytics', async () => {
    const res = await fetch(`${BASE}/api/analytics`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.analytics.taskCompletionRate !== undefined, 'Missing rate');
  });

  await check('GET /api/achievements', async () => {
    const res = await fetch(`${BASE}/api/achievements`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.badges.length === 8, `Badges: ${data.badges.length}`);
  });

  // ── SETTINGS ──────────────────────────────
  console.log('\n⚙️ SETTINGS');

  await check('GET /api/settings', async () => {
    const res = await fetch(`${BASE}/api/settings`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.notifications.dailyReminders !== undefined, 'No prefs');
  });

  await check('PUT /api/settings', async () => {
    const res = await fetch(`${BASE}/api/settings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ name: 'Updated Student', notifications: { dailyReminders: false, missedTaskAlerts: true, motivationNudges: true, examCountdown: false } }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  // ── ROADMAPS ──────────────────────────────
  console.log('\n🗺️ ROADMAPS');

  await check('POST /api/roadmaps', async () => {
    const res = await fetch(`${BASE}/api/roadmaps`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ careerId: 'software-engineer', title: 'My SE Roadmap', startDate: '2026-03-01', endDate: '2030-03-01', milestones: [{ title: 'Learn Python', dueDate: '2026-06-01' }, { title: 'Build Projects', dueDate: '2026-12-01' }] }),
    });
    const body = await res.json();
    assert(res.status === 201, `Status ${res.status}: ${JSON.stringify(body)}`);
  });

  await check('GET /api/roadmaps', async () => {
    const res = await fetch(`${BASE}/api/roadmaps`, { headers: { Authorization: `Bearer ${studentToken}` } });
    const data = await res.json();
    assert(data.roadmaps.length >= 1, `Roadmaps: ${data.roadmaps.length}`);
    assert(data.roadmaps[0].milestones.length === 2, `Milestones: ${data.roadmaps[0].milestones.length}`);
  });

  // ── AI CHAT ───────────────────────────────
  console.log('\n🤖 AI CHAT');

  await check('POST /api/ai/chat (without NVIDIA key)', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ message: 'Hello!' }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('GET /api/ai/chat (history)', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.messages.length >= 1, `Messages: ${data.messages.length}`);
  });

  await check('DELETE /api/ai/chat (clear)', async () => {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(res.ok, `Status ${res.status}`);
  });

  // ── ADMIN ─────────────────────────────────
  console.log('\n🔒 ADMIN');

  await check('GET /api/admin/dashboard', async () => {
    const res = await fetch(`${BASE}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.stats.totalUsers >= 1, `Users: ${data.stats.totalUsers}`);
    assert(data.stats.totalCareers >= 8, `Careers: ${data.stats.totalCareers}`);
  });

  await check('GET /api/admin/dashboard (student → 403)', async () => {
    const res = await fetch(`${BASE}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${studentToken}` } });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await check('GET /api/admin/users', async () => {
    const res = await fetch(`${BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    assert(data.users.length >= 1, 'No users');
  });

  await check('GET /api/admin/users/[id]', async () => {
    const res = await fetch(`${BASE}/api/admin/users/${studentId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.user.interests.length === 2, `Interests: ${data.user.interests.length}`);
  });

  await check('PUT /api/admin/users/[id] (deactivate)', async () => {
    const res = await fetch(`${BASE}/api/admin/users/${studentId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ is_active: false }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('PUT /api/admin/users/[id] (reactivate)', async () => {
    const res = await fetch(`${BASE}/api/admin/users/${studentId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ is_active: true }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('GET /api/admin/careers', async () => {
    const res = await fetch(`${BASE}/api/admin/careers`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    assert(data.careers.length >= 8, `Careers: ${data.careers.length}`);
  });

  const testSlug = `test-career-${Date.now()}`;
  let newCareerId = 0;
  await check('POST /api/admin/careers (create)', async () => {
    const res = await fetch(`${BASE}/api/admin/careers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ slug: testSlug, title: 'Test Career', category: 'Testing', description: 'A test', skillsRequired: ['Testing'] }),
    });
    const body = await res.json();
    assert(res.status === 201, `Status ${res.status}: ${JSON.stringify(body)}`);
    newCareerId = body.id;
  });

  await check('PUT /api/admin/careers/[id]', async () => {
    const res = await fetch(`${BASE}/api/admin/careers/${newCareerId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: 'Updated Test Career' }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('DELETE /api/admin/careers/[id]', async () => {
    const res = await fetch(`${BASE}/api/admin/careers/${newCareerId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('GET /api/admin/resources', async () => {
    const res = await fetch(`${BASE}/api/admin/resources`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    assert(data.resources.length >= 4, `Resources: ${data.resources.length}`);
  });

  await check('POST /api/admin/resources', async () => {
    const res = await fetch(`${BASE}/api/admin/resources`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: 'Test Resource', type: 'article', url: 'https://example.com' }),
    });
    assert(res.status === 201, `Status ${res.status}`);
  });

  await check('GET /api/admin/notifications', async () => {
    const res = await fetch(`${BASE}/api/admin/notifications`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(res.ok, `Status ${res.status}`);
  });

  await check('POST /api/admin/notifications (send)', async () => {
    const res = await fetch(`${BASE}/api/admin/notifications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: 'Test Notif', message: 'Hello!', target: 'all' }),
    });
    assert(res.status === 201, `Status ${res.status}`);
  });

  // ── FCM TOKEN ─────────────────────────────
  console.log('\n🔔 FCM TOKEN');

  await check('POST /api/notifications/register-token', async () => {
    const res = await fetch(`${BASE}/api/notifications/register-token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ token: 'fake-fcm-token', device: 'test' }),
    });
    assert(res.ok, `Status ${res.status}`);
  });

  // ── SUMMARY ───────────────────────────────
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failures.length > 0) {
    console.log(`\n  FAILURES:`);
    failures.forEach(f => console.log(`    ❌ ${f}`));
  }
  console.log(`${'═'.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

test().catch(err => { console.error('Test runner crash:', err); process.exit(1); });
