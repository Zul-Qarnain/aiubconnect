import { getPosts, getCurrentUser } from "@/lib/data";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";

export default function Home() {
  const posts = getPosts();
  const currentUser = getCurrentUser();

  const trendingPosts = posts.filter((post) => post.sticky);
  const regularPosts = posts.filter((post) => !post.sticky);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Community Feed</h1>
        <PostForm currentUser={currentUser} />
      </div>

      <div className="space-y-6">
        {trendingPosts.map((post) => (
          <PostCard key={post.id} post={post} isTrending />
        ))}
        {regularPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
