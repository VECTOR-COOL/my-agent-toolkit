# 設計變數 (Design Tokens)

設計系統的核心在於不寫死任何數值，所有視覺屬性都必須對應到 Design Tokens。

## 1. 顏色系統 (Color System)
- **Primary**: 品牌主色 (如：`primary-500`, `primary-hover`)
- **Secondary**: 輔助色
- **Semantic/Status**: 語意顏色 (Success, Warning, Error, Info)
- **Background**: 背景色 (Surface, Default, Alt)
- **Text**: 文字顏色 (Primary, Secondary, Muted, Inverse)

## 2. 字體系統 (Typography)
- **Font Families**: 標題字體 (Heading)、內文字體 (Body)、等寬字體 (Monospace)。
- **Font Sizes**: 以 Rem 為單位 (如：`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`)。
- **Font Weights**: Regular (400), Medium (500), Bold (700)。

## 3. 間距與尺寸 (Spacing & Sizing)
- **間距 (Spacing)**: 使用 4px 或 8px 倍數系統 (`space-2`, `space-4`, `space-8`...)，應用於 margin 與 padding。
- **圓角 (Radius)**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`。

## 4. 斷點 (Breakpoints)
定義響應式設計的邊界 (Mobile First 策略)：
- `sm`: 640px (Tablet Portrait)
- `md`: 768px (Tablet Landscape)
- `lg`: 1024px (Laptop)
- `xl`: 1280px (Desktop)
- `2xl`: 1536px (Large Display)
