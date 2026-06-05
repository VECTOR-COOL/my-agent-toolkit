# 共用元件規範 (Components)

定義設計系統中可重複使用的基礎 UI 元件 (Primitives)。這些元件必須嚴格遵守 `tokens.md` 中的變數，不得自行 hardcode 顏色或尺寸。

## 1. 按鈕 (Buttons)
- **Variants**: Solid, Outline, Ghost, Link.
- **Sizes**: Small, Medium, Large.
- **States**: Default, Hover, Active, Disabled, Loading (需支援 spinner 顯示)。

## 2. 輸入控制項 (Inputs & Controls)
- **Text Input**: 包含 Label, Placeholder, Helper Text, Error State 的完整結構。
- **Select / Checkbox / Radio**: 統一的主題外觀，隱藏原生瀏覽器樣式並自訂。
- **Toggle/Switch**: 用於布林值切換。

## 3. 資訊展示 (Data Display)
- **Cards**: 用於文章、商品或重點資訊。必須有統一的 Padding、Shadow 與 Radius。
- **Badges/Tags**: 用於狀態標示或分類標籤。
- **Avatars**: 使用者頭像，需處理圖片載入失敗的 Fallback 顯示 (如 initials 或預設圖示)。

## 4. 互動回饋 (Feedback)
- **Alerts/Banners**: 成功或失敗的操作回饋。
- **Toast/Snackbar**: 短暫浮現的系統通知。
- **Skeletons/Spinners**: 非同步資料載入時的佔位符 (Loading State)。
