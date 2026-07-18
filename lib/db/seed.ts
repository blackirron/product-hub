import { eq, sql } from "drizzle-orm";
import { db } from "./src/index";
import {
  usersTable,
  decksTable,
  deckStarsTable,
  userFollowsTable,
  coursesTable,
  eventsTable,
} from "./src/schema";

async function seed() {
  console.log("Seeding users...");
  const users = await db
    .insert(usersTable)
    .values([
      {
        username: "alex_pm",
        name: "Alex Rivera",
        bio: "Senior PM focused on growth and lifecycle. Ex-fintech.",
        title: "Senior Product Manager",
        company: "Northwind",
        avatarUrl: null,
      },
      {
        username: "priya_builds",
        name: "Priya Nair",
        bio: "PM turned founder. Writes about 0-to-1 product.",
        title: "Founder",
        company: "Loopstack",
        avatarUrl: null,
      },
      {
        username: "sam_product",
        name: "Sam Okafor",
        bio: "APM mentor. Loves teardown decks and roadmap reviews.",
        title: "Group PM",
        company: "Verto",
        avatarUrl: null,
      },
      {
        username: "mira_designs",
        name: "Mira Chen",
        bio: "Product + design hybrid. Occasional conference speaker.",
        title: "Principal PM",
        company: "Fieldnote",
        avatarUrl: null,
      },
    ])
    .returning();

  console.log(`  ${users.length} users created`);

  console.log("Seeding decks...");
  const decks = await db
    .insert(decksTable)
    .values([
      {
        userId: users[0].id,
        title: "Growth Loops Teardown: 5 Consumer Apps",
        description:
          "A breakdown of how five top consumer apps engineer their growth loops, with annotated screenshots.",
        thumbnailUrl: null,
        fileUrl: null,
        tags: ["growth", "teardown", "consumer"],
      },
      {
        userId: users[1].id,
        title: "0-to-1: Finding Product-Market Fit in 90 Days",
        description:
          "The exact framework I used to validate and ship a B2B SaaS MVP in three months.",
        thumbnailUrl: null,
        fileUrl: null,
        tags: ["pmf", "0to1", "saas"],
      },
      {
        userId: users[2].id,
        title: "Roadmap Prioritization: RICE vs ICE vs Kano",
        description:
          "Side-by-side comparison of three prioritization frameworks with real scoring examples.",
        thumbnailUrl: null,
        fileUrl: null,
        tags: ["strategy", "prioritization", "roadmap"],
      },
      {
        userId: users[3].id,
        title: "Designing for Trust: Onboarding Patterns That Convert",
        description:
          "Onboarding flow teardown across fintech and healthtech, focused on trust signals.",
        thumbnailUrl: null,
        fileUrl: null,
        tags: ["design", "onboarding", "conversion"],
      },
      {
        userId: users[0].id,
        title: "Metrics That Matter: A PM's Guide to North Star Metrics",
        description:
          "How to pick, validate, and defend a North Star metric to leadership.",
        thumbnailUrl: null,
        fileUrl: null,
        tags: ["metrics", "strategy"],
      },
    ])
    .returning();

  console.log(`  ${decks.length} decks created`);

  console.log("Seeding deck stars...");
  await db.insert(deckStarsTable).values([
    { userId: users[1].id, deckId: decks[0].id },
    { userId: users[2].id, deckId: decks[0].id },
    { userId: users[3].id, deckId: decks[0].id },
    { userId: users[0].id, deckId: decks[1].id },
    { userId: users[2].id, deckId: decks[1].id },
    { userId: users[0].id, deckId: decks[2].id },
    { userId: users[1].id, deckId: decks[3].id },
  ]);

  const starCounts: Record<number, number> = {
    [decks[0].id]: 3,
    [decks[1].id]: 2,
    [decks[2].id]: 1,
    [decks[3].id]: 1,
  };
  for (const [deckId, count] of Object.entries(starCounts)) {
    await db
      .update(decksTable)
      .set({ stars: count })
      .where(eq(decksTable.id, Number(deckId)));
  }

  console.log("Seeding user follows...");
  await db.insert(userFollowsTable).values([
    { followerId: users[0].id, followingId: users[1].id },
    { followerId: users[0].id, followingId: users[2].id },
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[3].id },
    { followerId: users[3].id, followingId: users[0].id },
  ]);

  console.log("Seeding courses...");
  await db.insert(coursesTable).values([
    {
      title: "Product Management Fundamentals",
      description:
        "Covers discovery, prioritization, roadmapping, and stakeholder management from the ground up.",
      instructor: "Dana Whitfield",
      provider: "Reforge",
      url: "https://example.com/course/pm-fundamentals",
      thumbnailUrl: null,
      duration: "6 weeks",
      level: "beginner",
      tags: ["fundamentals", "discovery"],
      isFree: false,
    },
    {
      title: "Advanced Growth Strategy for PMs",
      description:
        "Deep dive into growth loops, activation, and retention modeling for experienced PMs.",
      instructor: "Marcus Lee",
      provider: "Product School",
      url: "https://example.com/course/advanced-growth",
      thumbnailUrl: null,
      duration: "4 weeks",
      level: "advanced",
      tags: ["growth", "retention"],
      isFree: false,
    },
    {
      title: "Intro to Product Analytics",
      description:
        "Free crash course on setting up and reading product analytics dashboards.",
      instructor: "Team",
      provider: "Amplitude Academy",
      url: "https://example.com/course/intro-analytics",
      thumbnailUrl: null,
      duration: "2 hours",
      level: "beginner",
      tags: ["analytics", "metrics"],
      isFree: true,
    },
  ]);

  console.log("Seeding events...");
  await db.insert(eventsTable).values([
    {
      title: "PM Network Meetup: Growth Edition",
      description:
        "Monthly meetup focused on growth case studies, with lightning talks from members.",
      type: "meetup",
      host: "PM Network",
      eventDate: "2026-08-15",
      endDate: null,
      location: "San Francisco, CA",
      url: "https://example.com/events/growth-meetup",
      registrationDeadline: "2026-08-10",
      prize: null,
      tags: ["growth", "networking"],
    },
    {
      title: "Product Teardown Hackathon",
      description:
        "Team up to teardown and re-pitch an existing product in 48 hours.",
      type: "hackathon",
      host: "Verto",
      eventDate: "2026-09-05",
      endDate: "2026-09-07",
      location: "Remote",
      url: "https://example.com/events/teardown-hackathon",
      registrationDeadline: "2026-08-30",
      prize: "$2,000 + mentorship",
      tags: ["hackathon", "teardown"],
    },
    {
      title: "Webinar: Writing PRDs That Get Buy-In",
      description:
        "Live session on structuring PRDs that align engineering and leadership fast.",
      type: "webinar",
      host: "Loopstack",
      eventDate: "2026-07-28",
      endDate: null,
      location: "Online",
      url: "https://example.com/events/prd-webinar",
      registrationDeadline: null,
      prize: null,
      tags: ["writing", "process"],
    },
  ]);

  console.log("Syncing user counters...");
  const deckCounts: Record<number, number> = {
    [users[0].id]: 2,
    [users[1].id]: 1,
    [users[2].id]: 1,
    [users[3].id]: 1,
  };
  const followerCounts: Record<number, number> = {
    [users[0].id]: 2,
    [users[1].id]: 1,
    [users[2].id]: 1,
    [users[3].id]: 1,
  };
  const followingCounts: Record<number, number> = {
    [users[0].id]: 2,
    [users[1].id]: 1,
    [users[2].id]: 1,
    [users[3].id]: 1,
  };
  for (const user of users) {
    await db
      .update(usersTable)
      .set({
        deckCount: deckCounts[user.id] ?? 0,
        followers: followerCounts[user.id] ?? 0,
        following: followingCounts[user.id] ?? 0,
      })
      .where(eq(usersTable.id, user.id));
  }

  console.log("Done seeding.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
