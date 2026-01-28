'use client';

import { Sidebar } from '@/src/components/sidebar/Sidebar';

/**
 * About page describing Quily Chat.
 */
export default function AboutPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {/* Main content area - pt-14 on mobile for fixed header, pt-0 on desktop */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          <h1 className="text-3xl font-bold text-text-primary mb-6">
            About Quily Chat
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            {/* Beta Warning */}
            <div className="callout-warning mb-8">
              <p className="text-sm">
                <strong>Beta Notice:</strong> Quily Chat is currently in beta. Responses may not always
                be accurate. For critical technical information, always verify with the{' '}
                <a
                  href="https://docs.quilibrium.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  official Quilibrium documentation
                </a>.
              </p>
            </div>

            <p className="text-text-secondary mb-4">
              Quily Chat is an AI chatbot that helps you quickly find information about{' '}
              <a
                href="https://quilibrium.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quilibrium
              </a>{' '}
              — node operation, tokenomics, technical details, and more.
              It uses Retrieval-Augmented Generation (RAG) to search through official sources
              and generate helpful responses.
            </p>
            <p className="text-text-secondary mb-4">
              This is a community-maintained project, <strong>not officially endorsed by
              Quilibrium Inc.</strong> The code is open source under the AGPL-3.0 license
              and available on{' '}
              <a
                href="https://github.com/lamat1111/Quily-Chatbot"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>.
            </p>

            <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">
              Data Sources
            </h2>
            <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
              <li>
                The{' '}
                <a
                  href="https://docs.quilibrium.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  official Quilibrium documentation
                </a>
              </li>
              <li>
                Transcriptions from{' '}
                <a
                  href="https://www.youtube.com/@quilibriuminc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  official Quilibrium live streams
                </a>
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-text-primary mt-8 mb-4">
              Support the Project
            </h2>
            <p className="text-text-secondary mb-4">
              If you find Quily Chat helpful, you can support its development by{' '}
              <a
                href="https://quilibrium.one/#treasury"
                target="_blank"
                rel="noopener noreferrer"
              >
                donating to the community treasury
              </a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
