import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostById, getCommentsByPostId, getCurrentUser } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { CommentSection } from "@/components/comment-section";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  const currentUser = getCurrentUser();

  if (!post) {
    notFound();
  }

  const comments = getCommentsByPostId(params.id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserAvatar user={post.author} className="w-8 h-8" />
                    <span>Posted by {post.author.name}</span>
                    <span>•</span>
                    <time dateTime={post.createdAt}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </time>
                </div>
                <Badge variant="secondary">{post.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold font-headline mb-4">{post.title}</h1>
            
            {post.imageUrl && (
                <div className="relative w-full aspect-video my-6 rounded-lg overflow-hidden">
                    <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" data-ai-hint="forum image detail" />
                </div>
            )}
            
            <div className="prose prose-lg max-w-none text-foreground/90">
                <p>{post.text}</p>
            </div>

             <div className="flex items-center gap-2 mt-6 border-t pt-4">
                <Button variant="outline" size="sm">
                    <ArrowUp className="h-4 w-4 mr-2"/>
                    {post.reactions.upvotes}
                </Button>
                <Button variant="outline" size="sm">
                    <ArrowDown className="h-4 w-4 mr-2"/>
                    {post.reactions.downvotes}
                </Button>
            </div>
        </div>
      </div>
      <CommentSection comments={comments} postId={post.id} currentUser={currentUser} />
    </div>
  );
}
