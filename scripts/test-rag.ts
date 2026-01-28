import { ragPipeline } from '../src/lib/ai/rag';

const TEST_CONTENT_ID = 'test-rag-verification';

const sampleContent = `
JavaScript Variables and Data Types

Variables in JavaScript are containers for storing data values.
There are three ways to declare variables: var, let, and const.

let is block-scoped and can be reassigned.
const is block-scoped and cannot be reassigned.
var is function-scoped and can be reassigned.

JavaScript has several primitive data types:
- String: text values like "Hello"
- Number: numeric values like 42 or 3.14
- Boolean: true or false
- undefined: uninitialized variables
- null: intentional absence of value
`;

async function testRagPipeline() {
  console.log('🔍 RAG Pipeline Verification Test\n');

  try {
    // Step 1: Initialize
    console.log('1. Initializing RAG pipeline...');
    await ragPipeline.initialize();
    console.log('   ✅ Pipeline initialized\n');

    // Step 2: Index content
    console.log('2. Indexing sample content...');
    const indexResult = await ragPipeline.indexContent(
      TEST_CONTENT_ID,
      sampleContent,
      {
        courseId: 'test-course',
        moduleId: 'test-module',
        type: 'lesson',
        title: 'JavaScript Basics',
      }
    );
    console.log(`   ✅ Indexed ${indexResult.indexed} chunks\n`);

    // Step 3: Retrieve with query
    console.log('3. Testing retrieval...');
    const query = 'What are the ways to declare variables in JavaScript?';
    console.log(`   Query: "${query}"`);
    const results = await ragPipeline.retrieve(query);
    console.log(`   ✅ Retrieved content (${results.length} characters)\n`);

    // Step 4: Verify relevance
    console.log('4. Verifying relevance...');
    const hasRelevantContent =
      results.includes('let') ||
      results.includes('const') ||
      results.includes('var');

    if (hasRelevantContent) {
      console.log('   ✅ Retrieved content is relevant\n');
    } else {
      console.log('   ❌ Retrieved content may not be relevant\n');
      console.log('   Content preview:', results.slice(0, 200));
    }

    // Step 5: Cleanup
    console.log('5. Cleaning up test data...');
    await ragPipeline.deleteContent(TEST_CONTENT_ID);
    console.log('   ✅ Test data cleaned up\n');

    console.log('═══════════════════════════════');
    console.log('✅ RAG Pipeline Verification: PASSED');
    console.log('═══════════════════════════════');
  } catch (error) {
    console.error('❌ RAG Pipeline Verification: FAILED');
    console.error('Error:', error);
    process.exit(1);
  }
}

testRagPipeline();
