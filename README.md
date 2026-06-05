# sarah-alex-jam

A music jam with Sarah and Alex.

## Dev Setup

### Prerequisites
- Node.js
- Docker (for MongoDB)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and set a `JWT_SECRET` and your `GOOGLE_CLIENT_ID` if using Google OAuth.

### 3. Start MongoDB
```bash
docker compose up -d
```

### 4. Start the dev servers
```bash
npm run dev
```

This starts both:
- **Client** — Vite at `http://localhost:5173`
- **Server** — Apollo GraphQL at `http://localhost:4000/graphql`
