import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (c.title LIKE ? OR c.category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      whereClause += ' AND c.category = ?';
      params.push(category);
    }

    const careers = await query<any[]>(
      `SELECT c.*, GROUP_CONCAT(cs.name) as skills_required
       FROM careers c LEFT JOIN career_skills cs ON c.id = cs.career_id
       WHERE ${whereClause}
       GROUP BY c.id
       ORDER BY c.title ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Parse JSON fields and skills
    const formatted = careers.map((c: any) => ({
      id: c.slug,
      title: c.title,
      category: c.category,
      description: c.description,
      dailyLife: c.daily_life,
      skillsRequired: c.skills_required ? c.skills_required.split(',') : [],
      academicPath: JSON.parse(c.academic_path || '[]'),
      entranceExams: JSON.parse(c.entrance_exams || '[]'),
      collegeTypes: JSON.parse(c.college_types || '[]'),
      realityCheck: { competition: c.competition, difficulty: c.difficulty, backupOptions: JSON.parse(c.backup_options || '[]') },
      studyDuration: c.study_duration,
      growthPotential: c.growth_potential,
      riskLevel: c.risk_level,
      averageSalary: c.average_salary,
      lifestyle: c.lifestyle,
      image: c.image,
    }));

    return NextResponse.json({ careers: formatted });
  } catch (error) {
    console.error('Careers GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
