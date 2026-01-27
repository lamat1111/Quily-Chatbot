import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

async function debugSearch() {
  console.log('=== Searching for chunks containing "quilibrium" ===\n');

  // Search for chunks containing 'quilibrium' in content
  const { data: textMatches, error: textError } = await supabase
    .from('document_chunks')
    .select('id, source_file, content')
    .ilike('content', '%quilibrium%')
    .limit(20);

  if (textError) {
    console.error('Text search error:', textError.message);
    return;
  }

  console.log(`Found ${textMatches?.length ?? 0} chunks with "quilibrium" in text\n`);

  if (textMatches && textMatches.length > 0) {
    for (const chunk of textMatches.slice(0, 5)) {
      console.log('---');
      console.log('ID:', chunk.id);
      console.log('Source:', chunk.source_file);
      console.log('Preview:', chunk.content.slice(0, 200).replace(/\n/g, ' ') + '...');
    }
  }

  // Also check source files
  console.log('\n\n=== Source files containing "quilibrium" in path ===\n');

  const { data: sourceFiles } = await supabase
    .from('document_chunks')
    .select('source_file')
    .ilike('source_file', '%quilibrium%');

  const uniqueSources = [...new Set(sourceFiles?.map(f => f.source_file) ?? [])];
  console.log(`Found ${uniqueSources.length} source files with "quilibrium" in path:`);
  for (const src of uniqueSources) {
    console.log('  -', src);
  }

  // Check total embedding count
  console.log('\n\n=== Embedding statistics ===\n');

  const { data: sample } = await supabase
    .from('document_chunks')
    .select('id, embedding')
    .limit(1);

  if (sample && sample[0]) {
    const embedding = sample[0].embedding;
    console.log('Embedding exists:', !!embedding);
    console.log('Embedding type:', typeof embedding);
    if (Array.isArray(embedding)) {
      console.log('Embedding length:', embedding.length);
      console.log('First 5 values:', embedding.slice(0, 5));
    } else if (typeof embedding === 'string') {
      // pgvector returns as string
      const parsed = embedding.replace(/[\[\]]/g, '').split(',').map(Number);
      console.log('Embedding length:', parsed.length);
      console.log('First 5 values:', parsed.slice(0, 5));
    }
  }
}

async function testVectorSearch() {
  console.log('\n\n=== Testing vector search directly ===\n');

  const query = 'what is Quilibrium?';
  console.log('Query:', query);

  // Generate embedding
  console.log('Generating embedding...');
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
    value: query,
  });

  console.log('Embedding generated, length:', embedding.length);
  console.log('First 5 values:', embedding.slice(0, 5));

  // Test with very low threshold
  console.log('\nCalling match_document_chunks with threshold 0.3...');
  const { data: results, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 10,
  });

  if (error) {
    console.error('RPC Error:', error.message);
    return;
  }

  console.log(`\nFound ${results?.length ?? 0} results:`);
  for (const result of results ?? []) {
    console.log('---');
    console.log('Similarity:', result.similarity.toFixed(4));
    console.log('Source:', result.source_file);
    console.log('Preview:', result.content.slice(0, 100).replace(/\n/g, ' ') + '...');
  }

  // Also test a specific chunk we know has "quilibrium"
  console.log('\n\n=== Testing with a known good chunk ===');
  const { data: knownChunk } = await supabase
    .from('document_chunks')
    .select('id, content, embedding')
    .eq('source_file', 'quilibrium-official/discover/01-what-is-quilibrium.md')
    .limit(1)
    .single();

  if (knownChunk) {
    console.log('\nFound "what-is-quilibrium.md" chunk:');
    console.log('ID:', knownChunk.id);
    console.log('Content preview:', knownChunk.content.slice(0, 200));

    // Parse the embedding from the chunk
    const chunkEmbedding = typeof knownChunk.embedding === 'string'
      ? knownChunk.embedding.replace(/[\[\]]/g, '').split(',').map(Number)
      : knownChunk.embedding;

    console.log('\nChunk embedding length:', chunkEmbedding?.length);
    console.log('Chunk first 5 values:', chunkEmbedding?.slice(0, 5));

    // Calculate cosine similarity manually
    if (chunkEmbedding && chunkEmbedding.length === embedding.length) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < embedding.length; i++) {
        dotProduct += embedding[i] * chunkEmbedding[i];
        normA += embedding[i] * embedding[i];
        normB += chunkEmbedding[i] * chunkEmbedding[i];
      }
      const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      console.log('\nManual cosine similarity:', cosineSimilarity.toFixed(4));
    }
  } else {
    console.log('Could not find what-is-quilibrium.md chunk');
  }
}

debugSearch().then(testVectorSearch).catch(console.error);
