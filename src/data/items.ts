export type ItemKind = "consumable" | "weapon" | "armor";

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  kind: ItemKind;

  power?: number;
}

export const SHOP_ITEMS: ShopItem[] = [

  {
    id: "boite-mystere",
    name: "Boîte mystère",
    emoji: "",
    price: 250,
    description:
      "Une boîte qui contient entre 50 et 500 pièces. Tente ta chance !",
    kind: "consumable",
  },
  {
    id: "ticket-loterie",
    name: "Ticket de loterie",
    emoji: "",
    price: 100,
    description: "10 % de chance de remporter le jackpot : 1 000 pièces !",
    kind: "consumable",
  },
  {
    id: "cafe",
    name: "Café",
    emoji: "",
    price: 50,
    description: "Un bon café chaud pour se booster (+50 XP).",
    kind: "consumable",
  },
  {
    id: "potion",
    name: "Potion de soin",
    emoji: "",
    price: 150,
    description: "Restaure 40 PV. Indispensable pour l'aventure !",
    kind: "consumable",
  },

  {
    id: "epee-bois",
    name: "Épée en bois",
    emoji: "",
    price: 400,
    description: "+4 dégâts lors des aventures.",
    kind: "weapon",
    power: 4,
  },
  {
    id: "epee-fer",
    name: "Épée en fer",
    emoji: "",
    price: 1200,
    description: "+9 dégâts lors des aventures.",
    kind: "weapon",
    power: 9,
  },
  {
    id: "armure-cuir",
    name: "Armure en cuir",
    emoji: "",
    price: 350,
    description: "-2 dégâts subis lors des aventures.",
    kind: "armor",
    power: 2,
  },
  {
    id: "armure-fer",
    name: "Armure de fer",
    emoji: "",
    price: 1100,
    description: "-5 dégâts subis lors des aventures.",
    kind: "armor",
    power: 5,
  },
];

const itemMap = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

export function getShopItem(id: string): ShopItem | undefined {
  return itemMap.get(id);
}

export function getConsumables(): ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.kind === "consumable");
}
