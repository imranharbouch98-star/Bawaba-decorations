# Bawaba Decorations

A cozy 3D room that agents decorate with items earned through quizzes and work performance.

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

- `src/game/items.ts`: decoration catalog (Moroccan/Islamic themed, geometric and floral motifs only), rarities, room themes
- `src/game/goals.ts`: goals and their rewards
- `src/game/placement.ts`: turns a drop point + surface normal into an item transform
- `src/game/store.ts`: game state (rooms, bookshelf, inventory, placed items, goals, drag state)
- `src/scene/`: 3D room, furniture, bookshelf, decoration models, procedural pattern textures, drag & drop
- `src/ui/`: overlay UI (inventory, selected item controls, goals sidebar)

## Game loop (current prototype)

- Drag decorations from the inventory onto any surface: floor, walls, furniture or other decorations.
- Furniture (sofa, table, bookshelf, window) is placed by default in every room but can be moved or stored like anything else.
- Paint buckets are reusable: drag one onto a wall, the floor or paintable furniture to change its color or pattern. "Originele kleur" restores the default.
- Click a placed item to rotate it (R / Shift+R) or put it back (Delete); drag it to move it, or onto the inventory to store it.
- Each completed quiz adds a book to the bookshelf. When the shelf is full (12 books) a new room unlocks.
- Goals in the sidebar give decorations as rewards.
- Daily prize: reaching 75 points in a day lets the agent pick one of 3 decorations. On busy days (set by an admin) the choice is rare/special items only. Points are mocked locally (`src/game/daily.ts`, `points` in the store) until the external points system is connected.
- Collection (top bar): 120 collectibles (decorations and paints), grouped by category. Most start locked and only become winnable once an admin enables them in the "Beheer" tab.
- Admin login is in the collection popup. It is a temporary client-side check (`src/game/admin.ts`); move it and the admin settings to a backend before going live.
- The "Testen" section simulates points, quizzes and rewards.
