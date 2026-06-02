# 全域樣式系統設定規範

> 主題規劃總入口請見 `theme-planning/README.md`。本文件是其中的全域樣式系統規範。

這份文件定義 `frontend-development` skill 在規劃前端專案時應如何處理全域可重用樣式系統。它回答一個核心問題：主題計劃是否包含樣式？答案是包含，而且不應只包含顏色，而應包含一套類似 Bootstrap / design system 的全域配置。

## 定位

全域樣式系統是主題計劃的實作層延伸。它負責把品牌與體驗規則轉成可重用、可檢查、可在多頁面維持一致的 UI 設定。

它不是：

- 單一頁面的客製 CSS。
- 只服務某個 component 的局部樣式。
- 一份只有色碼的 palette。
- runtime env config，例如 API URL、secret、WordPress 帳密或部署設定。

它應該是：

- 全站共享的 semantic token system。
- Tailwind / CSS variables / component variants 的共同來源。
- 後續 AI builder prompt 或人工實作不能任意偏離的設計合約。
- 新專案初始化與既有專案對齊時都能使用的基準。

## 建議檔案

專案內建議使用：

```text
docs/
  theme-plan.md
  theme-plan.config.json
  design-tokens.md
  style-system.config.json
  component-contracts.md
```

程式碼實作層可依框架放在：

```text
src/
  styles/
    globals.css
    tokens.css
    components.css
```

如果是 Tailwind v4 / shadcn 類型專案，應把 semantic tokens 對應到 CSS variables，再由 Tailwind utility 或 component class 使用，不要在各頁面直接散落裸色碼。

## Style System Config 範例

`style-system.config.json` 建議保持機器可讀，但不要取代 CSS。它是規格來源，實際渲染仍落在 `globals.css`、`tokens.css`、Tailwind config 或元件 variant。

```json
{
  "$schema": "./style-system.schema.json",
  "version": 1,
  "colorSystem": {
    "mode": "semantic",
    "themes": ["light"],
    "roles": {
      "background": "#ffffff",
      "foreground": "#181818",
      "surface": "#f7f7f5",
      "surfaceElevated": "#ffffff",
      "border": "#dedbd4",
      "muted": "#edeae4",
      "mutedForeground": "#66635e",
      "primary": "#1f5f4a",
      "primaryForeground": "#ffffff",
      "accent": "#c94f2f",
      "accentForeground": "#ffffff",
      "success": "#287d4f",
      "warning": "#b7791f",
      "danger": "#b42318",
      "focusRing": "#1f5f4a"
    },
    "rules": {
      "avoidOneHuePalette": true,
      "forbidDecorativeGradientOrbs": true,
      "minimumTextContrast": "WCAG AA"
    }
  },
  "typographySystem": {
    "families": {
      "display": "brand display or system serif",
      "body": "system sans",
      "mono": "ui-monospace"
    },
    "roles": {
      "pageTitle": {
        "size": "clamp-free fixed responsive step",
        "weight": 700,
        "lineHeight": 1.1
      },
      "sectionTitle": {
        "size": "compact heading scale",
        "weight": 650,
        "lineHeight": 1.2
      },
      "body": {
        "size": "16px",
        "weight": 400,
        "lineHeight": 1.6
      },
      "caption": {
        "size": "13px",
        "weight": 500,
        "lineHeight": 1.4
      }
    },
    "rules": {
      "noViewportWidthFontSizing": true,
      "letterSpacing": "0 unless brand typography requires otherwise",
      "buttonTextMustFit": true
    }
  },
  "spacingSystem": {
    "base": 4,
    "scale": {
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "20px",
      "6": "24px",
      "8": "32px",
      "10": "40px",
      "12": "48px",
      "16": "64px",
      "20": "80px"
    },
    "layout": {
      "pageInline": "responsive 16px / 24px / 32px",
      "sectionBlock": "route-specific but consistent",
      "controlGap": "8px"
    }
  },
  "shapeSystem": {
    "radius": {
      "control": "6px",
      "card": "8px",
      "modal": "8px",
      "pill": "999px only when semantic"
    },
    "rules": {
      "noNestedCards": true,
      "cardsOnlyForRepeatedItemsModalsAndTools": true
    }
  },
  "elevationSystem": {
    "shadow": {
      "none": "none",
      "subtle": "0 1px 2px rgb(0 0 0 / 0.06)",
      "raised": "0 8px 24px rgb(0 0 0 / 0.10)"
    },
    "rules": {
      "useElevationFunctionally": true,
      "avoidDecorativeFloatingSections": true
    }
  },
  "componentTokens": {
    "button": {
      "height": {
        "sm": "32px",
        "md": "40px",
        "lg": "48px"
      },
      "variants": ["primary", "secondary", "ghost", "icon"],
      "states": ["default", "hover", "active", "disabled", "focus-visible", "loading"]
    },
    "input": {
      "height": "40px",
      "states": ["default", "focus-visible", "invalid", "disabled"]
    },
    "card": {
      "radius": "8px",
      "states": ["default", "hover", "selected", "loading", "empty"]
    },
    "navigation": {
      "states": ["default", "active", "hover", "collapsed"]
    }
  },
  "motionSystem": {
    "duration": {
      "fast": "120ms",
      "normal": "180ms",
      "slow": "240ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.2, 0, 0, 1)"
    },
    "rules": {
      "respectReducedMotion": true,
      "motionMustClarifyStateChange": true
    }
  }
}
```

## CSS Variables 對應

實作時應把 semantic tokens 落到全域 CSS variables。範例：

```css
:root {
  --color-background: #ffffff;
  --color-foreground: #181818;
  --color-surface: #f7f7f5;
  --color-border: #dedbd4;
  --color-primary: #1f5f4a;
  --color-primary-foreground: #ffffff;
  --color-accent: #c94f2f;
  --color-focus-ring: #1f5f4a;

  --font-display: Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --radius-control: 6px;
  --radius-card: 8px;
  --shadow-subtle: 0 1px 2px rgb(0 0 0 / 0.06);
}
```

## Tailwind / Utility 對應

如果專案使用 Tailwind，AI builder prompt 應要求：

- utility class 使用 semantic token，不直接硬寫任意色碼。
- 全站 button、input、card、badge、nav、section spacing 使用共用 class 或 component variant。
- 新增頁面時先重用既有 token 與 component contract，再考慮擴充。
- Tailwind v4 專案優先用 CSS variables 與 `@theme` 對應；Tailwind v3 專案則維持既有 config 與 HSL token，不做無必要遷移。

範例 prompt：

```text
請把樣式視為全域 design system。
使用 docs/style-system.config.json 與 src/styles/tokens.css 的 semantic tokens。
新增元件時只能重用既有 color、spacing、radius、shadow、typography、component variant；若需要新 token，先更新 style-system.config.json 並說明理由。
```

## Bootstrap 類比

可以把這套配置理解成專案自己的 Bootstrap，但它不一定提供完整 class library。更精準地說：

- Bootstrap 提供預設 component、utility、layout 與 theme variables。
- 前端專案的全域樣式系統提供 semantic tokens、component contracts、layout rules 與 prompt invariants。
- 如果專案已有 shadcn/ui、Radix、Tailwind 或自建元件庫，style system 負責統一它們的視覺語言。
- 如果專案沒有元件庫，style system 至少要定義 button、input、card、badge、tabs、dialog、navigation、table/list、section 等基礎元件規則。

## 必須避免的漂移

全域樣式系統應明確禁止這些常見問題：

- 每個頁面各自新增色碼、陰影、圓角與間距。
- hero、section、card 使用不同視覺語言。
- 儀表板或操作工具被做成行銷 landing page。
- 過度使用紫色/藍紫色漸層、米色系、深藍灰、棕橘咖啡色等單一主題。
- 用裝飾性光球、漸層 blob 或巢狀卡片填補畫面。
- 按鈕文字溢出、heading 擠壓、mobile 版互相重疊。
- 後續 prompt 新增功能時無意間改掉全站視覺方向。

## 驗證方式

完成或對齊樣式系統後，至少檢查：

- `style-system.config.json` 是否定義 color、typography、spacing、shape、elevation、component tokens。
- `globals.css` / `tokens.css` 是否使用 semantic CSS variables。
- 主要元件是否使用共用 variants，而不是頁面內臨時 class。
- desktop 與 mobile 截圖是否沒有文字溢出、重疊、空白媒體或不一致 spacing。
- 新增頁面是否保持第一視窗品牌信號、版型節奏與元件語言一致。
