/**
 * Seed script for Dronacharya Beta Launch
 * Creates domains, tracks, courses, modules, and lessons for the beta
 *
 * Run with: npx tsx scripts/seed-beta-content.ts
 */

import { db } from '../src/lib/db';
import { domains, tracks, courses, modules, lessons } from '../src/lib/db/schema/content';
import { achievements } from '../src/lib/db/schema/gamification';

// ========================================
// DOMAINS
// ========================================
const DOMAINS = [
  {
    name: 'Python',
    slug: 'python',
    description: 'Master Python programming from fundamentals to advanced concepts',
    icon: 'code',
    order: 1,
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Learn data analysis, visualization, and statistical methods',
    icon: 'brain',
    order: 2,
  },
  {
    name: 'AI & Machine Learning',
    slug: 'machine-learning',
    description: 'Build intelligent systems with machine learning and deep learning',
    icon: 'zap',
    order: 3,
  },
];

// ========================================
// TRACKS
// ========================================
const TRACKS = [
  // Python Tracks
  {
    domainSlug: 'python',
    name: 'Python Fundamentals',
    slug: 'python-fundamentals',
    description: 'Start your programming journey with Python basics',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    skillsGained: ['Variables & Data Types', 'Control Flow', 'Functions', 'Basic OOP'],
    isPublished: true,
  },
  {
    domainSlug: 'python',
    name: 'Python Intermediate',
    slug: 'python-intermediate',
    description: 'Level up with advanced Python concepts and patterns',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['Python Fundamentals'],
    skillsGained: ['OOP Mastery', 'Error Handling', 'File I/O', 'Modules & Packages'],
    isPublished: true,
  },
  // Data Science Tracks
  {
    domainSlug: 'data-science',
    name: 'Data Analysis with Python',
    slug: 'data-analysis-python',
    description: 'Learn to analyze data with pandas, numpy, and matplotlib',
    difficulty: 'beginner',
    estimatedHours: 25,
    prerequisites: ['Python Fundamentals'],
    skillsGained: ['pandas', 'numpy', 'Data Cleaning', 'Visualization'],
    isPublished: true,
  },
  {
    domainSlug: 'data-science',
    name: 'Statistical Analysis',
    slug: 'statistical-analysis',
    description: 'Master statistical methods for data-driven decisions',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['Data Analysis with Python'],
    skillsGained: ['Hypothesis Testing', 'Regression', 'Probability', 'Statistical Inference'],
    isPublished: true,
  },
  // ML Tracks
  {
    domainSlug: 'machine-learning',
    name: 'Machine Learning Foundations',
    slug: 'ml-foundations',
    description: 'Understand core ML concepts and algorithms',
    difficulty: 'intermediate',
    estimatedHours: 35,
    prerequisites: ['Data Analysis with Python', 'Statistical Analysis'],
    skillsGained: ['Supervised Learning', 'Model Evaluation', 'scikit-learn', 'Feature Engineering'],
    isPublished: true,
  },
];

// ========================================
// COURSES (Sample for Python Fundamentals)
// ========================================
const COURSES = [
  // Python Fundamentals Track
  {
    trackSlug: 'python-fundamentals',
    name: 'Getting Started with Python',
    slug: 'getting-started-python',
    description: 'Your first steps in Python programming',
    order: 1,
    estimatedMinutes: 120,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Variables and Data Types',
    slug: 'variables-data-types',
    description: 'Understanding Python\'s data types and variables',
    order: 2,
    estimatedMinutes: 180,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Control Flow',
    slug: 'control-flow',
    description: 'If statements, loops, and program control',
    order: 3,
    estimatedMinutes: 200,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Functions',
    slug: 'functions',
    description: 'Creating reusable code with functions',
    order: 4,
    estimatedMinutes: 180,
    isPublished: true,
  },
  // Data Analysis Track
  {
    trackSlug: 'data-analysis-python',
    name: 'Introduction to pandas',
    slug: 'intro-pandas',
    description: 'Learn the fundamentals of pandas DataFrames',
    order: 1,
    estimatedMinutes: 150,
    isPublished: true,
  },
  {
    trackSlug: 'data-analysis-python',
    name: 'Data Cleaning',
    slug: 'data-cleaning',
    description: 'Handle missing data, duplicates, and outliers',
    order: 2,
    estimatedMinutes: 180,
    isPublished: true,
  },
  // ML Foundations Track
  {
    trackSlug: 'ml-foundations',
    name: 'What is Machine Learning?',
    slug: 'what-is-ml',
    description: 'Introduction to ML concepts and types',
    order: 1,
    estimatedMinutes: 90,
    isPublished: true,
  },
  {
    trackSlug: 'ml-foundations',
    name: 'Supervised Learning',
    slug: 'supervised-learning',
    description: 'Classification and regression fundamentals',
    order: 2,
    estimatedMinutes: 240,
    isPublished: true,
  },
];

// ========================================
// MODULES (Sample for "Variables and Data Types" course)
// ========================================
const MODULES = [
  {
    courseSlug: 'variables-data-types',
    name: 'Understanding Variables',
    description: 'Learn what variables are and how to use them',
    order: 1,
    type: 'concept',
    estimatedMinutes: 30,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Numeric Types',
    description: 'Working with integers, floats, and complex numbers',
    order: 2,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Strings',
    description: 'Text manipulation and string operations',
    order: 3,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Lists and Tuples',
    description: 'Ordered collections in Python',
    order: 4,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Practice Challenge',
    description: 'Apply your knowledge',
    order: 5,
    type: 'challenge',
    estimatedMinutes: 15,
  },
];

// ========================================
// LESSONS (Sample for "Understanding Variables" module)
// ========================================
const LESSONS = [
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'What is a Variable?',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'What is a Variable?',
      objectives: [
        'Understand what variables are',
        'Learn how to create variables in Python',
        'Understand variable naming conventions',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **variable** is like a labeled container that holds data in your program. Think of it as a box with a name tag - you can put things in it, look at what's inside, or replace its contents.

In Python, you create a variable by choosing a name and using the assignment operator (=) to give it a value.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Creating your first variable
message = "Hello, Dronacharya!"
print(message)

# Variables can hold different types of data
age = 25
price = 19.99
is_student = True`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What symbol do we use to assign a value to a variable in Python?',
          options: ['==', '=', ':=', '->'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'encouraging and patient',
      hints: [
        'Think about what connects the variable name to its value',
        'The symbol is commonly used in math, but with a slightly different meaning',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'Variable Naming Rules',
    type: 'concept',
    order: 2,
    estimatedMinutes: 8,
    contentJson: {
      type: 'concept' as const,
      title: 'Variable Naming Rules',
      objectives: [
        'Learn Python variable naming rules',
        'Understand naming conventions (snake_case)',
        'Identify valid vs invalid variable names',
      ],
      steps: [
        {
          id: 'rules',
          type: 'text' as const,
          content: `Python has rules for variable names:

✅ **Must start with** a letter (a-z, A-Z) or underscore (_)
✅ **Can contain** letters, numbers, and underscores
❌ **Cannot start with** a number
❌ **Cannot contain** spaces or special characters
❌ **Cannot be** a reserved keyword (like \`if\`, \`for\`, \`class\`)`,
        },
        {
          id: 'examples',
          type: 'code' as const,
          content: `# Valid variable names
user_name = "Alice"      # snake_case (recommended)
userName = "Bob"         # camelCase (works but not Pythonic)
_private = "secret"      # starts with underscore
age2 = 30                # contains a number

# Invalid variable names (will cause errors)
# 2nd_place = "silver"   # starts with number
# user-name = "Alice"    # contains hyphen
# class = "Python"       # reserved keyword`,
        },
        {
          id: 'question',
          type: 'question' as const,
          content: 'Which of these is a VALID Python variable name?',
          options: ['1st_name', 'user-age', 'my_variable', 'for'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'friendly and detailed',
      hints: [
        'Check if it starts with a number',
        'Look for special characters that might not be allowed',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'Practice: Variables',
    type: 'code',
    order: 3,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Practice: Working with Variables',
      objectives: [
        'Create variables of different types',
        'Print variable values',
        'Perform basic operations with variables',
      ],
      code: {
        language: 'python',
        initialCode: `# Create a variable called 'name' with your name as a string
# YOUR CODE HERE

# Create a variable called 'age' with your age as an integer
# YOUR CODE HERE

# Create a variable called 'greeting' that combines "Hello, " with your name
# YOUR CODE HERE

# Print the greeting
print(greeting)`,
        testCases: [
          {
            input: '',
            expected: 'Hello,',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'helpful and encouraging',
      hints: [
        'Remember to use quotes around string values',
        'You can combine strings using the + operator',
        'Make sure your variable names match exactly what\'s asked',
      ],
      maxHints: 3,
    },
  },
];

// ========================================
// ACHIEVEMENTS for Beta
// ========================================
const ACHIEVEMENTS = [
  {
    name: 'First Steps',
    description: 'Complete your first lesson',
    category: 'learning',
    xpReward: 50,
    criteria: { type: 'count' as const, target: 1, metric: 'lessons_completed' },
    icon: 'sparkles',
  },
  {
    name: 'Quick Learner',
    description: 'Complete 10 lessons',
    category: 'learning',
    xpReward: 200,
    criteria: { type: 'count' as const, target: 10, metric: 'lessons_completed' },
    icon: 'zap',
  },
  {
    name: 'On Fire',
    description: 'Maintain a 7-day learning streak',
    category: 'streak',
    xpReward: 300,
    criteria: { type: 'streak' as const, target: 7 },
    icon: 'flame',
  },
  {
    name: 'Dedicated',
    description: 'Maintain a 30-day learning streak',
    category: 'streak',
    xpReward: 1000,
    criteria: { type: 'streak' as const, target: 30 },
    icon: 'flame',
  },
  {
    name: 'Python Beginner',
    description: 'Complete the Python Fundamentals track',
    category: 'mastery',
    xpReward: 500,
    criteria: { type: 'custom' as const, target: 1, conditions: { track: 'python-fundamentals' } },
    icon: 'trophy',
  },
  {
    name: 'Data Explorer',
    description: 'Complete the Data Analysis track',
    category: 'mastery',
    xpReward: 750,
    criteria: { type: 'custom' as const, target: 1, conditions: { track: 'data-analysis-python' } },
    icon: 'brain',
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on any quiz',
    category: 'special',
    xpReward: 150,
    criteria: { type: 'score' as const, target: 100 },
    icon: 'star',
  },
  {
    name: 'Code Reviewer',
    description: 'Get your code reviewed 5 times',
    category: 'special',
    xpReward: 200,
    criteria: { type: 'count' as const, target: 5, metric: 'code_reviews' },
    icon: 'code',
  },
  {
    name: 'Beta Pioneer',
    description: 'Join during the beta launch period',
    category: 'special',
    xpReward: 500,
    criteria: { type: 'custom' as const, target: 1, conditions: { beta_user: true } },
    icon: 'rocket',
  },
];

// ========================================
// SEED FUNCTION
// ========================================
async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Seed Domains
    console.log('📁 Seeding domains...');
    const domainRecords = await db
      .insert(domains)
      .values(DOMAINS)
      .onConflictDoUpdate({
        target: domains.slug,
        set: { name: domains.name, description: domains.description },
      })
      .returning();
    console.log(`  ✓ ${domainRecords.length} domains`);

    // Create domain ID map
    const domainMap = new Map(domainRecords.map((d) => [d.slug, d.id]));

    // Seed Tracks
    console.log('📚 Seeding tracks...');
    const trackData = TRACKS.map((t) => ({
      ...t,
      domainId: domainMap.get(t.domainSlug)!,
    }));
    const trackRecords = await db
      .insert(tracks)
      .values(trackData.map(({ domainSlug, ...rest }) => rest))
      .onConflictDoUpdate({
        target: tracks.slug,
        set: { name: tracks.name, description: tracks.description },
      })
      .returning();
    console.log(`  ✓ ${trackRecords.length} tracks`);

    // Create track ID map
    const trackMap = new Map(trackRecords.map((t) => [t.slug, t.id]));

    // Seed Courses
    console.log('📖 Seeding courses...');
    const courseData = COURSES.map((c) => ({
      ...c,
      trackId: trackMap.get(c.trackSlug)!,
    }));
    const courseRecords = await db
      .insert(courses)
      .values(courseData.map(({ trackSlug, ...rest }) => rest))
      .onConflictDoUpdate({
        target: courses.slug,
        set: { name: courses.name, description: courses.description },
      })
      .returning();
    console.log(`  ✓ ${courseRecords.length} courses`);

    // Create course ID map
    const courseMap = new Map(courseRecords.map((c) => [c.slug, c.id]));

    // Seed Modules
    console.log('📝 Seeding modules...');
    const moduleData = MODULES.map((m) => ({
      ...m,
      courseId: courseMap.get(m.courseSlug)!,
    }));
    const moduleRecords = await db
      .insert(modules)
      .values(moduleData.map(({ courseSlug, ...rest }) => rest))
      .returning();
    console.log(`  ✓ ${moduleRecords.length} modules`);

    // Create module ID map (using composite key)
    const moduleMap = new Map(
      moduleRecords.map((m, i) => [
        `${MODULES[i].name.toLowerCase().replace(/\s+/g, '-')}-${MODULES[i].courseSlug}`,
        m.id,
      ])
    );

    // Seed Lessons
    console.log('📄 Seeding lessons...');
    const lessonData = LESSONS.map((l) => ({
      ...l,
      moduleId: moduleMap.get(l.moduleSlug)!,
    }));
    const lessonRecords = await db
      .insert(lessons)
      .values(lessonData.map(({ moduleSlug, ...rest }) => rest))
      .returning();
    console.log(`  ✓ ${lessonRecords.length} lessons`);

    // Seed Achievements
    console.log('🏆 Seeding achievements...');
    const achievementRecords = await db
      .insert(achievements)
      .values(
        ACHIEVEMENTS.map((a) => ({
          ...a,
          criteria: a.criteria,
        }))
      )
      .returning();
    console.log(`  ✓ ${achievementRecords.length} achievements`);

    console.log('\n✅ Seed complete!');
    console.log(`
Summary:
- ${domainRecords.length} domains
- ${trackRecords.length} tracks
- ${courseRecords.length} courses
- ${moduleRecords.length} modules
- ${lessonRecords.length} lessons
- ${achievementRecords.length} achievements
    `);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
