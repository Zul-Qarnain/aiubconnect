"use client";

import type { Comment as CommentType, User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserAvatar } from "./user-avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty.").max(2000),
});

interface CommentSectionProps {
  comments: CommentType[];
  postId: string;
  currentUser: User;
}

export function CommentSection({ comments, currentUser }: CommentSectionProps) {
    const { toast } = useToast();
    const hasCommented = comments.some(c => c.authorId === currentUser.id);

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: { text: "" },
    });
    
    function onSubmit(values: z.infer<typeof commentSchema>) {
        console.log(values);
        toast({
            title: "Comment Posted!",
            description: "Your comment has been posted (simulation).",
        });
        form.reset();
    }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold font-headline mb-4">Comments ({comments.length})</h2>
      
      <Card className="mb-6">
        <CardContent className="p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                    <UserAvatar user={currentUser} className="mt-1"/>
                    <div className="flex-1">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea 
                                            placeholder={hasCommented ? "You have already commented on this post." : "Add your comment..."}
                                            {...field}
                                            disabled={hasCommented}
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={hasCommented} className="mt-2">Post Comment</Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {comments.map((comment, index) => (
          <div key={comment.id}>
            <div className="flex items-start gap-4">
              <UserAvatar user={comment.author} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{comment.author.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <time dateTime={comment.createdAt} className="text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </time>
                  {comment.editedAt && <span className="text-muted-foreground text-xs">(edited)</span>}
                </div>
                <p className="mt-1 text-foreground/90">{comment.text}</p>
              </div>
            </div>
            {index < comments.length -1 && <Separator className="mt-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}
