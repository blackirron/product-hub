import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, decksTable, usersTable, deckStarsTable } from "@workspace/db";
import {
  ListDecksQueryParams,
  CreateDeckBody,
  GetTrendingDecksQueryParams,
  GetDeckParams,
  UpdateDeckParams,
  UpdateDeckBody,
  DeleteDeckParams,
  StarDeckParams,
  StarDeckBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const deckWithAuthor = {
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
};

router.get("/decks/trending", async (req, res): Promise<void> => {
  const parsed = GetTrendingDecksQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
  const decks = await db
    .select(deckWithAuthor)
    .from(decksTable)
    .leftJoin(usersTable, eq(decksTable.userId, usersTable.id))
    .orderBy(desc(decksTable.stars))
    .limit(limit);
  res.json(decks);
});

router.get("/decks", async (req, res): Promise<void> => {
  const parsed = ListDecksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, tag, sortBy = "newest", limit = 20, offset = 0 } = parsed.data;

  let query = db.select(deckWithAuthor).from(decksTable).leftJoin(usersTable, eq(decksTable.userId, usersTable.id)).$dynamic();

  const conditions = [];
  if (search) {
    conditions.push(sql`(${decksTable.title} ilike ${"%" + search + "%"} or ${decksTable.description} ilike ${"%" + search + "%"})`);
  }
  if (tag) {
    conditions.push(sql`${tag} = ANY(${decksTable.tags})`);
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (sortBy === "stars") {
    query = query.orderBy(desc(decksTable.stars));
  } else if (sortBy === "views") {
    query = query.orderBy(desc(decksTable.views));
  } else {
    query = query.orderBy(desc(decksTable.createdAt));
  }

  const decks = await query.limit(limit).offset(offset);
  res.json(decks);
});

router.post("/decks", async (req, res): Promise<void> => {
  const parsed = CreateDeckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deck] = await db.insert(decksTable).values({
    userId: parsed.data.userId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    fileUrl: parsed.data.fileUrl ?? null,
    tags: parsed.data.tags ?? [],
  }).returning();

  await db.update(usersTable).set({ deckCount: sql`${usersTable.deckCount} + 1` }).where(eq(usersTable.id, parsed.data.userId));

  const [full] = await db.select(deckWithAuthor).from(decksTable).leftJoin(usersTable, eq(decksTable.userId, usersTable.id)).where(eq(decksTable.id, deck.id));
  res.status(201).json(full);
});

router.get("/decks/:id", async (req, res): Promise<void> => {
  const params = GetDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deck] = await db.select(deckWithAuthor).from(decksTable).leftJoin(usersTable, eq(decksTable.userId, usersTable.id)).where(eq(decksTable.id, params.data.id));
  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  // increment views
  await db.update(decksTable).set({ views: sql`${decksTable.views} + 1` }).where(eq(decksTable.id, params.data.id));
  res.json({ ...deck, views: deck.views + 1 });
});

router.patch("/decks/:id", async (req, res): Promise<void> => {
  const params = UpdateDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDeckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.thumbnailUrl !== undefined) updateData.thumbnailUrl = parsed.data.thumbnailUrl;
  if (parsed.data.fileUrl !== undefined) updateData.fileUrl = parsed.data.fileUrl;
  if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;

  await db.update(decksTable).set(updateData).where(eq(decksTable.id, params.data.id));
  const [full] = await db.select(deckWithAuthor).from(decksTable).leftJoin(usersTable, eq(decksTable.userId, usersTable.id)).where(eq(decksTable.id, params.data.id));
  if (!full) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  res.json(full);
});

router.delete("/decks/:id", async (req, res): Promise<void> => {
  const params = DeleteDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deck] = await db.delete(decksTable).where(eq(decksTable.id, params.data.id)).returning();
  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  await db.update(usersTable).set({ deckCount: sql`${usersTable.deckCount} - 1` }).where(eq(usersTable.id, deck.userId));
  res.sendStatus(204);
});

router.post("/decks/:id/star", async (req, res): Promise<void> => {
  const params = StarDeckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = StarDeckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { id: deckId } = params.data;
  const { userId } = parsed.data;

  const [existing] = await db.select().from(deckStarsTable).where(and(eq(deckStarsTable.userId, userId), eq(deckStarsTable.deckId, deckId)));

  if (existing) {
    await db.delete(deckStarsTable).where(and(eq(deckStarsTable.userId, userId), eq(deckStarsTable.deckId, deckId)));
    const [updated] = await db.update(decksTable).set({ stars: sql`${decksTable.stars} - 1` }).where(eq(decksTable.id, deckId)).returning();
    res.json({ starred: false, starCount: updated?.stars ?? 0 });
  } else {
    await db.insert(deckStarsTable).values({ userId, deckId });
    const [updated] = await db.update(decksTable).set({ stars: sql`${decksTable.stars} + 1` }).where(eq(decksTable.id, deckId)).returning();
    res.json({ starred: true, starCount: updated?.stars ?? 0 });
  }
});

export default router;
