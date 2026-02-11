import { z } from 'zod';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { executeCode, runTestCases, type TestCase } from '@/lib/sandbox/executor';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/sandbox/languages';

export const runtime = 'nodejs';
export const maxDuration = 30;

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().optional(),
});

const executeRequestSchema = z.object({
  code: z.string().max(50000, 'Code must be less than 50,000 characters'),
  language: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [SupportedLanguage, ...SupportedLanguage[]]),
  stdin: z.string().optional(),
  testCases: z.array(testCaseSchema).optional(),
});

export async function POST(req: Request) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: 20 executions per minute per user
    const rateLimit = await checkRateLimit(`sandbox:${session.user.id}`, {
      maxAttempts: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please wait before running more code.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const parseResult = executeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: parseResult.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { code, language, stdin, testCases } = parseResult.data;

    // Run test cases if provided
    if (testCases && testCases.length > 0) {
      const results = await runTestCases(code, language, testCases as TestCase[]);
      const allPassed = results.every((r) => r.passed);

      return new Response(
        JSON.stringify({
          results,
          allPassed,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Simple execution
    const result = await executeCode(code, language, stdin);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sandbox execution error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
