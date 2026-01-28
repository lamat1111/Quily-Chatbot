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
} from '@/src/lib/chutes/chuteDiscovery';

export async function GET(request: Request) {
  try {
    let accessToken = await getServerAccessToken();
    let refreshedTokenInfo: { refreshToken?: string; expiresIn?: number } | null = null;

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

    const models = filtered.map((chute) => ({
      id: getChuteUrl(chute.slug),
      name: chute.name,
      description: chute.tagline || chute.description || '',
      template: chute.standard_template || null,
      slug: chute.slug,
      chuteId: chute.chute_id,
    }));

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
