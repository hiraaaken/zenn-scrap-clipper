import {
  type FetchScrapResult,
  type ZennScrapResponse,
  isZennScrapResponse,
  isZennErrorResponse,
} from '../types/zenn.ts';

const ZENN_API_BASE = 'https://zenn.dev/api';

export async function fetchScrap(slug: string): Promise<FetchScrapResult> {
  try {
    const response = await fetch(`${ZENN_API_BASE}/scraps/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'not_found',
          message: 'スクラップが見つかりませんでした',
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          error: 'private',
          message: '非公開のスクラップです',
        };
      }
      return {
        success: false,
        error: 'network_error',
        message: `APIエラー: ${response.status}`,
      };
    }

    const data: unknown = await response.json();

    if (isZennErrorResponse(data)) {
      return {
        success: false,
        error: 'not_found',
        message: data.message,
      };
    }

    if (!isZennScrapResponse(data)) {
      return {
        success: false,
        error: 'network_error',
        message: '不正なAPIレスポンスです',
      };
    }

    return {
      success: true,
      data: data as ZennScrapResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: 'network_error',
      message:
        error instanceof Error
          ? error.message
          : 'ネットワークエラーが発生しました',
    };
  }
}

export function extractSlugFromUrl(url: string): string | null {
  const match = url.match(/zenn\.dev\/[^/]+\/scraps\/([^/?#]+)/);
  return match ? match[1] : null;
}
