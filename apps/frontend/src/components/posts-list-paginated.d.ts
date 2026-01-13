import type { PostResponse } from '@/lib/api';
interface PostsListPaginatedProps {
    posts: PostResponse[];
    locale: 'uz' | 'ru';
    postsPerPage?: number;
}
export default function PostsListPaginated({ posts, locale, postsPerPage }: PostsListPaginatedProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=posts-list-paginated.d.ts.map