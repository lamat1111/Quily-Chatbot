'use client';

import { useState } from 'react';

type Provider = 'openrouter' | 'chutes';

interface ChunkDebug {
  rank: number;
  id: number;
  similarity: number;
  similarityPercent: string;
  source_file: string;
  heading_path: string | null;
  url: string | null;
  content_preview: string;
  content_length: number;
  full_content: string;
}

interface DebugResponse {
  database: {
    total_chunks: number;
    unique_source_files: number;
    source_files: string[];
    warning: string | null;
  };
  query: string;
  timing: {
    embedding_ms: number;
    search_ms: number;
    total_ms: number;
  };
  retrieval: {
    threshold: number;
    requested: number;
    returned: number;
    chunks: ChunkDebug[];
  };
  llm_input: {
    top_k: number;
    chunks_used: number;
    context_block: string;
    system_prompt_length: number;
    system_prompt: string;
  };
  analysis: {
    has_results: boolean;
    top_similarity: number | null;
    lowest_similarity: number | null;
    avg_similarity: number | null;
    unique_sources: string[];
  };
  error?: string;
}

export default function DebugPage() {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<Provider>('openrouter');
  const [threshold, setThreshold] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const runDebug = async () => {
    if (!query.trim()) {
      setError('Query is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          provider,
          similarityThreshold: threshold,
          initialCount: 15,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Request failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleChunk = (id: number) => {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-400';
    if (similarity >= 0.7) return 'text-yellow-400';
    if (similarity >= 0.6) return 'text-orange-400';
    return 'text-red-400';
  };

  // Quality diagnosis logic
  const getDiagnosis = (result: DebugResponse) => {
    const checks: {
      name: string;
      status: 'pass' | 'warn' | 'fail';
      message: string;
      detail: string;
    }[] = [];

    const topSim = result.analysis.top_similarity ?? 0;
    const avgSim = result.analysis.avg_similarity ?? 0;
    const chunkCount = result.retrieval.returned;
    const top5Chunks = result.retrieval.chunks.slice(0, 5);
    const top5AvgSim = top5Chunks.length > 0
      ? top5Chunks.reduce((sum, c) => sum + c.similarity, 0) / top5Chunks.length
      : 0;

    // Check 1: Are we getting any results?
    if (chunkCount === 0) {
      checks.push({
        name: 'Results Found',
        status: 'fail',
        message: 'No chunks retrieved',
        detail: 'The query returned zero results. Either the threshold is too high, or the content doesn\'t exist in your docs.',
      });
    } else if (chunkCount < 5) {
      checks.push({
        name: 'Results Found',
        status: 'warn',
        message: `Only ${chunkCount} chunks found`,
        detail: 'Few results found. The query may be too specific or docs coverage is limited.',
      });
    } else {
      checks.push({
        name: 'Results Found',
        status: 'pass',
        message: `${chunkCount} chunks retrieved`,
        detail: 'Good number of candidates for the LLM to work with.',
      });
    }

    // Check 2: Top similarity score
    if (topSim >= 0.75) {
      checks.push({
        name: 'Top Match Quality',
        status: 'pass',
        message: `${(topSim * 100).toFixed(1)}% similarity`,
        detail: 'Excellent! The top result is highly relevant to the query.',
      });
    } else if (topSim >= 0.6) {
      checks.push({
        name: 'Top Match Quality',
        status: 'warn',
        message: `${(topSim * 100).toFixed(1)}% similarity`,
        detail: 'Moderate match. Results may be tangentially related. Reranking could help prioritize better.',
      });
    } else if (topSim > 0) {
      checks.push({
        name: 'Top Match Quality',
        status: 'fail',
        message: `${(topSim * 100).toFixed(1)}% similarity`,
        detail: 'Poor match. The retrieved content is likely not what the user needs. Check if this topic exists in your docs.',
      });
    }

    // Check 3: Consistency of top 5 (are they all relevant or mixed quality?)
    if (top5Chunks.length >= 5) {
      const simSpread = top5Chunks[0].similarity - top5Chunks[4].similarity;
      if (simSpread < 0.1 && top5AvgSim >= 0.65) {
        checks.push({
          name: 'Result Consistency',
          status: 'pass',
          message: 'Top 5 are consistently relevant',
          detail: `Similarity spread is only ${(simSpread * 100).toFixed(1)}%. All top results are similarly relevant.`,
        });
      } else if (simSpread > 0.2) {
        checks.push({
          name: 'Result Consistency',
          status: 'warn',
          message: 'Mixed quality in top 5',
          detail: `Large spread (${(simSpread * 100).toFixed(1)}%) between #1 and #5. Reranking would help filter out weaker matches.`,
        });
      } else {
        checks.push({
          name: 'Result Consistency',
          status: 'pass',
          message: 'Reasonable consistency',
          detail: 'Top results have acceptable similarity spread.',
        });
      }
    }

    // Check 4: Would reranking help?
    // Look for cases where a lower-ranked chunk might be more relevant
    const hasRerankingPotential = result.retrieval.chunks.length > 5 &&
      result.retrieval.chunks.slice(5).some(c => c.similarity > top5Chunks[4]?.similarity - 0.05);

    if (hasRerankingPotential && topSim < 0.8) {
      checks.push({
        name: 'Reranking Benefit',
        status: 'warn',
        message: 'Reranking could improve results',
        detail: 'There are chunks ranked 6-15 with similar scores to top 5. A reranker (Cohere/Jina) could better identify the most relevant ones.',
      });
    } else if (topSim >= 0.8) {
      checks.push({
        name: 'Reranking Benefit',
        status: 'pass',
        message: 'Reranking likely unnecessary',
        detail: 'Top results are already high quality. Reranking would add latency with minimal benefit.',
      });
    }

    // Check 5: Source diversity (are results from multiple docs or one?)
    const uniqueSources = result.analysis.unique_sources.length;
    if (uniqueSources === 1 && chunkCount >= 5) {
      checks.push({
        name: 'Source Diversity',
        status: 'warn',
        message: 'All results from 1 source',
        detail: 'All chunks come from a single document. This could be fine, or might indicate the query is too narrow.',
      });
    } else if (uniqueSources >= 3) {
      checks.push({
        name: 'Source Diversity',
        status: 'pass',
        message: `${uniqueSources} different sources`,
        detail: 'Good diversity! Results pulled from multiple documents.',
      });
    }

    // Check 6: Content appears relevant (simple heuristic - does query term appear in top chunks?)
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const topChunkText = top5Chunks.map(c => c.full_content.toLowerCase()).join(' ');
    const matchingWords = queryWords.filter(w => topChunkText.includes(w));
    const wordMatchRatio = queryWords.length > 0 ? matchingWords.length / queryWords.length : 0;

    if (wordMatchRatio >= 0.5) {
      checks.push({
        name: 'Keyword Presence',
        status: 'pass',
        message: `${matchingWords.length}/${queryWords.length} query terms found`,
        detail: `Key terms from your query appear in the retrieved chunks: "${matchingWords.join('", "')}"`,
      });
    } else if (wordMatchRatio > 0) {
      checks.push({
        name: 'Keyword Presence',
        status: 'warn',
        message: `Only ${matchingWords.length}/${queryWords.length} terms found`,
        detail: `Some query terms missing from results. Semantic search found related content, but exact matches are limited.`,
      });
    } else if (queryWords.length > 0) {
      checks.push({
        name: 'Keyword Presence',
        status: 'fail',
        message: 'No query terms in results',
        detail: 'None of your query keywords appear in the top results. The semantic search may have found unrelated content.',
      });
    }

    // Overall assessment
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warnCount = checks.filter(c => c.status === 'warn').length;

    let overall: 'good' | 'okay' | 'poor';
    let overallMessage: string;
    let overallDetail: string;

    if (failCount === 0 && warnCount <= 1) {
      overall = 'good';
      overallMessage = 'Retrieval looks good!';
      overallDetail = 'The RAG pipeline is finding relevant content. If answers are still poor, the issue is likely in the LLM prompt or response generation.';
    } else if (failCount === 0 && warnCount <= 3) {
      overall = 'okay';
      overallMessage = 'Retrieval is acceptable';
      overallDetail = 'Results are usable but could be improved. Consider the warnings below. Adding reranking (Jina free tier) could help.';
    } else {
      overall = 'poor';
      overallMessage = 'Retrieval needs improvement';
      overallDetail = 'The RAG pipeline is struggling to find relevant content. Check if the topic exists in your docs, or if chunking is cutting up relevant sections.';
    }

    return { checks, overall, overallMessage, overallDetail };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">RAG Debug Tool</h1>
        <p className="text-gray-400 mb-8">
          Test retrieval quality without calling the LLM. See exactly what chunks are retrieved and
          what context would be sent.
        </p>

        {/* Input Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., How do I set up a Quilibrium node?"
                className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && runDebug()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Embedding Provider</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      value="openrouter"
                      checked={provider === 'openrouter'}
                      onChange={(e) => setProvider(e.target.value as Provider)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <span>OpenRouter</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      value="chutes"
                      checked={provider === 'chutes'}
                      onChange={(e) => setProvider(e.target.value as Provider)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <span>Chutes</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Uses API key from environment variables
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Similarity Threshold: {threshold}
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.3 (loose)</span>
                  <span>0.9 (strict)</span>
                </div>
              </div>
            </div>

            <button
              onClick={runDebug}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Run Debug Search'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Database Stats - Critical Info */}
            {result.database.warning && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-6">
                <h2 className="text-xl font-bold text-red-400 mb-2">Database Problem Detected</h2>
                <p className="text-red-300 mb-4">{result.database.warning}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total chunks in DB:</span>{' '}
                    <span className="font-bold text-red-400">{result.database.total_chunks}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Unique source files:</span>{' '}
                    <span className="font-bold text-red-400">{result.database.unique_source_files}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-900 rounded text-sm">
                  <p className="text-gray-300 mb-2">To fix this, run the ingestion script:</p>
                  <code className="text-green-400">npx tsx scripts/ingest/index.ts</code>
                </div>
              </div>
            )}

            {!result.database.warning && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2">Database Status</h2>
                <div className="flex gap-8 text-sm">
                  <span>
                    <span className="text-gray-400">Total chunks:</span>{' '}
                    <span className="font-bold text-green-400">{result.database.total_chunks}</span>
                  </span>
                  <span>
                    <span className="text-gray-400">Source files:</span>{' '}
                    <span className="font-bold">{result.database.unique_source_files}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Quality Diagnosis */}
            {(() => {
              const diagnosis = getDiagnosis(result);
              return (
                <div
                  className={`rounded-lg p-6 border-2 ${
                    diagnosis.overall === 'good'
                      ? 'bg-green-900/20 border-green-500'
                      : diagnosis.overall === 'okay'
                      ? 'bg-yellow-900/20 border-yellow-500'
                      : 'bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-3xl ${
                        diagnosis.overall === 'good'
                          ? 'text-green-400'
                          : diagnosis.overall === 'okay'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {diagnosis.overall === 'good' ? '✓' : diagnosis.overall === 'okay' ? '~' : '✗'}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold">{diagnosis.overallMessage}</h2>
                      <p className="text-gray-400 text-sm">{diagnosis.overallDetail}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 mt-4">
                    {diagnosis.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded ${
                          check.status === 'pass'
                            ? 'bg-green-900/30'
                            : check.status === 'warn'
                            ? 'bg-yellow-900/30'
                            : 'bg-red-900/30'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            check.status === 'pass'
                              ? 'text-green-400'
                              : check.status === 'warn'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL'}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{check.name}</span>
                            <span className="text-gray-400 text-sm">{check.message}</span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold">{result.retrieval.returned}</div>
                <div className="text-gray-400 text-sm">Chunks Retrieved</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getSimilarityColor(result.analysis.top_similarity ?? 0)}`}>
                  {result.analysis.top_similarity?.toFixed(3) ?? 'N/A'}
                </div>
                <div className="text-gray-400 text-sm">Top Similarity</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold">{result.analysis.avg_similarity?.toFixed(3) ?? 'N/A'}</div>
                <div className="text-gray-400 text-sm">Avg Similarity</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold">{result.timing.total_ms}ms</div>
                <div className="text-gray-400 text-sm">Total Time</div>
              </div>
            </div>

            {/* Timing Breakdown */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Timing Breakdown</h2>
              <div className="flex gap-8 text-sm">
                <span>Embedding: {result.timing.embedding_ms}ms</span>
                <span>Vector Search: {result.timing.search_ms}ms</span>
              </div>
            </div>

            {/* Unique Sources */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">
                Sources Found ({result.analysis.unique_sources.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.analysis.unique_sources.map((source) => (
                  <span key={source} className="bg-gray-700 px-2 py-1 rounded text-sm">
                    {source}
                  </span>
                ))}
              </div>
            </div>

            {/* Retrieved Chunks */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Retrieved Chunks</h2>
              <div className="space-y-3">
                {result.retrieval.chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className={`border rounded-lg p-4 ${
                      chunk.rank <= 5 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold ${chunk.rank <= 5 ? 'text-blue-400' : 'text-gray-500'}`}>
                          #{chunk.rank}
                        </span>
                        <span className={`font-mono ${getSimilarityColor(chunk.similarity)}`}>
                          {chunk.similarityPercent}
                        </span>
                        {chunk.rank <= 5 && (
                          <span className="bg-blue-600 text-xs px-2 py-0.5 rounded">Used by LLM</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleChunk(chunk.id)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        {expandedChunks.has(chunk.id) ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    <div className="text-sm text-gray-400 mb-2">
                      <span className="font-medium">{chunk.source_file}</span>
                      {chunk.heading_path && (
                        <span className="text-gray-500"> &gt; {chunk.heading_path}</span>
                      )}
                    </div>

                    <div className="text-sm bg-gray-900 rounded p-3 font-mono whitespace-pre-wrap">
                      {expandedChunks.has(chunk.id) ? chunk.full_content : chunk.content_preview}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {chunk.content_length} chars | ID: {chunk.id}
                      {chunk.url && (
                        <>
                          {' | '}
                          <a
                            href={chunk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            View in docs
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {result.retrieval.chunks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No chunks found above similarity threshold ({threshold})
                  </div>
                )}
              </div>
            </div>

            {/* System Prompt Preview */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  System Prompt ({result.llm_input.system_prompt_length} chars)
                </h2>
                <button
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {showSystemPrompt ? 'Hide' : 'Show'} Full Prompt
                </button>
              </div>

              {showSystemPrompt && (
                <pre className="text-sm bg-gray-900 rounded p-4 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {result.llm_input.system_prompt}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
