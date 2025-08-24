import { Suspense } from 'react';
import { getPosts, getCurrentUser } from "@/lib/data";
import { FeedClient } from "@/components/feed-client";

export const runtime = 'edge';
// This is the component that will be rendered on the server.
// It fetches the data and passes it to the client component.
async function PostFeed() {
  const posts = getPosts();
  const user = getCurrentUser();
  return <FeedClient initialPosts={posts} currentUser={user} />;
}

// This is the main page component.
// It uses Suspense to handle the loading state of the async component.
export default function HomePage() {
  return (
    <div className="w-full">
      <Suspense fallback={<p>Loading feed...</p>}>
        <PostFeed />
      </Suspense>
    </div>
  );
}
