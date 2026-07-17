import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, coursesTable } from "@workspace/db";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  GetCourseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const parsed = ListCoursesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, level, tag, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(coursesTable).$dynamic();

  const conditions = [];
  if (search) {
    conditions.push(sql`(${coursesTable.title} ilike ${"%" + search + "%"} or ${coursesTable.description} ilike ${"%" + search + "%"} or ${coursesTable.provider} ilike ${"%" + search + "%"})`);
  }
  if (level) {
    conditions.push(eq(coursesTable.level, level));
  }
  if (tag) {
    conditions.push(sql`${tag} = ANY(${coursesTable.tags})`);
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const courses = await query.limit(limit).offset(offset).orderBy(coursesTable.createdAt);
  res.json(courses);
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [course] = await db.insert(coursesTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    instructor: parsed.data.instructor ?? null,
    provider: parsed.data.provider,
    url: parsed.data.url ?? null,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    duration: parsed.data.duration ?? null,
    level: parsed.data.level,
    tags: parsed.data.tags ?? [],
    isFree: parsed.data.isFree ?? false,
  }).returning();
  res.status(201).json(course);
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(course);
});

export default router;
