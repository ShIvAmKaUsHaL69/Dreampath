import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { parsePaginationParams } from '@/lib/pagination';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const { limit, offset } = parsePaginationParams(searchParams, {
      defaultLimit: 50,
      maxLimit: 200,
    });

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
       LIMIT ${limit} OFFSET ${offset}`,
      params
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
