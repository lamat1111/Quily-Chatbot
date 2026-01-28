import { NextResponse } from 'next/server';
import { getOAuthConfig, refreshTokens } from '@/src/lib/chutesAuth';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  cookieOptions,
  getServerAccessToken,
  getServerRefreshToken,
} from '@/src/lib/serverAuth';
import {
  discoverChutes,
  filterChutesByType,
  getChuteUrl,
  getCuratedModels,
} from '@/src/lib/chutes/chuteDiscovery';

export async function GET(request: Request) {
  try {
    // Dev bypass: use CHUTES_DEV_API_KEY if set
    const devApiKey = process.env.CHUTES_DEV_API_KEY;
    let accessToken: string | null = devApiKey || null;
    let refreshedTokenInfo: { refreshToken?: string; expiresIn?: number } | null = null;

    if (!accessToken) {
      accessToken = await getServerAccessToken();
    }

    if (!accessToken) {
      const refreshToken = await getServerRefreshToken();
      if (refreshToken) {
        try {
          const config = getOAuthConfig();
          const refreshed = await refreshTokens({ refreshToken, config });
          accessToken = refreshed.access_token;
          refreshedTokenInfo = {
            refreshToken: refreshed.refresh_token || refreshToken,
            expiresIn: refreshed.expires_in ?? 3600,
          };
        } catch {
          accessToken = null;
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'llm';

    const allChutes = await discoverChutes(accessToken);
    const filtered = filterChutesByType(allChutes, type);
    const curatedMetadata = getCuratedModels(type as 'llm' | 'embedding');

    // Build a map of slug -> curated metadata for quick lookup
    const metadataMap = new Map(curatedMetadata.map((m) => [m.slug, m]));

    // Map chutes to model options, enriching with curated metadata
    const models = filtered
      .map((chute) => {
        const meta = metadataMap.get(chute.slug);
        return {
          id: getChuteUrl(chute.slug),
          name: meta?.displayName || chute.name,
          description: meta?.description || chute.tagline || chute.description || '',
          template: chute.standard_template || null,
          slug: chute.slug,
          chuteId: chute.chute_id,
          isOpenSource: meta?.isOpenSource ?? true,
          isRecommended: meta?.isRecommended ?? false,
          order: meta?.order ?? 999,
        };
      })
      // Sort by order to ensure consistent display
      .sort((a, b) => a.order - b.order);

    const res = NextResponse.json({ models });
    if (refreshedTokenInfo?.expiresIn) {
      res.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
        ...cookieOptions,
        maxAge: refreshedTokenInfo.expiresIn,
      });
      if (refreshedTokenInfo.refreshToken) {
        res.cookies.set(COOKIE_REFRESH_TOKEN, refreshedTokenInfo.refreshToken, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    }

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Chutes models';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
