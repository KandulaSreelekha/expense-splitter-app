"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
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

export function ParticipantSelector({ participants, onParticipantsChange }) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search for users
  useEffect(() => {
    console.log("Current searchQuery:", searchQuery);
  }, [searchQuery]);
  const { data: searchResults, isLoading } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  // Add a participant
  const addParticipant = (user) => {
    // Check if already added
    if (participants.some((p) => p.id === user.id)) {
      return;
    }

    // Add to list
    onParticipantsChange([...participants, user]);
    setOpen(false);
    setSearchQuery("");
  };

  // Remove a participant
  const removeParticipant = (userId) => {
    // Don't allow removing yourself
    if (userId === currentUser._id) {
      return;
    }

    onParticipantsChange(participants.filter((p) => p.id !== userId));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {participants.map((participant) => (
          <Badge
            key={participant.id}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-2"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={participant.imageUrl} />
              <AvatarFallback>
                {(participant.username && participant.username.charAt(0)) || (participant.email && participant.email.charAt(0)) || "?"}
              </AvatarFallback>
            </Avatar>
            <span>
              {participant.id === currentUser?._id
                ? "You"
                : participant.username || participant.email || "Unknown"}
            </span>
            {participant.id !== currentUser?._id && (
              <button
                type="button"
                onClick={() => removeParticipant(participant.id)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {/* Improved add member UI */}
      {participants.length < 2 && (
        <div className="mt-2 w-full max-w-md">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by email or username..."
            className="border rounded px-2 py-1 text-sm w-full"
          />
          {searchQuery.length >= 2 && (
            <div className="bg-white border rounded-lg shadow p-2 space-y-1 mt-1">
              {isLoading && (
                <div className="py-2 text-center text-muted-foreground text-sm">Searching...</div>
              )}
              {!isLoading && searchResults?.length === 0 && (
                <div className="py-2 text-center text-muted-foreground text-sm">No users found</div>
              )}
              {!isLoading && searchResults?.map(user => (
                (participants.some(p => p.id === user.id) || user.id === currentUser?._id) ? null : (
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
                      onClick={() => addParticipant(user)}
                    >
                      Add
                    </Button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
