import { Request, Response } from 'express';
import crypto from "crypto";
import prisma from '../dbClient/client';
import { ResourceType } from '../types/resource';

// create resource id helper
const genResourceId = (): string => {
  return crypto.randomUUID();
};

function isResourceType(value: any): value is ResourceType {
  return Object.values(ResourceType).includes(value);
}

import { ParsedQs } from 'qs';

function toStringOrUndefined(
  value: string | ParsedQs | (string | ParsedQs)[] | undefined
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value.find(v => typeof v === 'string');
    if (first) return first;
  }
  return undefined;
}

// Create resource controller
export const createResource = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name for resource is required' });
    }

    // Check if type is a valid enum value
    if (!isResourceType(type)) {
      return res.status(400).json({ error: 'Invalid resource type' });
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

    let typeFilter: ResourceType | undefined;
    if (type) {
      if (!isResourceType(type)) {
        return res.status(400).json({ error: 'Invalid resource type' });
      }
      typeFilter = type as ResourceType; // <-- MUST cast here
    }

    const nameStr = toStringOrUndefined(name);

    const resources = await prisma.resource.findMany({
      where: {
        name: nameStr ? { contains: nameStr } : undefined,
        type: typeFilter,
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

    if (type && !isResourceType(type)) {
      return res.status(400).json({ error: 'Invalid resource type' });
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: { name, type, updatedAt: new Date() },
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

