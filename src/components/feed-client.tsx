
"use client";

import type { Post, User } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";

interface FeedClientProps {
  initialPosts: Post[];
  currentUser: User;
}

export function FeedClient({ initialPosts, currentUser }: FeedClientProps) {

  const trendingPosts = initialPosts.filter((post) => post.sticky);
  const regularPosts = initialPosts.filter((post) => !post.sticky);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline">Community Feed</h1>
        <PostForm currentUser={currentUser} />
      </div>

      {initialPosts.length > 0 ? (
          <div className="space-y-6">
          {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} isTrending />
          ))}
          {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
          ))}
          </div>
      ) : (
          <div className="text-center py-16 text-muted-foreground">
              <h2 className="text-xl font-semibold">No posts found</h2>
              <p>Try adjusting your search query.</p>
          </div>
      )}
    </div>
  );
}
