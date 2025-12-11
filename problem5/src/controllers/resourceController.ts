import { Request, Response } from 'express';
import { db, Resource } from '../db';

// auto-increment helper
const getNextId = (): number => {
  const maxId = db.data.resources.reduce((max, r) => Math.max(max, r.id), 0);
  return maxId + 1;
};

// Create resource controller
export const createResource = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const newResource: Resource = { id: getNextId(), name, type };
    db.data.resources.push(newResource);
    await db.write();
    res.status(200).json(newResource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

