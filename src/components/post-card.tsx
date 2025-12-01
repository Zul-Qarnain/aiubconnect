
"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { deletePost } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { EditPostDialog } from "@/components/edit-post-dialog";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  TrendingUp,
  MoreVertical,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import dynamic from "next/dynamic";

import { deleteImage } from "@/app/actions/cloudinary";

const ReportAction = dynamic(() => import('@/components/report-action').then(mod => mod.ReportAction), { ssr: false });

interface PostCardProps {
  post: Post;
  isTrending?: boolean;
  className?: string;
}

export function PostCard({ post, isTrending = false, className }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(post.reactions.upvotes);
  const [downvotes, setDownvotes] = useState(post.reactions.downvotes);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isAuthor = user?.uid === post.authorId;

  // Fetch user's vote on mount
  useEffect(() => {
    if (user) {
      import("@/lib/firestore").then(({ getUserVote }) => {
        getUserVote(post.id, user.uid).then((v: any) => setVote(v));
      });
    }
  }, [user, post.id]);

  const handleDelete = async (e: Event) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        if (post.imageUrl) {
          // Extract public_id from Cloudinary URL
          const publicIdMatch = post.imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
          if (publicIdMatch && publicIdMatch[1]) {
            await deleteImage(publicIdMatch[1]);
          }
        }

        await deletePost(post.id);
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
        window.location.reload();
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast({ title: "Login required", description: "Please login to vote." });
      return;
    }

    // Optimistic update
    const previousVote = vote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    if (vote === 'up') {
      setUpvotes(upvotes - 1);
      setVote(null);
    } else {
      setUpvotes(upvotes + 1);
      if (vote === 'down') setDownvotes(downvotes - 1);
      setVote('up');
    }

    try {
      const { togglePostLike } = await import("@/lib/firestore");
      await togglePostLike(post.id, user.uid, 'up');
    } catch (error) {
      // Revert on error
      setVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      toast({ title: "Error", description: "Failed to update vote", variant: "destructive" });
    }
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast({ title: "Login required", description: "Please login to vote." });
      return;
    }

    // Optimistic update
    const previousVote = vote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    if (vote === 'down') {
      setDownvotes(downvotes - 1);
      setVote(null);
    } else {
      setDownvotes(downvotes + 1);
      if (vote === 'up') setUpvotes(upvotes - 1);
      setVote('down');
    }

    try {
      const { togglePostLike } = await import("@/lib/firestore");
      await togglePostLike(post.id, user.uid, 'down');
    } catch (error) {
      // Revert on error
      setVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      toast({ title: "Error", description: "Failed to update vote", variant: "destructive" });
    }
  };

  return (
    <Card className={cn("overflow-hidden hover:border-primary/50 transition-colors duration-300", className)}>
      <div className="flex">
        <div className="hidden sm:flex flex-col items-center p-2 bg-muted/50">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUpvote}>
            <ArrowUp className={cn("h-5 w-5", vote === "up" && "text-primary fill-primary")} />
          </Button>
          <span className="text-sm font-bold">{upvotes - downvotes}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownvote}>
            <ArrowDown className={cn("h-5 w-5", vote === "down" && "text-accent fill-accent")} />
          </Button>
        </div>
        <div className="flex-1">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 hover:underline">
                  <UserAvatar user={post.author} className="w-6 h-6" />
                  <span className="font-medium text-foreground">{post.author.name}</span>
                </Link>
                <span className="hidden sm:inline-block">•</span>
                <time dateTime={post.createdAt} className="text-xs">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2">
                  {isTrending && (
                    <Badge variant="destructive" className="bg-primary hover:bg-primary/90 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {isAuthor && (
                      <>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditOpen(true); }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Post
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <ReportAction contentId={post.id} contentOwnerId={post.author.id} contentType="post">
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report Post
                      </DropdownMenuItem>
                    </ReportAction>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <EditPostDialog post={post} open={isEditOpen} onOpenChange={setIsEditOpen} />
          <Link href={`/post/${post.id}`} className="block p-4 pt-2">
            <CardContent className="p-0">
              <h2 className="text-xl font-bold font-headline mb-2">{post.title}</h2>
              {post.imageUrl && (
                <div className="relative w-full aspect-video my-4 rounded-md overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={isTrending} // Prioritize trending posts images
                  />
                </div>
              )}
              <p className="text-foreground/80 line-clamp-3 text-sm">{post.text}</p>
            </CardContent>
          </Link>
          <CardFooter className="p-4 pt-0 sm:pt-2 flex items-center justify-between sm:justify-start">
            <div className="flex sm:hidden items-center gap-2 bg-muted/50 p-1 rounded-full">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUpvote}>
                <ArrowUp className={cn("h-4 w-4", vote === "up" && "text-primary fill-primary")} />
              </Button>
              <span className="text-xs font-bold px-1">{upvotes - downvotes}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownvote}>
                <ArrowDown className={cn("h-4 w-4", vote === "down" && "text-accent fill-accent")} />
              </Button>
            </div>
            <Button variant="ghost" asChild className="text-xs sm:text-sm">
              <Link href={`/post/${post.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {post.commentsCount} Comments
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
