# Design Foundations (設計基礎與 Tokens)

設計基礎是 HeadPress 前端設計系統的根基，透過 Design Tokens 保證跨平台與跨框架的樣式一致性。所有的色票、字體排版、間距與陰影都必須以此文件為依歸，嚴禁在元件中寫死 hardcoded values。

## Design Tokens

前端專案應該使用 CSS Custom Properties (Variables) 作為 Tokens 實作。推薦命名慣例為 `--hp-{category}-{property}-{variant}`。

### 1. 顏色系統 (Color System)
- **Primary / Brand**: 品牌主色系，用於主要按鈕、焦點與連結。`--hp-color-primary`
- **Secondary / Accent**: 輔助色或強調色，用於標籤或次要動作。`--hp-color-secondary`
- **Background / Surface**: 背景與介面層級。支援 Light/Dark 模式切換。`--hp-bg-base`, `--hp-bg-surface`
- **Semantic (Feedback)**: 語意顏色。
  - `--hp-color-success` (成功/完成)
  - `--hp-color-warning` (警告/注意)
  - `--hp-color-danger` (錯誤/刪除)
  - `--hp-color-info` (提示/資訊)
- **Text**: 文字層次。`--hp-text-main`, `--hp-text-muted`, `--hp-text-inverse`

### 2. 字體排版 (Typography)
我們採用系統預設優先或明確指定的品牌字體 (例如 Inter, Noto Sans TC)。
- **Font Families**: 
  - `--hp-font-sans`: 主要 UI 字體。
  - `--hp-font-mono`: 程式碼或等寬數字。
- **Type Scale (字級)**: 基於 `rem` 縮放，例如 `xs(0.75rem)`, `sm(0.875rem)`, `base(1rem)`, `lg(1.125rem)`, `xl(1.25rem)`, `2xl(1.5rem)`。
- **Line Heights**: 預設內文 `1.5` 到 `1.6`；標題 `1.2` 到 `1.3` 以確保緊湊。

### 3. 間距系統 (Spacing)
禁止使用隨機的 margin / padding 數值。一律採用基於 4px 或 8px 的倍數網格系統。
- `--hp-space-1`: 4px
- `--hp-space-2`: 8px
- `--hp-space-3`: 12px
- `--hp-space-4`: 16px
- `--hp-space-6`: 24px
- `--hp-space-8`: 32px

### 4. 圓角與陰影 (Radii & Shadows)
- **Radii**: `--hp-radius-sm` (4px), `--hp-radius-md` (8px), `--hp-radius-lg` (12px), `--hp-radius-full` (9999px)。
- **Shadows**: 透過不同層級的陰影來表現 Z 軸深度 (Elevation)。`--hp-shadow-sm` (按鈕), `--hp-shadow-md` (下拉選單), `--hp-shadow-lg` (對話框)。

## 開發原則

- **DRY (Don't Repeat Yourself)**: 若發現兩個元件使用相同的色碼，應將其抽象為 Semantic Token。
- **支援 Dark Mode**: 所有背景與文字色彩 Token 需同時定義 Light / Dark 模式下的對應值，並透過 `@media (prefers-color-scheme: dark)` 或 `[data-theme="dark"]` 自動切換。
- **響應式對齊**: 間距與字體大小可配合 [Responsive Breakpoints](responsive-breakpoints.md) 利用 CSS 鎖 (Fluid Typography / Clamp) 進行平滑縮放。
