// 业务常量（叶子模块，零依赖）
// 行数目标：≤150

// WorkBuddy 能力关键词（用于行业适配度计算）
export const WB_CAPABILITIES = [
  '实时音视频', '低延迟直播', 'AI Agent 编排', '数字人', '云渲染',
  '大模型接入', '知识库', '智能客服', '多模态交互', '工作流自动化',
] as const;

// 评分阈值
export const SCORE_TIER = {
  A: 80,
  B: 65,
  C: 0,
} as const;

// 漏斗阶段顺序
export const FUNNEL_ORDER: Record<string, number> = {
  lead: 0,
  qualified: 1,
  demo: 2,
  proposal: 3,
  negotiation: 4,
  closed: 5,
};

export const FUNNEL_LABEL: Record<string, string> = {
  lead: '线索',
  qualified: '已验证',
  demo: 'Demo',
  proposal: '方案',
  negotiation: '商务谈判',
  closed: '已签约',
};

export const FUNNEL_COLOR: Record<string, string> = {
  lead: '#94a3b8',
  qualified: '#60a5fa',
  demo: '#38bdf8',
  proposal: '#22d3ee',
  negotiation: '#00C7BE',
  closed: '#00A86B',
};

// 行业 → WorkBuddy 适配度经验值（用于打分）
export const INDUSTRY_WB_FIT: Record<string, number> = {
  '在线教育': 95,
  '互动影游': 98,
  'AI 漫剧': 92,
  '电商直播': 90,
  '金融科技': 78,
  '医疗健康': 72,
  '智能制造': 68,
  '企业服务': 85,
  '游戏': 88,
  '元宇宙': 96,
  '其他': 50,
};

// 深圳 8 大商区中心坐标
export const SZ_CENTER = { lng: 114.0579, lat: 22.5431 } as const;

// 地图样式：使用 OpenStreetMap 公开瓦片（无需 Key）
export const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
} as const;
