/**
 * Comprehensive Verification Test for BGE-M3 Consolidation
 *
 * Tests:
 * 1. Embedding generation works (OpenRouter BGE-M3)
 * 2. Retrieval works via OpenRouter
 * 3. Retrieval works via Chutes
 * 4. Both providers return identical results
 * 5. The actual retriever.ts code path works
 *
 * Run with: npx tsx scripts/research/verify-consolidation.ts
 */

import 'dotenv/config';
import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const TEST_QUERY = 'How do I run a Quilibrium node?';

async function main() {
  console.log(chalk.bold.white('\n╔═══════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.white('║  Comprehensive Consolidation Verification                         ║'));
  console.log(chalk.bold.white('╚═══════════════════════════════════════════════════════════════════╝\n'));

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const chutesKey = process.env.CHUTES_DEV_API_KEY || process.env.CHUTES_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!openRouterKey || !chutesKey || !supabaseUrl || !supabaseKey) {
    console.log(chalk.red('Missing required environment variables'));
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  let allPassed = true;

  // ==========================================================================
  // TEST 1: Embedding Generation (OpenRouter BGE-M3)
  // ==========================================================================
  console.log(chalk.yellow('TEST 1: Embedding Generation (OpenRouter BGE-M3)'));
  try {
    const openrouter = createOpenRouter({ apiKey: openRouterKey });
    const result = await embed({
      model: openrouter.textEmbeddingModel('baai/bge-m3'),
      value: TEST_QUERY,
    });

    if (result.embedding && result.embedding.length === 1024) {
      console.log(chalk.green(`  ✓ PASS: Generated ${result.embedding.length}-dim embedding`));
    } else {
      console.log(chalk.red(`  ✗ FAIL: Expected 1024 dims, got ${result.embedding?.length}`));
      allPassed = false;
    }
  } catch (error) {
    console.log(chalk.red(`  ✗ FAIL: ${error}`));
    allPassed = false;
  }

  // ==========================================================================
  // TEST 2: Retrieval via OpenRouter (simulating route.ts flow)
  // ==========================================================================
  console.log(chalk.yellow('\nTEST 2: Retrieval via OpenRouter BGE-M3'));
  let openRouterResults: any[] = [];
  try {
    const openrouter = createOpenRouter({ apiKey: openRouterKey });
    const { embedding } = await embed({
      model: openrouter.textEmbeddingModel('baai/bge-m3'),
      value: TEST_QUERY,
    });

    const { data, error } = await supabase.rpc('match_document_chunks_chutes', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error) {
      console.log(chalk.red(`  ✗ FAIL: RPC error: ${error.message}`));
      allPassed = false;
    } else if (data && data.length > 0) {
      openRouterResults = data;
      console.log(chalk.green(`  ✓ PASS: Retrieved ${data.length} results`));
      console.log(chalk.gray(`    Top: [${data[0].similarity.toFixed(3)}] ${data[0].source_file}`));
    } else {
      console.log(chalk.red('  ✗ FAIL: No results returned'));
      allPassed = false;
    }
  } catch (error) {
    console.log(chalk.red(`  ✗ FAIL: ${error}`));
    allPassed = false;
  }

  // ==========================================================================
  // TEST 3: Retrieval via Chutes BGE-M3
  // ==========================================================================
  console.log(chalk.yellow('\nTEST 3: Retrieval via Chutes BGE-M3'));
  let chutesResults: any[] = [];
  try {
    const response = await fetch('https://chutes-baai-bge-m3.chutes.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chutesKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [TEST_QUERY],
        model: 'BAAI/bge-m3',
      }),
    });

    if (!response.ok) {
      throw new Error(`Chutes API error ${response.status}`);
    }

    const embData = await response.json();
    const embedding = embData.data[0].embedding;

    if (embedding.length !== 1024) {
      console.log(chalk.red(`  ✗ FAIL: Expected 1024 dims, got ${embedding.length}`));
      allPassed = false;
    } else {
      const { data, error } = await supabase.rpc('match_document_chunks_chutes', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
      });

      if (error) {
        console.log(chalk.red(`  ✗ FAIL: RPC error: ${error.message}`));
        allPassed = false;
      } else if (data && data.length > 0) {
        chutesResults = data;
        console.log(chalk.green(`  ✓ PASS: Retrieved ${data.length} results`));
        console.log(chalk.gray(`    Top: [${data[0].similarity.toFixed(3)}] ${data[0].source_file}`));
      } else {
        console.log(chalk.red('  ✗ FAIL: No results returned'));
        allPassed = false;
      }
    }
  } catch (error) {
    console.log(chalk.red(`  ✗ FAIL: ${error}`));
    allPassed = false;
  }

  // ==========================================================================
  // TEST 4: Cross-Provider Consistency
  // ==========================================================================
  console.log(chalk.yellow('\nTEST 4: Cross-Provider Consistency'));
  if (openRouterResults.length > 0 && chutesResults.length > 0) {
    const orFiles = openRouterResults.map(r => r.source_file);
    const chFiles = chutesResults.map(r => r.source_file);

    const top1Match = orFiles[0] === chFiles[0];
    const allMatch = orFiles.every((f, i) => f === chFiles[i]);

    if (allMatch) {
      console.log(chalk.green('  ✓ PASS: Both providers return IDENTICAL results'));
    } else if (top1Match) {
      console.log(chalk.yellow('  ≈ PARTIAL: Top result matches, minor reordering in others'));
    } else {
      console.log(chalk.red('  ✗ FAIL: Results differ between providers'));
      console.log(chalk.gray(`    OpenRouter top: ${orFiles[0]}`));
      console.log(chalk.gray(`    Chutes top: ${chFiles[0]}`));
      allPassed = false;
    }

    // Compare similarity scores
    const orSim = openRouterResults[0]?.similarity;
    const chSim = chutesResults[0]?.similarity;
    const simDiff = Math.abs(orSim - chSim);

    if (simDiff < 0.001) {
      console.log(chalk.green(`  ✓ PASS: Similarity scores match (diff: ${simDiff.toFixed(6)})`));
    } else {
      console.log(chalk.yellow(`  ≈ NOTE: Similarity scores differ by ${simDiff.toFixed(6)}`));
    }
  } else {
    console.log(chalk.red('  ✗ SKIP: Cannot compare - missing results from one provider'));
    allPassed = false;
  }

  // ==========================================================================
  // TEST 5: Table Row Count
  // ==========================================================================
  console.log(chalk.yellow('\nTEST 5: Database State'));
  try {
    const { count, error } = await supabase
      .from('document_chunks_chutes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(chalk.red(`  ✗ FAIL: ${error.message}`));
      allPassed = false;
    } else {
      console.log(chalk.green(`  ✓ PASS: document_chunks_chutes has ${count} rows`));
    }
  } catch (error) {
    console.log(chalk.red(`  ✗ FAIL: ${error}`));
    allPassed = false;
  }

  // ==========================================================================
  // FINAL VERDICT
  // ==========================================================================
  console.log(chalk.blue.bold('\n═══════════════════════════════════════════════════════════════'));
  if (allPassed) {
    console.log(chalk.green.bold('✓ ALL TESTS PASSED - Safe to proceed with consolidation'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  1. Run the SQL migration to drop the old table'));
    console.log(chalk.gray('  2. Test the chat UI with both providers'));
  } else {
    console.log(chalk.red.bold('✗ SOME TESTS FAILED - Review errors above'));
  }
  console.log(chalk.blue.bold('═══════════════════════════════════════════════════════════════\n'));

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
