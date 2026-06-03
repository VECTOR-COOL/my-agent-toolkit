# 裝置與響應式配置規範

這份文件定義 前端專案在不同裝置下的斷點、版型、資訊密度、互動方式與 QA 尺寸。它應與 `theme-plan.md`、`style-system.config.json`、`component-contracts.md` 一起使用。

## 核心原則

- 裝置配置不只是 breakpoint。它應定義 navigation、layout、section rhythm、media crop、control size、touch target、content priority。
- 優先使用 container-aware layout，而不是只靠 viewport breakpoint。
- responsive 行為應盡量由 responsive tokens、density modes 與 component contract 定義，不只散落在 page class。
- 同一個 section 在不同裝置可以改 layout，但不應改品牌方向或資料語意。
- mobile 不是 desktop 的縮小版；應重新定義資訊順序與操作密度。
- QA 必須包含至少一個 desktop 與一個 mobile 截圖；重要專案再補 tablet。

## 建議斷點

建議用語意斷點，而不是只記 pixel：

```json
{
  "$schema": "./responsive-config.schema.json",
  "version": 1,
  "breakpoints": {
    "narrowMobile": {
      "min": 320,
      "max": 374,
      "qaWidth": 360,
      "purpose": "small phones and constrained embedded views"
    },
    "mobile": {
      "min": 375,
      "max": 767,
      "qaWidth": 390,
      "purpose": "main phone experience"
    },
    "tablet": {
      "min": 768,
      "max": 1023,
      "qaWidth": 820,
      "purpose": "portrait tablet and large phone landscape"
    },
    "laptop": {
      "min": 1024,
      "max": 1279,
      "qaWidth": 1280,
      "purpose": "compact desktop and laptop"
    },
    "desktop": {
      "min": 1280,
      "max": 1535,
      "qaWidth": 1440,
      "purpose": "primary desktop design"
    },
    "wide": {
      "min": 1536,
      "max": null,
      "qaWidth": 1728,
      "purpose": "wide desktop without over-stretching content"
    }
  }
}
```

## Layout 配置

```json
{
  "layout": {
    "contentMaxWidth": "1200px",
    "wideContentMaxWidth": "1320px only when content density requires it",
    "pagePadding": {
      "narrowMobile": "16px",
      "mobile": "20px",
      "tablet": "24px",
      "desktop": "32px"
    },
    "grid": {
      "mobile": "1 column",
      "tablet": "2 columns when content supports it",
      "desktop": "12-column or content-specific grid"
    },
    "sectionSpacing": {
      "mobile": "48px-64px",
      "tablet": "64px-80px",
      "desktop": "80px-112px"
    }
  }
}
```

## Responsive Tokens 與 Density Modes

若專案有 design tokens，應把常用 responsive 值集中管理：

- page padding。
- section spacing。
- grid gap。
- control height。
- touch target。
- typography role size。
- media aspect ratio。
- navigation height。

範例：

```json
{
  "responsiveTokens": {
    "space.page.x": {
      "mobile": "20px",
      "tablet": "24px",
      "desktop": "32px"
    },
    "space.section.y": {
      "mobile": "56px",
      "tablet": "72px",
      "desktop": "96px"
    },
    "control.height.md": {
      "compact": "36px",
      "comfortable": "44px"
    }
  },
  "densityModes": ["compact", "comfortable"]
}
```

不要讓 AI builder 在每個 section 任意調整 padding/gap；應先查 responsive tokens 或在設計系統中新增有理由的 token。

## Navigation 配置

應明確定義：

- 資料結構：主選單項目需支援 `children`，不得在 IA 有階層時強制攤平成單層連結。
- desktop：top nav、sidebar、dropdown、flyout、mega menu 或 segmented nav。
- tablet：是否保留 desktop nav，或改成 compact nav；若寬度不足，子選單不得被裁切。
- mobile：drawer、sheet、accordion、bottom nav 或簡化 header；多層選單不得依賴 hover。
- active state：目前 route 如何顯示。
- ancestor active state：目前 route 的父層項目如何顯示。
- overflow：導覽項目過多時怎麼處理。
- keyboard：focus order、Esc close、Tab trap、方向鍵或 Tab 瀏覽、子選單展開/收合。
- accessibility：`aria-expanded`、`aria-controls`、focus-visible、outside click close、screen reader label。

範例：

```json
{
  "navigation": {
    "dataModel": "items support label, href, children, active, ancestorActive, external",
    "desktop": "persistent header with inline nav and dropdown/mega menu for child items",
    "tablet": "compact header; keep dropdown only when child panels fit without clipping",
    "mobile": "header with menu sheet and nested accordion groups",
    "maxDepth": "2 levels by default, 3 only when IA requires it",
    "touchTarget": "44px minimum",
    "states": ["default", "hover", "active", "ancestor-active", "focus-visible", "open"],
    "closeBehavior": ["Esc", "outside click", "route change"],
    "qa": ["desktop dropdown", "mobile nested expansion", "deep-link active parent"]
  }
}
```

## Section 響應式規則

每個重要 section 應定義 responsive behavior：

```md
## HeroSection Responsive

Desktop:
- text and media may use two-column layout
- first viewport must show brand/product/place signal
- next section hint remains visible when hero is used

Tablet:
- preserve media, reduce horizontal density
- avoid text overlapping image

Mobile:
- single column
- primary media appears before or immediately after title
- CTA remains visible and does not wrap awkwardly
- no full-screen hero that hides all following content unless explicitly required
```

## Component 響應式規則

元件規範應包含：

- min/max width。
- aspect ratio。
- label wrapping。
- icon button size。
- touch target。
- table/list 在 mobile 的替代呈現。
- card grid 欄數。
- form field stacking。
- image crop 與 fallback。
- density mode：compact 與 comfortable 是否改變高度、gap、資訊密度。
- container behavior：在窄容器中如何重排，而不只看 viewport。

範例：

```json
{
  "components": {
    "cardGrid": {
      "mobile": "1 column",
      "tablet": "2 columns",
      "desktop": "3 columns unless content density requires 4",
      "rules": ["consistent card height is optional", "image aspect ratio is required"]
    },
    "form": {
      "mobile": "single column",
      "desktop": "two columns only for related short fields",
      "rules": ["labels remain visible", "errors do not shift layout excessively"]
    },
    "table": {
      "mobile": "convert to list rows or horizontal scroll with sticky first column",
      "desktop": "full table",
      "rules": ["do not shrink text below readable size"]
    },
    "dialog": {
      "mobile": "bottom sheet or full-height panel when content is long",
      "desktop": "centered modal with max width token",
      "rules": ["focus trap remains valid", "actions remain visible"]
    }
  }
}
```

## Media 配置

圖片與影片在不同裝置應明確定義：

- aspect ratio：hero、card、gallery、avatar、logo。
- crop focal point。
- fallback image。
- lazy loading。
- sizes/srcset 策略。
- 真實圖與生成圖使用條件。

範例：

```json
{
  "media": {
    "hero": {
      "desktopRatio": "16:9 or 21:9 depending on subject",
      "mobileRatio": "4:3 or 1:1 when subject must remain inspectable",
      "focalPoint": "center subject, not decorative crop"
    },
    "card": {
      "ratio": "4:3",
      "fallback": "theme-consistent placeholder, not blank gray block"
    }
  }
}
```

## QA 尺寸

最低檢查：

- desktop：1440 x 900
- mobile：390 x 844

建議增加：

- narrow mobile：360 x 740
- tablet：820 x 1180
- laptop：1280 x 800
- wide：1728 x 1000

每個尺寸至少檢查：

- 文字不溢出、不重疊。
- button label 可讀且不被壓縮。
- media 不空白、不過度裁切、不遮住文字。
- navigation 可操作。
- section spacing 不過鬆或過擠。
- first viewport 保留品牌/產品/場域信號。
- hero 不吃掉所有首屏，除非任務明確要求。

## 常見不足

- 只定義 Tailwind breakpoints，沒有定義不同裝置下的內容優先順序。
- desktop 使用 12 欄 grid，但 mobile 沒有 section-specific layout。
- table、filter、tabs 在 mobile 無替代模式。
- hero 圖在 mobile 被裁到看不出產品/場域。
- card 文字長度一變就高度跳動或按鈕溢出。
- density mode 沒有定義，導致 dashboard、marketing page、mobile form 用同一套過鬆或過擠 spacing。
- component 只寫 viewport breakpoint，放進 sidebar、drawer、grid cell 時就破版。
- wide desktop 內容過度拉寬。
- mobile nav 沒有 focus、close、active state。
