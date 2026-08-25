
export interface CommandCategory {
  id: string;
  title: string;
  description: string;
  commands: string[];
}

export const CATEGORIES: CommandCategory[] = [
  {
    id: "messages",
    title: "Messages",
    description: "Messages sauvegardes et profils de messages — pseudo et avatar personnalise via webhook.",
    commands: ["message", "dire"],
  },
  {
    id: "interactions",
    title: "Interactions",
    description: "Boutons et selecteurs — interactions avancees : roles, tickets, suggestions, boutique et articles.",
    commands: ["demo", "ticket", "suggestion"],
  },
  {
    id: "profil",
    title: "Profil & classement",
    description: "Progression, niveaux et statistiques des membres.",
    commands: ["profil", "classement"],
  },
  {
    id: "economie",
    title: "Économie",
    description:
      "Gagne, mise et échange des pièces au quotidien.",
    commands: [
      "quotidien",
      "travail",
      "parier",
      "donner",
      "boutique",
      "acheter",
      "inventaire",
      "utiliser",
    ],
  },
  {
    id: "aventure",
    title: "Aventure & jeux",
    description:
      "Combats au tour par tour et défis contre les autres membres.",
    commands: ["aventure", "duel", "pfc"],
  },
  {
    id: "social",
    title: "Vie sociale",
    description:
      "Animaux de compagnie, mariage et sondages communautaires.",
    commands: ["animal", "mariage", "sondage"],
  },
  {
    id: "anniversaires",
    title: "Anniversaires",
    description:
      "Chaque anniversaire est unique — message d'annonce personnalisé pour chaque membre ou rôle.",
    commands: ["anniv"],
  },
  {
    id: "reseaux",
    title: "Réseaux & logs",
    description:
      "Soyez de bons fans — logs customisés (photo, couleur par type) + plusieurs notifs YouTube, Twitch, Reddit, Dealabs.",
    commands: ["log", "interserveur", "giveaway", "rappel"],
  },
  {
    id: "vocal",
    title: "Salons vocaux",
    description:
      "Crée ton propre salon vocal temporaire avec panneau de contrôle.",
    commands: ["vocal"],
  },
  {
    id: "minijeux",
    title: "Mini-jeux",
    description: "Petits jeux rapides pour s'amuser entre deux messages.",
    commands: ["piece", "de", "8ball"],
  },
  {
    id: "moderation",
    title: "Modération",
    description:
      "Outils de modération classiques avec garde-fous intégrés.",
    commands: ["clear", "kick", "ban", "timeout", "slowmode", "warn", "automod"],
  },
  {
    id: "administration",
    title: "Administration",
    description:
      "Gestion du jeu : rôles autorisés, économie, annonces, réinitialisations + automatisation.",
    commands: ["admin", "autorole", "custom", "reactionrole", "wordreact"],
  },
  {
    id: "utilitaires",
    title: "Utilitaires",
    description: "Liens utiles et informations sur le bot.",
    commands: ["ping", "wiki"],
  },
];
