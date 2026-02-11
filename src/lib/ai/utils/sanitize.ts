/**
 * Input sanitization utilities for AI agent prompts
 * Prevents prompt injection attacks and malicious input
 */

/**
 * Known prompt injection patterns that should be stripped
 */
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|prior|all)\s+(instructions?|prompts?|commands?|rules?)/gi,
  /new\s+(instructions?|prompts?|commands?|rules?|task)/gi,
  /system\s*:/gi,
  /assistant\s*:/gi,
  /user\s*:/gi,
  /\[?\s*system\s*\]?/gi,
  /\[?\s*assistant\s*\]?/gi,
  /forget\s+(everything|all|previous)/gi,
  /disregard\s+(previous|above|all)/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /roleplay/gi,
];

/**
 * Special characters that should be escaped in prompts
 */
const SPECIAL_CHARS_REGEX = /[{}[\]()$#@!%^&*<>|\\:;'"]/g;

/**
 * Sanitizes a string for safe use in AI prompts
 * @param input - The input string to sanitize
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escape special characters
  sanitized = sanitized.replace(SPECIAL_CHARS_REGEX, '\\$&');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Remove control characters and non-printable characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  return sanitized;
}

/**
 * Sanitizes learning style preference
 * @param learningStyle - User's learning style preference
 * @returns Sanitized learning style
 */
export function sanitizeLearningStyle(learningStyle: string | null | undefined): string {
  if (!learningStyle) {
    return 'adaptive';
  }

  const sanitized = sanitizeInput(learningStyle, 50);

  // Validate against known learning styles
  const validStyles = ['adaptive', 'visual', 'auditory', 'kinesthetic', 'reading', 'social', 'solitary'];
  const normalized = sanitized.toLowerCase().replace(/[^a-z]/g, '');

  if (validStyles.includes(normalized)) {
    return normalized;
  }

  // If not recognized, return default
  return 'adaptive';
}

/**
 * Sanitizes an array of struggle areas or topics
 * @param areas - Array of struggle areas or topics
 * @param maxItems - Maximum number of items to include (default: 10)
 * @param maxLengthPerItem - Maximum length per item (default: 100)
 * @returns Sanitized array
 */
export function sanitizeArray(
  areas: string[] | null | undefined,
  maxItems: number = 10,
  maxLengthPerItem: number = 100
): string[] {
  if (!areas || !Array.isArray(areas)) {
    return [];
  }

  return areas
    .slice(0, maxItems)
    .map((area) => sanitizeInput(area, maxLengthPerItem))
    .filter((area) => area.length > 0);
}

/**
 * Sanitizes RAG context or external content
 * @param context - RAG context or external content
 * @param maxLength - Maximum allowed length (default: 5000)
 * @returns Sanitized context
 */
export function sanitizeRagContext(context: string | null | undefined, maxLength: number = 5000): string {
  if (!context || typeof context !== 'string') {
    return 'No specific content loaded.';
  }

  let sanitized = context.trim();

  // Limit length for RAG context (can be longer than user input)
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  // Remove prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  // Don't escape special chars in RAG context as it may contain code/markdown
  // but remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized || 'No specific content loaded.';
}

/**
 * Sanitizes user message content
 * @param message - User's message
 * @param maxLength - Maximum allowed length (default: 2000)
 * @returns Sanitized message
 */
export function sanitizeUserMessage(message: string, maxLength: number = 2000): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  let sanitized = message.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  // Remove control characters but preserve newlines and tabs for code snippets
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  return sanitized;
}

/**
 * Sanitizes topic or lesson name
 * @param topic - Topic or lesson name
 * @returns Sanitized topic
 */
export function sanitizeTopic(topic: string | null | undefined): string {
  if (!topic) {
    return 'General';
  }

  return sanitizeInput(topic, 100) || 'General';
}

/**
 * Sanitizes objectives array
 * @param objectives - Array of learning objectives
 * @returns Sanitized objectives
 */
export function sanitizeObjectives(objectives: string[] | null | undefined): string[] {
  return sanitizeArray(objectives, 20, 150);
}
