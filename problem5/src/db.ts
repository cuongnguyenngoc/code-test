import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

export type Resource = {
  id: string;
  name: string;
  type: string;
};

type Data = {
  resources: Resource[];
};

// JSON file path
const file = join(__dirname, 'db.json');
const adapter = new JSONFile<Data>(file);

// Provide default data as second argument
const db = new Low<Data>(adapter, { resources: [] });

export { db };
