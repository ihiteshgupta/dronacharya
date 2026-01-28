import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { certifications, assessments, assessmentQuestions } from '@/lib/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { quizGeneratorAgent } from '@/lib/ai/agents/quiz-generator';

// Generate unique credential ID
function generateCredentialId(courseCode: string): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LF-${courseCode.toUpperCase()}-${year}-${random}`;
}

export const certificationRouter = router({
  // Check if user is eligible for a certification tier
  checkEligibility: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      tier: z.enum(['bronze', 'silver', 'gold']),
    }))
    .query(async ({ ctx, input }) => {
      const { courseId, tier } = input;

      // Get course info
      const course = await ctx.db.query.courses.findFirst({
        where: (courses, { eq }) => eq(courses.id, courseId),
        with: {
          modules: {
            with: {
              lessons: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      // Get all lesson IDs in this course
      const lessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));

      // Get user's completed lessons for this course
      const completedLessons = await ctx.db.query.progress.findMany({
        where: (progress, { eq, and, inArray }) =>
          and(
            eq(progress.userId, ctx.user.id),
            eq(progress.status, 'completed'),
            inArray(progress.lessonId, lessonIds.length > 0 ? lessonIds : ['none'])
          ),
      });

      const completionPercentage = lessonIds.length > 0
        ? (completedLessons.length / lessonIds.length) * 100
        : 0;

      // Check existing certifications
      const existingCerts = await ctx.db.query.certifications.findMany({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, courseId)
        ),
      });

      const hasBronze = existingCerts.some(c => c.tier === 'bronze');
      const hasSilver = existingCerts.some(c => c.tier === 'silver');
      const hasGold = existingCerts.some(c => c.tier === 'gold');

      // Determine eligibility based on tier
      switch (tier) {
        case 'bronze':
          return {
            eligible: completionPercentage === 100 && !hasBronze,
            reason: hasBronze
              ? 'Already earned'
              : completionPercentage < 100
                ? `Complete all lessons (${completionPercentage.toFixed(0)}% done)`
                : 'Eligible',
            completionPercentage,
            hasCertification: hasBronze,
          };

        case 'silver':
          return {
            eligible: hasBronze && !hasSilver,
            reason: !hasBronze
              ? 'Earn Bronze first'
              : hasSilver
                ? 'Already earned'
                : 'Eligible - Pass certification exam',
            hasCertification: hasSilver,
            requiresBronze: true,
          };

        case 'gold':
          return {
            eligible: hasSilver && !hasGold,
            reason: !hasSilver
              ? 'Earn Silver first'
              : hasGold
                ? 'Already earned'
                : 'Eligible - Submit project for review',
            hasCertification: hasGold,
            requiresSilver: true,
          };

        default:
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid tier' });
      }
    }),

  // Issue Bronze certificate (auto on 100% completion)
  issueBronze: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check eligibility
      const eligibility = await ctx.db.query.courses.findFirst({
        where: (courses, { eq }) => eq(courses.id, input.courseId),
        with: {
          modules: {
            with: {
              lessons: true,
            },
          },
        },
      });

      if (!eligibility) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      const lessonIds = eligibility.modules.flatMap(m => m.lessons.map(l => l.id));

      const completedLessons = await ctx.db.query.progress.findMany({
        where: (progress, { eq, and, inArray }) =>
          and(
            eq(progress.userId, ctx.user.id),
            eq(progress.status, 'completed'),
            inArray(progress.lessonId, lessonIds.length > 0 ? lessonIds : ['none'])
          ),
      });

      if (completedLessons.length < lessonIds.length) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Must complete all lessons to earn Bronze certification',
        });
      }

      // Check if already has bronze
      const existing = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, input.courseId),
          eq(certifications.tier, 'bronze')
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Bronze certification already earned',
        });
      }

      // Generate credential ID using course code or name
      const courseCode = eligibility.name.split(' ').map(w => w[0]).join('').slice(0, 4);
      const credentialId = generateCredentialId(courseCode);

      // Issue certificate
      const [cert] = await ctx.db
        .insert(certifications)
        .values({
          userId: ctx.user.id,
          courseId: input.courseId,
          tier: 'bronze',
          credentialId,
          metadata: {
            skills: eligibility.modules.flatMap(m => m.name ? [m.name] : []),
          },
        })
        .returning();

      return cert;
    }),

  // Start Silver certification exam
  startSilverExam: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify Bronze certification exists
      const hasBronze = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, input.courseId),
          eq(certifications.tier, 'bronze')
        ),
      });

      if (!hasBronze) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Must earn Bronze certification first',
        });
      }

      // Check if already has Silver
      const hasSilver = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, input.courseId),
          eq(certifications.tier, 'silver')
        ),
      });

      if (hasSilver) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Silver certification already earned',
        });
      }

      // Check for in-progress exam (cooldown after failed attempt)
      const recentAssessment = await ctx.db.query.assessments.findFirst({
        where: and(
          eq(assessments.userId, ctx.user.id),
          eq(assessments.courseId, input.courseId),
          eq(assessments.type, 'certification_exam')
        ),
        orderBy: (assessments, { desc }) => [desc(assessments.createdAt)],
      });

      if (recentAssessment) {
        if (recentAssessment.status === 'in_progress') {
          // Return existing in-progress exam
          const questions = await ctx.db.query.assessmentQuestions.findMany({
            where: eq(assessmentQuestions.assessmentId, recentAssessment.id),
            orderBy: (q, { asc }) => [asc(q.order)],
          });

          return {
            assessment: recentAssessment,
            questions: questions.map(q => ({
              id: q.id,
              questionType: q.questionType,
              question: q.question,
              options: q.options,
              order: q.order,
              points: q.points,
            })),
          };
        }

        // Check 24-hour cooldown after failed attempt
        if (recentAssessment.status === 'failed') {
          const cooldownEnd = new Date(recentAssessment.completedAt!);
          cooldownEnd.setHours(cooldownEnd.getHours() + 24);

          if (new Date() < cooldownEnd) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: `Retry available after ${cooldownEnd.toISOString()}`,
            });
          }
        }
      }

      // Get course info for quiz generation
      const course = await ctx.db.query.courses.findFirst({
        where: (courses, { eq }) => eq(courses.id, input.courseId),
      });

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      // Generate exam questions using Quiz Generator agent
      const examQuiz = await quizGeneratorAgent.generateExam({
        topic: course.name,
        count: 20,
        passingScore: 80,
        timeLimit: 45,
        certificationTier: 'silver',
        courseName: course.name,
      });

      if (!examQuiz) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate exam questions',
        });
      }

      // Create assessment record
      const [assessment] = await ctx.db
        .insert(assessments)
        .values({
          userId: ctx.user.id,
          courseId: input.courseId,
          type: 'certification_exam',
          status: 'in_progress',
          maxScore: examQuiz.questions.length,
          startedAt: new Date(),
        })
        .returning();

      // Insert questions
      const questionRecords = await ctx.db
        .insert(assessmentQuestions)
        .values(
          examQuiz.questions.map((q, index) => ({
            assessmentId: assessment.id,
            questionType: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 1,
            order: index + 1,
          }))
        )
        .returning();

      return {
        assessment,
        questions: questionRecords.map(q => ({
          id: q.id,
          questionType: q.questionType,
          question: q.question,
          options: q.options,
          order: q.order,
          points: q.points,
        })),
        timeLimit: 45 * 60, // 45 minutes in seconds
      };
    }),

  // Submit Silver exam answers
  submitSilverExam: protectedProcedure
    .input(z.object({
      assessmentId: z.string().uuid(),
      answers: z.record(z.string().uuid(), z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get assessment with questions
      const assessment = await ctx.db.query.assessments.findFirst({
        where: and(
          eq(assessments.id, input.assessmentId),
          eq(assessments.userId, ctx.user.id)
        ),
        with: {
          questions: true,
        },
      });

      if (!assessment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Assessment not found' });
      }

      if (assessment.status !== 'in_progress') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Assessment already submitted',
        });
      }

      // Grade answers
      let correctCount = 0;
      const answerDetails: Record<string, { answer: string; timeSpent: number }> = {};

      for (const question of assessment.questions) {
        const userAnswer = input.answers[question.id];
        answerDetails[question.id] = { answer: userAnswer || '', timeSpent: 0 };

        if (userAnswer && userAnswer === question.correctAnswer) {
          correctCount++;
        }
      }

      const score = correctCount;
      const maxScore = assessment.questions.length;
      const percentage = (score / maxScore) * 100;
      const passed = percentage >= 80;

      // Update assessment
      await ctx.db
        .update(assessments)
        .set({
          status: passed ? 'passed' : 'failed',
          score,
          answers: answerDetails,
          completedAt: new Date(),
          feedback: {
            overall: passed
              ? 'Congratulations! You passed the certification exam.'
              : 'You did not pass. Review the material and try again in 24 hours.',
            recommendations: passed ? [] : ['Review course materials', 'Practice coding exercises'],
          },
        })
        .where(eq(assessments.id, input.assessmentId));

      // Issue Silver if passed
      let certification = null;
      if (passed) {
        const course = await ctx.db.query.courses.findFirst({
          where: (courses, { eq }) => eq(courses.id, assessment.courseId),
        });

        const courseCode = course?.name.split(' ').map(w => w[0]).join('').slice(0, 4) || 'GEN';
        const credentialId = generateCredentialId(courseCode);

        [certification] = await ctx.db
          .insert(certifications)
          .values({
            userId: ctx.user.id,
            courseId: assessment.courseId,
            tier: 'silver',
            credentialId,
            metadata: {
              skills: [],
              reviewerNotes: `Exam score: ${percentage.toFixed(1)}%`,
            },
          })
          .returning();
      }

      return {
        passed,
        score,
        maxScore,
        percentage,
        certification,
      };
    }),

  // Submit Gold project
  submitGoldProject: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      projectUrl: z.string().url(),
      projectRepo: z.string().url(),
      description: z.string().min(50).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify Silver certification exists
      const hasSilver = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, input.courseId),
          eq(certifications.tier, 'silver')
        ),
      });

      if (!hasSilver) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Must earn Silver certification first',
        });
      }

      // Check if already has Gold or pending submission
      const existingGold = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.userId, ctx.user.id),
          eq(certifications.courseId, input.courseId),
          eq(certifications.tier, 'gold')
        ),
      });

      if (existingGold) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Gold certification already earned or pending',
        });
      }

      // Create pending Gold certification
      const [cert] = await ctx.db
        .insert(certifications)
        .values({
          userId: ctx.user.id,
          courseId: input.courseId,
          tier: 'gold',
          credentialId: `PENDING-${Date.now()}`, // Temporary until approved
          projectUrl: input.projectUrl,
          projectRepo: input.projectRepo,
          metadata: {
            projectDescription: input.description,
            reviewerNotes: 'Pending review',
          },
        })
        .returning();

      return {
        certification: cert,
        status: 'pending_review',
        message: 'Your project has been submitted for review.',
      };
    }),

  // Admin: Approve Gold certification
  approveGold: adminProcedure
    .input(z.object({
      certificationId: z.string().uuid(),
      approved: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const cert = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.id, input.certificationId),
          eq(certifications.tier, 'gold')
        ),
        with: {
          course: true,
        },
      });

      if (!cert) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Certification not found' });
      }

      if (!cert.credentialId.startsWith('PENDING-')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Certification already processed',
        });
      }

      if (input.approved) {
        // Generate real credential ID
        const courseCode = cert.course?.name.split(' ').map(w => w[0]).join('').slice(0, 4) || 'GEN';
        const credentialId = generateCredentialId(courseCode);

        await ctx.db
          .update(certifications)
          .set({
            credentialId,
            metadata: {
              ...cert.metadata,
              reviewerNotes: input.notes || 'Approved',
            },
          })
          .where(eq(certifications.id, input.certificationId));

        return { approved: true, credentialId };
      } else {
        // Delete rejected submission
        await ctx.db
          .delete(certifications)
          .where(eq(certifications.id, input.certificationId));

        return { approved: false, message: input.notes || 'Submission rejected' };
      }
    }),

  // List user's certifications
  list: protectedProcedure.query(async ({ ctx }) => {
    const certs = await ctx.db.query.certifications.findMany({
      where: eq(certifications.userId, ctx.user.id),
      with: {
        course: true,
      },
      orderBy: (certifications, { desc }) => [desc(certifications.issuedAt)],
    });

    return certs.map(c => ({
      ...c,
      isPending: c.credentialId.startsWith('PENDING-'),
    }));
  }),

  // Get single certification
  get: protectedProcedure
    .input(z.object({
      certificationId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const cert = await ctx.db.query.certifications.findFirst({
        where: and(
          eq(certifications.id, input.certificationId),
          eq(certifications.userId, ctx.user.id)
        ),
        with: {
          course: true,
          user: true,
        },
      });

      if (!cert) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Certification not found' });
      }

      return cert;
    }),

  // Public verification (no auth required)
  verify: publicProcedure
    .input(z.object({
      credentialId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      if (input.credentialId.startsWith('PENDING-')) {
        return null;
      }

      const cert = await ctx.db.query.certifications.findFirst({
        where: eq(certifications.credentialId, input.credentialId),
        with: {
          course: true,
          user: {
            columns: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!cert) {
        return null;
      }

      return {
        valid: true,
        credentialId: cert.credentialId,
        tier: cert.tier,
        courseName: cert.course?.name,
        recipientName: cert.user?.name,
        recipientImage: cert.user?.avatarUrl,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        skills: cert.metadata?.skills || [],
      };
    }),

  // Get pending Gold submissions (admin)
  getPendingReviews: adminProcedure.query(async ({ ctx }) => {
    const pending = await ctx.db.query.certifications.findMany({
      where: sql`${certifications.credentialId} LIKE 'PENDING-%'`,
      with: {
        course: true,
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (certifications, { asc }) => [asc(certifications.issuedAt)],
    });

    return pending;
  }),
});
