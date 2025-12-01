"use client";

import { MoreVertical, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ReportAction } from "@/components/report-action";
import { Post } from "@/lib/types";

interface PostActionsProps {
    post: Post;
}

export function PostActions({ post }: PostActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <ReportAction contentId={post.id} contentOwnerId={post.author.id} contentType="post">
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report Post
                    </DropdownMenuItem>
                </ReportAction>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
