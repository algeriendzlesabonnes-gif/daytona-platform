export type UserRole = 'USER' | 'STAFF' | 'ADMIN' | 'OWNER' | 'GRAPHISTE';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string;
  avatar?: string;
}

export type ProjectCategory = 'Légal' | 'Illégal' | 'Entreprise';
export type ProjectStatus = 'Disponible' | 'Repris' | 'Fermé';

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  description: string;
  leader?: string;
  image?: string;
}

export type TicketStatus = 'Ouvert' | 'En cours' | 'Fermé';

export interface TicketMessage {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  author: string;
  subject: string;
  content: string;
  status: TicketStatus;
  createdAt: string;
  claimedBy?: string;
  messages: TicketMessage[];
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  addedBy: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface AppState {
  user: User | null;
  projects: Project[];
  tickets: Ticket[];
  gallery: GalleryImage[];
  shop: ShopItem[];
  socials: SocialLink[];
}
