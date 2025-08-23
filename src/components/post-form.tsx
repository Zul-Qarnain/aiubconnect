
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Image as ImageIcon, FileText } from "lucide-react";

import type { User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  title: z.string().min(1, "Title is required.").max(300),
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
  const isMobile = useIsMobile();

  const canPost = currentUser.dailyPostCount < 2;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", text: "", category: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // TODO: Actually create post
    setOpen(false);
    form.reset();
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Create a new post</DrawerTitle>
            <DrawerDescription>
                Share your thoughts with the AIUB community. Daily posts remaining: {2 - currentUser.dailyPostCount}.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="overflow-y-auto">
            <PostFormContent form={form} onSubmit={onSubmit} currentUser={currentUser} className="px-4" />
          </ScrollArea>
          <DrawerFooter className="pt-2">
            <Button onClick={form.handleSubmit(onSubmit)} disabled={!canPost}>Submit Post</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
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
        <PostFormContent form={form} onSubmit={onSubmit} currentUser={currentUser} />
         <DialogFooter>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={!canPost}>
                Submit Post
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface PostFormContentProps {
    form: any;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    currentUser: User;
    className?: string;
}

function PostFormContent({ form, onSubmit, currentUser, className }: PostFormContentProps) {
    const canPostImage = currentUser.monthlyImagePostCount < 2;
    const textValue = form.watch("text");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text Post</TabsTrigger>
                <TabsTrigger value="image" disabled={!canPostImage}><ImageIcon className="mr-2 h-4 w-4" />Image Post</TabsTrigger>
              </TabsList>
              <div className="py-4 space-y-4">
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
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue="">
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
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add some context to your image..."
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                       <p className="text-xs text-muted-foreground text-right">{field.value?.length || 0} / 5000</p>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            </form>
        </Form>
    )
}
