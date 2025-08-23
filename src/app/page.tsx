
import { getPosts, getCurrentUser } from "@/lib/data";
import { FeedClient } from "@/components/feed-client";

export default function Home({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const allPosts = getPosts();
  const currentUser = getCurrentUser();
  const searchQuery = searchParams?.query || '';

  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FeedClient
      initialPosts={filteredPosts}
      currentUser={currentUser}
    />
  );
}
