"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getReports, deleteReport, getPosts, deletePost, banUser, unbanUser, getPostsByUser, getCommentsByUser, deleteComment } from "@/lib/firestore";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2, Ban, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [suspendedPosts, setSuspendedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // User Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchedUser, setSearchedUser] = useState<any>(null);
    const [searchingUser, setSearchingUser] = useState(false);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [userComments, setUserComments] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const fetchedReports = await getReports();
            setReports(fetchedReports);

            // Fetch all posts and filter for suspended ones (since we don't have a direct query for it in getPosts yet without admin flag)
            // Actually, let's use the admin flag in getPosts
            const allPosts = await getPosts(true);
            setSuspendedPosts(allPosts.filter((p: any) => p.isSuspended));
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: string, reportId?: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(postId);
            if (reportId) {
                await deleteReport(reportId);
                setReports(prev => prev.filter(r => r.id !== reportId));
            }
            setSuspendedPosts(prev => prev.filter(p => p.id !== postId));
            toast({ title: "Success", description: "Post deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        }
    };

    const handleDismissReport = async (reportId: string) => {
        try {
            await deleteReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
            toast({ title: "Success", description: "Report dismissed." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to dismiss report.", variant: "destructive" });
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await deleteComment(postId, commentId);
            setUserComments(prev => prev.filter(c => c.id !== commentId));
            toast({ title: "Success", description: "Comment deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
        }
    };

    const handleSearchUser = async () => {
        if (!searchQuery.trim()) return;
        setSearchingUser(true);
        setSearchedUser(null);
        try {
            const usersRef = collection(db, "users");
            const term = searchQuery.trim();

            // Run multiple queries in parallel to find a match
            const queries = [
                query(usersRef, where("email", "==", term)),
                query(usersRef, where("email", "==", term.toLowerCase())),
                query(usersRef, where("aiubEmail", "==", term)),
                query(usersRef, where("aiubEmail", "==", term.toLowerCase()))
            ];

            const snapshots = await Promise.all(queries.map(q => getDocs(q)));

            // Find the first non-empty snapshot
            const foundSnapshot = snapshots.find(s => !s.empty);

            if (foundSnapshot) {
                const userData = { id: foundSnapshot.docs[0].id, ...foundSnapshot.docs[0].data() };
                setSearchedUser(userData);

                // Fetch user's posts and comments
                const [posts, comments] = await Promise.all([
                    getPostsByUser(userData.id),
                    getCommentsByUser(userData.id)
                ]);
                setUserPosts(posts);
                setUserComments(comments);
            } else {
                toast({ title: "Not Found", description: "No user found with that email." });
            }
        } catch (error) {
            console.error("Search error", error);
            toast({ title: "Error", description: "Failed to search user.", variant: "destructive" });
        } finally {
            setSearchingUser(false);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!confirm("Are you sure you want to ban this user?")) return;
        try {
            await banUser(userId);
            setSearchedUser((prev: any) => ({ ...prev, isBanned: true }));
            toast({ title: "Success", description: "User banned." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to ban user.", variant: "destructive" });
        }
    };

    const handleUnbanUser = async (userId: string) => {
        try {
            await unbanUser(userId);
            setSearchedUser((prev: any) => ({ ...prev, isBanned: false }));
            toast({ title: "Success", description: "User unbanned." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to unban user.", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
                <TabsTrigger value="suspended">Suspended Posts ({suspendedPosts.length})</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4 mt-4">
                {reports.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No active reports.</p>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between">
                                    <span>Reported {report.contentType}</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    Reason: <span className="font-medium text-foreground">{report.category}</span>
                                    {report.reason && <span className="block text-sm mt-1">&quot;{report.reason}&quot;</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/post/${report.contentId}`} target="_blank">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Content
                                    </Link>
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => handleDismissReport(report.id)}>
                                    Dismiss
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePost(report.contentId, report.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Content
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>

            <TabsContent value="suspended" className="space-y-4 mt-4">
                {suspendedPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No suspended posts.</p>
                ) : (
                    suspendedPosts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{post.title}</CardTitle>
                                <CardDescription>
                                    Report Count: {post.reportCount}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/post/${post.id}`} target="_blank">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Post
                                    </Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4 mt-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by email (e.g. id@student.aiub.edu)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                    />
                    <Button onClick={handleSearchUser} disabled={searchingUser}>
                        {searchingUser ? <Loader2 className="animate-spin h-4 w-4" /> : "Search"}
                    </Button>
                </div>

                {searchedUser && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {searchedUser.name}
                                    {searchedUser.isBanned && <span className="text-destructive text-sm border border-destructive px-2 py-0.5 rounded">BANNED</span>}
                                </CardTitle>
                                <CardDescription>
                                    {searchedUser.email}
                                    {searchedUser.aiubEmail && <span className="block text-xs text-muted-foreground">AIUB: {searchedUser.aiubEmail}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    {searchedUser.isBanned ? (
                                        <Button variant="outline" onClick={() => handleUnbanUser(searchedUser.id)}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Unban User
                                        </Button>
                                    ) : (
                                        <Button variant="destructive" onClick={() => handleBanUser(searchedUser.id)}>
                                            <Ban className="mr-2 h-4 w-4" /> Ban User
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Posts ({userPosts.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                                    {userPosts.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No posts found.</p>
                                    ) : (
                                        userPosts.map((post) => (
                                            <div key={post.id} className="border rounded p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{post.text}</p>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                                                        <Link href={`/post/${post.id}`} target="_blank">View</Link>
                                                    </Button>
                                                    <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDeletePost(post.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>User Comments ({userComments.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                                    {userComments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No comments found.</p>
                                    ) : (
                                        userComments.map((comment) => (
                                            <div key={comment.id} className="border rounded p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm line-clamp-2">{comment.text}</p>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Unknown date'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                                                        <Link href={`/post/${comment.postId}`} target="_blank">View Post</Link>
                                                    </Button>
                                                    <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDeleteComment(comment.postId, comment.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
