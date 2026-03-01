import { Project, Ticket } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'LAPD',
    category: 'Légal',
    status: 'Repris',
    description: 'Los Angeles Police Department - To Protect and to Serve.',
    leader: 'Commandant Daytona',
    image: 'https://media.discordapp.net/attachments/1472361346669482057/1472404842348679299/IMG_7357.png?ex=699e50de&is=699cff5e&hm=a73d51cb24b2198eda32432bfc94f81beb8c8817f0534c909bfbf3684af7ed39&=&format=webp&quality=lossless&width=357&height=960'
  },
  {
    id: '2',
    name: 'EMS',
    category: 'Légal',
    status: 'Disponible',
    description: 'Emergency Medical Services - Sauver des vies à Los Angeles.',
    image: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472405588829929545/image.png?ex=699e5190&is=699d0010&hm=fdbc0b5cd9d57bbcf77954003b85d04abdade3749f1dd966d8753c3db0d46d6d&'
  },
  {
    id: '3',
    name: 'ILLÉGAL',
    category: 'Illégal',
    status: 'Disponible',
    description: 'Le côté sombre de Los Angeles. Gangs, cartels et trafics.',
    image: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472406231560884428/image.png?ex=699e5229&is=699d00a9&hm=6dff1d47b4cc27e67918d073735a62dc2c5f687744a3d3730d65e7920a5afc5f&'
  }
];

export const INITIAL_GALLERY = [
  {
    id: 'g1',
    url: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472405589060485280/image.png?ex=699e5190&is=699d0010&hm=db2f1e3229aaed10b1d74d0a06b4ad5cf582deca04716cb6713e3c585af10f4b&',
    caption: 'Intervention Rapide',
    addedBy: 'Staff',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g2',
    url: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472405589823848659/image.png?ex=699e5190&is=699d0010&hm=b47354866bfc896ffe1944b98f894804d5738e7844413d60c8b0e5043dbfc997&',
    caption: 'Los Angeles by Night',
    addedBy: 'Staff',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g3',
    url: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472405588318093332/image.png?ex=699e5190&is=699d0010&hm=b6f089ac8e4c54bdc4d7622b51242500b6d1e83f853ba1516aba494e855bd6fc&',
    caption: 'Patrouille de Routine',
    addedBy: 'Staff',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-101',
    author: 'Citizen42',
    subject: 'Problème de remboursement',
    content: 'J\'ai perdu mon véhicule suite à un bug serveur.',
    status: 'Ouvert',
    createdAt: new Date().toISOString(),
    messages: []
  }
];

export const ACCESS_CODES = {
  STAFF: 'STAFF_DAYTONA_2025',
  OWNER: 'CEO_DAYTONA_2025',
  GRAPHISTE: 'ART_DAYTONA_2025'
};

export const DISCORD_LINK = 'https://discord.gg/5aKTKDRd';

export const ASSETS = {
  LOGO: 'https://media.discordapp.net/attachments/1472361346669482057/1477073774015676516/DT_PRINCIPAL.png?ex=69a36fa6&is=69a21e26&hm=41271d9d1c525360dca98d087ca79198464ee2296948b2bd182b13d107c908c0&=&format=webp&quality=lossless',
  HERO_BG: 'https://cdn.discordapp.com/attachments/1472361346669482057/1472373110077521962/logobykrv-1.png?ex=699e3350&is=699ce1d0&hm=f0331f6d5204bcd0fba48c9147da00f5911b84703a2204c19fc83ef0e1cf85d0',
  INFO_BANNER: 'https://picsum.photos/seed/daytona-info/1200/400',
  RULES_BANNER: 'https://picsum.photos/seed/daytona-rules/1200/400',
  TICKETS_BANNER: 'https://picsum.photos/seed/daytona-tickets/1200/400'
};

export const INITIAL_SHOP: any[] = [];
export const INITIAL_SOCIALS: any[] = [
  { id: '1', name: 'Discord', url: DISCORD_LINK, icon: 'MessageSquare' },
  { id: '2', name: 'TikTok', url: '#', icon: 'Activity' },
  { id: '3', name: 'YouTube', icon: 'Zap' }
];
