import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AvatarLink() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-ink/10" />;
  }
  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Join Rewards"
        className="grid size-9 place-items-center rounded-full bg-forest text-cream"
      >
        <UserRound className="size-4" />
      </Link>
    );
  }
  const letter = (user.displayName ?? user.primaryEmail ?? "R").charAt(0).toUpperCase();
  return (
    <Link to="/account" className="block size-9 overflow-hidden rounded-full bg-forest" aria-label="Account">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center text-[13px] font-medium text-cream">
          {letter}
        </span>
      )}
    </Link>
  );
}
