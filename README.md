# 中美貿易戰｜歷史專題進度網站

歷史課小組報告「中美貿易戰」的進度網站。報告日為 **2026-11-13**，長度 45 分鐘。

- 網站：https://alvin-lo0729.github.io/us-china-trade-war/
- 完整大綱與講稿重點：[docs/outline.md](docs/outline.md)

## 網站內容

| 分頁 | 內容 | 資料來源（試算表分頁） |
|---|---|---|
| 總覽 | 倒數天數、整體完成度、45 分鐘報告流程、組員分工 | settings、tasks、outline、members |
| 準備時程 | 甘特圖，依負責人分組 | tasks |
| 任務看板 | 待辦／進行中／完成三欄 | tasks |
| 大綱心智圖 | 報告大綱，節點依完成狀態上色 | outline |
| 成因魚骨圖 | 貿易戰成因分析與出處 | fishbone |

網站是純靜態頁面，部署在 GitHub Pages。進度資料放在 Google 試算表，組員改試算表，網站就會跟著更新，不需要會用 git。

## 組員：如何更新進度

1. 打開小組的 Google 試算表。
2. 到 `tasks` 分頁修改任務的「狀態」，只能填 `待辦`、`進行中`、`完成` 其中一個。
3. 大約 5 分鐘後重新整理網站，就會看到更新。這段延遲來自 Google 的發布機制。

填寫規則：

- **不要修改第一列的欄位名稱**，網站是依欄位名稱讀取資料。
- 日期請填 `2026-10-01` 或 `2026/10/1` 格式。
- `tasks` 的「負責人」要和 `members` 的「角色」一致，總覽頁才算得出每個人的進度。
- 發布後的試算表**任何人都看得到**，所以不要放學號、電話等個人資料。

## 組長：第一次設定 Google 試算表

1. 在 Google 試算表新增一份空白試算表。
2. 依序匯入 `sheet-template/` 裡的 5 個 CSV：
   - 路徑：「檔案 → 匯入 → 上傳」，匯入位置選「**插入新工作表**」。
   - 匯入後把分頁改名成 `settings`、`members`、`tasks`、`outline`、`fishbone`。
   - 刪掉預設的「工作表1」。
3. 發布成 CSV：
   - 路徑：「檔案 → 共用 → 發布到網路」。
   - 左邊選一個分頁，右邊選「**逗號分隔值 (.csv)**」，按「發布」後複製網址。
   - 5 個分頁都要各做一次。
4. 把 5 個網址分別貼到 [js/config.js](js/config.js) 對應的欄位，再 commit 並 push。
5. 按右上角「共用」，把組員加為「編輯者」。
6. 在 `settings` 分頁的 `sheet_url` 填入試算表網址，總覽頁就會出現「編輯進度試算表」按鈕。

## 本機預覽

```bash
python3 -m http.server 8765
```

然後在瀏覽器開啟 http://localhost:8765 。`js/config.js` 還沒換成 Google 網址時，網站會讀取 `sheet-template/` 裡的範本資料。

## 檔案結構

```
index.html            單頁網站
css/style.css         樣式
js/config.js          資料來源網址
js/data.js            讀取與解析 CSV
js/app.js             總覽與分頁切換
js/gantt.js           甘特圖（Mermaid）
js/kanban.js          任務看板
js/mindmap.js         大綱心智圖（Mermaid）
js/fishbone.js        魚骨圖（SVG）
sheet-template/       Google 試算表的 CSV 範本
docs/outline.md       報告大綱、大事記、Q&A 題庫
```
