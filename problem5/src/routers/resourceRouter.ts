import { Router } from "express";

import { createResource, deleteResource, getResource, getResources, updateResource } from "../controllers/resourceController";

const router = Router();

// POST /resources - Create a new resource
router.post("/", createResource);
// GET /resources - Get resources with optional filters
router.get("/", getResources);

// Get /resources/:id - Get resource by ID
router.get("/:id", getResource);

// Update /resources/:id - Update resource by ID
router.put("/:id", updateResource);

// Delete /resources/:id - Delete resource by ID
router.delete("/:id", deleteResource);

export default router;