import { Router } from "express";

import { createResource } from "../controllers/resourceController";

const router = Router();

// POST /resources - Create a new resource
router.post("/", createResource);

export default router;