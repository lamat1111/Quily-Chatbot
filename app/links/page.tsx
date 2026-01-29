import { Icon } from '@/src/components/ui/Icon';

/**
 * Links page with Quilibrium resources and references.
 */

interface LinkItem {
  title: string;
  description: string;
  url: string;
  icon: string;
}

const OFFICIAL_LINKS: LinkItem[] = [
  {
    title: 'Website',
    description: 'The official Quilibrium website',
    url: 'https://quilibrium.com',
    icon: 'globe',
  },
  {
    title: 'Quilibrium Inc. on X',
    description: 'Official Quilibrium Inc. Twitter/X account',
    url: 'https://x.com/QuilibriumInc',
    icon: 'simple-icons:x',
  },
  {
    title: 'GitHub',
    description: 'Official source code and repositories',
    url: 'https://github.com/quilibriumnetwork',
    icon: 'github',
  },
  {
    title: 'Quorum Messenger',
    description: 'Secure messaging built on Quilibrium',
    url: 'https://quorummessenger.com',
    icon: 'message-circle',
  },
  {
    title: 'Quilibrium Names Service',
    description: 'Register your @username for Quilibrium',
    url: 'https://names.quilibrium.com',
    icon: 'at-sign',
  },
];

const COMMUNITY_LINKS: LinkItem[] = [
  {
    title: 'Community Website',
    description: 'Quilibrium.one - community resources and guides',
    url: 'https://quilibrium.one',
    icon: 'globe',
  },
  {
    title: 'Community Discord',
    description: 'Join the community discussion on Discord',
    url: 'https://discord.gg/quilibrium',
    icon: 'simple-icons:discord',
  },
  {
    title: 'Community X / Twitter',
    description: 'QuilibriumOne community Twitter/X account',
    url: 'https://x.com/QuilibriumOne/highlights',
    icon: 'simple-icons:x',
  },
];

export default function LinksPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          <h1 className="text-3xl font-bold text-text-primary mb-2 font-title">
            Quilibrium Links
          </h1>
          <p className="text-text-secondary mb-8">
            Official resources and community links for Quilibrium.
          </p>

          {/* Official Links */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-title">
              <Icon name="shield" size={20} className="text-accent" />
              Official Links
            </h2>
            <div className="space-y-3">
              {OFFICIAL_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    link-unstyled
                    flex items-center gap-4 p-4
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-lg
                    hover:border-accent/50 hover:bg-accent/5
                    dark:hover:border-accent/50 dark:hover:bg-accent/10
                    transition-colors
                    group
                  "
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <Icon name={link.icon} size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      {link.description}
                    </p>
                  </div>
                  <Icon
                    name="external-link"
                    size={16}
                    className="text-gray-400 group-hover:text-accent transition-colors"
                  />
                </a>
              ))}
            </div>
          </section>

          {/* Community Links */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-title">
              <Icon name="users" size={20} className="text-accent" />
              Community Links
            </h2>
            <div className="space-y-3">
              {COMMUNITY_LINKS.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    link-unstyled
                    flex items-center gap-4 p-4
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-lg
                    hover:border-accent/50 hover:bg-accent/5
                    dark:hover:border-accent/50 dark:hover:bg-accent/10
                    transition-colors
                    group
                  "
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <Icon name={link.icon} size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      {link.description}
                    </p>
                  </div>
                  <Icon
                    name="external-link"
                    size={16}
                    className="text-gray-400 group-hover:text-accent transition-colors"
                  />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
}
