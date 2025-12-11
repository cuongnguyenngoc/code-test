import { Request, Response } from 'express';
import crypto from "crypto";
import { db, Resource } from '../db';

// create resource id helper
const genResourceId = (): string => {
  return crypto.randomUUID();
};

// Create resource controller
export const createResource = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name for resource is required' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Type for resource is required' });
    }

    const newResource: Resource = { id: genResourceId(), name, type };
    db.data.resources.push(newResource);
    await db.write();
    res.status(200).json(newResource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

// get resources with optional filters by name or type
export const getResources = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.query;
    let resources = db.data.resources;
    if (name) {
      resources = resources.filter(r => r.name === name);
    }
    if (type) {
      resources = resources.filter(r => r.type === type);
    }

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list resources' });
  }
};

// Get resource by ID
export const getResource = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const resource = db.data.resources.find(r => r.id === id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get resource' });
  }
};

// Update resource by ID
export const updateResource = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { name, type } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    if (!name && !type) {
      return res.status(400).json({ error: 'At least one field (name or type) is required to update' });
    }

    const resourceIndex = db.data.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (name) {
      db.data.resources[resourceIndex].name = name;
    }
    if (type) {
      db.data.resources[resourceIndex].type = type;
    }

    await db.write();

    res.json(db.data.resources[resourceIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
}

