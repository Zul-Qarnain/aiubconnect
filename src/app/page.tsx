import { Suspense } from 'react';
import { getPosts } from "@/lib/firestore";
import { FeedClient } from "@/components/feed-client";

// This is the component that will be rendered on the server.
export const dynamic = 'force-dynamic';
// It fetches the data and passes it to the client component.
async function PostFeed() {
  const posts = await getPosts();
  // We don't pass user here anymore, FeedClient will handle it via Context
  return <FeedClient initialPosts={posts as any} />;
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
