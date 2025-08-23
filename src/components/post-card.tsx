
"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  TrendingUp,
  MoreVertical,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ReportAction } from "./report-action";

interface PostCardProps {
  post: Post;
  isTrending?: boolean;
  className?: string;
}

export function PostCard({ post, isTrending = false, className }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.reactions.upvotes);
  const [downvotes, setDownvotes] = useState(post.reactions.downvotes);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (vote === 'up') {
      setUpvotes(upvotes - 1);
      setVote(null);
    } else {
      setUpvotes(upvotes + 1);
      if (vote === 'down') setDownvotes(downvotes - 1);
      setVote('up');
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (vote === 'down') {
      setDownvotes(downvotes - 1);
      setVote(null);
    } else {
      setDownvotes(downvotes + 1);
      if (vote === 'up') setUpvotes(upvotes - 1);
      setVote('down');
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
                        <UserAvatar user={post.author} className="w-6 h-6" />
                        <span className="font-medium text-foreground">{post.author.name}</span>
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
                                <ReportAction contentId={post.id} contentOwnerId={post.author.id} contentType="post">
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Flag className="mr-2 h-4 w-4"/>
                                        Report Post
                                    </DropdownMenuItem>
                                </ReportAction>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
          <Link href={`/post/${post.id}`} className="block p-4 pt-2">
            <CardContent className="p-0">
              <h2 className="text-xl font-bold font-headline mb-2">{post.title}</h2>
              {post.imageUrl && (
                <div className="relative w-full aspect-video my-4 rounded-md overflow-hidden">
                    <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" data-ai-hint="forum image" />
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
