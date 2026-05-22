import { Router } from "express";
import { db, waitlistTable, insertWaitlistSchema } from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

router.post("/waitlist", async (req, res) => {
  const parsed = insertWaitlistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { name, email, country } = parsed.data;

  try {

    const [entry] = await db
      .insert(waitlistTable)
      .values({ name, email, country })
      .returning();

    res.status(201).json({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      country: entry.country,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      res.status(409).json({ error: "This email is already on the waitlist." });
      return;
    }
    req.log.error({ err }, "Failed to insert waitlist entry");
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/waitlist", async (req, res) => {
  const [result] = await db.select({ count: count() }).from(waitlistTable);
  res.json({ count: Number(result.count) });
});

export default router;
