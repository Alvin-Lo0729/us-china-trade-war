// 換成 Google 試算表「檔案 → 共用 → 發布到網路」產生的各分頁 CSV 網址。
// 分頁名稱與欄位名稱必須和 sheet-template/ 裡的範本一致。
const PUB = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnnCaR6xWBKWJFxC6uw3QeJMYmCl-xLlPl1MITPVdlBeTe6GJ45Kt8Lou-P_pWjRN3rIrfjV598CGa/pub';

export const SOURCES = {
  settings: `${PUB}?gid=228718624&single=true&output=csv`,
  members: `${PUB}?gid=447765493&single=true&output=csv`,
  tasks: `${PUB}?gid=1023651931&single=true&output=csv`,
  outline: `${PUB}?gid=2023777165&single=true&output=csv`,
  fishbone: `${PUB}?gid=394723458&single=true&output=csv`,
};
