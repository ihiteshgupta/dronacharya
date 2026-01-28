export const SUPPORTED_LANGUAGES = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    pistonId: 'javascript',
    version: '18.15.0',
    extension: '.js',
    monacoLanguage: 'javascript',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    pistonId: 'typescript',
    version: '5.0.3',
    extension: '.ts',
    monacoLanguage: 'typescript',
  },
  python: {
    id: 'python',
    name: 'Python',
    pistonId: 'python',
    version: '3.10.0',
    extension: '.py',
    monacoLanguage: 'python',
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
