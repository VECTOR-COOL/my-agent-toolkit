# 元件開發指南 (Components Guidelines)

HeadPress 前端的 UI 架構需遵循「狀態可預期」、「職責單一」與「高可組合性」的現代設計系統方法論 (如 Atomic Design)。

## 1. 元件層級劃分 (Atomic Approach)

- **原子 (Atoms)**: 最小且不可分割的 UI 單元。例如：Button, Input, Badge, Icon。不包含任何業務邏輯或外部 API 呼叫。
- **分子 (Molecules)**: 將原子組合而成的簡單功能區塊。例如：Search Form (Input + Button), Article Card (Image + Title + Date)。
- **有機體 (Organisms)**: 複雜的獨立區塊。例如：Header, Footer, 帶篩選器的列表區域。可包含內部狀態管理。
- **模板 (Templates) / 版面 (Layouts)**: 定義有機體與分子在頁面中的排列方式，通常負責 Grid/Flex 的網格配置。

## 2. 狀態機與互動回饋

所有的互動元件（特別是 Atoms 與 Molecules）必須完整考慮並實作以下狀態 (States)：
- **Default**: 預設靜止狀態。
- **Hover**: 游標懸停狀態（需有平滑的 `transition`）。
- **Focus / Focus-Visible**: 鍵盤導覽時的焦點狀態，必須明顯可見（參考 [Accessibility](accessibility-a11y.md)）。
- **Active / Pressed**: 被點擊瞬間的按壓回饋。
- **Disabled**: 停用狀態，降低透明度、游標設為 `not-allowed` 且無法觸發事件。
- **Loading**: 等待非同步操作時的狀態（如：按鈕內顯示 Spinner）。

## 3. 組合優於繼承 (Composition over Configuration)

避免建立擁有數十個 Props 的「萬能元件」。應善用 React 的 `children` (或對應框架的 Slot 機制) 來提高元件的彈性。

**❌ Anti-pattern**:
```tsx
<Card 
  title="標題" 
  description="內容" 
  buttonText="點擊" 
  onButtonClick={...} 
  showIcon={true}
  iconName="arrow" 
/>
```

**✅ Recommended Pattern (Composition)**:
```tsx
<Card>
  <CardHeader>
    <Icon name="arrow" />
    <CardTitle>標題</CardTitle>
  </CardHeader>
  <CardContent>內容</CardContent>
  <CardFooter>
    <Button onClick={...}>點擊</Button>
  </CardFooter>
</Card>
```

## 4. 資料與 UI 脫鉤 (Separation of Concerns)

- UI Component 應該是「愚蠢的」(Dumb Component)。
- Component 只接受 Normalized View Model（例如 `PostCardModel`），絕對不可直接把 WordPress REST API 的 Raw Payload (例如 `{"title": {"rendered": "..."}}`) 傳進共用元件內。
- API 資料映射請在 Service/Mapper 層處理。
