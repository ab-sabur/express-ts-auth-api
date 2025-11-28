# my-crud-auth-api — CRUD API with JWT Authentication (TypeScript)

A concise, accurate reference for the repository in this workspace. The API implements user authentication (signup/login) and full CRUD for products. The code follows a simple MVC-like structure with TypeScript and Mongoose.

**Tech stack:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, bcryptjs

**Important:** Do not commit actual credentials (e.g. real MongoDB URIs or JWT secrets) to source control. Use a local `.env` with safe placeholders.

---

**Project layout (important files)**

- `package.json` — scripts & dependencies
- `tsconfig.json` — TypeScript build config
- `src/app.ts` — application entrypoint (starts server)
- `src/config/db.ts` — MongoDB connection helper
- `src/routes/authRoutes.ts` — auth endpoints (`/api/auth`)
- `src/routes/productRoutes.ts` — product endpoints (`/api/products`)
- `src/controllers/*` — controllers for auth & products
- `src/models/*` — Mongoose models (`User`, `Product`)
- `src/middleware/authMiddleware.ts` — JWT verification middleware

---

## Quick setup

1. Install dependencies

```powershell
npm install
```

2. Create a `.env` in project root with these variables (example):

```dotenv
# .env (example - DO NOT COMMIT)
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://absecommerce:di00r78xtsWajtdS@cluster0.ppar2jr.mongodb.net/diptiassignment?retryWrites=true&w=majority
JWT_SECRET=supersecureandlongsecretkey1234567890
JWT_EXPIRES_IN=1d
```

3. Development

This project uses a build-watch + nodemon approach (TypeScript compiled to `dist/`):

```powershell
npm run dev
```

What `dev` does (from `package.json`): it runs `tsc --watch` to compile TypeScript to `dist/` and runs `nodemon` on the compiled output.

4. Production build

```powershell
npm run build
npm start
```

---

## Environment variables

- `MONGO_URI` — MongoDB connection string
- `PORT` — port server listens on (default 5000)
- `JWT_SECRET` — secret used to sign JWTs (keep private)
- `JWT_EXPIRES_IN` — token expiry (e.g. `1d`)
- `NODE_ENV` — `development` or `production`

---

## API Reference

Base path: `/api`

Authentication

- POST `/api/auth/signup` — Register a new user (public)

  - Body (JSON): `{ "username": "Alice", "email": "a@x.com", "password": "secret" }`
  - Success (201):
    ```json
    {
      "_id": "<userId>",
      "username": "Alice",
      "email": "a@x.com",
      "token": "<jwt-token>"
    }
    ```

- POST `/api/auth/login` — Authenticate and receive token (public)
  - Body (JSON): `{ "email": "a@x.com", "password": "secret" }`
  - Success (200): same shape as signup response (includes `token`)

Products

- GET `/api/products` — Get all products (public)

  - Response: array of product objects with `user` populated (`username`, `email`)

- GET `/api/products/:id` — Get a product by ID (public)

- POST `/api/products` — Create product (private — requires Authorization header)

  - Header: `Authorization: Bearer <token>`
  - Body (JSON): `{ "name": "Phone", "description": "Smartphone", "price": 199.99 }`
  - Success (201): created product document

- PUT `/api/products/:id` — Update product (private — owner only)

  - Header: `Authorization: Bearer <token>`
  - Body: partial or full product fields to update

- DELETE `/api/products/:id` — Delete product (private — owner only)
  - Header: `Authorization: Bearer <token>`

Notes on authorization: private product routes use `src/middleware/authMiddleware.ts` which expects the JWT in the `Authorization` header as `Bearer <token>`. The middleware attaches `req.userId` (the authenticated user's ObjectId) for controller checks. Product controllers check that `product.user` matches `req.userId` before allowing updates/deletes.

---

## Models (brief)

- `User` (`src/models/userModel.ts`): `username`, `email`, `password` (hashed with bcryptjs). Password is excluded by default from queries (`select: false`). A `matchPassword` method compares plaintext to hashed value.
- `Product` (`src/models/productModel.ts`): `user` (owner), `name`, `description`, `price`.

---

## Tips & next steps

- Use a secure secret for `JWT_SECRET`. Store it in environment variables or a secrets manager.
- For local tests, use a local MongoDB or a throwaway Atlas cluster.
- Add rate-limiting and input validation (e.g., `express-validator`) before production.
- Add integration tests for auth flows and product CRUD.

If you want, I can:

- add example `curl`/Postman requests for each endpoint
- create minimal integration tests or a Postman collection
- sanitize and remove any leaked secrets in your git history

---
