import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const career = await queryOne<any>(
      'SELECT * FROM careers WHERE slug = ?',
      [id]
    );

    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    const skills = await query<any[]>('SELECT name FROM career_skills WHERE career_id = ?', [career.id]);

    return NextResponse.json({
      career: {
        id: career.slug,
        title: career.title,
        category: career.category,
        description: career.description,
        dailyLife: career.daily_life,
        skillsRequired: skills.map((s: any) => s.name),
        academicPath: JSON.parse(career.academic_path || '[]'),
        entranceExams: JSON.parse(career.entrance_exams || '[]'),
        collegeTypes: JSON.parse(career.college_types || '[]'),
        realityCheck: {
          competition: career.competition,
          difficulty: career.difficulty,
          backupOptions: JSON.parse(career.backup_options || '[]'),
        },
        studyDuration: career.study_duration,
        growthPotential: career.growth_potential,
        riskLevel: career.risk_level,
        averageSalary: career.average_salary,
        lifestyle: career.lifestyle,
        image: career.image,
      },
    });
  } catch (error) {
    console.error('Career detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
