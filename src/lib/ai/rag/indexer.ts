import { db } from '@/lib/db';
import { ragPipeline } from './pipeline';

export async function indexCourse(courseId: string) {
  const course = await db.query.courses.findFirst({
    where: { id: courseId },
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
  for (const module of course.modules || []) {
    if (module.description) {
      const result = await ragPipeline.indexContent(
        `module-${module.id}`,
        module.description,
        {
          courseId: course.id,
          moduleId: module.id,
          type: 'module',
          title: module.name,
        }
      );
      totalIndexed += result.indexed;
    }

    for (const lesson of module.lessons || []) {
      const content = lesson.contentJson as { text?: string } | null;
      if (content?.text) {
        const result = await ragPipeline.indexContent(
          `lesson-${lesson.id}`,
          content.text,
          {
            courseId: course.id,
            moduleId: module.id,
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
