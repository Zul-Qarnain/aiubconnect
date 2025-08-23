
"use client";

import { useState } from "react";
import { getPosts, getCurrentUser } from "@/lib/data";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";
import { Header } from "@/components/header"; // Import Header

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const allPosts = getPosts();
  const currentUser = getCurrentUser();

  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingPosts = filteredPosts.filter((post) => post.sticky);
  const regularPosts = filteredPosts.filter((post) => !post.sticky);

  return (
    <>
      {/* The Header is now rendered here to pass search state */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold font-headline">Community Feed</h1>
          <PostForm currentUser={currentUser} />
        </div>

        {filteredPosts.length > 0 ? (
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
    </>
  );
}
