import Link from "next/link";
import { Users, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export function GroupList({ groups }) {
  const router = useRouter();
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const { user } = useUser();
  const currentUserId = user?.id;

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No groups yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a group to start tracking shared expenses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        // Calculate total balance in the group
        const balance = group.balance || 0;
        const hasBalance = balance !== 0;
        // Only show delete if current user is creator
        const isCreator = group.createdBy === currentUserId;

        return (
          <div key={group.id} className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors">
            <Link
              href={`/groups/${group.id}`}
              className="flex items-center gap-3 flex-1"
            >
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.members.length} members
                </p>
              </div>
            </Link>
            {hasBalance && (
              <span
                className={`text-sm font-medium ${
                  balance > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {balance > 0 ? "+" : ""}${balance.toFixed(2)}
              </span>
            )}
            {isCreator && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={async (e) => {
                  e.preventDefault();
                  if (confirm(`Are you sure you want to delete the group '${group.name}'? This will delete all related expenses and settlements.`)) {
                    await deleteGroup({ groupId: group.id });
                    router.refresh && router.refresh();
                  }
                }}
                title="Delete group"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
