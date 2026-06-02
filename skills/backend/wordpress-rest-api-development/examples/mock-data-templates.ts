/**
 * WordPress REST API Mock 測試資料範本
 *
 * 所有 mock 資料嚴格對齊 WordPress REST API 回應格式（含 ?_embed）。
 * 使用時複製到專案的 src/data/ 目錄，依據實際專案需求調整內容。
 *
 * ⚠️ 重要：mock 資料的結構必須與正式 API 一致，
 *    切換到正式 API 時不應需要修改 component 或 service 程式碼。
 */

import type { WPPost, WPPage, WPCategory, WPTag } from "@/types/wordpress";

// ============================================================
// Mock Posts（文章）
// ============================================================

export const mock_posts: WPPost[] = [
  {
    id: 1,
    date: "2025-06-01T10:00:00",
    date_gmt: "2025-06-01T02:00:00",
    modified: "2025-06-01T10:00:00",
    modified_gmt: "2025-06-01T02:00:00",
    slug: "uav-inspection-service-launch",
    status: "publish",
    type: "post",
    link: "https://cms.uavs.tw/uav-inspection-service-launch/",
    title: {
      rendered: "UAVS 正式推出無人機巡檢服務",
    },
    content: {
      rendered: `
        <p>UAVS 無人機應用研究院正式推出無人機巡檢服務，涵蓋電力設施、橋樑結構、太陽能板等多種場景。</p>
        <p>我們採用最新的 DJI Matrice 350 RTK 搭配 Zenmuse H30T 熱成像鏡頭，能在惡劣環境下執行精密巡檢任務。</p>
        <h2>服務特色</h2>
        <ul>
          <li>高精度 RTK 定位，精確到公分級別</li>
          <li>熱成像 + 可見光雙鏡頭同步拍攝</li>
          <li>AI 自動偵測異常熱點</li>
          <li>完整巡檢報告與 3D 模型建置</li>
        </ul>
        <p>歡迎聯繫我們了解更多詳情。</p>
      `,
      protected: false,
    },
    excerpt: {
      rendered:
        "<p>UAVS 無人機應用研究院正式推出無人機巡檢服務，涵蓋電力設施、橋樑結構、太陽能板等多種場景。</p>",
      protected: false,
    },
    guid: {
      rendered: "https://cms.uavs.tw/?p=1",
    },
    author: 1,
    featured_media: 101,
    comment_status: "closed",
    ping_status: "closed",
    sticky: false,
    template: "",
    format: "standard",
    meta: {},
    categories: [1, 2],
    tags: [1, 3],
    yoast_head_json: {
      title: "UAVS 正式推出無人機巡檢服務 | UAVS 無人機應用研究院",
      description:
        "UAVS 無人機應用研究院正式推出無人機巡檢服務，涵蓋電力設施、橋樑結構、太陽能板等多種場景。",
      canonical: "https://uavs.tw/news/uav-inspection-service-launch",
      og_locale: "zh_TW",
      og_type: "article",
      og_title: "UAVS 正式推出無人機巡檢服務",
      og_description:
        "涵蓋電力設施、橋樑結構、太陽能板等多種場景的專業無人機巡檢服務。",
      og_url: "https://uavs.tw/news/uav-inspection-service-launch",
      og_site_name: "UAVS 無人機應用研究院",
      og_image: [
        {
          width: 1200,
          height: 630,
          url: "https://picsum.photos/1200/630?random=1",
          type: "image/jpeg",
        },
      ],
      twitter_card: "summary_large_image",
    },
    _embedded: {
      author: [
        {
          id: 1,
          name: "UAVS 編輯部",
          url: "",
          description: "UAVS 無人機應用研究院官方編輯團隊",
          link: "https://cms.uavs.tw/author/editor/",
          slug: "editor",
          avatar_urls: {
            "24": "https://secure.gravatar.com/avatar/?s=24&d=mm&r=g",
            "48": "https://secure.gravatar.com/avatar/?s=48&d=mm&r=g",
            "96": "https://secure.gravatar.com/avatar/?s=96&d=mm&r=g",
          },
        },
      ],
      "wp:featuredmedia": [
        {
          id: 101,
          date: "2025-05-28T12:00:00",
          slug: "drone-inspection-hero",
          status: "inherit",
          type: "attachment",
          link: "https://cms.uavs.tw/drone-inspection-hero/",
          title: { rendered: "無人機巡檢服務" },
          author: 1,
          caption: { rendered: "<p>UAVS 無人機正在執行電力線路巡檢</p>" },
          alt_text: "UAVS 無人機在高壓電塔旁執行巡檢任務",
          media_type: "image",
          mime_type: "image/jpeg",
          post: 1,
          source_url: "https://picsum.photos/1920/1080?random=1",
          media_details: {
            width: 1920,
            height: 1080,
            file: "2025/05/drone-inspection-hero.jpg",
            sizes: {
              thumbnail: {
                file: "drone-inspection-hero-150x150.jpg",
                width: 150,
                height: 150,
                mime_type: "image/jpeg",
                source_url: "https://picsum.photos/150/150?random=1",
              },
              medium: {
                file: "drone-inspection-hero-300x169.jpg",
                width: 300,
                height: 169,
                mime_type: "image/jpeg",
                source_url: "https://picsum.photos/300/169?random=1",
              },
              large: {
                file: "drone-inspection-hero-1024x576.jpg",
                width: 1024,
                height: 576,
                mime_type: "image/jpeg",
                source_url: "https://picsum.photos/1024/576?random=1",
              },
              full: {
                file: "drone-inspection-hero.jpg",
                width: 1920,
                height: 1080,
                mime_type: "image/jpeg",
                source_url: "https://picsum.photos/1920/1080?random=1",
              },
            },
          },
        },
      ],
      "wp:term": [
        [
          { id: 1, link: "https://cms.uavs.tw/category/news/", name: "最新消息", slug: "news", taxonomy: "category" },
          { id: 2, link: "https://cms.uavs.tw/category/service/", name: "服務", slug: "service", taxonomy: "category" },
        ],
        [
          { id: 1, link: "https://cms.uavs.tw/tag/drone/", name: "無人機", slug: "drone", taxonomy: "post_tag" },
          { id: 3, link: "https://cms.uavs.tw/tag/inspection/", name: "巡檢", slug: "inspection", taxonomy: "post_tag" },
        ],
      ],
    },
  },
  {
    id: 2,
    date: "2025-05-20T14:30:00",
    date_gmt: "2025-05-20T06:30:00",
    modified: "2025-05-21T09:00:00",
    modified_gmt: "2025-05-21T01:00:00",
    slug: "drone-pilot-training-program",
    status: "publish",
    type: "post",
    link: "https://cms.uavs.tw/drone-pilot-training-program/",
    title: {
      rendered: "2025 年無人機飛手培訓課程開放報名",
    },
    content: {
      rendered: `
        <p>UAVS 無人機應用研究院 2025 年度飛手培訓課程正式開放報名。課程內容涵蓋基礎飛行訓練、法規認證、產業應用實務等。</p>
        <h2>課程內容</h2>
        <ol>
          <li>基礎飛行操作與安全規範</li>
          <li>民航局遙控無人機操作證照考試輔導</li>
          <li>空拍攝影與影片製作</li>
          <li>農業噴灑應用實務</li>
          <li>測量與 3D 建模應用</li>
        </ol>
      `,
      protected: false,
    },
    excerpt: {
      rendered:
        "<p>UAVS 2025 年度飛手培訓課程正式開放報名，涵蓋基礎飛行訓練、法規認證、產業應用實務等。</p>",
      protected: false,
    },
    guid: { rendered: "https://cms.uavs.tw/?p=2" },
    author: 1,
    featured_media: 102,
    comment_status: "closed",
    ping_status: "closed",
    sticky: false,
    template: "",
    format: "standard",
    meta: {},
    categories: [1, 3],
    tags: [1, 2],
    yoast_head_json: {
      title: "2025 年無人機飛手培訓課程開放報名 | UAVS",
      description: "UAVS 2025 年度飛手培訓課程正式開放報名，涵蓋基礎飛行訓練、法規認證。",
      canonical: "https://uavs.tw/news/drone-pilot-training-program",
      og_locale: "zh_TW",
      og_type: "article",
      og_title: "2025 年無人機飛手培訓課程開放報名",
      og_description: "涵蓋基礎飛行訓練、法規認證、產業應用實務。",
      og_image: [{ width: 1200, height: 630, url: "https://picsum.photos/1200/630?random=2" }],
      twitter_card: "summary_large_image",
    },
    _embedded: {
      author: [
        {
          id: 1, name: "UAVS 編輯部", url: "", description: "",
          link: "https://cms.uavs.tw/author/editor/", slug: "editor",
          avatar_urls: { "24": "", "48": "", "96": "" },
        },
      ],
      "wp:featuredmedia": [
        {
          id: 102, date: "2025-05-18T10:00:00", slug: "training-program",
          status: "inherit", type: "attachment",
          link: "https://cms.uavs.tw/training-program/",
          title: { rendered: "飛手培訓課程" }, author: 1,
          caption: { rendered: "" }, alt_text: "無人機飛手培訓課程現場",
          media_type: "image", mime_type: "image/jpeg", post: 2,
          source_url: "https://picsum.photos/1920/1080?random=2",
          media_details: {
            width: 1920, height: 1080, file: "2025/05/training.jpg",
            sizes: {
              thumbnail: { file: "t.jpg", width: 150, height: 150, mime_type: "image/jpeg", source_url: "https://picsum.photos/150/150?random=2" },
              medium: { file: "m.jpg", width: 300, height: 169, mime_type: "image/jpeg", source_url: "https://picsum.photos/300/169?random=2" },
              large: { file: "l.jpg", width: 1024, height: 576, mime_type: "image/jpeg", source_url: "https://picsum.photos/1024/576?random=2" },
              full: { file: "f.jpg", width: 1920, height: 1080, mime_type: "image/jpeg", source_url: "https://picsum.photos/1920/1080?random=2" },
            },
          },
        },
      ],
      "wp:term": [
        [
          { id: 1, link: "", name: "最新消息", slug: "news", taxonomy: "category" },
          { id: 3, link: "", name: "教育訓練", slug: "training", taxonomy: "category" },
        ],
        [
          { id: 1, link: "", name: "無人機", slug: "drone", taxonomy: "post_tag" },
          { id: 2, link: "", name: "培訓", slug: "training", taxonomy: "post_tag" },
        ],
      ],
    },
  },
  {
    id: 3,
    date: "2025-05-10T09:00:00",
    date_gmt: "2025-05-10T01:00:00",
    modified: "2025-05-10T09:00:00",
    modified_gmt: "2025-05-10T01:00:00",
    slug: "agriculture-drone-case-study",
    status: "publish",
    type: "post",
    link: "https://cms.uavs.tw/agriculture-drone-case-study/",
    title: { rendered: "農業無人機噴灑案例分享：屏東芒果園" },
    content: {
      rendered: "<p>本次案例分享屏東芒果園使用農業無人機進行農藥噴灑的實際效果與成本分析。</p><p>透過 DJI AGRAS T40 搭配 RTK 模組，我們在 2 小時內完成了 10 公頃的噴灑作業，相比傳統人工噴灑節省了 80% 的時間。</p>",
      protected: false,
    },
    excerpt: {
      rendered: "<p>屏東芒果園使用農業無人機進行農藥噴灑的實際效果與成本分析。</p>",
      protected: false,
    },
    guid: { rendered: "https://cms.uavs.tw/?p=3" },
    author: 1,
    featured_media: 103,
    comment_status: "closed",
    ping_status: "closed",
    sticky: false,
    template: "",
    format: "standard",
    meta: {},
    categories: [4],
    tags: [1, 4],
    yoast_head_json: {
      title: "農業無人機噴灑案例分享：屏東芒果園 | UAVS",
      description: "屏東芒果園使用農業無人機進行農藥噴灑的實際效果與成本分析。",
      og_image: [{ width: 1200, height: 630, url: "https://picsum.photos/1200/630?random=3" }],
    },
    _embedded: {
      author: [
        { id: 1, name: "UAVS 編輯部", url: "", description: "", link: "", slug: "editor", avatar_urls: { "24": "", "48": "", "96": "" } },
      ],
      "wp:featuredmedia": [
        {
          id: 103, date: "2025-05-08T12:00:00", slug: "agri-drone",
          status: "inherit", type: "attachment", link: "",
          title: { rendered: "農業無人機" }, author: 1,
          caption: { rendered: "" }, alt_text: "農業無人機在芒果園上方噴灑",
          media_type: "image", mime_type: "image/jpeg", post: 3,
          source_url: "https://picsum.photos/1920/1080?random=3",
          media_details: {
            width: 1920, height: 1080, file: "agri.jpg",
            sizes: {
              full: { file: "agri.jpg", width: 1920, height: 1080, mime_type: "image/jpeg", source_url: "https://picsum.photos/1920/1080?random=3" },
            },
          },
        },
      ],
      "wp:term": [
        [{ id: 4, link: "", name: "案例分享", slug: "case-study", taxonomy: "category" }],
        [
          { id: 1, link: "", name: "無人機", slug: "drone", taxonomy: "post_tag" },
          { id: 4, link: "", name: "農業", slug: "agriculture", taxonomy: "post_tag" },
        ],
      ],
    },
  },
];

// ============================================================
// Mock Pages（頁面）
// ============================================================

export const mock_pages: WPPage[] = [
  {
    id: 10,
    date: "2025-01-01T00:00:00",
    date_gmt: "2024-12-31T16:00:00",
    modified: "2025-03-15T12:00:00",
    modified_gmt: "2025-03-15T04:00:00",
    slug: "about",
    status: "publish",
    type: "page",
    link: "https://cms.uavs.tw/about/",
    title: { rendered: "關於 UAVS" },
    content: {
      rendered: `
        <p>UAVS 無人機應用研究院成立於 2020 年，致力於推動無人機技術在台灣各產業的應用與發展。</p>
        <h2>我們的使命</h2>
        <p>透過專業培訓、技術研發與產業應用，讓無人機成為台灣產業升級的重要工具。</p>
        <h2>核心團隊</h2>
        <p>我們的團隊由資深飛手、航空工程師、軟體開發者與產業專家組成。</p>
      `,
      protected: false,
    },
    excerpt: {
      rendered: "<p>UAVS 無人機應用研究院致力於推動無人機技術在台灣各產業的應用與發展。</p>",
      protected: false,
    },
    guid: { rendered: "https://cms.uavs.tw/?page_id=10" },
    author: 1,
    featured_media: 201,
    parent: 0,
    menu_order: 0,
    comment_status: "closed",
    ping_status: "closed",
    template: "",
    meta: {},
    yoast_head_json: {
      title: "關於 UAVS | UAVS 無人機應用研究院",
      description: "UAVS 無人機應用研究院致力於推動無人機技術在台灣各產業的應用與發展。",
      canonical: "https://uavs.tw/about",
      og_locale: "zh_TW",
      og_type: "website",
      og_title: "關於 UAVS",
      og_description: "推動無人機技術在台灣各產業的應用與發展。",
      og_image: [{ width: 1200, height: 630, url: "https://picsum.photos/1200/630?random=10" }],
    },
    _embedded: {
      author: [
        { id: 1, name: "UAVS 編輯部", url: "", description: "", link: "", slug: "editor", avatar_urls: { "24": "", "48": "", "96": "" } },
      ],
      "wp:featuredmedia": [
        {
          id: 201, date: "2025-01-01T00:00:00", slug: "about-hero",
          status: "inherit", type: "attachment", link: "",
          title: { rendered: "關於我們 Hero" }, author: 1,
          caption: { rendered: "" }, alt_text: "UAVS 團隊合照",
          media_type: "image", mime_type: "image/jpeg", post: 10,
          source_url: "https://picsum.photos/1920/1080?random=10",
          media_details: {
            width: 1920, height: 1080, file: "about-hero.jpg",
            sizes: {
              full: { file: "about-hero.jpg", width: 1920, height: 1080, mime_type: "image/jpeg", source_url: "https://picsum.photos/1920/1080?random=10" },
            },
          },
        },
      ],
    },
  },
];

// ============================================================
// Mock Categories（分類）
// ============================================================

export const mock_categories: WPCategory[] = [
  {
    id: 1,
    count: 10,
    description: "最新消息與公告",
    link: "https://cms.uavs.tw/category/news/",
    name: "最新消息",
    slug: "news",
    taxonomy: "category",
    parent: 0,
    meta: {},
  },
  {
    id: 2,
    count: 5,
    description: "UAVS 提供的各項服務",
    link: "https://cms.uavs.tw/category/service/",
    name: "服務",
    slug: "service",
    taxonomy: "category",
    parent: 0,
    meta: {},
  },
  {
    id: 3,
    count: 8,
    description: "無人機培訓課程相關資訊",
    link: "https://cms.uavs.tw/category/training/",
    name: "教育訓練",
    slug: "training",
    taxonomy: "category",
    parent: 0,
    meta: {},
  },
  {
    id: 4,
    count: 6,
    description: "無人機應用案例分享",
    link: "https://cms.uavs.tw/category/case-study/",
    name: "案例分享",
    slug: "case-study",
    taxonomy: "category",
    parent: 0,
    meta: {},
  },
];

// ============================================================
// Mock Tags（標籤）
// ============================================================

export const mock_tags: WPTag[] = [
  { id: 1, count: 20, description: "", link: "", name: "無人機", slug: "drone", taxonomy: "post_tag", meta: {} },
  { id: 2, count: 8, description: "", link: "", name: "培訓", slug: "training", taxonomy: "post_tag", meta: {} },
  { id: 3, count: 5, description: "", link: "", name: "巡檢", slug: "inspection", taxonomy: "post_tag", meta: {} },
  { id: 4, count: 6, description: "", link: "", name: "農業", slug: "agriculture", taxonomy: "post_tag", meta: {} },
  { id: 5, count: 4, description: "", link: "", name: "空拍", slug: "aerial-photo", taxonomy: "post_tag", meta: {} },
];
