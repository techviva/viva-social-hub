export interface PlatformMetrics {
  platform: "instagram" | "tiktok" | "youtube";
  followers: number;
  followersChange: number;
  engagement: number;
  engagementChange: number;
  reach: number;
  reachChange: number;
  impressions: number;
  impressionsChange: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export const platformMetrics: PlatformMetrics[] = [
  {
    platform: "instagram",
    followers: 12847,
    followersChange: 3.2,
    engagement: 4.8,
    engagementChange: 0.6,
    reach: 45230,
    reachChange: 12.4,
    impressions: 78540,
    impressionsChange: 8.7,
    likes: 3245,
    comments: 487,
    shares: 312,
    saves: 891,
  },
  {
    platform: "tiktok",
    followers: 8423,
    followersChange: 8.7,
    engagement: 7.2,
    engagementChange: 1.3,
    reach: 124500,
    reachChange: 22.1,
    impressions: 287000,
    impressionsChange: 15.4,
    likes: 18720,
    comments: 1243,
    shares: 2840,
    saves: 456,
  },
  {
    platform: "youtube",
    followers: 3156,
    followersChange: 1.8,
    engagement: 3.1,
    engagementChange: -0.4,
    reach: 18900,
    reachChange: 5.2,
    impressions: 42300,
    impressionsChange: -2.1,
    likes: 1456,
    comments: 234,
    shares: 178,
    saves: 567,
  },
];

export const followerHistory = [
  { month: "Nov", instagram: 9200, tiktok: 3100, youtube: 2400 },
  { month: "Dic", instagram: 9800, tiktok: 3800, youtube: 2500 },
  { month: "Ene", instagram: 10500, tiktok: 4600, youtube: 2650 },
  { month: "Feb", instagram: 11200, tiktok: 5800, youtube: 2800 },
  { month: "Mar", instagram: 12100, tiktok: 7200, youtube: 3000 },
  { month: "Abr", instagram: 12847, tiktok: 8423, youtube: 3156 },
];

export interface TopPost {
  id: string;
  title: string;
  platform: "instagram" | "tiktok" | "youtube";
  image: string;
  likes: number;
  comments: number;
  reach: number;
}

export const topPosts: TopPost[] = [
  {
    id: "t1",
    title: "Transformacion patio trasero",
    platform: "instagram",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
    likes: 842,
    comments: 67,
    reach: 12400,
  },
  {
    id: "t2",
    title: "Iluminacion de paisaje nocturna",
    platform: "tiktok",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&h=200&fit=crop",
    likes: 4230,
    comments: 312,
    reach: 48700,
  },
  {
    id: "t3",
    title: "Oferta de primavera: 15% descuento",
    platform: "instagram",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=200&h=200&fit=crop",
    likes: 623,
    comments: 45,
    reach: 8900,
  },
];

// 30-day daily data for the line chart
export interface DailyMetric {
  day: number;
  label: string;
  followers: number;
  views: number;
  engagement: number;
}

function generateDailyData(): DailyMetric[] {
  const data: DailyMetric[] = [];
  const baseFollowers = 23200;
  const baseViews = 4800;
  const baseEngagement = 4.2;

  for (let i = 0; i < 30; i++) {
    const noise = Math.sin(i * 0.7) * 0.3 + Math.sin(i * 0.3) * 0.2;
    const growth = i / 30;
    const weekendBoost = (i % 7 === 5 || i % 7 === 6) ? 1.15 : 1;

    data.push({
      day: i + 1,
      label: `${(i + 9) > 31 ? (i + 9 - 31) : (i + 9)} Abr`.replace(/^(\d) /, "0$1 "),
      followers: Math.round(baseFollowers + baseFollowers * growth * 0.058 + noise * 200),
      views: Math.round((baseViews + baseViews * growth * 0.22 + noise * 600) * weekendBoost),
      engagement: Math.round((baseEngagement + growth * 0.8 + noise * 0.4) * 100) / 100,
    });
  }
  return data;
}

export const dailyMetrics = generateDailyData();

// Best post of the week
export const bestPostOfWeek = {
  title: "Iluminacion de paisaje nocturna",
  platform: "tiktok" as const,
  image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop",
  likes: 4230,
  comments: 312,
  shares: 1840,
  reach: 48700,
  engagementRate: 9.2,
};

// Platform comparison data for bar chart
export const platformComparison = [
  {
    metric: "Seguidores",
    instagram: 12847,
    tiktok: 8423,
    youtube: 3156,
    max: 12847,
  },
  {
    metric: "Engagement %",
    instagram: 4.8,
    tiktok: 7.2,
    youtube: 3.1,
    max: 7.2,
  },
  {
    metric: "Alcance",
    instagram: 45230,
    tiktok: 124500,
    youtube: 18900,
    max: 124500,
  },
  {
    metric: "Likes",
    instagram: 3245,
    tiktok: 18720,
    youtube: 1456,
    max: 18720,
  },
  {
    metric: "Comentarios",
    instagram: 487,
    tiktok: 1243,
    youtube: 234,
    max: 1243,
  },
];
