import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import decksRouter from "./decks";
import coursesRouter from "./courses";
import eventsRouter from "./events";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(decksRouter);
router.use(coursesRouter);
router.use(eventsRouter);
router.use(statsRouter);

export default router;
