export interface CreateIssueParams {
  title: string;
  correction: string;
  discordUsername: string;
  originalQuestion: string;
  quilyAnswer: string;
  /** Discord message link to the original bot answer, if available */
  discordMessageLink?: string;
}

/**
 * Create a GitHub issue via the REST API.
 * Returns the issue HTML URL on success.
 * Throws on failure (caller should catch and log).
 */
export async function createGitHubIssue(params: CreateIssueParams): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'Quilibrium-Community/quily';

  if (!token) {
    throw new Error('GITHUB_TOKEN not configured');
  }

  const discordLink = params.discordMessageLink
    ? `\n\n[View original message on Discord](${params.discordMessageLink})`
    : '';

  const body = `## Correction (via Discord)

**Reported by:** ${params.discordUsername}

### What Quily said:
> ${params.quilyAnswer.replace(/\n/g, '\n> ')}

### What the user corrected:
> ${params.correction.replace(/\n/g, '\n> ')}

### Original question:
> ${params.originalQuestion.replace(/\n/g, '\n> ')}
${discordLink}
---
*This issue was automatically created by Quily from a Discord correction.*`;

  const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      title: params.title,
      body,
      labels: ['knowledge-update', 'auto-reported'],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as { html_url: string };
  return data.html_url;
}
