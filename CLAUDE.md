@AGENTS.md

## Claude Code

- 改 `my-plugins/` 內容後先跑 `node my-plugins/my-workflow/scripts/check-release.mjs`，通過才 commit；升版 8 處同號。
- 這個 repo 常有多個 session 同時修改：動手前 `git pull`，commit 前再 `git status` 確認沒有別人的變更被覆蓋。
- 想知道 my-workflow plugin 的行為，讀 `my-plugins/my-workflow/AGENTS.md`，不要憑記憶。
