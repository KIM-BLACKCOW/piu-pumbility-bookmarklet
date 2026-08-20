/*
 * 별도 패키지 없이 북마클릿 배포 파일을 생성합니다.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const sourcePath = resolve(projectRoot, "src", "bookmarklet.js");
const outputDirectory = resolve(projectRoot, "dist");
const source = await readFile(sourcePath, "utf8");

new Function(source);

const compactSource = source
  .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "")
  .replace(/\r?\n\s*/g, " ")
  .replace(/[\t ]{2,}/g, " ")
  .trim();
const standaloneBookmarklet = `javascript:${compactSource}`;
const hostedScriptUrl = "https://kim-blackcow.github.io/piu-pumbility-bookmarklet/dist/pumbility-bookmarklet.js";
const loaderBody = `(()=>{const s=document.createElement("script");s.src="${hostedScriptUrl}?t="+Date.now();s.referrerPolicy="no-referrer";s.onload=()=>s.remove();s.onerror=()=>window.alert("펌빌리티 코드를 불러오지 못했습니다.");document.documentElement.append(s)})()`;
const bookmarklet = `javascript:${loaderBody}`;
const escapedBookmarklet = bookmarklet
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");
const serializedBookmarklet = JSON.stringify(bookmarklet).replaceAll("<", "\\u003c");
const serializedBody = JSON.stringify(loaderBody).replaceAll("<", "\\u003c");
const installer = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>펌빌리티 이미지 북마클릿 설치</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 80% 10%,#34306b 0,transparent 35%),linear-gradient(145deg,#111a2d,#090e19);font-family:Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif;color:#eef3ff}.card{width:min(760px,100%);padding:34px;border:1px solid rgba(143,169,235,.25);border-radius:24px;background:rgba(19,28,48,.94);box-shadow:0 24px 80px rgba(0,0,0,.45)}h1{margin:0 0 14px;font-size:28px}p{color:#b9c5df;line-height:1.75}.warning{padding:13px 15px;border:1px solid rgba(255,154,174,.28);border-radius:12px;background:rgba(122,35,58,.18);color:#ffc4cf;font-size:14px}.bookmark{display:flex;align-items:center;justify-content:center;min-height:58px;margin:22px 0 16px;border-radius:14px;background:linear-gradient(135deg,#4d8cff,#865eff);color:#fff;text-decoration:none;font-size:18px;font-weight:800;box-shadow:0 12px 32px rgba(78,118,255,.25);cursor:grab}.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.copy{width:100%;border:0;border-radius:12px;padding:13px 16px;background:rgba(255,255,255,.1);color:#fff;font:700 14px inherit;cursor:pointer}.copy:hover{background:rgba(255,255,255,.16)}.status{min-height:46px;margin-top:13px;color:#81ddff;font-size:14px;line-height:1.55}.note{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.09);font-size:13px;color:#8491ad}@media(max-width:600px){.card{padding:24px}h1{font-size:23px}.actions{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="card">
    <h1>펌빌리티 이미지 북마클릿</h1>
    <p>가장 쉬운 방법은 아래 보라색 버튼을 <strong>클릭하지 않고 북마크바로 끌어다 놓는 것</strong>입니다.</p>
    <p class="warning">전체 코드를 주소창에 바로 붙여 넣으면 브라우저가 Google 검색으로 처리합니다.</p>
    <a class="bookmark" draggable="true" href="${escapedBookmarklet}">펌빌리티 이미지 만들기</a>
    <div class="actions">
      <button class="copy bookmark-copy" type="button">새 북마크 URL용 복사</button>
      <button class="copy address-copy" type="button">주소창 실행용 본문 복사</button>
    </div>
    <div class="status" role="status" aria-live="polite"></div>
    <p class="note">공식 사이트에 로그인한 뒤 piugame.com 또는 www.piugame.com 안의 아무 페이지에서 북마크를 실행하세요. 짧은 북마클릿은 GitHub Pages에서 공개된 실행 코드를 불러오며, 기록과 로그인 정보는 외부 서버로 전송하지 않습니다.</p>
  </main>
  <script>
    const bookmarklet=${serializedBookmarklet};
    const body=${serializedBody};
    const status=document.querySelector(".status");
    const copy=async value=>{try{await navigator.clipboard.writeText(value)}catch{const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();document.execCommand("copy");area.remove()}};
    document.querySelector(".bookmark").addEventListener("click",event=>{event.preventDefault();status.textContent="이 버튼은 클릭하지 말고 북마크바로 끌어다 놓으세요."});
    document.querySelector(".bookmark-copy").addEventListener("click",async()=>{await copy(bookmarklet);status.textContent="복사했습니다. 주소창이 아니라 새 북마크의 URL 입력란에 붙여 넣으세요."});
    document.querySelector(".address-copy").addEventListener("click",async()=>{await copy(body);status.textContent="piugame.com 주소창에 javascript: 를 직접 입력한 다음, 바로 뒤에 복사한 본문을 붙여 넣고 Enter를 누르세요."});
  </script>
</body>
</html>
`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "pumbility-bookmarklet.txt"), `${standaloneBookmarklet}\n`, "utf8");
await writeFile(resolve(outputDirectory, "pumbility-loader.txt"), `${bookmarklet}\n`, "utf8");
await writeFile(resolve(outputDirectory, "pumbility-bookmarklet.js"), `${compactSource}\n`, "utf8");
await writeFile(resolve(outputDirectory, "install.html"), installer, "utf8");

process.stdout.write(`북마클릿 생성 완료: 로더 ${bookmarklet.length.toLocaleString("ko-KR")}자 / 독립형 ${standaloneBookmarklet.length.toLocaleString("ko-KR")}자\n`);
