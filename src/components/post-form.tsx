"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Image as ImageIcon, FileText, Sparkles, Loader2 } from "lucide-react";

import { suggestPostCategory } from "@/ai/flows/suggest-post-category";
import type { User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().max(300),
  text: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1, "Please select a category."),
});

const categories = ["Academics", "Campus Life", "Events", "Question", "Complaint", "Discussion", "Other"];

interface PostFormProps {
  currentUser: User;
}

export function PostForm({ currentUser }: PostFormProps) {
  const [open, setOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const canPost = currentUser.dailyPostCount < 2;
  const canPostImage = currentUser.monthlyImagePostCount < 2;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", text: "", category: "" },
  });
  
  const textValue = form.watch("text");

  const handleSuggestCategory = async () => {
    const content = form.getValues("text");
    if (!content) {
      toast({
        variant: "destructive",
        title: "No content provided",
        description: "Please write something in your post to get a category suggestion.",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestPostCategory({ text: content });
      if (result.categories && result.categories.length > 0) {
        const suggestedCategory = result.categories[0];
        if (categories.map(c => c.toLowerCase()).includes(suggestedCategory.toLowerCase())) {
          form.setValue("category", categories.find(c => c.toLowerCase() === suggestedCategory.toLowerCase())!);
        } else {
          form.setValue("category", "Other");
        }
        toast({ title: "Category Suggested!", description: `We've selected "${suggestedCategory}" for you.` });
      } else {
        toast({ variant: "destructive", title: "Suggestion failed", description: "Couldn't suggest a category. Please select one manually." });
      }
    } catch (error) {
      console.error("Failed to suggest category:", error);
      toast({ variant: "destructive", title: "An error occurred", description: "Failed to get category suggestions." });
    } finally {
      setIsSuggesting(false);
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Post Created!",
      description: "Your post has been successfully created (simulation).",
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the AIUB community.
            Daily posts remaining: {2 - currentUser.dailyPostCount}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text Post</TabsTrigger>
                <TabsTrigger value="image" disabled={!canPostImage}><ImageIcon className="mr-2 h-4 w-4" />Image Post</TabsTrigger>
              </TabsList>
              <div className="py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="An interesting title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <TabsContent value="text" className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                       <p className="text-xs text-muted-foreground text-right">{textValue?.length || 0} / 5000</p>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="image" className="space-y-4">
                 <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Upload</FormLabel>
                      <FormControl>
                         <Input type="file" disabled />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Image upload is disabled in this demo. Monthly image posts remaining: {2 - currentUser.monthlyImagePostCount}.</p>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex gap-2">
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggesting}>
                    {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Suggest
                  </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={!canPost}>
                Submit Post
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
