# Gemini：安裝與更新

方法見 [SKILL.md](../SKILL.md)。依 Gemini CLI extension 文件整理，**全部未實機驗證**。

## Gemini CLI

- extension 定義在 plugin 目錄的 `gemini-extension.json`（`contextFileName` 指向 `GEMINI.md`），`GEMINI.md` 指到 `skills/my-workflow/references/global.md`，不複製內容。
- 先 clone 來源 repo，再從 plugin 目錄安裝（需在 shell 執行，Gemini CLI 互動模式內不支援 `extensions install`）：

```text
gemini extensions install ./my-plugins/my-workflow
```

- GitHub URL 直裝要求 repo 根目錄就是 extension；本 repo 根目錄是多 plugin 的 marketplace，所以不走 URL（行為未驗證）。
- 更新：`git pull` 後重新 install。CLI 安裝時會複製一份，之後來源變動不會自動反映。
- skills 是否被 extension 自動發現，官方文件沒查到，不要宣稱已載入；規則靠 `GEMINI.md` 指示讀 `global.md`。

## Gemini 網頁

沒查到 skill 匯入機制。把 `skills/my-workflow/references/global.md` 貼到 Gem 指示；需要的 skill 內容貼進指示或上傳為知識檔。更新就重貼。沒有 hook 與 MCP。
