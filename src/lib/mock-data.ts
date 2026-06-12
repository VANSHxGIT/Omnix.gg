
export interface Game {
  id: string;
  name: string;
  description: string;
  poster: string;
  hero: string;
  category: 'RPG' | 'FPS' | 'Sandbox' | 'Action' | 'Strategy';
  playersOnline: number;
}

export const MOCK_GAMES: Game[] = [
  {
    id: 'minecraft',
    name: 'Minecraft',
    description: 'Build, explore, and survive in an infinite world of blocks.',
    poster: 'https://picsum.photos/seed/201/300/450',
    hero: 'https://picsum.photos/seed/11/1200/400',
    category: 'Sandbox',
    playersOnline: 4250,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.',
    poster: 'https://picsum.photos/seed/202/300/450',
    hero: 'https://picsum.photos/seed/22/1200/400',
    category: 'FPS',
    playersOnline: 8120,
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    poster: 'https://picsum.photos/seed/203/300/450',
    hero: 'https://picsum.photos/seed/33/1200/400',
    category: 'RPG',
    playersOnline: 1240,
  },
];

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export const MOCK_CHATS: Record<string, ChatMessage[]> = {
  minecraft: [
    { id: '1', userId: 'u1', userName: 'BlockMaster', userAvatar: 'https://picsum.photos/seed/101/150/150', content: 'Anyone hosting a survival server?', timestamp: '12:45' },
    { id: '2', userId: 'u2', userName: 'CraftyDev', userAvatar: 'https://picsum.photos/seed/102/150/150', content: 'Just finished my redstone calculator!', timestamp: '12:48' },
  ],
  valorant: [
    { id: '3', userId: 'u3', userName: 'JettMain99', userAvatar: 'https://picsum.photos/seed/103/150/150', content: 'Need a Sage for ranked. Gold 2 lobby.', timestamp: '13:02' },
    { id: '4', userId: 'u4', userName: 'VandalWhiz', userAvatar: 'https://picsum.photos/seed/104/150/150', content: 'That last update to Phoenix is insane.', timestamp: '13:05' },
  ],
};

export interface MessageThread {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: 'online' | 'offline';
  };
  lastMessage: string;
  time: string;
  unread: boolean;
}

export const MOCK_THREADS: MessageThread[] = [
  {
    id: 't1',
    user: { name: 'CyberCat', avatar: 'https://picsum.photos/seed/cat/150/150', status: 'online' },
    lastMessage: 'Yo! Ready for that Minecraft session?',
    time: '5m ago',
    unread: true
  },
  {
    id: 't2',
    user: { name: 'ShadowBlade', avatar: 'https://picsum.photos/seed/shadow/150/150', status: 'offline' },
    lastMessage: 'Good games today, GG.',
    time: '2h ago',
    unread: false
  },
  {
    id: 't3',
    user: { name: 'Starlight_99', avatar: 'https://picsum.photos/seed/star/150/150', status: 'online' },
    lastMessage: 'Did you see the Elden Ring DLC trailer?',
    time: '1d ago',
    unread: false
  }
];

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  gamingIds: Record<string, string>;
  preferences: string;
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Alex Gamer',
    avatar: 'https://picsum.photos/seed/101/150/150',
    bio: 'Loves tactical shooters and building complex survival bases.',
    gamingIds: { valorant: 'Alex#NA1', minecraft: 'AlexCraft', discord: 'Alex#1234' },
    preferences: 'I prefer strategic play, good communication, and team-oriented players. Not a fan of toxicity.'
  },
  {
    id: 'u2',
    name: 'Sarah Craft',
    avatar: 'https://picsum.photos/seed/102/150/150',
    bio: 'Casual gamer looking for friendly groups to explore new RPG worlds.',
    gamingIds: { steam: 'SarahPlayz', minecraft: 'SarahC' },
    preferences: 'I enjoy immersive storytelling, exploring map corners, and chatting about game lore.'
  }
];
