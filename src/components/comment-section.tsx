
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Comment as CommentType, User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserAvatar } from "./user-avatar";
import { Card, CardContent } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { MoreVertical, Flag, Pencil, Trash2, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import dynamic from "next/dynamic";
import { addComment, updateComment, deleteComment, getUserComment, toggleCommentLike, getUserCommentVote } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ReportAction = dynamic(() => import('@/components/report-action').then(mod => mod.ReportAction), { ssr: false });

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(2000),
});

interface CommentItemProps {
  comment: CommentType;
  currentUser: User | null;
  postId: string;
  onDelete: () => void;
  onEdit: () => void;
}

function CommentItem({ comment, currentUser, postId, onDelete, onEdit }: CommentItemProps) {
  const { toast } = useToast();
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [reactions, setReactions] = useState(comment.reactions || { upvotes: 0, downvotes: 0 });

  useEffect(() => {
    if (currentUser) {
      getUserCommentVote(postId, comment.id, currentUser.id).then((v: any) => setVote(v));
    }
  }, [currentUser, comment.id, postId]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to vote.",
        action: <Button variant="outline" size="sm" asChild><a href="/login">Login</a></Button>
      });
      return;
    }

    // Optimistic update
    const previousVote = vote;
    const previousReactions = { ...reactions };

    let newReactions = { ...reactions };
    if (vote === type) {
      // Remove vote
      setVote(null);
      if (type === 'up') newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
      else newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
    } else {
      // Change/Add vote
      setVote(type);
      if (type === 'up') {
        newReactions.upvotes++;
        if (vote === 'down') newReactions.downvotes = Math.max(0, newReactions.downvotes - 1);
      } else {
        newReactions.downvotes++;
        if (vote === 'up') newReactions.upvotes = Math.max(0, newReactions.upvotes - 1);
      }
    }
    setReactions(newReactions);

    try {
      await toggleCommentLike(postId, comment.id, currentUser.id, type);
    } catch (error) {
      // Revert on error
      setVote(previousVote);
      setReactions(previousReactions);
      toast({ title: "Error", description: "Failed to update vote.", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-start gap-4">
        <Link href={`/profile/${comment.authorId}`}>
          <UserAvatar user={comment.author} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href={`/profile/${comment.authorId}`} className="font-bold hover:underline">
                {comment.author.name}
              </Link>
              <span className="text-muted-foreground">•</span>
              <time dateTime={comment.createdAt} className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </time>
              {comment.editedAt && <span className="text-muted-foreground text-xs">(edited)</span>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentUser?.id === comment.authorId ? (
                  <>
                    <DropdownMenuItem onSelect={onEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <ReportAction contentId={comment.id} contentOwnerId={comment.author.id} contentType="comment">
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report Comment
                    </DropdownMenuItem>
                  </ReportAction>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-1 text-foreground/90">{comment.text}</p>

          {/* Voting Actions */}
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 rounded-full", vote === 'up' && "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-600")}
              onClick={() => handleVote('up')}
            >
              <ArrowBigUp className={cn("h-6 w-6", vote === 'up' && "fill-current")} />
              <span className="ml-1 text-sm font-medium">{reactions.upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 rounded-full", vote === 'down' && "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-600")}
              onClick={() => handleVote('down')}
            >
              <ArrowBigDown className={cn("h-6 w-6", vote === 'down' && "fill-current")} />
              <span className="ml-1 text-sm font-medium">{reactions.downvotes}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  comments: CommentType[]; // Initial comments (could be empty if we fetch client-side)
  postId: string;
}

export function CommentSection({ comments: initialComments, postId }: CommentSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [isEditing, setIsEditing] = useState(false);

  // Map Firebase user to App user shape
  const currentUser = useMemo(() => user ? {
    id: user.uid,
    name: user.displayName || "User",
    email: user.email || "",
    profilePicUrl: user.photoURL || "",
    dailyPostCount: 0,
    monthlyImagePostCount: 0,
    textPostCount: 0,
    createdAt: "", // Not needed for this component
  } as User : null, [user]);

  const userComment = useMemo(() =>
    currentUser ? comments.find(c => c.authorId === currentUser.id) : null
    , [comments, currentUser]);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  });

  // If editing, populate form
  useEffect(() => {
    if (isEditing && userComment) {
      form.setValue("text", userComment.text);
    }
  }, [isEditing, userComment, form]);

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    if (!currentUser) {
      toast({ title: "Login required", description: "Please login to comment." });
      return;
    }

    try {
      if (isEditing && userComment) {
        await updateComment(postId, currentUser.id, values.text);
        setComments(prev => prev.map(c => c.id === userComment.id ? { ...c, text: values.text, editedAt: new Date().toISOString() } : c));
        toast({ title: "Success", description: "Comment updated." });
        setIsEditing(false);
      } else {
        const newComment = await addComment(postId, currentUser, values.text);
        setComments(prev => [newComment as CommentType, ...prev]);
        toast({ title: "Success", description: "Comment added." });
        form.reset();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit comment.", variant: "destructive" });
    }
  }

  const handleDelete = async () => {
    if (!userComment || !currentUser || !confirm("Delete your comment?")) return;
    try {
      await deleteComment(postId, currentUser.id);
      setComments(prev => prev.filter(c => c.id !== userComment.id));
      setIsEditing(false);
      form.reset();
      toast({ title: "Success", description: "Comment deleted." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold font-headline mb-4">Comments ({comments.length})</h2>

      {/* Comment Form - Show if no user comment OR if editing */}
      {/* Comment Form - Show if no user comment OR if editing */}
      {(!userComment || isEditing) && (
        <Card className="mb-6">
          <CardContent className="p-4">
            {currentUser ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                  <UserAvatar user={currentUser} className="mt-1" />
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={isEditing ? "Update your comment..." : "Add your comment..."}
                              {...field}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit">{isEditing ? "Update Comment" : "Post Comment"}</Button>
                      {isEditing && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>}
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <p className="text-muted-foreground">Join the discussion to leave a comment.</p>
                <Button asChild>
                  <a href="/login">Log in to Comment</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {comments.map((comment, index) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUser={currentUser}
              postId={postId}
              onDelete={handleDelete}
              onEdit={() => setIsEditing(true)}
            />
            {index < comments.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}
