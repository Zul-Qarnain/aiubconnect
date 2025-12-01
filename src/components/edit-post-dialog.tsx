"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Image as ImageIcon, FileText } from "lucide-react";
import type { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import { updatePost } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    title: z.string().min(1, "Title is required.").max(300),
    text: z.string().max(5000).optional(),
    imageUrl: z.string().url().optional(),
    category: z.string().min(1, "Please select a category."),
});

const categories = ["Academics", "Campus Life", "Events", "Question", "Complaint", "Discussion", "Other"];

interface EditPostDialogProps {
    post: Post;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(post.imageUrl || null);
    const [activeTab, setActiveTab] = useState(post.imageUrl ? "image" : "text");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: post.title,
            text: post.text || "",
            imageUrl: post.imageUrl,
            category: post.category,
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const url = await uploadToCloudinary(file);
                form.setValue("imageUrl", url);
                setPreviewUrl(url);
            } catch (error) {
                console.error("Upload failed", error);
                toast({
                    title: "Error",
                    description: "Failed to upload image",
                    variant: "destructive",
                });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleRemoveImage = () => {
        form.setValue("imageUrl", "");
        setPreviewUrl(null);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === "text") {
            // If switching to text tab, effectively remove the image for the submission
            // We don't clear previewUrl immediately in case they switch back, 
            // but we should ensure the form submits without an image if they stay on text tab.
            // However, to be explicit, let's just clear it if they save from this tab.
            // Or better, let's just use the form state.
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // If active tab is text, ensure imageUrl is cleared
            const finalValues = {
                ...values,
                imageUrl: activeTab === "text" ? "" : values.imageUrl,
            };

            await updatePost(post.id, finalValues);
            toast({
                title: "Success",
                description: "Post updated successfully",
            });
            onOpenChange(false);
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update post",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription>
                        Make changes to your post here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text Post</TabsTrigger>
                                <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Image Post</TabsTrigger>
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
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    {previewUrl ? (
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={previewUrl}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute right-2 top-2"
                                                                onClick={handleRemoveImage}
                                                            >
                                                                Remove Image
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                                    )}
                                                </div>
                                            </FormControl>
                                            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                                            <FormMessage />
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
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>
                        <DialogFooter>
                            <Button type="submit" disabled={uploading}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
