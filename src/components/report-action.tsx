
"use client";

import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/data";

interface ReportActionProps {
  contentId: string;
  contentType: "post" | "comment";
  contentOwnerId: string;
  children: React.ReactNode;
}

export function ReportAction({
  contentId,
  contentType,
  contentOwnerId,
  children,
}: ReportActionProps) {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (currentUser.id === contentOwnerId) {
      toast({
        variant: "destructive",
        title: "Cannot report your own content",
        description: "You cannot report your own " + contentType + ".",
      });
      return;
    }
    
    console.log(`Reported ${contentType} with ID: ${contentId}`);
    toast({
      title: "Content Reported",
      description: `The ${contentType} has been reported for review.`,
    });
  };

  return <div onClick={handleReport}>{children}</div>;
}
