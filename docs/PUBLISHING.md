# Xuất bản demo TÀN NGUYỆT

**Ngày:** 10/10/2026. **Trạng thái: PUB-01 DONE — đã xuất bản và kiểm tra public thành công.**

Người dùng cho phép Git, commit/push vào [gamingbite/TAN-NGUYET](https://github.com/gamingbite/TAN-NGUYET) và xuất bản demo tại **[https://tan-nguyet-game.vercel.app](https://tan-nguyet-game.vercel.app)**. Giữ tên repo và lịch sử remote; không triển khai gameplay v0.2 trong đợt này.

## Địa chỉ và dữ liệu chơi

- Game đang hoạt động: [tan-nguyet-game.vercel.app](https://tan-nguyet-game.vercel.app).
- Cảnh kỹ thuật cần giữ: [foundation.html](https://tan-nguyet-game.vercel.app/foundation.html).
- Kiểm source: [GitHub Actions](https://github.com/gamingbite/TAN-NGUYET/actions/workflows/verify-demo.yml).

Bạn bè chơi bằng trình duyệt PC, bàn phím/chuột. Đây là game chơi đơn; mỗi người có nhân vật/save riêng trong trình duyệt. Save local không tự xuất hiện trên website vì khác origin. Chuyển nhân vật bằng **Bản lưu & sao lưu → Xuất JSON**, sau đó chọn file trên bản web, xem trước và xác nhận khôi phục. Triển khai không đọc/xóa save thật của người dùng.

Project Vercel `tan-nguyet-game` thuộc scope tài khoản đã xác thực `hungmap478-4866`. Domain đã verified, deployment production READY; trình duyệt mới không đăng nhập nhận HTTP200 và chơi được. Không đổi tên repo/domain.

## Cấu hình và quy trình

[vercel.json](../vercel.json) giữ Vite, `npm ci --ignore-scripts`, `npm run build`, output `dist`. Không thêm SPA rewrite; `/foundation.html` là entry thật, asset thiếu phải trả lỗi. `.vercelignore` loại backup/cache/save/env/test/docs khỏi upload source; `.vercel/` nằm ngoài Git và snapshot local.

[verify-demo.yml](../.github/workflows/verify-demo.yml) chỉ kiểm source khi push code vào `main` hoặc chạy thủ công: Node22.20.0 → npm ci theo lock → TypeScript/build → Chromium → hai test deployment. Actions pin SHA; không chứa token Vercel hoặc job xuất bản Pages. Pages đã được chuẩn bị trước khi người dùng chọn Vercel, nhưng chưa deploy; workflow Pages đã thay bằng kiểm build.

Lần xuất bản này upload đúng artifact đã kiểm qua CLI Vercel63.1.2:

1. Sao lưu local, chạy `npm run verify`; giữ log và kết quả thật.
2. `npm exec --yes --package=vercel@63.1.2 -- vercel login`. Người dùng xác thực OAuth Device Flow; không chia sẻ mật khẩu/token trong chat.
3. Kiểm tài khoản/project; link bằng `vercel link --yes --project tan-nguyet-game --scope hungmap478-4866`. Không ghi đè project khác.
4. Tạo `.vercel/output/config.json` với `{"version":3}`, chép **chỉ nội dung dist** vào `.vercel/output/static/`. So hash mọi file, bảo đảm không có function/env/output cũ. Metadata này không commit.
5. `vercel deploy --prebuilt --prod` qua CLI đã pin. Không dùng `--public` (cờ này công khai source). Kiểm domain production đúng tên đã chốt.
6. Kiểm public bằng context mới không có cookie đăng nhập/bypass: HTTP, art/title/portrait, tạo nhân vật, di chuyển, menu, lưu/reload/Continue, cửa sổ hẹp và Foundation. Ghi URL/commit/deployment/CI và kết quả vào queue/nhật ký.

Push GitHub chưa tự cập nhật Vercel: Git integration chưa kết nối vì tài khoản Vercel thiếu GitHub Login Connection. CLI vẫn xuất bản được; quy trình hiện tại tách kiểm CI và xuất bản artifact, không cần người dùng cung cấp thêm token.

## Thay đổi phục vụ xuất bản

- Giữ Vite `base:'./'`; `ArtManifest.ts`, `PlayerArt.ts`, `B2PlayerSources.ts` dùng URL PNG tương đối `assets/...`. Không thay PNG/renderer/collider/gameplay.
- Test art giải URL manifest; `tests/deployment.spec.ts` kiểm build thật dưới prefix `/TAN-NGUYET/`, không alias root-assets/fallback che lỗi. Vercel root vẫn hưởng sửa này.
- Chỉ đưa source/asset/config/tài liệu cần thiết vào Git; loại dependencies/dist/cache/backup/browser save/env/`.vercel`.
- Remote ban đầu có một commit README; giữ làm cha lần upload source, không force-push/xóa lịch sử.

## Bằng chứng hiện có

- Backup trước sửa URL: `.local-backups/2026-10-10T07-31-53-482Z-before-github-pages-release-lhW7nL`,120file,exit0.
- Backup trước Vercel/harness: `.local-backups/2026-10-10T13-25-21-397Z-before-vercel-release-fix-Nn4tU4`,123file,exit0.
- BuildPASS/99regressionPASS; focusedhai journey gốc2/2PASS,exit0,5,2phút (Sword2,5/Mage2,7), gồm Boss/handin/save/Continue/freeplay. Đây là hai lệnh riêng; fullverify trước đó99PASS/2harnessFAIL được giữlog. Chỉ giảm ảnhcanvas trace, bỏ các thử thay thao tác. CI đầu buildPASS nhưng testprefix tổng hợp chạm30s; chỉnh timeout riêng90s/giữassertion và thêm log/failureartifact. Localdeployment sau chỉnh2/2PASS,9,9s.
- Vercel deployment **dpl_2xbETaXGWPcHB68dvHKjY8iS5SLp**, READY/production; [trang deployment](https://vercel.com/hungmap478-4866/tan-nguyet-game/2xbETaXGWPcHB68dvHKjY8iS5SLp). Upload29,7MB,28filedist hashkhớp, khôngsource/env/backup. Productionalias đúng `tan-nguyet-game.vercel.app`.
- Source đãpush **450af3575c64705d458b4761ccc200be59dc6ff2**, sauCIfix là **d437859e0b4d4dce77b53ea0517ac103efda69f6**. [CI38057331477](https://github.com/gamingbite/TAN-NGUYET/actions/runs/38057331477) SUCCESS: npmci/typecheck/build/Chromium/hai deploymenttest. Giữrunđầuthấtbại làm bằng chứng, khôngxóa lịch sử.
- PublicQA **6/6stagePASS,exit0**,10/10 lúc20:52+07:00, contextEdge mới khôngcookie/login/bypass:HTTP200/title/bốnportrait,98worldframes/384B2/14PNG200/0missing; WASD/menu/save/reload/Continue;1366×768 và500×800/help;Foundation.64request/64response,0pageerror/HTTPfail/requestfail/outboundhost. Bốnảnh trong `.cache/qa/2026-10-10-publish/`; `public-check.json`, `release-result.json` ghi bằng chứng. Không mở/xóa browser save thật.
- CLI tạo `.env.local` OIDC khilink; không đọc/in/upload, Gitignore/backup loại. Gitintegration tựdeploy chưa nối (thiếuGitHubLoginConnection); cập nhậtwebsite tiếp theo vẫn dùng quy trìnhprebuilt đãnêu.


Nếu deployment lỗi, giữ artifact/log và sửa nguyên nhân cụ thể. Khôi phục code bằng commit sửa/revert đã kiểm; không force-push hoặc xóa save/backup.

Nguồn chính thức: [Vercel Vite](https://vercel.com/docs/frameworks/frontend/vite), [CLI login](https://vercel.com/docs/cli/login), [prebuilt deployment](https://vercel.com/docs/cli/deploy), [Build Output API](https://vercel.com/docs/build-output-api/primitives), [Vite deployment](https://vite.dev/guide/static-deploy.html).
