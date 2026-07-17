import { Router, type IRouter } from "express";
import { eq, ilike, sql, and, ne } from "drizzle-orm";
import { db, usersTable, decksTable, deckStarsTable, userFollowsTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  GetUserDecksParams,
  GetUserStarredParams,
  FollowUserParams,
  FollowUserBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(usersTable).$dynamic();
  if (search) {
    query = query.where(
      sql`(${usersTable.name} ilike ${"%" + search + "%"} or ${usersTable.username} ilike ${"%" + search + "%"} or ${usersTable.company} ilike ${"%" + search + "%"})`
    );
  }
  const users = await query.limit(limit).offset(offset).orderBy(usersTable.followers);
  res.json(users);
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  res.status(201).json(user);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.get("/users/:id/decks", async (req, res): Promise<void> => {
  const params = GetUserDecksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const decks = await db
    .select({
      id: decksTable.id,
      userId: decksTable.userId,
      authorName: usersTable.name,
      authorUsername: usersTable.username,
      authorAvatarUrl: usersTable.avatarUrl,
      title: decksTable.title,
      description: decksTable.description,
      thumbnailUrl: decksTable.thumbnailUrl,
      fileUrl: decksTable.fileUrl,
      tags: decksTable.tags,
      stars: decksTable.stars,
      views: decksTable.views,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
    })
    .from(decksTable)
    .leftJoin(usersTable, eq(decksTable.userId, usersTable.id))
    .where(eq(decksTable.userId, params.data.id))
    .orderBy(decksTable.createdAt);
  res.json(decks);
});

router.get("/users/:id/starred", async (req, res): Promise<void> => {
  const params = GetUserStarredParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const starredDecks = await db
    .select({
      id: decksTable.id,
      userId: decksTable.userId,
      authorName: usersTable.name,
      authorUsername: usersTable.username,
      authorAvatarUrl: usersTable.avatarUrl,
      title: decksTable.title,
      description: decksTable.description,
      thumbnailUrl: decksTable.thumbnailUrl,
      fileUrl: decksTable.fileUrl,
      tags: decksTable.tags,
      stars: decksTable.stars,
      views: decksTable.views,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
    })
    .from(deckStarsTable)
    .innerJoin(decksTable, eq(deckStarsTable.deckId, decksTable.id))
    .leftJoin(usersTable, eq(decksTable.userId, usersTable.id))
    .where(eq(deckStarsTable.userId, params.data.id))
    .orderBy(deckStarsTable.createdAt);
  res.json(starredDecks);
});

router.post("/users/:id/follow", async (req, res): Promise<void> => {
  const params = FollowUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = FollowUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const followingId = params.data.id;
  const followerId = parsed.data.followerId;

  if (followerId === followingId) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }

  const [existing] = await db
    .select()
    .from(userFollowsTable)
    .where(and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId)));

  if (existing) {
    // Unfollow
    await db
      .delete(userFollowsTable)
      .where(and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId)));
    await db.update(usersTable).set({ followers: sql`${usersTable.followers} - 1` }).where(eq(usersTable.id, followingId));
    await db.update(usersTable).set({ following: sql`${usersTable.following} - 1` }).where(eq(usersTable.id, followerId));
    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, followingId));
    res.json({ following: false, followerCount: updated?.followers ?? 0 });
  } else {
    // Follow
    await db.insert(userFollowsTable).values({ followerId, followingId });
    await db.update(usersTable).set({ followers: sql`${usersTable.followers} + 1` }).where(eq(usersTable.id, followingId));
    await db.update(usersTable).set({ following: sql`${usersTable.following} + 1` }).where(eq(usersTable.id, followerId));
    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, followingId));
    res.json({ following: true, followerCount: updated?.followers ?? 0 });
  }
});

export default router;
