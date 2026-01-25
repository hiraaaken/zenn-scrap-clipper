/**
 * Zenn API Response Types
 *
 * Type definitions for the Zenn scrap API endpoint:
 * GET https://zenn.dev/api/scraps/{slug}
 */

export interface ZennScrapResponse {
  scrap: ZennScrap;
}

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
  created_at: string;
  last_comment_created_at: string;
  should_noindex: boolean;
  path: string;
  unlisted: boolean;
  topics: ZennTopic[];
  user: ZennUser;
  comments: ZennComment[];
  current_user_liked: boolean;
  is_mine: boolean;
  positive_comments_count: number;
  commented_users: ZennCommentedUser[];
}

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

export interface ZennCommentedUser {
  id: number;
  username: string;
  name: string;
  avatar_small_url: string;
}

export interface ZennTopic {
  id: number;
  name: string;
  taggings_count: number;
  image_url: string;
  display_name: string;
}

export interface ZennComment {
  id: number;
  post_type: 'Comment';
  slug: string;
  user_id: number;
  liked_count: number;
  body_updated_at: string | null;
  created_at: string;
  pinned: boolean;
  body_html: string;
  hidden_reason: string | null;
  current_user_liked: boolean;
  is_mine: boolean;
  user: ZennUser;
  children: ZennComment[];
}

export interface ZennErrorResponse {
  message: string;
}

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

export type FetchScrapResult =
  | { success: true; data: ZennScrapResponse }
  | { success: false; error: 'not_found' | 'private' | 'network_error'; message: string };
