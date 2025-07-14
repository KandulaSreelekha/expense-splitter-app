import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("User identity:", identity); // Debug log
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Try to get email from identity.email or identity.emailAddresses
    let email = identity.email;
    if (!email && Array.isArray(identity.emailAddresses) && identity.emailAddresses.length > 0) {
      email = identity.emailAddresses[0].emailAddress;
    }
    if (!email) {
      throw new Error("User does not have an email address.");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    let username = identity.username || "Anonymous";
    if (user !== null) {
      // Always sync username from Clerk
      await ctx.db.patch(user._id, { username });
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      username,
      tokenIdentifier: identity.tokenIdentifier,
      email: email,
      imageUrl: identity.pictureUrl,
    });
  },
});

// Get current user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

// Search users by username or email (for adding participants)
export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Use centralized getCurrentUser function
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Don't search if query is too short
    if (args.query.length < 2) {
      return [];
    }

    // Search by username using search index
    const usernameResults = (await ctx.db.query("users").collect())
      .filter(user => user.username && user.username.toLowerCase().includes(args.query.toLowerCase()));

    // Search by email using search index
    const emailResults = await ctx.db
      .query("users")
      .withSearchIndex("search_email", (q) => q.search("email", args.query))
      .collect();

    // Combine results (removing duplicates)
    const users = [
      ...usernameResults,
      ...emailResults.filter(
        (email) => !usernameResults.some((user) => user._id === email._id)
      ),
    ];

    // Exclude current user and format results
    return users
      .filter((user) => user._id !== currentUser._id)
      .map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
      }));
  },
});

// TEMPORARY: List all usernames and emails for debugging
export const listUsernames = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({ id: u._id, username: u.username, email: u.email }));
  }
});

export const updateUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    if (!user) {
      throw new Error("User not found");
    }
    console.log("Updating user", user._id, "to username", args.username);
    await ctx.db.patch(user._id, { username: args.username });
    return { success: true };
  },
});
