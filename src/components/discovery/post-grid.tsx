import { PostCard } from "./post-card";

interface PostGridProps {
  posts: Array<Record<string, unknown>>;
  platform: "instagram" | "tiktok";
}

export function PostGrid({ posts, platform }: PostGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found for this profile</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post, index) => (
        <PostCard
          key={
            (post.id as string) ||
            (post.shortcode as string) ||
            (post.aweme_id as string) ||
            index
          }
          post={post}
          platform={platform}
        />
      ))}
    </div>
  );
}
