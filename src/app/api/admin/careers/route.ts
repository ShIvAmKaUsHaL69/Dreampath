import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update, queryOne } from '@/lib/db';

// GET all careers (admin view)
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const careers = await query<any[]>('SELECT * FROM careers ORDER BY title');
    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Admin careers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CREATE career
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { slug, title, category, description, dailyLife, academicPath, entranceExams, collegeTypes, competition, difficulty, backupOptions, studyDuration, growthPotential, riskLevel, averageSalary, lifestyle, image, skillsRequired } = body;

    if (!slug || !title || !category) {
      return NextResponse.json({ error: 'Slug, title, and category are required' }, { status: 400 });
    }

    const careerId = await insert(
      `INSERT INTO careers (slug, title, category, description, daily_life, academic_path, entrance_exams, college_types, competition, difficulty, backup_options, study_duration, growth_potential, risk_level, average_salary, lifestyle, image)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [slug, title, category, description || '', dailyLife || '', JSON.stringify(academicPath || []), JSON.stringify(entranceExams || []), JSON.stringify(collegeTypes || []), competition || 'medium', difficulty || 'medium', JSON.stringify(backupOptions || []), studyDuration || '', growthPotential || 'medium', riskLevel || 'medium', averageSalary || '', lifestyle || '', image || null]
    );

    if (skillsRequired?.length) {
      for (const skill of skillsRequired) {
        await insert('INSERT INTO career_skills (career_id, name) VALUES (?, ?)', [careerId, skill]);
      }
    }

    return NextResponse.json({ id: careerId, message: 'Career created' }, { status: 201 });
  } catch (error) {
    console.error('Admin career POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
