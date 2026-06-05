# 通用主題頁面結構 (Theme Pages Structure)

開發一個「通用型主題 (General Theme)」或一套完整的網站模板時，通常需要確保涵蓋以下基礎頁面與路由，以滿足絕大多數企業形象、部落格或電商的骨架需求。

## 1. 核心基礎頁面 (Core Pages)
- **首頁 (Home)**：品牌形象展示、Hero Section、最新消息、服務亮點、Call to Action (CTA)。
- **關於我們 (About Us)**：公司簡介、團隊成員、核心價值、歷史沿革。
- **聯絡我們 (Contact)**：聯絡表單、Google 地圖、實體地址與客服資訊。

## 2. 內容與動態頁面 (Content & Dynamic Pages)
- **文章/新聞列表 (Blog / News Archive)**：網格或列表式的文章預覽、分類篩選器 (Category Filter)、分頁 (Pagination)。
- **文章內頁 (Single Post)**：文章標題、發布日期、作者資訊、特色圖片、Rich Text 內容區塊、相關文章推薦。
- **搜尋結果頁 (Search Results)**：顯示使用者搜尋關鍵字的相關結果，以及無結果時的 Empty State。

## 3. 系統與錯誤處理頁面 (System & Error Pages)
- **404 找不到頁面 (Not Found)**：清楚的錯誤訊息、返回首頁按鈕或熱門連結，確保使用者不會迷失。
- **500 伺服器錯誤 (Server Error)**：當 API 崩潰時的友好提示頁面。
- **維護中頁面 (Maintenance)**：系統升級時使用的過渡畫面。

## 4. 法律與政策 (Legal)
- **隱私權政策 (Privacy Policy)**：純文字內容為主的排版設計。
- **服務條款 (Terms of Service)**：純文字與條列式排版。

## 5. (選用) 會員與電商 (Auth & E-commerce)
若主題包含會員機制或商城，需額外包含：
- **登入 / 註冊 (Login / Register)**：表單驗證、第三方登入按鈕。
- **會員中心 (Dashboard/Profile)**：個人資料管理、訂單紀錄。
- **商品列表 / 單一商品頁 (Product Archive / Single Product)**。

---
**設計建議：**
在實作這些頁面時，應共用 `App Shell` (Header 與 Footer)，並從 `design-system/components.md` 提取共用元件，以確保整體主題風格一致。
