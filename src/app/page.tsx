import { Suspense } from 'react';
import { getPosts, getCurrentUser } from "@/lib/data";
import { FeedClient } from "@/components/feed-client";

export const runtime = 'edge';

function Feed({ searchParams }: { searchParams?: { query?: string } }) {
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

export default function Home({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading feed...</div>}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
