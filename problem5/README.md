# Backend server with ExpressJS

Simple backend with **CRUD endpoints** for `Resource` entities (UUID PK, name, type enum). Uses **SQLite** for persistence.


## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client & migrate:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Start server (dev mode):

```bash
npm run dev
```

Server runs at http://localhost:3000.



## API Endpoints

| Method | Route | Description | Body / Query |
|--------|-------------------|-------------|--------------|
| GET    | `/resources`        | List resources | Optional query: `?name=<string>&type=BOOK` |
| GET    | `/resources/:id`    | Get resource by ID | — |
| POST   | `/resources`        | Create a resource | `{ "name": "string", "type": "BOOK" }` |
| PUT    | `/resources/:id`    | Update a resource | `{ "name": "string", "type": "BOOK" }` |
| DELETE | `/resources/:id`    | Delete a resource | — |

> `type` must be one of: `BOOK`, `VIDEO`, `ARTICLE`  
> JSON requests must include `Content-Type: application/json`.

---


## Example

Create resource:

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "Learn Prisma", "type": "BOOK"}'
```

List resources:

```bash
curl "http://localhost:3000/resources?type=BOOK&name=Learn"
```