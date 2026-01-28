import { db, courses } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { ragPipeline } from './pipeline';

interface ModuleWithLessons {
  id: string;
  name: string;
  description: string | null;
  lessons?: Array<{
    id: string;
    name: string;
    contentJson: { text?: string } | null;
  }>;
}

export async function indexCourse(courseId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  let totalIndexed = 0;

  // Index course description
  if (course.description) {
    const result = await ragPipeline.indexContent(
      `course-${course.id}`,
      course.description,
      {
        courseId: course.id,
        type: 'course',
        title: course.name,
      }
    );
    totalIndexed += result.indexed;
  }

  // Index each module and lesson
  const courseModules = (course as { modules?: ModuleWithLessons[] }).modules || [];
  for (const courseModule of courseModules) {
    if (courseModule.description) {
      const result = await ragPipeline.indexContent(
        `module-${courseModule.id}`,
        courseModule.description,
        {
          courseId: course.id,
          moduleId: courseModule.id,
          type: 'module',
          title: courseModule.name,
        }
      );
      totalIndexed += result.indexed;
    }

    for (const lesson of courseModule.lessons || []) {
      const content = lesson.contentJson as { text?: string } | null;
      if (content?.text) {
        const result = await ragPipeline.indexContent(
          `lesson-${lesson.id}`,
          content.text,
          {
            courseId: course.id,
            moduleId: courseModule.id,
            lessonId: lesson.id,
            type: 'lesson',
            title: lesson.name,
          }
        );
        totalIndexed += result.indexed;
      }
    }
  }

  return { courseId, totalIndexed };
}

export async function reindexAll() {
  const allCourses = await db.query.courses.findMany();

  const results = [];
  for (const course of allCourses || []) {
    const result = await indexCourse(course.id);
    results.push(result);
  }

  return results;
}
