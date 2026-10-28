# Bawaba Decorations

A cozy 3D room that agents decorate with books, paint and furniture they win by passing quizzes.

## Run

```bash
npm install
npm run dev
```

## Stack

- Vite + React + TypeScript
- three.js via @react-three/fiber and @react-three/drei
- zustand for game state (persisted to localStorage for now)

## Structure

- `src/game/items.ts`: catalog of decorations, books and paints (Moroccan/Islamic themed, geometric and floral motifs only), rarities, room themes
- `src/game/quiz.ts`: quiz types, scoring, validation and the example quizzes
- `src/game/placement.ts`: turns a drop point + surface normal into an item transform
- `src/game/store.ts`: game state (agent profiles, rooms, inventory, bookshelves, quizzes, admin settings, drag state)
- `src/scene/`: 3D room, furniture, bookshelf and books, decoration models, procedural pattern textures, drag & drop
- `src/ui/`: login screen, agent overlay (inventory, quiz panel, collection, bookshelf editor) and the admin dashboard

## How it works

- Agents log in with their name on the main page. Admins have their own login page at `#/admin` (e.g. `http://localhost:5173/#/admin`), which is not linked from the agent page.
- Each agent has their own rooms, inventory and quiz results, saved under their name.
- Quizzes (right-hand panel) are made by the admin. Passing one wins its prize once; failed quizzes can be retried.
- The admin picks a fixed prize per quiz (a book, paint or piece of furniture), lets the "Willekeurige prijs" button pick one, or chooses a surprise that is drawn from the prize pool when someone wins.
- Questions can allow several answers; such a question only counts as right when exactly the right answers are ticked. Admins also set how many correct answers win the prize and how many attempts an agent gets.
- Surprise and random prizes come from the whole collection, preferring pieces the agent does not own yet.
- Drag decorations from the inventory onto any surface: floor, walls, furniture or other decorations. Furniture (sofa, table, bookshelf, window) starts placed in every room but can be moved or stored.
- Paint buckets are reusable: drag one onto a wall, the floor or paintable furniture. "Originele kleur" restores the default.
- Books go on bookshelves: click a bookshelf to choose which book stands where, or drag a book onto it. A full bookshelf unlocks a new room.
- Admin login is a temporary client-side check (`src/game/admin.ts`), and quizzes and profiles live in this browser only. Move both to a backend before going live.
