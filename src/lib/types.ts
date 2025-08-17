export type User = {
  id: string;
  name: string;
  email: string;
  profilePicUrl: string;
  createdAt: string;
  dailyPostCount: number;
  monthlyImagePostCount: number;
  textPostCount: number;
};

export type Post = {
  id: string;
  authorId: string;
  author: User;
  title: string;
  text?: string;
  imageUrl?: string;
  category: string;
  createdAt: string;
  reactions: {
    upvotes: number;
    downvotes: number;
  };
  commentsCount: number;
  sticky: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  text: string;
  createdAt: string;
  editedAt?: string;
};
