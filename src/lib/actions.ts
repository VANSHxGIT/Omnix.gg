'use server';

import { prisma } from './db';
import { revalidatePath } from 'next/cache';
import { MOCK_GAMES, MOCK_USERS } from './mock-data';

// 1. Dashboard Stats
export async function getDashboardStats() {
  const totalPlayersOnline = MOCK_GAMES.reduce((acc, game) => acc + game.playersOnline, 0).toLocaleString();
  const totalReviews = await prisma.review.count();
  const compatibleMatches = await prisma.user.count({
    where: { NOT: { id: 'u1' } },
  });
  const totalHubs = MOCK_GAMES.length;

  return {
    totalPlayersOnline,
    totalReviews,
    compatibleMatches,
    totalHubs,
  };
}

// 2. Identity Vault Credentials
export async function getCredentials() {
  return prisma.credential.findMany({
    where: { userId: 'u1' },
  });
}

export async function createCredential(platform: string, handle: string, status: string) {
  const cred = await prisma.credential.create({
    data: {
      userId: 'u1',
      platform,
      handle,
      status,
    },
  });
  revalidatePath('/vault');
  return cred;
}

export async function deleteCredential(id: string) {
  const cred = await prisma.credential.delete({
    where: { id },
  });
  revalidatePath('/vault');
  return cred;
}

// 3. Activity Feed Reviews
export async function getReviews() {
  return prisma.review.findMany({
    orderBy: { time: 'desc' },
  });
}

export async function createReview(game: string, rating: number, content: string) {
  const review = await prisma.review.create({
    data: {
      user: 'Pilot_Alex',
      avatar: 'https://picsum.photos/seed/pilot/40/40',
      game,
      rating,
      content,
      likes: 0,
      comments: 0,
    },
  });
  revalidatePath('/feed');
  revalidatePath('/');
  return review;
}

export async function likeReview(id: string) {
  const review = await prisma.review.update({
    where: { id },
    data: {
      likes: { increment: 1 },
    },
  });
  revalidatePath('/feed');
  return review;
}

// 4. Messaging & Hubs
export async function getMessages(threadId: string) {
  const msgs = await prisma.message.findMany({
    where: { threadId },
    orderBy: { time: 'asc' },
  });
  return msgs.map(m => ({
    id: m.id,
    userId: m.senderId,
    userName: m.senderName,
    userAvatar: m.senderAvatar,
    content: m.text,
    timestamp: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
}

export async function createMessage(threadId: string, text: string, senderId: string = 'me') {
  let senderName = 'Pilot_Alex';
  let senderAvatar = 'https://picsum.photos/seed/pilot/40/40';

  if (senderId !== 'me' && senderId !== 'u1') {
    const user = await prisma.user.findUnique({ where: { id: senderId } });
    if (user) {
      senderName = user.name;
      senderAvatar = user.avatar;
    }
  }

  const msg = await prisma.message.create({
    data: {
      threadId,
      senderId,
      senderName,
      senderAvatar,
      text,
    },
  });

  revalidatePath('/messages');
  revalidatePath(`/hubs/${threadId}`);
  return msg;
}

export async function deleteMessage(id: string) {
  const msg = await prisma.message.delete({
    where: { id },
  });
  revalidatePath(`/hubs/${msg.threadId}`);
  revalidatePath('/messages');
  return msg;
}

export async function getThreads() {
  const dmMessages = await prisma.message.findMany({
    where: {
      NOT: {
        threadId: {
          in: ['minecraft', 'valorant', 'elden-ring']
        }
      }
    },
    orderBy: { time: 'asc' }
  });

  const threadIds = Array.from(new Set(dmMessages.map(m => m.threadId)));

  const defaultThreadIds = ['t1', 't2', 't3'];
  defaultThreadIds.forEach(id => {
    if (!threadIds.includes(id)) {
      threadIds.push(id);
    }
  });

  const staticUsers: Record<string, { name: string; avatar: string; status: 'online' | 'offline' }> = {
    t1: { name: 'CyberCat', avatar: 'https://picsum.photos/seed/cat/150/150', status: 'online' },
    t2: { name: 'ShadowBlade', avatar: 'https://picsum.photos/seed/shadow/150/150', status: 'offline' },
    t3: { name: 'Starlight_99', avatar: 'https://picsum.photos/seed/star/150/150', status: 'online' },
  };

  return Promise.all(
    threadIds.map(async (threadId) => {
      const msgs = dmMessages.filter(m => m.threadId === threadId);
      const lastMsg = msgs[msgs.length - 1];

      let user = staticUsers[threadId];
      if (!user) {
        const otherMsg = msgs.find(m => m.senderId !== 'me' && m.senderId !== 'u1');
        let name = 'Gamer';
        let avatar = 'https://picsum.photos/seed/gamer/150/150';
        
        if (otherMsg) {
          name = otherMsg.senderName;
          avatar = otherMsg.senderAvatar;
        } else if (threadId.startsWith('t-')) {
          const rawName = threadId.substring(2);
          const resolved = await getUserProfile(rawName);
          name = resolved.name;
          avatar = resolved.avatar;
        }

        user = {
          name,
          avatar,
          status: 'online'
        };
      }

      return {
        id: threadId,
        user,
        lastMessage: lastMsg ? lastMsg.text : 'No messages yet.',
        time: lastMsg
          ? new Date(lastMsg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Recently',
        unread: false,
        messages: msgs.map((m) => ({
          id: m.id,
          sender: m.senderId === 'me' ? ('me' as const) : ('them' as const),
          text: m.text,
          time: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      };
    })
  );
}

// 5. AI Teammate Compatibility
import { getPlayerCompatibilityRecommendations } from '@/ai/flows/player-compatibility-recommendations';

export async function getTeammatesCompatibility(profile: string) {
  const users = await prisma.user.findMany({
    where: { NOT: { id: 'u1' } },
  });

  const potentialTeammates = users.map((u) => ({
    id: u.id,
    profile: u.preferences,
  }));

  const res = await getPlayerCompatibilityRecommendations({
    currentPlayerProfile: profile,
    potentialTeammates,
  });

  const recommendationsWithProfiles = await Promise.all(
    res.recommendations.map(async (rec) => {
      const profileData = await getUserProfile(rec.playerId);
      return {
        ...rec,
        user: profileData,
      };
    })
  );

  return {
    recommendations: recommendationsWithProfiles,
  };
}

export async function getUserProfile(nameOrId: string) {
  // 1. Try finding by ID or name in DB
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: nameOrId },
        { name: nameOrId },
      ],
    },
    include: { credentials: true },
  });

  if (user) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      preferences: user.preferences,
      credentials: user.credentials.map((c) => ({
        platform: c.platform,
        handle: c.handle,
        status: c.status,
      })),
    };
  }

  // 2. Try finding in mock data
  const mockUser = MOCK_USERS.find(
    (u) => u.id === nameOrId || u.name.toLowerCase() === nameOrId.toLowerCase()
  );
  if (mockUser) {
    return {
      id: mockUser.id,
      name: mockUser.name,
      avatar: mockUser.avatar,
      bio: mockUser.bio,
      preferences: mockUser.preferences,
      credentials: Object.entries(mockUser.gamingIds).map(([platform, handle]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        handle,
        status: 'Public',
      })),
    };
  }

  // 3. Generate fallback dynamically
  const cleanName = nameOrId.replace(/[^a-zA-Z0-9_]/g, '');
  const seed = cleanName.toLowerCase();
  
  const defaultBios: Record<string, string> = {
    BlockMaster: 'Redstone architect and survival world host.',
    CraftyDev: 'Full-stack developer and Minecraft hobbyist.',
    JettMain99: 'Valorant competitive player. Aiming for Radiant.',
    VandalWhiz: 'Loves tactical FPS games and theorycrafting patch updates.',
    TarnishedOne: 'Elden Ring lore theorist and speedrunner.',
    GraceSeeker: 'Co-op helper for difficult boss fights in Souls games.',
    Starlight_99: 'Stardew Valley enthusiast and cozy game streamer.',
    GamerPro_X: 'FPS enthusiast, casual streamer, and strategy game fan.',
    CyberCat: 'Cyberpunk fan, coder, and cat lover.',
    ShadowBlade: 'Assassin main across multiple RPGs.',
  };

  const defaultPreferences: Record<string, string> = {
    BlockMaster: 'LFG for survival servers, prefers co-op play and voice chat.',
    CraftyDev: 'Looking for vanilla survival servers, loves building automation.',
    JettMain99: 'Looking for a solid Sage/Initiator for competitive ranked lobbies. Gold-Plat.',
    VandalWhiz: 'Prefers tactical gameplay and coordination. Low-toxicity lobby only.',
    TarnishedOne: 'Interested in co-op exploration and trade, helping with bosses.',
    GraceSeeker: 'Available for summon, expert in boss strategy and parrying.',
    Starlight_99: 'Cozy gaming sessions, friendly chats, and sharing farm layouts.',
    GamerPro_X: 'Competitive play, serious lobbies but chill vibes.',
    CyberCat: 'Casual matches, late night lobbies, and synthwave soundtracks.',
    ShadowBlade: 'PvP arena, stealth builds, and coordinated raids.',
  };

  const bio = defaultBios[nameOrId] || 'Gaming enthusiast and active community member.';
  const preferences = defaultPreferences[nameOrId] || 'Enjoys a mix of competitive and casual play. Always down for good teamwork.';

  const defaultCredentials: Record<string, Array<{ platform: string; handle: string; status: string }>> = {
    BlockMaster: [
      { platform: 'Minecraft', handle: 'BlockMasterX', status: 'Public' },
      { platform: 'Discord', handle: 'block#1234', status: 'Mutuals Only' },
    ],
    CraftyDev: [
      { platform: 'Minecraft', handle: 'CraftyDev', status: 'Public' },
      { platform: 'Steam', handle: 'CraftyDev', status: 'Public' },
    ],
    JettMain99: [
      { platform: 'Valorant', handle: 'Jett#9999', status: 'Public' },
      { platform: 'Discord', handle: 'jett99#9999', status: 'Mutuals Only' },
    ],
    VandalWhiz: [
      { platform: 'Valorant', handle: 'Whiz#1337', status: 'Public' },
    ],
    TarnishedOne: [
      { platform: 'Steam', handle: 'TarnishedOne', status: 'Public' },
      { platform: 'Discord', handle: 'tarnished#0001', status: 'Mutuals Only' },
    ],
    GraceSeeker: [
      { platform: 'Steam', handle: 'GraceSeeker', status: 'Public' },
    ],
    Starlight_99: [
      { platform: 'Steam', handle: 'StarLight_99', status: 'Public' },
      { platform: 'Discord', handle: 'star#9999', status: 'Mutuals Only' },
    ],
    GamerPro_X: [
      { platform: 'Steam', handle: 'GamerPro_X', status: 'Public' },
      { platform: 'Valorant', handle: 'Pro#1111', status: 'Public' },
    ],
    CyberCat: [
      { platform: 'Steam', handle: 'CyberCat', status: 'Public' },
      { platform: 'Discord', handle: 'cybercat#0001', status: 'Mutuals Only' },
    ],
    ShadowBlade: [
      { platform: 'Steam', handle: 'ShadowBlade', status: 'Public' },
      { platform: 'Discord', handle: 'shadow#4444', status: 'Private' },
    ],
  };

  const credentials = defaultCredentials[nameOrId] || [
    { platform: 'Steam', handle: `${cleanName}_play`, status: 'Public' },
    { platform: 'Discord', handle: `${cleanName}#${Math.floor(1000 + Math.random() * 9000)}`, status: 'Mutuals Only' },
  ];

  return {
    id: `fallback-${seed}`,
    name: nameOrId,
    avatar: `https://picsum.photos/seed/${seed}/150/150`,
    bio,
    preferences,
    credentials,
  };
}

export async function getSingleTeammateCompatibility(teammateId: string, teammateProfile: string) {
  const currentUser = await prisma.user.findUnique({
    where: { id: 'u1' }
  });
  const currentProfile = currentUser?.preferences || 'I prefer strategic play, good communication, and team-oriented players. Not a fan of toxicity.';

  const result = await getPlayerCompatibilityRecommendations({
    currentPlayerProfile: currentProfile,
    potentialTeammates: [{ id: teammateId, profile: teammateProfile }],
  });

  return result.recommendations[0]?.compatibilityReason || 'No match compatibility reason available.';
}
