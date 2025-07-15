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
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const createGroup = useConvexMutation(api.contacts.createGroup);
  // Search for users
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  // Add a member
  const addMember = (user) => {
    // Check if already added
    if (selectedMembers.some((m) => m.id === user.id) || user.id === currentUser?._id) {
      return;
    }
    setSelectedMembers([...selectedMembers, user]);
    setOpen(false);
    setSearchQuery("");
  };

  // Remove a member
  const removeMember = (userId) => {
    // Don't allow removing yourself
    if (userId === currentUser?._id) {
      return;
    }
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

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
              {currentUser && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add member
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        autoFocus
                      />
                      <CommandList>
                        <CommandEmpty>
                          {searchQuery.length < 2 ? (
                            <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                              Type at least 2 characters to search
                            </p>
                          ) : isSearching ? (
                            <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                              Searching...
                            </p>
                          ) : (
                            <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                              No users found
                            </p>
                          )}
                        </CommandEmpty>
                        <CommandGroup heading="Users">
                          {searchResults?.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.username + user.email}
                              onSelect={() => addMember(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.imageUrl} />
                                  <AvatarFallback>
                                    {user.username?.charAt(0) || user.email?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">{user.username}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
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
