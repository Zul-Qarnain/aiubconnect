
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportActionProps {
  contentId: string;
  contentType: "post" | "comment";
  contentOwnerId: string;
  children: React.ReactNode;
}

const reportCategories = [
  { id: "hate-speech", label: "Hate Speech" },
  { id: "religious-extremism", label: "Religious Extremism" },
  { id: "sexual-content", label: "Sexual Content" },
  { id: "bullying-harassment", label: "Bullying or Harassment" },
  { id: "spam", label: "Spam" },
  { id: "misinformation", label: "Misinformation" },
  { id: "other", label: "Other" },
];

export function ReportAction({
  contentId,
  contentType,
  contentOwnerId,
  children,
}: ReportActionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser.id === contentOwnerId) {
      toast({
        variant: "destructive",
        title: "Cannot report your own content",
        description: "You cannot report your own " + contentType + ".",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Please select a category",
      });
      return;
    }
    if (selectedCategory === "other" && !otherReason.trim()) {
      toast({
        variant: "destructive",
        title: "Please provide a reason",
      });
      return;
    }

    try {
      const reportData = {
        contentId,
        contentType,
        contentOwnerId,
        reporterId: currentUser.id,
        category: selectedCategory,
        ...(selectedCategory === "other" && { reason: otherReason }),
      };

      const { createReport } = await import("@/lib/firestore");
      await createReport(reportData);

      toast({
        title: "Content Reported",
        description: `The ${contentType} has been reported for review. Thank you for helping keep our community safe.`,
      });

      setIsDialogOpen(false);
      setSelectedCategory(null);
      setOtherReason("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit report",
      });
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild onClick={handleTriggerClick}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Report {contentType}</AlertDialogTitle>
          <AlertDialogDescription>
            Please select a reason for reporting this content. Your report is anonymous.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <RadioGroup onValueChange={setSelectedCategory} value={selectedCategory || ""}>
            {reportCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={category.id} />
                <Label htmlFor={category.id}>{category.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedCategory === "other" && (
            <Textarea
              placeholder="Please describe the issue."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setIsDialogOpen(false) }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmitReport}>Submit Report</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
