import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = (user.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={user.profilePicUrl} alt={user.name} data-ai-hint="profile picture" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
