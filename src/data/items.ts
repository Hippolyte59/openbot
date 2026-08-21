export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "boite-mystere",
    name: "Boîte mystère",
    emoji: "🎁",
    price: 250,
    description:
      "Une boîte qui contient entre 50 et 500 pièces. Tente ta chance !",
  },
  {
    id: "ticket-loterie",
    name: "Ticket de loterie",
    emoji: "🎟️",
    price: 100,
    description: "10 % de chance de remporter le jackpot : 1 000 pièces !",
  },
  {
    id: "cafe",
    name: "Café",
    emoji: "☕",
    price: 50,
    description: "Un bon café chaud pour se booster (+50 XP).",
  },
];

const itemMap = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

export function getShopItem(id: string): ShopItem | undefined {
  return itemMap.get(id);
}
