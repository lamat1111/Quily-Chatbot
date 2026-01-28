'use client';

import { Icon as IconifyIcon } from '@iconify/react';

/**
 * Icon component using Iconify with Feather Icons as default.
 *
 * Default: Feather Icons set (feather:) - 287 icons
 * See: https://icon-sets.iconify.design/feather/
 *
 * For brand/logo icons, use full icon name with set prefix:
 * - streamline-logos: https://icon-sets.iconify.design/streamline-logos/
 * - simple-icons: https://icon-sets.iconify.design/simple-icons/
 *
 * Usage:
 *   <Icon name="plus" />                           // feather:plus
 *   <Icon name="info" size={20} />                 // feather:info
 *   <Icon name="streamline-logos:discord" />       // Discord logo
 *   <Icon name="streamline-logos:twitter-x" />     // X (Twitter) logo
 */

export interface IconProps {
  /** Icon name - simple name for Feather, or full "set:name" for other sets */
  name: string;
  /** Icon size in pixels (default: 20) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export function Icon({ name, size = 20, className = '' }: IconProps) {
  // If name contains a colon, it's a full icon reference (e.g., "streamline-logos:discord")
  // Otherwise, use Feather Icons as default
  const iconName = name.includes(':') ? name : `feather:${name}`;

  return (
    <IconifyIcon
      icon={iconName}
      width={size}
      height={size}
      className={className}
    />
  );
}
