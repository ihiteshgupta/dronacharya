import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';
import { certificationRouter } from './routers/certification';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
  certification: certificationRouter,
});

export type AppRouter = typeof appRouter;
