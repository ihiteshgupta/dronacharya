import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './languages';

// PISTON_URL is required in production (validated in env.ts). No public fallback.
const PISTON_URL = process.env.PISTON_URL;
const TIMEOUT_MS = 10000; // 10 seconds
const MEMORY_LIMIT = 128 * 1024 * 1024; // 128MB

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  error?: string;
}

interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export async function executeCode(
  code: string,
  language: SupportedLanguage,
  stdin?: string
): Promise<ExecutionResult> {
  if (!PISTON_URL) {
    return {
      success: false,
      output: '',
      error: 'Code execution is not configured. PISTON_URL is not set.',
    };
  }

  const langConfig = SUPPORTED_LANGUAGES[language];

  if (!langConfig) {
    return {
      success: false,
      output: '',
      error: `Unsupported language: ${language}`,
    };
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${PISTON_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.pistonId,
        version: langConfig.version,
        files: [
          {
            name: `main${langConfig.extension}`,
            content: code,
          },
        ],
        stdin: stdin || '',
        run_timeout: TIMEOUT_MS,
        compile_timeout: TIMEOUT_MS,
        compile_memory_limit: MEMORY_LIMIT,
        run_memory_limit: MEMORY_LIMIT,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        output: '',
        error: `Piston API error: ${response.status} - ${errorText}`,
        executionTime: Date.now() - startTime,
      };
    }

    const result: PistonResponse = await response.json();
    const executionTime = Date.now() - startTime;

    // Check for compilation errors (TypeScript)
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: '',
        error: result.compile.stderr || result.compile.output || 'Compilation failed',
        executionTime,
      };
    }

    // Check for runtime errors
    if (result.run.code !== 0 || result.run.signal) {
      return {
        success: false,
        output: result.run.stdout,
        error: result.run.stderr || result.run.output || `Process exited with code ${result.run.code}`,
        executionTime,
      };
    }

    return {
      success: true,
      output: result.run.stdout || result.run.output,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        output: '',
        error: 'Execution timed out (10 second limit)',
        executionTime,
      };
    }

    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown execution error',
      executionTime,
    };
  }
}

export async function runTestCases(
  code: string,
  language: SupportedLanguage,
  testCases: TestCase[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const executionResult = await executeCode(code, language, testCase.input);

    const actualOutput = executionResult.output.trim();
    const expectedOutput = testCase.expectedOutput.trim();
    const passed = executionResult.success && actualOutput === expectedOutput;

    results.push({
      testCase,
      passed,
      actualOutput,
      error: executionResult.error,
    });
  }

  return results;
}
