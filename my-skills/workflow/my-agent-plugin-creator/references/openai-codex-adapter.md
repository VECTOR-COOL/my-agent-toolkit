# OpenAI／Codex adapter

> 快照日期：2026-10-16。Portable package 與 Codex compatibility layout 應分開辨識。

## 官方來源

- Build plugins：<https://developers.openai.com/plugins/build/plugins>
- Plugin specification：<https://developers.openai.com/plugins/specification>

## Portable-first

跨 client package 仍以 root `plugin.json`、`skills/`、`mcp.json` 為核心。OpenAI-specific metadata 放在 portable manifest 的 `extensions.com.openai`，且只使用官方文件定義的欄位。

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "extensions": {
    "com.openai": {}
  }
}
```

不要為了看起來完整而建立空 extension；只有實際需要 OpenAI presentation、registered app mapping、onboarding 或 hooks 時才加入。

## Compatibility files

- `.codex-plugin/plugin.json` 是相容性 fallback，不是 portable manifest。
- `.mcp.json`、`.app.json` 與 hooks 屬於 OpenAI／Codex packaging layer；是否建立取決於實際 target 與當前官方文件。
- Codex 內建 plugin creator 可能產生 compatibility-oriented layout。不能因工具產物能被 Codex 載入，就宣稱符合 Agent Plugins portable root layout。
- 若同時保留 root 與 compatibility manifests，package identity、版本與元件指向必須一致，並避免兩份設定各自漂移。

## MCP authentication extension

OpenAI 文件允許在個別 `mcpServers.<name>.extensions["com.openai"].auth` 宣告 authentication。這個欄位不在 Agent Plugins v1.0.0 的 closed MCP server schema 內，因此需明確區分：

- 純 portable 驗證必須拒絕該欄位。
- `--target openai` 可接受已文件化的 `extensions.com.openai`，但必須回報它是 OpenAI-specific、不是 strict portable v1 conformance。
- Manifest 只宣告 connection／auth 方法；client secrets 與實際 credentials 不得寫入 package。
- 不可將同一設定對其他 clients 宣稱為可攜。

## Marketplace 與安裝

Marketplace catalog、local marketplace path、安裝、啟用與 app connection 都是 distribution 或 runtime 操作，不是建立 package 的隱含授權。只有使用者明確要求時才執行。

## 最低驗證

1. 執行 `node scripts/validate-agent-plugin.mjs <plugin-root> --target openai`，並審閱所有 portability warnings。
2. 分別驗證 root portable manifest 與每個 compatibility file。
3. 檢查 `extensions.com.openai` 只含目前官方文件允許的資料。
4. 在 Codex 實際安裝／載入並測試 skills、MCP、apps 或 hooks；沒有 runtime 證據時只回報靜態相容。
