#!/usr/bin/env node
/**
 * One-time script to fix path separators in database
 * Removes duplicate entries that have backslash paths
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixPaths() {
  console.log('Checking for backslash paths in database...\n');

  // Get all unique source files
  const { data: files, error } = await supabase
    .from('document_chunks_chutes')
    .select('source_file')
    .order('source_file');

  if (error) {
    console.error('Error fetching files:', error.message);
    process.exit(1);
  }

  const uniqueFiles = [...new Set(files?.map((f) => f.source_file) ?? [])];
  const backslashFiles = uniqueFiles.filter((f) => f.includes('\\'));
  const forwardSlashFiles = uniqueFiles.filter((f) => !f.includes('\\'));

  console.log(`Total unique source_file entries: ${uniqueFiles.length}`);
  console.log(`  - With forward slashes: ${forwardSlashFiles.length}`);
  console.log(`  - With backslashes: ${backslashFiles.length}`);

  if (backslashFiles.length === 0) {
    console.log('\nNo backslash paths found - database is clean!');
    return;
  }

  console.log('\nBackslash paths found:');
  for (const file of backslashFiles.slice(0, 10)) {
    console.log(`  - ${file}`);
  }
  if (backslashFiles.length > 10) {
    console.log(`  ... and ${backslashFiles.length - 10} more`);
  }

  // Check for duplicates (same file with both path styles)
  const forwardSlashSet = new Set(forwardSlashFiles);
  const duplicates = backslashFiles.filter((f) =>
    forwardSlashSet.has(f.replace(/\\/g, '/'))
  );

  console.log(`\nDuplicates (exist with both path styles): ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\nDeleting backslash-style duplicates...');

    let totalDeleted = 0;
    for (const file of backslashFiles) {
      const { data, error } = await supabase
        .from('document_chunks_chutes')
        .delete()
        .eq('source_file', file)
        .select('id');

      if (error) {
        console.error(`  Error deleting ${file}: ${error.message}`);
      } else {
        totalDeleted += data?.length ?? 0;
        process.stdout.write('.');
      }
    }

    console.log(`\n\nDeleted ${totalDeleted} chunks with backslash paths`);
  }

  // Verify final count
  const { count } = await supabase
    .from('document_chunks_chutes')
    .select('*', { count: 'exact', head: true });

  console.log(`\nFinal chunk count: ${count}`);
}

fixPaths().catch(console.error);
