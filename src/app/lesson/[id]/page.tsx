'use client';

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ImmersiveLesson } from '@/components/learning/immersive-lesson';
import { Loader2 } from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const { data: lesson, isLoading, error } = trpc.course.getLesson.useQuery(
    { lessonId },
    { enabled: !!lessonId }
  );

  const updateProgress = trpc.progress.updateProgress.useMutation();

  const handleComplete = async () => {
    await updateProgress.mutateAsync({
      lessonId,
      status: 'completed',
      score: 100,
      timeSpent: 0,
    });
    router.push('/courses');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Failed to load lesson</p>
      </div>
    );
  }

  // Format lesson for ImmersiveLesson component
  const formattedLesson = {
    id: lesson.id,
    name: lesson.title,
    type: lesson.type,
    content: lesson.content,
    module: {
      name: lesson.module?.name || 'Module',
      course: {
        name: lesson.module?.course?.name || 'Course',
      },
    },
  };

  // Calculate total steps from content
  const content = lesson.content as { steps?: unknown[] };
  const totalSteps = content?.steps?.length || 1;

  return (
    <ImmersiveLesson
      lesson={formattedLesson}
      totalSteps={totalSteps}
      onComplete={handleComplete}
    />
  );
}
