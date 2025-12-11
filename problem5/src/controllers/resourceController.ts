import { Request, Response } from 'express';
import crypto from "crypto";
import prisma from '../dbClient/client';

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

    const resourceId = genResourceId();
    const resource = await prisma.resource.create({ data: { id: resourceId, name, type } });

    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

// get resources with optional filters by name or type
export const getResources = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.query;
    const resources = await prisma.resource.findMany({
      where: {
        name: name ? String(name) : undefined,
        type: type ? String(type) : undefined,
      },
    });

    res.json(resources);
  } catch (err) {
    console.log('err', err);
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

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    
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

    const resource = await prisma.resource.update({
      where: { id },
      data: { name, type },
    });

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
}

// Delete resource by ID
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    await prisma.resource.delete({ where: { id } });

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
}

