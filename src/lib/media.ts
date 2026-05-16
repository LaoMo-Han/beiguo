export type ModuleMediaEntry = {
  title: string;
  subtitle: string;
  image: string;
  sourceUrl: string;
};

const nteImageBase = "https://nteguide.com/images";

export const moduleMedia: Record<string, ModuleMediaEntry[]> = {
  characters: [
    {
      title: "零",
      subtitle: "光系 / 输出",
      image: `${nteImageBase}/characters/zero-male.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/zero-male/"
    },
    {
      title: "娜娜莉",
      subtitle: "灵系 / 主输出",
      image: `${nteImageBase}/characters/nanally.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/nanally/"
    },
    {
      title: "达芙蒂尔",
      subtitle: "混沌 / 副输出",
      image: `${nteImageBase}/characters/daffodil.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/daffodil/"
    },
    {
      title: "法帝娅",
      subtitle: "魂系 / 生存",
      image: `${nteImageBase}/characters/fadia.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/fadia/"
    },
    {
      title: "哈尼娅",
      subtitle: "魂系 / 增伤辅助",
      image: `${nteImageBase}/characters/haniel.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/haniel/"
    },
    {
      title: "浔",
      subtitle: "光系 / 限定辅助",
      image: `${nteImageBase}/characters/xun.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/xun/"
    },
    {
      title: "白藏",
      subtitle: "咒系 / 主输出",
      image: `${nteImageBase}/characters/baicang.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/baicang/"
    },
    {
      title: "哈索尔",
      subtitle: "相系 / 爆发输出",
      image: `${nteImageBase}/characters/hathor.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/hathor/"
    },
    {
      title: "九原",
      subtitle: "灵系 / 爆发输出",
      image: `${nteImageBase}/characters/jiuyuan.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/jiuyuan/"
    },
    {
      title: "薄荷",
      subtitle: "灵系 / 过渡输出",
      image: `${nteImageBase}/characters/mint.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/mint/"
    },
    {
      title: "阿德勒",
      subtitle: "咒系 / 护盾",
      image: `${nteImageBase}/characters/adler.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/adler/"
    },
    {
      title: "翳",
      subtitle: "光系 / 输出",
      image: `${nteImageBase}/characters/skia.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/skia/"
    },
    {
      title: "埃德嘉",
      subtitle: "治疗 / 过渡",
      image: `${nteImageBase}/characters/edgar.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/edgar/"
    },
    {
      title: "小吱",
      subtitle: "光系 / 都市经营",
      image: `${nteImageBase}/characters/chiz.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/chiz/"
    },
    {
      title: "早雾",
      subtitle: "咒系 / 增益辅助",
      image: `${nteImageBase}/characters/sakiri.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/characters/sakiri/"
    }
  ],
  equipment: [
    {
      title: "预备备",
      subtitle: "S级 / 等离子弧盘",
      image: `${nteImageBase}/weapons/ready-ready.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/weapons/ready-ready/"
    },
    {
      title: "引爆全场",
      subtitle: "S级 / 固态弧盘",
      image: `${nteImageBase}/weapons/blow-up-the-crowd.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/weapons/blow-up-the-crowd/"
    },
    {
      title: "茶花会",
      subtitle: "S级 / 合成弧盘",
      image: `${nteImageBase}/weapons/camellia-society.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/weapons/camellia-society/"
    },
    {
      title: "现实避难所",
      subtitle: "S级 / 固态弧盘",
      image: `${nteImageBase}/weapons/reality-refuge.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/weapons/reality-refuge/"
    },
    {
      title: "漆黑青春妄想",
      subtitle: "S级 / 液态弧盘",
      image: `${nteImageBase}/weapons/youthful-fantasy.webp?v=7`,
      sourceUrl: "https://nteguide.com/zh/weapons/youthful-fantasy/"
    }
  ]
};

export function getModuleMedia(slug: string) {
  return moduleMedia[slug] ?? [];
}

export function getCharacterMedia(name: string) {
  return moduleMedia.characters.find((item) => item.title === name);
}
