-- DreamPath Seed Data
USE dreampath;

-- ============================================================
-- DEFAULT SUPERADMIN  (password: Admin@123)
-- bcrypt hash for "Admin@123"
-- ============================================================
INSERT INTO users (name, email, password_hash, role, grade, stream, goal_intensity) VALUES
('Super Admin', 'admin@dreampath.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9JqKBnKbDgLc5L7rdOxlIHyHha', 'superadmin', NULL, NULL, NULL);

-- ============================================================
-- BADGES
-- ============================================================
INSERT INTO badges (name, description, icon) VALUES
('First Step',       'Completed your first task',         '🎯'),
('Week Warrior',     '7 day streak achieved',             '🔥'),
('Skill Builder',    'Completed 10 skill tasks',          '💪'),
('Month Master',     '30 day streak achieved',            '🏆'),
('Roadmap Champion', 'Completed a full roadmap',          '🗺️'),
('Research Pro',     'Completed 20 research tasks',       '🔍'),
('Community Star',   'Received 50 likes on posts',        '⭐'),
('Knowledge Seeker', 'Accessed 50 resources',             '📚');

-- ============================================================
-- CAREERS  (from src/data/careers.ts)
-- ============================================================
INSERT INTO careers (slug, title, category, description, daily_life, academic_path, entrance_exams, college_types, competition, difficulty, backup_options, study_duration, growth_potential, risk_level, average_salary, lifestyle, image) VALUES
(
  'software-engineer',
  'Software Engineer',
  'Technology',
  'Design, develop, and maintain software applications and systems. Work with various programming languages and technologies to solve complex problems.',
  'A typical day involves writing code, attending team meetings, reviewing pull requests, debugging issues, and collaborating with designers and product managers.',
  '["Class 10 with Science & Math","Class 12 with PCM","B.Tech/B.E. in Computer Science","Optional: M.Tech/MS"]',
  '["JEE Main","JEE Advanced","BITSAT","State CETs"]',
  '["IITs","NITs","IIITs","Private Engineering Colleges","State Universities"]',
  'very-high', 'high',
  '["Data Analyst","IT Support","Technical Writer","QA Engineer"]',
  '4 years (B.Tech) + Optional 2 years (M.Tech)',
  'very-high', 'low',
  '₹6-25 LPA (Entry to Senior)',
  'Mostly desk job, flexible hours possible, remote work options available',
  '/careers/software-engineer.jpg'
),
(
  'doctor',
  'Doctor (MBBS)',
  'Healthcare',
  'Diagnose and treat illnesses, injuries, and other health conditions. Specialize in various medical fields to provide expert care.',
  'Long hours in hospitals or clinics, patient consultations, surgeries (if surgeon), continuous learning about new treatments, emergency calls.',
  '["Class 10 with Science","Class 12 with PCB","MBBS (5.5 years)","MD/MS Specialization (3 years)"]',
  '["NEET-UG","AIIMS","JIPMER"]',
  '["AIIMS","Government Medical Colleges","Private Medical Colleges","Deemed Universities"]',
  'very-high', 'very-high',
  '["Pharmacist","Medical Lab Technician","Healthcare Administrator","Medical Writer"]',
  '5.5 years (MBBS) + 3 years (Specialization)',
  'high', 'medium',
  '₹8-50 LPA (Varies by specialization)',
  'Demanding schedule, high responsibility, emotionally challenging but rewarding',
  '/careers/doctor.jpg'
),
(
  'chartered-accountant',
  'Chartered Accountant',
  'Finance',
  'Handle financial accounts, auditing, taxation, and business advisory services for individuals and organizations.',
  'Analyzing financial data, preparing reports, meeting clients, tax planning, audit work, staying updated with financial regulations.',
  '["Class 12 (Any stream)","CA Foundation","CA Intermediate","CA Final","Articleship (3 years)"]',
  '["CA Foundation Exam","CA Intermediate Exam","CA Final Exam"]',
  '["ICAI Registered Coaching Centers","Self Study","Online Courses"]',
  'very-high', 'very-high',
  '["Company Secretary","Cost Accountant","Financial Analyst","Tax Consultant"]',
  '4-5 years (including articleship)',
  'high', 'low',
  '₹7-30 LPA',
  'Busy during audit/tax seasons, good work-life balance otherwise, office-based',
  '/careers/ca.jpg'
),
(
  'lawyer',
  'Lawyer/Advocate',
  'Law',
  'Represent clients in legal matters, provide legal advice, draft documents, and argue cases in court.',
  'Court appearances, client meetings, legal research, document drafting, case preparation, negotiations.',
  '["Class 12 (Any stream)","5-year Integrated LLB or 3-year LLB after graduation","Optional: LLM"]',
  '["CLAT","AILET","LSAT India","State Law Entrance Exams"]',
  '["NLUs","Government Law Colleges","Private Law Schools","University Law Departments"]',
  'high', 'high',
  '["Legal Advisor","Paralegal","Legal Writer","Compliance Officer"]',
  '5 years (Integrated LLB) or 3 years (LLB after graduation)',
  'high', 'medium',
  '₹5-50 LPA (Highly variable)',
  'Irregular hours, court visits, research-heavy, intellectually stimulating',
  '/careers/lawyer.jpg'
),
(
  'architect',
  'Architect',
  'Design & Construction',
  'Design buildings and structures that are functional, safe, and aesthetically pleasing while considering environmental impact.',
  'Creating designs, meeting clients, site visits, coordinating with engineers and contractors, working with CAD software.',
  '["Class 10 with Math","Class 12 with PCM","B.Arch (5 years)","Optional: M.Arch"]',
  '["NATA","JEE Main Paper 2","State Architecture Entrance Exams"]',
  '["IITs","NITs","SPA (School of Planning & Architecture)","Private Architecture Colleges"]',
  'high', 'high',
  '["Interior Designer","Urban Planner","3D Visualizer","Construction Manager"]',
  '5 years (B.Arch) + Optional 2 years (M.Arch)',
  'medium', 'medium',
  '₹4-20 LPA',
  'Creative work, site visits, deadline pressure, project-based work',
  '/careers/architect.jpg'
),
(
  'data-scientist',
  'Data Scientist',
  'Technology',
  'Analyze complex data sets to help organizations make informed decisions using statistics, machine learning, and programming.',
  'Analyzing datasets, building ML models, creating visualizations, presenting insights, collaborating with stakeholders.',
  '["Class 12 with PCM","B.Tech/B.Sc in CS/Statistics/Math","M.Tech/MS in Data Science","Online Certifications"]',
  '["JEE Main","University Entrance Exams","GATE (for masters)"]',
  '["IITs","IISc","ISI","NITs","Online Programs"]',
  'high', 'high',
  '["Data Analyst","Business Analyst","ML Engineer","Statistician"]',
  '4 years (B.Tech) + Optional 2 years (Masters)',
  'very-high', 'low',
  '₹8-40 LPA',
  'Desk job, analytical work, continuous learning required',
  '/careers/data-scientist.jpg'
),
(
  'civil-services',
  'Civil Services (IAS/IPS/IFS)',
  'Government',
  'Serve the nation in administrative, police, or foreign service roles. Make policies and implement government programs.',
  'Administrative work, field visits, meetings, policy implementation, handling public grievances, emergency management.',
  '["Class 12 (Any stream)","Graduation in any discipline","UPSC Preparation (1-3 years)"]',
  '["UPSC Civil Services Examination (Prelims, Mains, Interview)"]',
  '["Any recognized university","UPSC Coaching Centers (Optional)"]',
  'very-high', 'very-high',
  '["State Civil Services","Public Sector Jobs","Banking","Teaching"]',
  '3-4 years graduation + 1-3 years preparation',
  'very-high', 'high',
  '₹10-25 LPA + Perks',
  'Transfers, high responsibility, public service, demanding but prestigious',
  '/careers/civil-services.jpg'
),
(
  'graphic-designer',
  'Graphic Designer',
  'Creative Arts',
  'Create visual content for brands, websites, advertisements, and various media using design software and creative skills.',
  'Creating designs, meeting clients, revisions, staying updated with design trends, working with marketing teams.',
  '["Class 12 (Any stream)","Bachelor in Design/Fine Arts","Design Certifications","Portfolio Building"]',
  '["NID Entrance","NIFT Entrance","UCEED","College-specific tests"]',
  '["NID","NIFT","Private Design Institutes","Online Courses"]',
  'medium', 'medium',
  '["UI/UX Designer","Illustrator","Art Director","Brand Designer"]',
  '3-4 years',
  'medium', 'medium',
  '₹3-15 LPA',
  'Creative work, deadlines, freelance options available',
  '/careers/graphic-designer.jpg'
);

-- Career Skills
INSERT INTO career_skills (career_id, name) VALUES
(1, 'Programming'), (1, 'Problem Solving'), (1, 'Logical Thinking'), (1, 'Mathematics'), (1, 'Communication'), (1, 'Teamwork'),
(2, 'Biology'), (2, 'Chemistry'), (2, 'Empathy'), (2, 'Communication'), (2, 'Decision Making'), (2, 'Patience'), (2, 'Physical Stamina'),
(3, 'Mathematics'), (3, 'Analytical Thinking'), (3, 'Attention to Detail'), (3, 'Communication'), (3, 'Ethics'), (3, 'Time Management'),
(4, 'Critical Thinking'), (4, 'Communication'), (4, 'Research'), (4, 'Writing'), (4, 'Analytical Skills'), (4, 'Persuasion'),
(5, 'Creativity'), (5, 'Mathematics'), (5, 'Physics'), (5, 'Drawing'), (5, 'Spatial Visualization'), (5, 'Communication'),
(6, 'Statistics'), (6, 'Programming (Python/R)'), (6, 'Machine Learning'), (6, 'Mathematics'), (6, 'Communication'), (6, 'Critical Thinking'),
(7, 'General Knowledge'), (7, 'Analytical Skills'), (7, 'Leadership'), (7, 'Communication'), (7, 'Decision Making'), (7, 'Ethics'),
(8, 'Creativity'), (8, 'Design Software'), (8, 'Color Theory'), (8, 'Typography'), (8, 'Communication'), (8, 'Time Management');

-- Resources
INSERT INTO resources (title, type, url, description, career_id, thumbnail) VALUES
('Introduction to Python Programming', 'video', 'https://example.com/python-intro', 'A comprehensive introduction to Python for beginners', 1, '/resources/python.jpg'),
('JEE Main Preparation Guide', 'exam-guide', 'https://example.com/jee-guide', 'Complete guide for JEE Main preparation', NULL, '/resources/jee.jpg'),
('Data Structures and Algorithms', 'article', 'https://example.com/dsa', 'Learn DSA concepts with examples', 1, '/resources/dsa.jpg'),
('Mathematics for Computer Science', 'skill-link', 'https://example.com/math-cs', 'Essential math concepts for CS students', 1, '/resources/math.jpg');
