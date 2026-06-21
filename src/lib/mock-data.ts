
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
    poster: '/images/minecraft-poster.png',
    hero: '/images/minecraft-hero.png',
    category: 'Sandbox',
    playersOnline: 4250,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.',
    poster: '/images/valorant-poster.png',
    hero: '/images/valorant-hero.png',
    category: 'FPS',
    playersOnline: 8120,
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    poster: '/images/elden-ring-poster.png',
    hero: '/images/elden-ring-hero.png',
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
  'elden-ring': [
    { id: '5', userId: 'u5', userName: 'TarnishedOne', userAvatar: 'https://picsum.photos/seed/105/150/150', content: 'Malenia is actually impossible. Help?', timestamp: '14:20' },
    { id: '6', userId: 'u6', userName: 'GraceSeeker', userAvatar: 'https://picsum.photos/seed/106/150/150', content: 'Try using bleed build, it melts her.', timestamp: '14:22' },
  ]
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
  messages: Array<{
    id: string;
    sender: 'me' | 'them';
    text: string;
    time: string;
  }>;
}

export const MOCK_THREADS: MessageThread[] = [
  {
    id: 't1',
    user: { name: 'CyberCat', avatar: 'https://picsum.photos/seed/cat/150/150', status: 'online' },
    lastMessage: 'Yo! Ready for that Minecraft session?',
    time: '5m ago',
    unread: true,
    messages: [
      { id: 'm1', sender: 'them', text: 'Hey, are you joining the server?', time: '10:00 AM' },
      { id: 'm2', sender: 'me', text: 'Yeah, just finishing up dinner.', time: '10:05 AM' },
      { id: 'm3', sender: 'them', text: 'Yo! Ready for that Minecraft session?', time: '10:10 AM' },
    ]
  },
  {
    id: 't2',
    user: { name: 'ShadowBlade', avatar: 'https://picsum.photos/seed/shadow/150/150', status: 'offline' },
    lastMessage: 'Good games today, GG.',
    time: '2h ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'me', text: 'That clutch on Haven was insane.', time: '1:00 PM' },
      { id: 'm2', sender: 'them', text: 'Total luck honestly haha.', time: '1:05 PM' },
      { id: 'm3', sender: 'them', text: 'Good games today, GG.', time: '1:10 PM' },
    ]
  },
  {
    id: 't3',
    user: { name: 'Starlight_99', avatar: 'https://picsum.photos/seed/star/150/150', status: 'online' },
    lastMessage: 'Did you see the Elden Ring DLC trailer?',
    time: '1d ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'them', text: 'Did you see the Elden Ring DLC trailer?', time: 'Yesterday' },
    ]
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

export interface Review {
  id: string;
  user: string;
  avatar: string;
  game: string;
  rating: number;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    user: 'CyberCat',
    avatar: 'https://picsum.photos/seed/cat/40/40',
    game: 'Minecraft',
    rating: 5,
    content: 'Just discovered an amazing seed for survival! The cave systems are incredible and the resource generation is top notch. Anyone want the coords?',
    likes: 24,
    comments: 12,
    time: '45m ago'
  },
  {
    id: 'r2',
    user: 'ShadowBlade',
    avatar: 'https://picsum.photos/seed/shadow/40/40',
    game: 'Valorant',
    rating: 4,
    content: 'The new map updates for Haven are actually pretty balanced. Defender rotations feel more dynamic now. Definitely makes B site more viable.',
    likes: 56,
    comments: 8,
    time: '2h ago'
  }
];
