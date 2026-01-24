/**
 * Zenn API Response Types
 *
 * Type definitions for the Zenn scrap API endpoint:
 * GET https://zenn.dev/api/scraps/{slug}
 *
 * These types are derived from API research and may need updates
 * if Zenn changes their API structure.
 */

// =============================================================================
// API Response
// =============================================================================

/**
 * Root response from GET /api/scraps/{slug}
 */
export interface ZennScrapResponse {
  scrap: ZennScrap;
}

/**
 * Scrap entity with all metadata and comments.
 */
export interface ZennScrap {
  id: number;
  post_type: 'Scrap';
  user_id: number;
  slug: string;
  title: string;
  closed: boolean;
  closed_at: string | null;
  archived: boolean;
  liked_count: number;
  can_others_post: boolean;
  comments_count: number;
  created_at: string;              // ISO 8601: "2025-07-17T13:08:17.943+09:00"
  last_comment_created_at: string;
  should_noindex: boolean;
  path: string;                    // "/username/scraps/slug"
  unlisted: boolean;
  topics: ZennTopic[];
  user: ZennUser;
  comments: ZennComment[];
  current_user_liked: boolean;
  is_mine: boolean;
  positive_comments_count: number;
  commented_users: ZennCommentedUser[];
}

/**
 * User information attached to scraps and comments.
 */
export interface ZennUser {
  id: number;
  username: string;
  name: string;
  avatar_small_url: string;
  avatar_url: string;
  bio: string;
  github_username: string;
  twitter_username: string;
  website_url: string;
}

/**
 * Minimal user info for commented_users list.
 */
export interface ZennCommentedUser {
  id: number;
  username: string;
  name: string;
  avatar_small_url: string;
}

/**
 * Topic/tag attached to a scrap.
 */
export interface ZennTopic {
  id: number;
  name: string;                    // Slug: "typescript"
  taggings_count: number;
  image_url: string;
  display_name: string;            // Display: "TypeScript"
}

/**
 * Comment within a scrap (threaded structure).
 */
export interface ZennComment {
  id: number;
  post_type: 'Comment';
  slug: string;
  user_id: number;
  liked_count: number;
  body_updated_at: string | null;
  created_at: string;              // ISO 8601
  pinned: boolean;
  body_html: string;               // HTML content
  hidden_reason: string | null;
  current_user_liked: boolean;
  is_mine: boolean;
  user: ZennUser;
  children: ZennComment[];         // Nested replies
}

// =============================================================================
// API Error Response
// =============================================================================

/**
 * Error response from Zenn API (e.g., 404).
 */
export interface ZennErrorResponse {
  message: string;                 // e.g., "見つかりませんでした"
}

// =============================================================================
// Type Guards
// =============================================================================

export function isZennScrapResponse(data: unknown): data is ZennScrapResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'scrap' in data &&
    typeof (data as ZennScrapResponse).scrap === 'object'
  );
}

export function isZennErrorResponse(data: unknown): data is ZennErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as ZennErrorResponse).message === 'string' &&
    !('scrap' in data)
  );
}

// =============================================================================
// API Client Types
// =============================================================================

/**
 * Result of fetching a scrap from the API.
 */
export type FetchScrapResult =
  | { success: true; data: ZennScrapResponse }
  | { success: false; error: 'not_found' | 'private' | 'network_error'; message: string };
