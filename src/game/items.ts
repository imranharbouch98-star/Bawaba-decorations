/** common = everyday rewards, rare = good performance, special = rewards on busy days */
export type Rarity = 'common' | 'rare' | 'special'

export type ModelKind =
  | 'rug-berber'
  | 'rug-kilim'
  | 'rug-round'
  | 'cushion'
  | 'pouf'
  | 'teapot'
  | 'tea-glasses'
  | 'tagine'
  | 'incense'
  | 'lantern'
  | 'plant'
  | 'screen'
  | 'mirror'
  | 'plate'
  | 'zellige-panel'
  | 'rug'
  | 'floor-cushion'
  | 'throw'
  | 'curtain'
  | 'paint'
  | 'sofa'
  | 'coffee-table'
  | 'bookshelf'
  | 'window'
  | 'tapestry'
  | 'vase'
  | 'cactus'
  | 'palm'
  | 'herb'
  | 'candle-lantern'
  | 'mosaic-lamp'
  | 'dallah'
  | 'bowl'
  | 'basket'
  | 'side-table'
  | 'chest'
  | 'tray-table'
  | 'clock'
  | 'wall-shelf'
  | 'wall-arch'
  | 'candles'
  | 'lattice-panel'

export interface ItemDef {
  id: string
  name: string
  rarity: Rarity
  model: ModelKind
  color: string
  accent: string
  /** Lies flat on a surface (rugs); gets rotated flat against walls. */
  flat?: boolean
  /** Approximate height, used to center the item on the cursor when hung on a wall. */
  height: number
  /** Distance from the model origin to its back, so it sits against a wall. */
  back: number
  /** Shape variant for model families that have several (vases, bowls). */
  variant?: string
  /** Part of the locked collection: only winnable once an admin enables it. */
  extra?: boolean
  /** Textile pattern (cushions, rugs, ...), or the pattern a paint applies. */
  pattern?: Pattern
  /** Room furniture every room starts with; never a prize. */
  fixture?: boolean
}

export type Pattern = 'kilim' | 'berber' | 'zellige' | 'stripes' | 'chevron' | 'trellis' | 'floral' | 'checker' | 'rosette'

export type Category = 'meubels' | 'textiel' | 'verlichting' | 'tafel' | 'planten' | 'muur' | 'verf'

export const CATEGORY_LABEL: Record<Category, string> = {
  meubels: 'Meubels',
  textiel: 'Textiel',
  verlichting: 'Verlichting',
  tafel: 'Thee & tafel',
  planten: 'Planten & vazen',
  muur: 'Muurdecoratie',
  verf: 'Verf',
}

const MODEL_CATEGORY: Record<ModelKind, Category> = {
  sofa: 'meubels', 'coffee-table': 'meubels', bookshelf: 'meubels', window: 'meubels', screen: 'meubels',
  'side-table': 'meubels', chest: 'meubels', 'tray-table': 'meubels', basket: 'meubels',
  'rug-berber': 'textiel', 'rug-kilim': 'textiel', 'rug-round': 'textiel', rug: 'textiel', cushion: 'textiel',
  pouf: 'textiel', 'floor-cushion': 'textiel', throw: 'textiel', curtain: 'textiel', tapestry: 'textiel',
  lantern: 'verlichting', 'candle-lantern': 'verlichting', 'mosaic-lamp': 'verlichting', candles: 'verlichting',
  teapot: 'tafel', 'tea-glasses': 'tafel', tagine: 'tafel', incense: 'tafel', dallah: 'tafel', bowl: 'tafel',
  plant: 'planten', cactus: 'planten', palm: 'planten', herb: 'planten', vase: 'planten',
  mirror: 'muur', plate: 'muur', 'zellige-panel': 'muur', clock: 'muur', 'wall-shelf': 'muur',
  'wall-arch': 'muur', 'lattice-panel': 'muur',
  paint: 'verf',
}

export const categoryOf = (item: ItemDef) => MODEL_CATEGORY[item.model]

/** Models whose main color can be changed with paint. */
const PAINTABLE = new Set<ModelKind>(['sofa', 'coffee-table', 'bookshelf', 'pouf', 'floor-cushion', 'chest', 'side-table', 'cushion'])
export const isPaintable = (item: ItemDef) => PAINTABLE.has(item.model)

export const isPaint = (item: ItemDef) => item.model === 'paint'

/** Can show up as a prize (daily prize, random reward, admin toggles). */
export const isPrize = (item: ItemDef) => !item.fixture

/** Paint that restores a surface's original look. Every player owns it. */
export const PAINT_RESET = 'paint-original'

/** Every room starts with these, already placed (see DEFAULT_LAYOUT). */
const FIXTURES: ItemDef[] = [
  { id: 'sofa', name: 'Marokkaanse bank', rarity: 'common', model: 'sofa', color: '#c2563a', accent: '#d4a640', height: 1.15, back: 0.48, fixture: true },
  { id: 'coffee-table', name: 'Messing salontafel', rarity: 'common', model: 'coffee-table', color: '#6d4429', accent: '#c9a24a', height: 0.53, back: 0.65, fixture: true },
  { id: 'bookshelf', name: 'Boekenkast', rarity: 'common', model: 'bookshelf', color: '#8a5a3b', accent: '#6d4429', height: 2.45, back: 0.23, fixture: true },
  { id: 'window', name: 'Hoefijzerraam', rarity: 'common', model: 'window', color: '#fff8ee', accent: '#7a4a2c', height: 2.2, back: 0.01, fixture: true },
  { id: PAINT_RESET, name: 'Originele kleur', rarity: 'common', model: 'paint', color: '#f6efe2', accent: '#c2563a', height: 0.35, back: 0.15, fixture: true },
]

export const FIXTURE_IDS = FIXTURES.filter((f) => !isPaint(f)).map((f) => f.id)

/** Where the furniture of a new room stands: [itemId, position, normal, spin]. */
export const DEFAULT_LAYOUT: [string, [number, number, number], [number, number, number], number][] = [
  ['sofa', [0.4, 0, -3.45], [0, 1, 0], 0],
  ['coffee-table', [0.6, 0, 0.2], [0, 1, 0], 0],
  ['bookshelf', [-3.7, 0, 1.2], [0, 1, 0], Math.PI / 2],
  ['window', [-2.4, 2.5, -3.95], [0, 0, 1], 0],
]

const paint = (id: string, name: string, rarity: Rarity, color: string, accent: string, pattern?: Pattern): ItemDef => ({
  id, name, rarity, model: 'paint', color, accent, pattern, height: 0.35, back: 0.15,
})

/** Paint buckets: drag onto a wall, the floor or furniture to recolor it. Owning one is enough, it is not used up. */
const BASE_PAINTS: ItemDef[] = [
  paint('paint-terracotta', 'Verf terracotta', 'common', '#d0745a', '#a8322a'),
  paint('paint-mint', 'Verf munt', 'common', '#bfdccb', '#2f7f7a'),
  paint('paint-sky', 'Verf hemelsblauw', 'common', '#bcd6ea', '#2d5c9e'),
]

const EXTRA_PAINTS: ItemDef[] = [
  paint('paint-saffron', 'Verf saffraan', 'common', '#efc46a', '#b8892f'),
  paint('paint-rose', 'Verf rozenwater', 'common', '#efc1bd', '#c2563a'),
  paint('paint-sand', 'Verf woestijnzand', 'common', '#e6cfa7', '#8a6a45'),
  paint('paint-olive', 'Verf olijf', 'common', '#a9b07a', '#5a6a3a'),
  paint('paint-ivory', 'Verf ivoor', 'common', '#f6efe2', '#c9a24a'),
  paint('paint-majorelle', 'Verf Majorelle blauw', 'rare', '#3655b3', '#e6b43a'),
  paint('paint-indigo', 'Verf indigo', 'rare', '#2d3f73', '#d4a640'),
  paint('paint-pomegranate', 'Verf granaatappel', 'rare', '#a8322a', '#e6a83a'),
  paint('paint-zellige', 'Zellige tegels', 'special', '#2f7f7a', '#c2563a', 'zellige'),
  paint('paint-stripes', 'Streepjesbehang', 'rare', '#f3e3c9', '#c2563a', 'stripes'),
  paint('paint-trellis', 'Trellisbehang', 'rare', '#f1dcc4', '#2f7f7a', 'trellis'),
  paint('paint-floral', 'Arabeskbehang', 'special', '#2d3f73', '#e6b43a', 'floral'),
  paint('paint-checker', 'Geblokte tegels', 'rare', '#f6efe2', '#3b3330', 'checker'),
  paint('paint-chevron', 'Chevronbehang', 'rare', '#efc1bd', '#f6efe2', 'chevron'),
  paint('paint-kilim', 'Kilimdessin', 'special', '#b5432f', '#e8b34b', 'kilim'),
  paint('paint-berber', 'Berberdessin', 'rare', '#efe4cf', '#3b3330', 'berber'),
].map((p) => ({ ...p, extra: true }))

/** Textiles with the newer patterns. */
const PATTERNED: ItemDef[] = ([
  { id: 'cushion-stripes', name: 'Gestreept kussen', rarity: 'common', model: 'cushion', pattern: 'stripes', color: '#f3e3c9', accent: '#c2563a', height: 0.6, back: 0.1 },
  { id: 'cushion-chevron', name: 'Chevron kussen', rarity: 'common', model: 'cushion', pattern: 'chevron', color: '#2f7f7a', accent: '#f6efe2', height: 0.6, back: 0.1 },
  { id: 'cushion-trellis', name: 'Trellis kussen', rarity: 'rare', model: 'cushion', pattern: 'trellis', color: '#f6efe2', accent: '#2d5c9e', height: 0.6, back: 0.1 },
  { id: 'cushion-floral', name: 'Arabesk kussen', rarity: 'rare', model: 'cushion', pattern: 'floral', color: '#8a4f86', accent: '#efc1bd', height: 0.6, back: 0.1 },
  { id: 'cushion-checker', name: 'Geblokt kussen', rarity: 'common', model: 'cushion', pattern: 'checker', color: '#efe4cf', accent: '#a8322a', height: 0.6, back: 0.1 },
  { id: 'cushion-zellige', name: 'Zellige kussen', rarity: 'special', model: 'cushion', pattern: 'zellige', color: '#2d5c9e', accent: '#e6a83a', height: 0.6, back: 0.1 },
  { id: 'rug-trellis', name: 'Trellis tapijt', rarity: 'rare', model: 'rug', pattern: 'trellis', color: '#f3e3c9', accent: '#2f7f7a', flat: true, height: 0, back: 0 },
  { id: 'rug-hanbel', name: 'Hanbel streeptapijt', rarity: 'common', model: 'rug', pattern: 'stripes', color: '#e2c68a', accent: '#a8322a', flat: true, height: 0, back: 0 },
  { id: 'rug-chevron', name: 'Chevron tapijt', rarity: 'rare', model: 'rug', pattern: 'chevron', color: '#3b3330', accent: '#efe4cf', flat: true, height: 0, back: 0 },
  { id: 'rug-floral', name: 'Arabesk tapijt', rarity: 'special', model: 'rug', pattern: 'floral', color: '#7a2f2a', accent: '#e6b43a', flat: true, height: 0, back: 0 },
  { id: 'rug-checker', name: 'Geblokt tapijt', rarity: 'common', model: 'rug', pattern: 'checker', color: '#efe4cf', accent: '#2f7f7a', flat: true, height: 0, back: 0 },
  { id: 'floor-cushion-stripes', name: 'Gestreepte zitkussen', rarity: 'common', model: 'floor-cushion', pattern: 'stripes', color: '#e6a83a', accent: '#2f7f7a', height: 0.22, back: 0.4 },
  { id: 'floor-cushion-kilim', name: 'Kilim zitkussen', rarity: 'rare', model: 'floor-cushion', pattern: 'kilim', color: '#b5432f', accent: '#e8b34b', height: 0.22, back: 0.4 },
  { id: 'floor-cushion-floral', name: 'Arabesk zitkussen', rarity: 'special', model: 'floor-cushion', pattern: 'floral', color: '#2d3f73', accent: '#efc1bd', height: 0.22, back: 0.4 },
  { id: 'throw-stripes', name: 'Gestreepte plaid', rarity: 'common', model: 'throw', pattern: 'stripes', color: '#efe4cf', accent: '#c2563a', height: 0.12, back: 0.3 },
  { id: 'throw-berber', name: 'Berber plaid', rarity: 'common', model: 'throw', pattern: 'berber', color: '#f6efe2', accent: '#3b3330', height: 0.12, back: 0.3 },
  { id: 'throw-checker', name: 'Geblokte plaid', rarity: 'rare', model: 'throw', pattern: 'checker', color: '#2f7f7a', accent: '#efe4cf', height: 0.12, back: 0.3 },
  { id: 'curtain-floral', name: 'Arabesk gordijnen', rarity: 'special', model: 'curtain', pattern: 'floral', color: '#7a2f2a', accent: '#e6b43a', height: 2.2, back: 0.06 },
  { id: 'curtain-stripes', name: 'Gestreepte gordijnen', rarity: 'rare', model: 'curtain', pattern: 'stripes', color: '#f3e3c9', accent: '#2f7f7a', height: 2.2, back: 0.06 },
  { id: 'tapestry-floral', name: 'Arabesk wandkleed', rarity: 'special', model: 'tapestry', pattern: 'floral', color: '#2d3f73', accent: '#e6b43a', height: 1.45, back: 0.03 },
  { id: 'tapestry-trellis', name: 'Trellis wandkleed', rarity: 'rare', model: 'tapestry', pattern: 'trellis', color: '#f3e3c9', accent: '#a8322a', height: 1.45, back: 0.03 },
  { id: 'pouf-chevron', name: 'Chevron poef', rarity: 'rare', model: 'pouf', pattern: 'chevron', color: '#c2563a', accent: '#f6efe2', height: 0.38, back: 0.38 },
  { id: 'pouf-trellis', name: 'Trellis poef', rarity: 'rare', model: 'pouf', pattern: 'trellis', color: '#f6efe2', accent: '#2f7f7a', height: 0.38, back: 0.38 },
] satisfies ItemDef[]).map((i): ItemDef => ({ ...i, extra: true }))

const BASE_ITEMS: ItemDef[] = [
  { id: 'rug-berber', name: 'Berber tapijt', rarity: 'common', model: 'rug-berber', color: '#efe4cf', accent: '#3b3330', flat: true, height: 0, back: 0 },
  { id: 'rug-kilim', name: 'Kilim tapijt', rarity: 'rare', model: 'rug-kilim', color: '#b5432f', accent: '#e8b34b', flat: true, height: 0, back: 0 },
  { id: 'rug-round', name: 'Rond rozettapijt', rarity: 'rare', model: 'rug-round', color: '#2d5c9e', accent: '#f3e3c3', flat: true, height: 0, back: 0 },
  { id: 'cushion-terracotta', name: 'Kussen terracotta', rarity: 'common', model: 'cushion', color: '#c2563a', accent: '#e6a83a', height: 0.6, back: 0.1 },
  { id: 'cushion-saffron', name: 'Kussen saffraan', rarity: 'common', model: 'cushion', color: '#e6a83a', accent: '#2f7f7a', height: 0.6, back: 0.1 },
  { id: 'cushion-teal', name: 'Kussen petrol', rarity: 'rare', model: 'cushion', color: '#2f7f7a', accent: '#e8b34b', height: 0.6, back: 0.1 },
  { id: 'pouf-leather', name: 'Leren poef', rarity: 'common', model: 'pouf', color: '#a0613a', accent: '#e8b34b', height: 0.38, back: 0.38 },
  { id: 'teapot-brass', name: 'Marokkaanse theepot', rarity: 'rare', model: 'teapot', color: '#c9a24a', accent: '#c9a24a', height: 0.38, back: 0.16 },
  { id: 'tea-glasses', name: 'Theeglazen op dienblad', rarity: 'common', model: 'tea-glasses', color: '#c9a24a', accent: '#2f7f7a', height: 0.14, back: 0.33 },
  { id: 'tagine', name: 'Tajine', rarity: 'common', model: 'tagine', color: '#b8643c', accent: '#2d5c9e', height: 0.45, back: 0.3 },
  { id: 'incense', name: 'Wierookbrander', rarity: 'rare', model: 'incense', color: '#b8892f', accent: '#b8892f', height: 0.35, back: 0.1 },
  { id: 'lantern-brass', name: 'Marokkaanse lantaarn', rarity: 'special', model: 'lantern', color: '#b8892f', accent: '#ffcf7a', height: 1.3, back: 0.32 },
  { id: 'plant-olive', name: 'Olijfboom in zellige pot', rarity: 'common', model: 'plant', color: '#2f7f7a', accent: '#7d9466', height: 1.5, back: 0.45 },
  { id: 'screen-mashrabiya', name: 'Mashrabiya kamerscherm', rarity: 'special', model: 'screen', color: '#7a4a2c', accent: '#7a4a2c', height: 1.75, back: 0.3 },
  { id: 'mirror-arch', name: 'Hoefijzerspiegel', rarity: 'rare', model: 'mirror', color: '#c9a24a', accent: '#c9a24a', height: 1.6, back: 0 },
  { id: 'plate-fez', name: 'Beschilderd Fez-bord', rarity: 'common', model: 'plate', color: '#f3ede0', accent: '#2d5c9e', height: 0.8, back: 0 },
  { id: 'zellige-panel', name: 'Zellige tegelpaneel', rarity: 'rare', model: 'zellige-panel', color: '#2f7f7a', accent: '#c2563a', height: 0.9, back: 0 },
  { id: 'tapestry-kilim', name: 'Kilim wandkleed', rarity: 'rare', model: 'tapestry', color: '#8a4f86', accent: '#e6a83a', height: 1.45, back: 0.03 },
]

const EXTRA_ITEMS: ItemDef[] = ([
  // cushions and poufs
  { id: 'cushion-rose', name: 'Kussen oudroze', rarity: 'common', model: 'cushion', color: '#e8a3a1', accent: '#c2563a', height: 0.6, back: 0.1 },
  { id: 'cushion-indigo', name: 'Kussen indigo', rarity: 'common', model: 'cushion', color: '#2d3f73', accent: '#e6a83a', height: 0.6, back: 0.1 },
  { id: 'cushion-olive', name: 'Kussen olijf', rarity: 'common', model: 'cushion', color: '#7d8a4a', accent: '#f3e3c3', height: 0.6, back: 0.1 },
  { id: 'cushion-plum', name: 'Kussen pruim', rarity: 'rare', model: 'cushion', color: '#8a4f86', accent: '#e6a83a', height: 0.6, back: 0.1 },
  { id: 'cushion-cream', name: 'Kussen ivoor', rarity: 'common', model: 'cushion', color: '#efe4cf', accent: '#3b3330', height: 0.6, back: 0.1 },
  { id: 'cushion-coral', name: 'Kussen koraal', rarity: 'rare', model: 'cushion', color: '#e5735a', accent: '#2f7f7a', height: 0.6, back: 0.1 },
  { id: 'pouf-yellow', name: 'Gele poef', rarity: 'common', model: 'pouf', color: '#e6b43a', accent: '#7a4a2c', height: 0.38, back: 0.38 },
  { id: 'pouf-teal', name: 'Petrol poef', rarity: 'rare', model: 'pouf', color: '#2f7f7a', accent: '#e8b34b', height: 0.38, back: 0.38 },
  { id: 'pouf-red', name: 'Rode poef', rarity: 'rare', model: 'pouf', color: '#a8322a', accent: '#e8b34b', height: 0.38, back: 0.38 },
  // rugs
  { id: 'rug-berber-ochre', name: 'Oker Berber tapijt', rarity: 'common', model: 'rug-berber', color: '#e2c68a', accent: '#5a3b2a', flat: true, height: 0, back: 0 },
  { id: 'rug-kilim-blue', name: 'Blauw kilim tapijt', rarity: 'rare', model: 'rug-kilim', color: '#2d5c9e', accent: '#e6a83a', flat: true, height: 0, back: 0 },
  { id: 'rug-kilim-green', name: 'Groen kilim tapijt', rarity: 'rare', model: 'rug-kilim', color: '#3f7a5a', accent: '#efe4cf', flat: true, height: 0, back: 0 },
  { id: 'rug-round-terracotta', name: 'Terracotta rozettapijt', rarity: 'special', model: 'rug-round', color: '#c2563a', accent: '#f3e3c3', flat: true, height: 0, back: 0 },
  // vases and plants
  { id: 'vase-amphora-blue', name: 'Blauwe amfora', rarity: 'rare', model: 'vase', variant: 'amphora', color: '#2d5c9e', accent: '#d4a640', height: 0.6, back: 0.17 },
  { id: 'vase-amphora-green', name: 'Groene amfora', rarity: 'rare', model: 'vase', variant: 'amphora', color: '#2f7f7a', accent: '#d4a640', height: 0.6, back: 0.17 },
  { id: 'vase-bulb-terracotta', name: 'Bolle terracotta vaas', rarity: 'common', model: 'vase', variant: 'bulb', color: '#c2563a', accent: '#f3e3c3', height: 0.4, back: 0.2 },
  { id: 'vase-bulb-white', name: 'Witte Fez-vaas', rarity: 'common', model: 'vase', variant: 'bulb', color: '#f3ede0', accent: '#2d5c9e', height: 0.4, back: 0.2 },
  { id: 'vase-tall-ochre', name: 'Hoge oker vaas', rarity: 'common', model: 'vase', variant: 'tall', color: '#d49a3a', accent: '#3b3330', height: 0.8, back: 0.15 },
  { id: 'vase-tall-plum', name: 'Hoge pruimen vaas', rarity: 'rare', model: 'vase', variant: 'tall', color: '#8a4f86', accent: '#d4a640', height: 0.8, back: 0.15 },
  { id: 'plant-cactus', name: 'Cactus', rarity: 'common', model: 'cactus', color: '#c2563a', accent: '#5f8a4f', height: 0.7, back: 0.2 },
  { id: 'plant-palm', name: 'Dadelpalm', rarity: 'special', model: 'palm', color: '#2d5c9e', accent: '#4f8a4b', height: 1.6, back: 0.5 },
  { id: 'plant-mint', name: 'Muntplantje', rarity: 'common', model: 'herb', color: '#e6a83a', accent: '#5fa35a', height: 0.35, back: 0.14 },
  { id: 'plant-lavender', name: 'Lavendel', rarity: 'common', model: 'herb', color: '#2f7f7a', accent: '#9a86c8', height: 0.35, back: 0.14 },
  // lighting
  { id: 'lantern-silver', name: 'Zilveren lantaarn', rarity: 'special', model: 'lantern', color: '#c8c8cc', accent: '#fff1c9', height: 1.3, back: 0.32 },
  { id: 'lantern-copper', name: 'Koperen lantaarn', rarity: 'special', model: 'lantern', color: '#b8643c', accent: '#ffb25a', height: 1.3, back: 0.32 },
  { id: 'candle-lantern-brass', name: 'Kaarslantaarn messing', rarity: 'common', model: 'candle-lantern', color: '#c9a24a', accent: '#ffcf7a', height: 0.45, back: 0.1 },
  { id: 'candle-lantern-black', name: 'Kaarslantaarn zwart', rarity: 'common', model: 'candle-lantern', color: '#3b3330', accent: '#ffcf7a', height: 0.45, back: 0.1 },
  { id: 'mosaic-lamp-jewel', name: 'Mozaïeklamp edelsteen', rarity: 'special', model: 'mosaic-lamp', color: '#b5432f', accent: '#2f7f7a', height: 0.55, back: 0.18 },
  { id: 'mosaic-lamp-blue', name: 'Mozaïeklamp blauw', rarity: 'rare', model: 'mosaic-lamp', color: '#2d5c9e', accent: '#7fc6d9', height: 0.55, back: 0.18 },
  { id: 'mosaic-lamp-amber', name: 'Mozaïeklamp amber', rarity: 'rare', model: 'mosaic-lamp', color: '#e6a83a', accent: '#c2563a', height: 0.55, back: 0.18 },
  { id: 'candles-ivory', name: 'Kaarsen op schaal', rarity: 'common', model: 'candles', color: '#f6efe2', accent: '#c9a24a', height: 0.3, back: 0.15 },
  // tea, coffee and table
  { id: 'teapot-silver', name: 'Zilveren theepot', rarity: 'rare', model: 'teapot', color: '#c8c8cc', accent: '#c8c8cc', height: 0.38, back: 0.16 },
  { id: 'teapot-copper', name: 'Koperen theepot', rarity: 'rare', model: 'teapot', color: '#b8643c', accent: '#b8643c', height: 0.38, back: 0.16 },
  { id: 'dallah-brass', name: 'Dallah koffiepot', rarity: 'special', model: 'dallah', color: '#c9a24a', accent: '#c9a24a', height: 0.45, back: 0.14 },
  { id: 'dallah-silver', name: 'Zilveren dallah', rarity: 'rare', model: 'dallah', color: '#c8c8cc', accent: '#c8c8cc', height: 0.45, back: 0.14 },
  { id: 'tagine-blue', name: 'Blauwe tajine', rarity: 'common', model: 'tagine', color: '#2d5c9e', accent: '#d4a640', height: 0.45, back: 0.3 },
  { id: 'tagine-green', name: 'Groene tajine', rarity: 'common', model: 'tagine', color: '#3f7a5a', accent: '#e6a83a', height: 0.45, back: 0.3 },
  { id: 'bowl-rosette', name: 'Schaal met rozet', rarity: 'common', model: 'bowl', color: '#f3ede0', accent: '#2d5c9e', height: 0.14, back: 0.2 },
  { id: 'bowl-dates', name: 'Schaal met dadels', rarity: 'common', model: 'bowl', variant: 'dates', color: '#2f7f7a', accent: '#6b3a1f', height: 0.16, back: 0.2 },
  { id: 'incense-silver', name: 'Zilveren wierookbrander', rarity: 'rare', model: 'incense', color: '#c8c8cc', accent: '#c8c8cc', height: 0.35, back: 0.1 },
  { id: 'tea-glasses-gold', name: 'Gouden theeset', rarity: 'special', model: 'tea-glasses', color: '#d4af37', accent: '#d4af37', height: 0.14, back: 0.33 },
  // furniture
  { id: 'side-table-zellige', name: 'Zellige bijzettafel', rarity: 'rare', model: 'side-table', color: '#7a4a2c', accent: '#2f7f7a', height: 0.55, back: 0.3 },
  { id: 'side-table-blue', name: 'Blauwe bijzettafel', rarity: 'rare', model: 'side-table', color: '#f3ede0', accent: '#2d5c9e', height: 0.55, back: 0.3 },
  { id: 'chest-cedar', name: 'Cederhouten kist', rarity: 'special', model: 'chest', color: '#8a5a3b', accent: '#c9a24a', height: 0.55, back: 0.28 },
  { id: 'tray-table-brass', name: 'Messing dienbladtafel', rarity: 'special', model: 'tray-table', color: '#c9a24a', accent: '#6d4429', height: 0.55, back: 0.45 },
  { id: 'basket-natural', name: 'Berber mand', rarity: 'common', model: 'basket', color: '#d9b98a', accent: '#c2563a', height: 0.7, back: 0.25 },
  { id: 'basket-colorful', name: 'Kleurrijke mand', rarity: 'rare', model: 'basket', color: '#e6a83a', accent: '#2f7f7a', height: 0.7, back: 0.25 },
  { id: 'screen-mashrabiya-light', name: 'Licht kamerscherm', rarity: 'special', model: 'screen', color: '#c9a27a', accent: '#c9a27a', height: 1.75, back: 0.3 },
  // wall
  { id: 'mirror-silver', name: 'Zilveren boogspiegel', rarity: 'rare', model: 'mirror', color: '#c8c8cc', accent: '#c8c8cc', height: 1.6, back: 0 },
  { id: 'mirror-copper', name: 'Koperen boogspiegel', rarity: 'rare', model: 'mirror', color: '#b8643c', accent: '#b8643c', height: 1.6, back: 0 },
  { id: 'plate-fez-green', name: 'Groen Fez-bord', rarity: 'common', model: 'plate', color: '#f3ede0', accent: '#2f7f7a', height: 0.8, back: 0 },
  { id: 'plate-fez-terracotta', name: 'Terracotta Fez-bord', rarity: 'common', model: 'plate', color: '#f3ede0', accent: '#c2563a', height: 0.8, back: 0 },
  { id: 'zellige-panel-blue', name: 'Blauw tegelpaneel', rarity: 'rare', model: 'zellige-panel', color: '#2d5c9e', accent: '#e6a83a', height: 0.9, back: 0 },
  { id: 'zellige-panel-green', name: 'Groen tegelpaneel', rarity: 'rare', model: 'zellige-panel', color: '#3f7a5a', accent: '#c2563a', height: 0.9, back: 0 },
  { id: 'tapestry-teal', name: 'Petrol wandkleed', rarity: 'rare', model: 'tapestry', color: '#2f7f7a', accent: '#e8b34b', height: 1.45, back: 0.03 },
  { id: 'tapestry-red', name: 'Rood wandkleed', rarity: 'rare', model: 'tapestry', color: '#a8322a', accent: '#efe4cf', height: 1.45, back: 0.03 },
  { id: 'clock-zellige', name: 'Zellige wandklok', rarity: 'rare', model: 'clock', color: '#2f7f7a', accent: '#c9a24a', height: 0.6, back: 0 },
  { id: 'wall-shelf', name: 'Boogplankje', rarity: 'common', model: 'wall-shelf', color: '#7a4a2c', accent: '#c2563a', height: 0.8, back: 0 },
  { id: 'wall-arch-white', name: 'Wit gestuct boogpaneel', rarity: 'special', model: 'wall-arch', color: '#fff8ee', accent: '#c9a24a', height: 1.4, back: 0 },
  { id: 'wall-arch-wood', name: 'Houten boogpaneel', rarity: 'special', model: 'wall-arch', color: '#7a4a2c', accent: '#c9a24a', height: 1.4, back: 0 },
  { id: 'lattice-panel', name: 'Mashrabiya wandpaneel', rarity: 'rare', model: 'lattice-panel', color: '#7a4a2c', accent: '#c9a24a', height: 1, back: 0 },
] satisfies ItemDef[]).map((i): ItemDef => ({ ...i, extra: true }))

export const ITEMS: ItemDef[] = [...FIXTURES, ...BASE_ITEMS, ...BASE_PAINTS, ...EXTRA_ITEMS, ...PATTERNED, ...EXTRA_PAINTS]

/** Items that can be won before an admin changes anything. */
export const DEFAULT_ENABLED = [...BASE_ITEMS, ...BASE_PAINTS].map((i) => i.id)

export const ITEMS_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]))

/** How a piece looks with a paint applied: the paint's color, and its pattern if it has one. */
export function withPaint(item: ItemDef, paintId?: string): ItemDef {
  const paint = paintId ? ITEMS_BY_ID[paintId] : undefined
  if (!paint) return item
  return { ...item, color: paint.color, accent: paint.pattern ? paint.accent : item.accent, pattern: paint.pattern }
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Gewoon',
  rare: 'Zeldzaam',
  special: 'Speciaal',
}

export const BOOKSHELF_CAPACITY = 12

export const ROOM_THEMES = [
  { name: 'Woonkamer', wall: '#f1dcc4', floor: '#c99a6b', tiles: ['#2f7f7a', '#c2563a', '#e6a83a'] },
  { name: 'Theekamer', wall: '#dfe7dc', floor: '#b58b62', tiles: ['#2d5c9e', '#e6a83a', '#2f7f7a'] },
  { name: 'Leeshoek', wall: '#efd6cf', floor: '#a97e57', tiles: ['#8a4f86', '#2f7f7a', '#e6a83a'] },
]
