import type { User, Post, Comment } from "./types";

const users: User[] = [
  {
    id: "user-1",
    name: "Aarav Sharma",
    email: "aarav@student.aiub.edu",
    profilePicUrl: "https://placehold.co/100x100.png",
    createdAt: "2023-01-15T09:30:00Z",
    dailyPostCount: 1,
    monthlyImagePostCount: 1,
    textPostCount: 5,
  },
  {
    id: "user-2",
    name: "Priya Patel",
    email: "priya@student.aiub.edu",
    profilePicUrl: "https://placehold.co/100x100.png",
    createdAt: "2023-02-20T14:00:00Z",
    dailyPostCount: 0,
    monthlyImagePostCount: 2,
    textPostCount: 8,
  },
  {
    id: "user-3",
    name: "Rohan Das",
    email: "rohan@student.aiub.edu",
    profilePicUrl: "https://placehold.co/100x100.png",
    createdAt: "2023-03-10T11:45:00Z",
    dailyPostCount: 2,
    monthlyImagePostCount: 0,
    textPostCount: 10,
  },
];

const posts: Post[] = [
  {
    id: "post-1",
    authorId: "user-1",
    title: "Thoughts on the new curriculum for ECE?",
    text: "I was looking at the updated curriculum for the Electrical and Computer Engineering department. Some interesting new courses have been added. What does everyone think about the changes? Are they for the better?",
    category: "Academics",
    createdAt: "2024-07-20T10:00:00Z",
    reactions: { upvotes: 125, downvotes: 3 },
    commentsCount: 3,
    sticky: true,
    author: users[0],
  },
  {
    id: "post-2",
    authorId: "user-2",
    title: "Campus Cafe - New Menu Items!",
    imageUrl: "https://placehold.co/600x400.png",
    text: "Heads up, foodies! The campus cafe just rolled out some new items. I tried the spicy chicken sandwich and it was amazing. Definitely recommend checking it out during your break.",
    category: "Campus Life",
    createdAt: "2024-07-19T15:30:00Z",
    reactions: { upvotes: 88, downvotes: 5 },
    commentsCount: 2,
    sticky: false,
    author: users[1],
  },
  {
    id: "post-3",
    authorId: "user-1",
    title: "Complaint: Wi-Fi connectivity issues in Annex 3",
    text: "Is anyone else experiencing frequent Wi-Fi disconnects in Annex 3, especially on the 4th floor? It's been happening for the past week and is making it impossible to attend online classes or study.",
    category: "Complaint",
    createdAt: "2024-07-18T09:00:00Z",
    reactions: { upvotes: 42, downvotes: 1 },
    commentsCount: 1,
    sticky: false,
    author: users[0],
  },
  {
    id: "post-4",
    authorId: "user-3",
    title: "Question about library book return policy",
    text: "I have a book that's due tomorrow, but I won't be on campus. Can a friend return it for me, or do I have to be present? Also, what's the late fee if I miss the deadline?",
    category: "Question",
    createdAt: "2024-07-21T11:00:00Z",
    reactions: { upvotes: 15, downvotes: 0 },
    commentsCount: 0,
    sticky: false,
    author: users[2],
  },
];

const comments: Comment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    authorId: "user-2",
    text: "I think the new AI and Machine Learning courses are a great addition. It makes the degree much more relevant to the current industry demands.",
    createdAt: "2024-07-20T10:30:00Z",
    author: users[1],
  },
  {
    id: "comment-2",
    postId: "post-1",
    authorId: "user-3",
    text: "Totally agree! I was a bit concerned about the removal of one of the older elective courses, but the new ones more than make up for it.",
    createdAt: "2024-07-20T11:00:00Z",
    author: users[2],
  },
    {
    id: "comment-3",
    postId: "post-1",
    authorId: "user-1",
    text: "Good points. I'm excited to see how these courses are taught.",
    createdAt: "2024-07-20T11:15:00Z",
    author: users[0],
  },
  {
    id: "comment-4",
    postId: "post-2",
    authorId: "user-1",
    text: "Oh, I have to try that! Thanks for the heads-up.",
    createdAt: "2024-07-19T16:00:00Z",
    author: users[0],
  },
    {
    id: "comment-5",
    postId: "post-2",
    authorId: "user-3",
    text: "The vegetarian wrap is also surprisingly good!",
    createdAt: "2024-07-19T17:00:00Z",
    author: users[2],
  },
  {
    id: "comment-6",
    postId: "post-3",
    authorId: "user-2",
    text: "Yes! It's been terrible. I've reported it to the IT department, but haven't heard back yet. Everyone facing this should send an email to IT so they know it's a widespread problem.",
    createdAt: "2024-07-18T09:45:00Z",
    author: users[1],
  },
];

export const getCurrentUser = (): User => users[0];
export const getUsers = (): User[] => users;
export const getPosts = (): Post[] => posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
export const getPostsByUser = (userId: string): Post[] => posts.filter(p => p.authorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
export const getPostById = (id: string): Post | undefined => posts.find(p => p.id === id);
export const getCommentsByPostId = (postId: string): Comment[] => comments.filter(c => c.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
export const getCommentsByUser = (userId: string): Comment[] => comments.filter(c => c.authorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
