export interface Animal {
  id: string;
  name: string;
  emoji: string;
  price: number;

  bonus: number;
}

export const ANIMALS: Animal[] = [
  { id: "chien", name: "Chien", emoji: "", price: 500, bonus: 5 },
  { id: "chat", name: "Chat", emoji: "", price: 600, bonus: 5 },
  { id: "lapin", name: "Lapin", emoji: "", price: 800, bonus: 8 },
  { id: "hamster", name: "Hamster", emoji: "", price: 900, bonus: 8 },
  { id: "hibou", name: "Hibou", emoji: "", price: 1500, bonus: 10 },
  { id: "loup", name: "Loup", emoji: "", price: 2500, bonus: 12 },
  { id: "dragon", name: "Bébé dragon", emoji: "", price: 5000, bonus: 15 },
  { id: "licorne", name: "Licorne", emoji: "", price: 8000, bonus: 20 },
];

export function getAnimal(id: string): Animal | undefined {
  return ANIMALS.find((animal) => animal.id === id);
}

export function applyAnimalBonus(
  animalId: string | null,
  baseAmount: number,
): number {
  if (!animalId) return baseAmount;
  const animal = getAnimal(animalId);
  if (!animal) return baseAmount;
  return Math.floor((baseAmount * (100 + animal.bonus)) / 100);
}
