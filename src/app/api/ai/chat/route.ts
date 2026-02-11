import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { chat } from '@/lib/ai/orchestrator';
import { db, users, userProfiles, lessons, aiSessions, aiMessages } from '@/lib/db';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { env } from '@/lib/env';
import type { TeachingMode } from '@/lib/ai/types';
import { sanitizeUserMessage } from '@/lib/ai/utils/sanitize';

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(10000),
  })).min(1).max(50),
  lessonId: z.string().uuid().optional(),
});

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Require authentication with NextAuth session
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;

    // Rate limit: MAX_AI_REQUESTS_PER_MINUTE per user per minute
    const rateLimit = await checkRateLimit(`ai:${userId}`, {
      maxAttempts: env.MAX_AI_REQUESTS_PER_MINUTE,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please wait before sending more messages.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      });
    }

    // Validate request body
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: 'Invalid request',
        details: parsed.error.issues,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, lessonId } = parsed.data;

    // Get user profile
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Get lesson context if provided
    let lessonContext = {
      lessonId: '',
      topic: 'General',
      courseId: '',
      objectives: [] as string[],
      teachingMode: 'adaptive' as TeachingMode,
    };

    if (lessonId) {
      const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
          module: {
            with: {
              course: true,
            },
          },
        },
      });

      if (lesson) {
        const content = lesson.contentJson as { objectives?: string[] } | null;
        const aiConfig = lesson.aiConfig as { mode?: string } | null;

        lessonContext = {
          lessonId: lesson.id,
          topic: lesson.name,
          courseId: lesson.module?.courseId || '',
          objectives: content?.objectives || [],
          teachingMode: (aiConfig?.mode as TeachingMode) || 'adaptive',
        };
      }
    }

    // Convert messages to LangChain format with sanitization
    const previousMessages = messages.slice(0, -1).map((m: { role: string; content: string }) =>
      m.role === 'user'
        ? new HumanMessage(sanitizeUserMessage(m.content))
        : new AIMessage(m.content) // Don't sanitize AI messages
    );

    // Sanitize the current user message
    const rawUserMessage = messages[messages.length - 1].content;
    const userMessage = sanitizeUserMessage(rawUserMessage);

    // Get or create AI session
    const aiSession = await db.query.aiSessions.findFirst({
      where: and(
        eq(aiSessions.userId, userId),
        eq(aiSessions.lessonId, lessonId || ''),
        eq(aiSessions.status, 'active')
      ),
    });

    const sessionId = aiSession?.id || crypto.randomUUID();

    if (!aiSession) {
      await db.insert(aiSessions).values({
        id: sessionId,
        userId,
        lessonId: lessonId || null,
        agentType: 'orchestrator',
        status: 'active',
      });
    }

    // Save user message
    await db.insert(aiMessages).values({
      sessionId,
      role: 'user',
      content: userMessage,
    });

    // Get AI response
    const result = await chat(userMessage, {
      lessonId,
      userProfile: {
        id: userId,
        level: profile?.level || 1,
        learningStyle: profile?.learningStyle || 'adaptive',
        struggleAreas: (profile?.skillMap as { weakAreas?: string[] })?.weakAreas || [],
        interests: (profile?.studyPreferences as { interests?: string[] })?.interests || [],
        avgScore: 75,
      },
      lessonContext,
      previousMessages,
    });

    // Save AI response
    await db.insert(aiMessages).values({
      sessionId,
      role: 'assistant',
      content: result.response,
      metadata: result.metadata,
    });

    // Return response
    return new Response(JSON.stringify({
      content: result.response,
      agentType: result.agentType,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
