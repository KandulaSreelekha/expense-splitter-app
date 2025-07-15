"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  // --- Begin ParticipantSelector logic ---
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const createGroup = useConvexMutation(api.contacts.createGroup);
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  // Add a member
  const addMember = (user) => {
    if (selectedMembers.some((m) => m.id === user.id) || user.id === currentUser?._id) {
      return;
    }
    setSelectedMembers([...selectedMembers, user]);
    setOpen(false);
    setSearchQuery("");
  };

  // Remove a member
  const removeMember = (userId) => {
    if (userId === currentUser?._id) {
      return;
    }
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };
  // --- End ParticipantSelector logic ---

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Extract member IDs
      const memberIds = selectedMembers.map((member) => member.id);

      // Create the group
      const groupId = await createGroup.mutate({
        name: data.name,
        description: data.description,
        members: memberIds,
      });

      // Success
      toast.success("Group created successfully!");
      reset();
      setSelectedMembers([]);
      onClose();

      // Redirect to the new group page
      if (onSuccess) {
        onSuccess(groupId);
      }
    } catch (error) {
      toast.error("Failed to create group: " + error.message);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter group description"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Current user (always included) */}
              {currentUser && (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src={currentUser.imageUrl} />
                    <AvatarFallback>
                      {(currentUser.email && currentUser.email.charAt(0)) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">You</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                  </span>
                </Badge>
              )}

              {/* Selected members */}
              {selectedMembers.map((member) => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-2"
                >
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback>
                      {(member.username && member.username.charAt(0)) || (member.email && member.email.charAt(0)) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{member.username}</span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {/* Add member button with dropdown */}
              {/* DEBUG: Replace popover with plain input to test typing */}
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by email/username..."
                className="border rounded px-2 py-1 text-sm"
              />
              <div className="mt-2 w-full max-w-md">
                {searchQuery.length >= 2 && (
                  <div className="bg-white border rounded-lg shadow p-2 space-y-1">
                    {isSearching && (
                      <div className="py-2 text-center text-muted-foreground text-sm">Searching...</div>
                    )}
                    {!isSearching && searchResults?.length === 0 && (
                      <div className="py-2 text-center text-muted-foreground text-sm">No users found</div>
                    )}
                    {!isSearching && searchResults?.map(user => (
                      (selectedMembers.some(m => m.id === user.id) || user.id === currentUser?._id) ? null : (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.imageUrl} />
                              <AvatarFallback>
                                {user.username?.charAt(0) || user.email?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{user.username}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs px-3 py-1"
                            onClick={() => addMember(user)}
                          >
                            Add
                          </Button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedMembers.length === 0 && (
              <p className="text-sm text-amber-600">
                Add at least one other person to the group
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedMembers.length === 0}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
