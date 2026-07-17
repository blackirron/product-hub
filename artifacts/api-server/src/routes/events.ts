import { Router, type IRouter } from "express";
import { eq, sql, and, gte, asc } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetUpcomingEventsQueryParams,
  GetEventParams,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const today = () => new Date().toISOString().split("T")[0];

router.get("/events/upcoming", async (req, res): Promise<void> => {
  const parsed = GetUpcomingEventsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
  const events = await db
    .select()
    .from(eventsTable)
    .where(gte(eventsTable.eventDate, today()))
    .orderBy(asc(eventsTable.eventDate))
    .limit(limit);
  res.json(events);
});

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, type, upcoming, limit = 30, offset = 0 } = parsed.data;

  let query = db.select().from(eventsTable).$dynamic();

  const conditions = [];
  if (search) {
    conditions.push(sql`(${eventsTable.title} ilike ${"%" + search + "%"} or ${eventsTable.description} ilike ${"%" + search + "%"} or ${eventsTable.host} ilike ${"%" + search + "%"})`);
  }
  if (type) {
    conditions.push(eq(eventsTable.type, type));
  }
  if (upcoming) {
    conditions.push(gte(eventsTable.eventDate, today()));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const events = await query.limit(limit).offset(offset).orderBy(asc(eventsTable.eventDate));
  res.json(events);
});

const toDateStr = (v: unknown): string | null => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().split("T")[0];
  return String(v);
};

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    type: parsed.data.type,
    host: parsed.data.host ?? null,
    eventDate: toDateStr(parsed.data.eventDate)!,
    endDate: toDateStr(parsed.data.endDate),
    location: parsed.data.location ?? null,
    url: parsed.data.url ?? null,
    registrationDeadline: toDateStr(parsed.data.registrationDeadline),
    prize: parsed.data.prize ?? null,
    tags: parsed.data.tags ?? [],
  }).returning();
  res.status(201).json(event);
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (updateData.eventDate) updateData.eventDate = toDateStr(updateData.eventDate);
  if (updateData.endDate) updateData.endDate = toDateStr(updateData.endDate);
  if (updateData.registrationDeadline) updateData.registrationDeadline = toDateStr(updateData.registrationDeadline);
  const [event] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
