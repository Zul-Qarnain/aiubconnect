
"use client";

import type { Post, User } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const PostForm = dynamic(() => import('@/components/post-form').then(mod => mod.PostForm), { ssr: false });

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

interface FeedClientProps {
  initialPosts: Post[];
}

export function FeedClient({ initialPosts }: FeedClientProps) {
  const { user } = useAuth();
  // Map Firebase user to App user shape (simplified for now)
  const appUser = user ? {
    id: user.uid,
    name: user.displayName || "User",
    dailyPostCount: 0, // TODO: Fetch from Firestore
    monthlyImagePostCount: 0, // TODO: Fetch from Firestore
    ...user
  } : null;

  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.toLowerCase() || '';

  const filteredPosts = initialPosts.filter((post) => {
    if (!query) return true;
    return post.title.toLowerCase().includes(query) || (post.text && post.text.toLowerCase().includes(query));
  });

  const trendingPosts = filteredPosts.filter((post) => post.sticky);
  const regularPosts = filteredPosts.filter((post) => !post.sticky);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline">Community Feed</h1>
        {appUser ? (
          <PostForm currentUser={appUser as any} />
        ) : (
          <Button asChild>
            <a href="/login">Login to Post</a>
          </Button>
        )}
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
          <p>{query ? `No results for "${query}"` : "Try adjusting your search query."}</p>
        </div>
      )}
    </div>
  );
}
