import { Router, type IRouter } from "express";
import { sql, gte } from "drizzle-orm";
import { db, usersTable, decksTable, deckStarsTable, coursesTable, eventsTable } from "@workspace/db";

const router: IRouter = Router();

const today = () => new Date().toISOString().split("T")[0];

router.get("/stats", async (_req, res): Promise<void> => {
  const [[userCountRow], [deckCountRow], [starCountRow], [courseCountRow], [eventCountRow], [upcomingEventCountRow]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(decksTable),
      db.select({ count: sql<number>`count(*)::int` }).from(deckStarsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(coursesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(eventsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(gte(eventsTable.eventDate, today())),
    ]);

  res.json({
    userCount: userCountRow?.count ?? 0,
    deckCount: deckCountRow?.count ?? 0,
    starCount: starCountRow?.count ?? 0,
    courseCount: courseCountRow?.count ?? 0,
    eventCount: eventCountRow?.count ?? 0,
    upcomingEventCount: upcomingEventCountRow?.count ?? 0,
  });
});

export default router;
