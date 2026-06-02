---
name: lovable-legacy-to-ssr-migration
description: 用於將舊版 Lovable 專案(CSR/SPA, react-router-dom)遷移或重建到新版 SEO-friendly SSR 架構(TanStack Start),同時優先維持原本 UI 不跑版。第一階段只重建基礎架構與可見 UI,不串接 API、不實作正式 SEO/sitemap/robots、不加入新功能。
---

# Lovable 舊版專案遷移 Skill

## 使用時機

當使用者要將舊版 Lovable 專案(通常為 Vite + react-router-dom + Tailwind v3 + HSL CSS variables 的 CSR/SPA),遷移或重建到 Lovable 新版 SEO-friendly SSR 架構(TanStack Start v1 + Tailwind v4 + oklch tokens)時,使用此 Skill。

此 Skill 適用於**第一階段遷移**。

第一階段的重點是:

**使用新版 Lovable SEO-friendly SSR 架構重建專案基礎,同時盡量維持原本 UI,不要跑版。**

---

## 核心原則

最高優先順序是:

**UI 維持原樣,不要跑版。**

- 不要主動重新設計網站
- 不要主動改變視覺風格
- 不要主動加入新功能
- 不要因為架構升級而改變畫面結果

---

## 遷移目標(依優先順序)

1. 使用 Lovable 最新 SEO / Discoverability 解決方案
2. 使用 Lovable 新版 SEO-friendly SSR 專案架構(TanStack Start)
3. 不沿用舊版 CSR / SPA 架構(不要再用 react-router-dom)
4. 依照舊專案目前可見畫面重建 UI
5. 盡量保留原本的 layout、spacing、colors、typography、image ratio、cards、buttons、header、footer 與 RWD
6. 只使用足夠的 mock data,讓畫面完整呈現
7. 不要在第一階段串接正式 API
8. 不要在第一階段實作第二階段功能

---

## 第一階段範圍

只處理:

- 建立新版 SEO-friendly SSR 架構(TanStack Start)
- 遷移或重建舊版專案 UI(每個頁面對應到 `src/routes/<path>.tsx`)
- 保持 desktop / tablet / mobile 畫面接近原本網站
- 重建可見區塊與 components
- 使用 mock data 維持畫面完整
- 在不影響畫面的前提下整理 components

---

## UI 保留要求

遷移時請盡量保留原本的:Header / Navigation / Footer / Hero / Section order / Section spacing / Background colors / Typography / Font size / Font weight / Line height / Image aspect ratio / Cards / Buttons / Icons / Animations / Hover states / Desktop layout / Tablet layout / Mobile layout / 整體視覺節奏。

---

## 架構要求

- 使用 TanStack Start v1 + 檔案路由 (`src/routes/`)
- 不使用 `BrowserRouter` / `Routes` / `Route` (react-router-dom)
- 不要建立 `src/pages/`
- `src/routes/__root.tsx` 是唯一的 root layout
- 每個舊頁面 → 對應 `src/routes/<path>.tsx` 並使用 `createFileRoute`
- 動態路由(例如 `/news/:slug`)→ `src/routes/news.$slug.tsx`
- 避免主要內容只能依賴 client-side JavaScript 才出現
- 客戶端專屬程式(`window`、`localStorage`、`framer-motion` 中需要 DOM 的部分)放在 `useEffect` 或加 `typeof window !== "undefined"` guard

---

## 樣式系統處理(關鍵差異)

舊版通常是 **Tailwind v3 + HSL CSS variables + `tailwind.config.ts`**。
新版是 **Tailwind v4 + oklch tokens + `src/styles.css` 中的 `@theme inline`**,沒有 `tailwind.config.ts`。

第一階段做法(以 UI 不跑版為優先):

- **保留舊的 HSL 色票寫法**:把舊的 `:root { --primary: 190 60% 42%; ... }` 整段轉成 `src/styles.css` 中對應的 `--primary: hsl(190 60% 42%);`(包成完整 `hsl()`),或直接保留 HSL 變數但把 `@theme inline` 對應到 `hsl(var(--primary))`。重點是 **Tailwind 工具類(`bg-primary` 等)算出來的顏色和舊版一致**。
- 自訂 utility(`.bg-pattern-light`、`.accent-line-left` 等)整段搬到 `src/styles.css` 的 `@layer utilities`。
- 自訂字型(例如 Montserrat、Noto Sans TC)用 `<link>` 在 `__root.tsx` 的 `head().links` 或直接 `@import url(...)` 放在 `styles.css` 最前面。`font-display` / `font-body` 等 utility 在 v4 用 `@theme` 註冊:`--font-display: "Montserrat", sans-serif;`。
- 自訂 keyframes(`fade-in-up` 等)放 `@theme` 內 `--animate-fade-in-up: fade-in-up 0.8s ease-out forwards;` 並在 `@keyframes` block 中定義。
- 暗色模式:舊版若用 `.dark` / `.light` class,沿用同樣 class 切換策略。

---

## 資源(圖片、影片、字型)處理

- 預設 **全部複製過來**(使用 `cross_project--copy_project_asset`)。
- `src/assets/*` 的圖片可選擇直接 `import` 用,或轉成 Lovable Assets pointer(`.asset.json`)。第一階段為求快速,維持原本 import 路徑即可。
- `public/*` 的檔案(`hero-forest-video.mp4`、`favicon.ico` 等)複製到新專案的 `public/`,引用路徑不變。
- 大量圖片時可分批複製,確保用到的頁面對應的圖都有。

---

## 多語系處理

若舊版有 `LanguageContext` 或類似機制:

- **預設保留多語系功能**。把 `src/contexts/LanguageContext.tsx` 整個搬過來,並在 `__root.tsx` 的 `RootComponent` 包 Provider。
- 在 SSR 環境注意 `window` / `localStorage`:讀取初始語言時加 `typeof window !== "undefined"` guard,或用 `useEffect` 在 mount 後同步。
- 若使用者選擇 hardcode 中文以加速第一階段,則第二階段再加回。

---

## Mock Data 規則

mock data 只用來維持目前 UI 完整。應該:

- 維持原本內容密度
- 避免空白區塊
- 避免版面高度明顯改變
- 避免看起來像大量 placeholder
- 文字長度與結構盡量接近原本畫面

直接從舊專案的 `src/data/*.ts` 把現成 mock data 搬過來最快。

---

## Component 規則

可以建立或整理:Layout / Header / Navigation / Footer / Hero / Section / Card / Button / ImageBlock / ContentBlock。

避免過度工程化或過度抽象,導致 UI 跑版。

---

## 第一階段不要做的事

- ❌ 不要重新設計網站、不要改變設計語言
- ❌ 不要加入大型新功能、不要套用不同網站模板
- ❌ 不要主動大幅調整路由(URL 對應應與舊版一致)
- ❌ 不要串接正式 API
- ❌ 不要實作正式 SEO metadata、sitemap.xml、robots.txt
- ❌ 不要處理正式網域綁定
- ❌ 不要加入與舊版 UI 無關的新區塊
- ❌ 不要為了重構而改變 spacing、typography 或 visual hierarchy

> 註:雖然第一階段不做「正式 SEO metadata」,但每個 route 仍應保留樣板既有的基本 `head()`(title/description),只是不需要為了 SEO 做進一步研究、撰寫長描述、加 JSON-LD 或產生 og:image。

---

## 建議執行順序(每輪聚焦)

1. **基礎架構**:把舊的 `index.css`、`tailwind.config.ts`、`LanguageContext` 對應到新的 `src/styles.css` + `__root.tsx`。建立全域 Navbar / Footer / Provider。
2. **資源複製**:批次複製 `public/` 與 `src/assets/` 圖片。
3. **首頁(Index)**:遷移首頁所有 section components。請使用者目視確認沒有跑版。
4. **次要頁面**:依優先順序逐頁遷移(About → Services → News → ...)。建議每 2–4 頁一輪,逐輪驗證。
5. **動態路由**:`/news/:slug` 等改成 `src/routes/news.$slug.tsx`。

每輪結束請主動詢問是否繼續下一批,避免一次性塞太多變更難以驗證。

---

## 完成標準

1. 專案已使用 Lovable 新版 SEO-friendly SSR 架構(TanStack Start)
2. 可見 UI 與舊版專案高度接近
3. Desktop / Mobile layout 沒有明顯跑版
4. Header、Footer、Hero、Sections、Cards、Buttons、圖片比例都盡量接近原本網站
5. 沒有提前加入第二階段功能

---

## 第二階段提醒

除非使用者明確要求開始第二階段,否則不要執行:正式 API 串接、正式路由重整、SEO metadata、sitemap.xml、robots.txt、custom domain、正式上線設定、任何會明顯改變 UI 的功能擴充。
