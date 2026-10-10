# TÀN NGUYỆT — AI TASK QUEUE & RESUME

**Phiên bản:** 1.9 — 10/10/2026
**Dành cho:** Codex / AI Game Director / AI QA / AI Art Reviewer  
**File theo dõi đang dùng:** `D:\RPG GAMES\docs\AI_NEXT_TASKS.md`  
**Nguồn:** Kiểm tra bản `RPG GAMES.zip` ngày 09/10/2026, `AGENTS.md`, `README.md`, `docs/ART_PROGRESS.md`, `docs/DEMO_CHECK.md`, `docs/DEVELOPMENT_PLAN.md`.

> **Mục tiêu:** Mỗi lần người dùng mở lại Codex sau khi hết hạn mức/token, AI đọc file này, biết việc đã làm và tiếp tục **một hạng mục nhỏ chưa hoàn tất**, không làm lại việc cũ, không tự mở rộng phạm vi. **File này không tự khởi chạy AI** khi hạn mức phục hồi: người dùng cần mở lại Codex và gửi prompt ở cuối tài liệu.

---

## Tiến độ phiên hiện tại

- [x] **PUB-01 DONE — GitHub/Vercel,10/10:** [Game public](https://tan-nguyet-game.vercel.app), [source](https://github.com/gamingbite/TAN-NGUYET). Codecommit `d437859e0b4d4dce77b53ea0517ac103efda69f6`; [CI38057331477](https://github.com/gamingbite/TAN-NGUYET/actions/runs/38057331477) SUCCESS. Verceldeployment `dpl_2xbETaXGWPcHB68dvHKjY8iS5SLp` READY/production, đúngdomain. Localbuild/99regressionPASS; focusedhai journey2/2PASS,exit0,5,2phút; deployment2/2PASS,9,9s. Public6/6stagePASS bằngbrowserkhôngcookie:HTTP200/art14PNG/di chuyển/menu/save/reload/Continue/fullviewport/Foundation,0JS/HTTP/requesterror;4ảnh. Không gọi hai lượtlocal riêng thànhfullverify101PASS; giữloglỗi cũ. [Bàn giao](PUBLISHING.md), `.cache/qa/2026-10-10-publish/release-result.json`. Không còn test/server cần nối; v0.2/P1 chưa triển khai.
- **Thứ tự hiện tại:** PUB-01 đãDONE. Chờ yêu cầu phát triển tiếp; khi được giao thì V02-00/P0-03 theo probe cũ, không làm lại town/B2/UI hoặc tự mở P1/v0.2. Git/push/Vercel vẫn được phép trong repo/domain đã chốt; mỗi bản mới phải backup/kiểm tra và ghi trạng thái thật.

### Mốc lập kế hoạch đã hoàn thành trước yêu cầu xuất bản

- [x] **V02-PLAN — Lập kế hoạch giai đoạn sau, 10/10:** người dùng xác nhận “demo vậy là oke rồi hãy lên plan vào giai đoạn tiếp theo”. Demo hiện tại/Tro Tàn được chấp nhận làm nền; [kế hoạch v0.2 PvE](NEXT_PHASE_PLAN_V0_2.md) đã lập từ GDD và source hiện có. Phiên này chỉ sửa tài liệu, chưa triển khai gameplay v0.2, chưa mở P1/P2. Kết quả99/99 dưới đây thuộc lượt verify trước phiên lập kế hoạch.
- **Đề xuất kế tiếp:** V02-00 chốt QA v0.1 → V02-01 thiết kế/dữ liệu/migration → V02-02 Cung Thủ → V02-03 Tu Sĩ → V02-04 một NPC đồng hành → V02-05 một nhánh PvE nhỏ → V02-06 cân bằng/nghiệm thu. **V02-00…06 đều TODO; phạm vi triển khai chưa chốt.** Khi được giao triển khai tiếp, bắt đầu P0-03 từ probe cũ; không làm lại town/B2/UX, không tự thêm Class từ yêu cầu chỉ lập kế hoạch.
- **Duyệt đã nhận:** demo và thị trấn hiện tại được người dùng chấp nhận ngày10/10. P0-10 đã có phần duyệt; P0-03/04/05 và phần tổng hợp kỹ thuật P0-10 vẫn cần bằng chứng riêng, không tự DONE vì lời duyệt.

### Mốc thị trấn đã hoàn thành trước phiên lập kế hoạch

- **Hoàn thành10/10: Tro Tàn TOWN-00 → TOWN-03 + TOWN-05 nghiệm thu P0, giữ khung hình hiện tại.** Verify mới99/99passed/0failed,exit0,11phút. Không làm lại B2/UI/làng hoặc mở TOWN-04/P1. [Ảnh trước/sau](../.cache/qa/2026-10-10-town/review.html), [báo cáo](TOWN_UPGRADE_REPORT.md).
- [x] **TOWN-00 — Audit/baseline:** 15 nhà, 8 dân, 5 NPC, 11 object, 9 path, 43 obstacle; backup 116 file tại `.local-backups/2026-10-10T06-37-52-353Z-before-town-visual-upgrade-ujDBXT`; build exit0, smoke 9/9 exit0. [12 ảnh trước](../.cache/qa/2026-10-10-town/before/result.json), cùng viewport1366×768/zoom2.048 ngày–đêm; overview QA riêng. `CODEX_TOWN_BUILD_PROMPT.md` không có, không tìm thấy bản tên khác; tiếp tục theo yêu cầu trực tiếp/Town Guide/AGENTS/GDD.
- [x] **TOWN-01 — Quảng trường/đường/biển/đèn:** `TownVisuals.ts` mới nối qua `VillageLife.ts`, không sửa map/camera/UI. Build exit0; village/navigation/art9/9 passed,14giây,exit0. Log `town-01-build.log`/`town-01-tests.log` trong `.cache/qa/2026-10-10-town/`;12ảnh trung gian đã chụp.
- [x] **TOWN-02 — Chợ/rèn/giả kim/quán trọ:** hàng chợ/sạp nhỏ/cờ, giá kiếm/thùng/ánh lò/tia lửa, thuốc/rune/hơi, ghế/thảm quán trọ. Build exit0; art/village/nghề/NPC đêm10/10passed,39giây,exit0. Sửa lớp dusk town fillAlpha0 gây đêm không hiện; bake nền tĩnh thành một texture nearest dùng lại. Backup117file `before-town-02-workshops-VnEYiz`.
- [x] **TOWN-03 — Cổng Đông/hoàn thiện:** trụ/đèn/biển rừng/đường ngưỡng/hoa bên lề đã nối; build và village/navigation/guide11/11passed,49,9giây,exit0. Backup117file `before-town-03-east-gate-ES0ZGt`. Ảnh cuối12ảnh + lifecycle3vòng + gallery12case đạt. Hai fulljourney mới đã passed trong lượtverify cuối99test: Kiếm Sĩ3,1phút/Pháp Sư3,1phút, có đường thị trấn→rừng→Boss→quay về/nộp/save/Continue/chơi tiếp.
- [x] **TOWN-05 — Nghiệm thu P0:** `npm run verify` source cuối99/99passed,0failed,exit0,11phút; session35830 đã kết thúc. [Log](../.cache/qa/2026-10-10-town/verify.log), [kết quả](../.cache/qa/2026-10-10-town/result.json). 12ảnh sau/0runtimeerror,48vật art pause/cleanup3vòng đạt; gallery12case/24PNG đạt; source/camera/map/save/PNG được so snapshot,0file mất. TOWN-04/P1 chưa mở; người dùng đã chấp nhận demo hiện tại10/10.
- **Bàn giao kỹ thuật:** P0-03 theo probe cũ5context, rồiP0-04/05/10 được đưa vào V02-00 của kế hoạch mới; không tự DONE các checklist cũ từ99test hoặc mởP1. Không còn server/test đang chạy cần nối lại.

### Mốc B2 đã hoàn thành trước yêu cầu thị trấn

- **Hoàn thành10/10,13:00 +07:00: ART-B-02 vàP0-09 DONE.** Người dùng đã “duyệt tất cả và tích hợp vào game”; A/B2/C/D approved, không chờ duyệt lại. Tám PNG B2/384base/sáu state/bốn hướng và portrait cùng renderer đã nối; game phủ cửa sổ web, HUD/chỉ hướng/kỹ năng trong game, menu☰góc phải trên chứa chức năng/hướng dẫn/cài đặt; chữ rõ hơn,làng15nhà/8dân trang trí. Không mởP1 khác.
- **Verify source cuối: `npm run verify` exit0,97/97passed,Playwright11,4phút.** Hai fulljourney mới hoàn chỉnh: Kiếm Sĩ3,2phút,Pháp Sư3,1phút,đếnBoss/nộp/save/Continue/chơi tiếp; các hồi quy B2/UI/làng/save đạt. QA UI21ảnh/bốn kích thước/đổiClass/lưu/fullscreen đạt,0pageerror/outbound/HTTPfail; curated384base/12nhận diện đạt. [Log cuối](../.cache/qa/2026-10-10-b2-regression/verify-complete.log), [UI QA](../.cache/qa/2026-10-10-b2-regression/ui-final/result.json), [ảnh game](../.cache/qa/2026-10-10-b2-regression/ui-final/game-1920x1080.png). Hai lượt lỗi87/9 và95/1 được giữ riêng; không dùng focused thay kết quả cuối.
- Backup trước tích hợp91file: `.local-backups/2026-10-09T13-21-36-512Z-before-b2-fullscreen-village-DPiLcl`; trước sửa hồi quy114file: `.local-backups/2026-10-10T05-16-57-086Z-before-b2-village-regression-fix-etvlkF`; trước sửa đọc HUD115file: `.local-backups/2026-10-10T05-40-51-488Z-before-mage-journey-harness-fix-AyWzLD`; cả ba exit0. Có content diff/hash local, không Git. GDD/package/lock/config/Foundation/model/runtime/asset cũ giữ nguyên; nhật ký append-only. Server QA4174 đã dừng; preview4173 của test tự đóng khi verify kết thúc.
- **Task tiếp theo: P0-03**, tiếp tục đúng probe năm context đã bàn giao, không làm lại UX-01/P0-02/ART-B-02/P0-09. Sau đóP0-04/05/10. Chưa phải toàn bộP0 hoàn thành; không tự chuyểnP1 hoặc triển khai công khai.

- **Các mốc đã có, không làm lại:** P0-01/02/06/07/08/09,UX-01 vàART-B-02 DONE. Baseline68test,player v1 có16tình huống/276texture; sau chỉ hướng verify83/83exit0 và probe5tình huống/119mẫu; sauB2/UI/làng verify97/97exit0. Bằng chứng riêng ở [nhật ký](AI_SESSION_LOG.md).
- Bộ xem [A–D](../.cache/art-review/2026-10-09/index.html) và [B2](art-review/2026-10-09-b2/index.html) được giữ. Bv1 bị yêu cầu sửa; B2 sau đó đã được duyệt cùng A/C/D. Năm bảng B2 là concept/keypose/tham chiếu, không phải atlas game. Runtime dùng tám PNG production riêng, giữ nguồn/prompt và metadata reuse/mirror.
- `docs/Town_Planning_Guide.md` ban đầu là đề xuất từ ZIP5nhà, xuất hiện độc lập trong đợt B2. **Người dùng đã yêu cầu triển khai trực tiếp ngày10/10**; nay đối chiếu15nhà/8dân và source hiện tại trước khi thực hiện TOWN P0. Không tự mở TOWN-04/P1.

## A. Trạng thái project (không xây lại từ đầu)

- Project đã có: Phaser 3.90.0, TypeScript 5.9.3, Vite 8.3.3, Playwright.
- Gameplay hiện có: tạo 4 chủng tộc; Kiếm Sĩ/Pháp Sư; 3 khu (thị trấn/rừng/hầm ngục); NPC, nhiệm vụ, đào quặng, chế tạo/mua bán, quái/Boss 2 pha, lưu/tải và tiếp tục chơi sau khi nộp nhiệm vụ Boss.
- **Kết quả hồi quy mới nhất nằm ở mục tiến độ phía trên**, không dùng mốc83test để nghiệm thu thay đổi B2/UI/làng. Checklist terrain/fog, NPC/props/icon và quái/Boss vẫn giữ phạm vi kiểm tra riêng.
- Source đã nối B2 sáu trạng thái/bốn hướng, portrait cùng renderer, UI phủ cửa sổ và làng15nhà/8dân trang trí. A/B2/C/D approved thiết kế. V1/procedural giữ làm fallback; có pose B2 dùng lại/lật đã ghi metadata, không gọi384output là384hình độc lập. Maplogic/save/collider người chơi/timing combat giữ nguyên; nhà thêm trên lô cỏ có footprint riêng, không dời đường/NPC/cổng/mỏ cũ.
- `AGENTS.md` cập nhật10/10: **được dùng lạiGit/commit/push vào repo `gamingbite/TAN-NGUYET` và xuất bản demo qua Vercel tại `https://tan-nguyet-game.vercel.app`** theo yêu cầu trực tiếp. Giữ backup/lịch sử/save và loại bí mật/cache/generated khỏiGit; không force-push hoặc tự uploaddịchvụ khác.
- **Không tạo lại Phaser/Vite, không chuyển engine, không thêm Multiplayer, NPC đánh thuê, bang hội, PvP, đấu giá, hệ thống server.** Các thứ này thuộc bản sau.

## B. Luật tự tiếp tục sau khi hết token

1. **Đọc theo thứ tự:** `AGENTS.md` → `docs/AI_NEXT_TASKS.md` → `docs/AI_SESSION_LOG.md` (nếu có) → `docs/ART_PROGRESS.md` → `docs/DEMO_CHECK.md` → `docs/DEVELOPMENT_PLAN.md` → file mã nguồn liên quan.
2. **Xác nhận trạng thái thật:** đọc kết quả kiểm tra cuối và tài liệu/hình chụp đã có; không xem `[x]` là đủ nếu không có bằng chứng. Nếu file đã thay đổi từ phiên trước, kiểm tra lại phạm vi liên quan.
3. **Chọn một task `TODO` cao nhất** chưa bị chặn; nếu đang có task `DOING` dở dang, tiếp tục task đó trước. Nếu lệnh verify đang lỗi, sửa đúng lỗi cản trở verify trước khi làm mỹ thuật mới.
4. Trước khi sửa source/asset/config, chạy `npm run backup -- before-<task-id>` theo quy tắc hiện tại. **Không sửa khi nhiệm vụ chỉ yêu cầu kiểm tra.**
5. Chỉ sửa phần nhỏ liên quan đến task; chạy kiểm tra phù hợp. Không tuyên bố `PASS` nếu chưa chạy. Không tự xóa save trình duyệt hoặc file dự phòng.
6. Cuối phiên **luôn cập nhật**: trạng thái checkbox bên dưới, ngày/giờ, file đã đọc/sửa, kiểm tra đã chạy + kết quả, lỗi/ảnh minh chứng, task tiếp theo vào `docs/AI_SESSION_LOG.md` (tạo mới nếu thiếu). Dùng file log để AI khác và phiên sau đọc tiếp.
7. Nếu chưa chắc nên thay art, thay gameplay, đổi quy tắc GDD hoặc có nguy cơ mất dữ liệu, ghi `BLOCKED – chờ chủ project quyết định` và chuyển sang task độc lập khác. Không tự giả định người dùng đã duyệt.
8. Nếu hết ngữ cảnh/token trong lúc làm, ưu tiên **ghi bàn giao trước khi kết thúc**; không tuyên bố xong nếu chưa test. Không yêu cầu làm lại toàn bộ backlog ở mỗi phiên.

**Quy ước trạng thái:** `[ ] TODO`, `[~] DOING`, `[x] DONE (có bằng chứng)`, `[!] BLOCKED`. Ở mỗi thời điểm tối đa 1 task chính `DOING` để tránh xung đột. Các trạng thái dưới đây mặc định là việc cần **kiểm tra bản mới nhất**, không khẳng định chức năng chưa được code.

---

## C. Hàng đợi công việc cho Demo v0.1

### Yêu cầu trực tiếp đã hoàn thành

- [x] **ART-B-02 · Tích hợp art đã duyệt, giao diện trong game và làng** — `Art / UI / QA`, theo phản hồi trực tiếp 09/10/2026.
  - Làm rõ bốn chủng tộc Con Người/Tinh Linh/Người Lùn/Thú Nhân trong dân thường và hai Class Kiếm Sĩ/Pháp Sư; nâng chất liệu, silhouette và chi tiết có thể đọc ở kích thước chơi. Chuẩn bị bản art B v2 để duyệt, gồm Hurt/Death/Dodge cùng các trạng thái phù hợp đang có; dân thường không tự có đòn chiến đấu.
  - **Đạt10/10:** tám PNG production RGBA nguyên nguồn,384base/12nhận diện,1.152texture runtime; Hurt/Death/Né bốn hướng,ngoại hình/loadout/portrait/pause/hồi sinh/fallback đã kiểm. Metadata đo crop/anchor riêng và ghi reuse/mirror; không coi384output là384hình độc lập. Năm bảng concept được giữ làm tham chiếu.
  - Game fullweb/Scale.RESIZE,camera giữ tỷ lệ; HUD/menu/hướng dẫn/cài đặt trong vùng chơi,chữ UI12–16px trở lên. Làng15nhà/8dân trang trí,vườn/sân/cờ/khói/đèn; giữ đường/NPC/cổng/mỏ/collider người chơi/save/timing combat. Verify97/97exit0;UI QA21ảnh/bốn viewport đạt. Lỗi modal500×800 và lỗi harness đã sửa có regression/bằng chứng trước-sau. [Manifest](art-review/2026-10-09-b2/manifest.json), [biên bản](DEMO_CHECK.md).
  - Ba backup91/114/115file trước các lần chỉnh source ở mục tiến độ; bản71file trước trình concept vẫn giữ. P0-02 DONE cho v1, B2 có QA riêng; không làm lại từ đầu hoặc mởP1.

- [x] **UX-01 · Chỉ hướng nhiệm vụ** — `Gameplay / UI`, người dùng yêu cầu 09/10/2026.
  - Bảng mục tiêu hiện tại và mũi tên hướng tới bước kế tiếp; cập nhật theo tiến độ, vị trí NPC và chuyển khu. Dùng đường tránh vật cản hiện có; giữ bản đồ, quest, save và phạm vi demo.
  - **Đạt:** đúng NPC/quặng/phong ấn/quái nhiệm vụ/Boss/cổng và đường trở về nộp; ẩn sau kết thúc. Đã sao lưu `before-quest-guidance`; build + **83 test đạt**, gồm 15 test mới và hai full journey. Runtime WASD tới Boss/quay ra, NPC đêm và đổi Class đạt; đã sửa mũi tên mất tại góc cửa, giữ regression và bằng chứng trước/sau. [Kết quả](../.cache/qa/2026-10-09-quest-guidance/result.json), [log verify](../.cache/qa/2026-10-09-quest-guidance/verify.log), [ảnh bắt đầu](../.cache/qa/2026-10-09-quest-guidance/route-run03/initial-guide-start.png).

### P0 — Ổn định bản đang có, làm trước mọi tính năng mới

- [x] **P0-01 · Baseline runtime & test** — `QA / Programmer`
  - Kiểm tra `node --version`, `npm --version`, `package.json`, đường dẫn project; chạy `npm run verify` trên **Windows và bản source đang dùng**. Nếu test thất bại, ghi tên test, stack trace, môi trường và phân loại lỗi setup hay code; chỉ sửa lỗi khi đã khoanh vùng.
  - **Đạt khi:** có file log/đoạn kết quả thật của build + test; số test pass/fail; không mượn kết quả lịch sử 08/10 để kết luận 09/10.
  - **Bằng chứng 09/10:** Node v22.20.0, npm 10.9.3, Edge 154.0.4258.62; TypeScript + Vite build đạt, 68 passed / 0 failed, exit 0. [Log thật](../.cache/qa/2026-10-09-P0-01/verify.log), [kết quả/thời gian](../.cache/qa/2026-10-09-P0-01/result.json).

- [x] **P0-02 · Kiểm tra atlas người chơi** — `Art Reviewer / QA`
  - Chạy game; xem 4 chủng tộc, 4 hướng, đứng/đi/tấn công. Đổi Kiếm Sĩ ↔ Pháp Sư **ngoài chiến đấu**; kiểm tra tóc/da/trang bị và điểm neo chân. Quan sát nhấp nháy, lệch crop, giật frame, đè sprite, biến mất nhân vật.
  - **Đạt khi:** có checklist/runtimescreenshot cho các trường hợp cần thiết, không mất key/frame, không thay đổi collider chỉ vì hình ảnh.
  - **Bằng chứng 09/10:** Edge 154.0.4258.62, runtime probe exit 0: 16 tình huống, 276 texture thực tế; ma trận chính 176 texture (48 civilian đứng/đi + 64 Kiếm Sĩ + 64 Pháp Sư), 48 cặp walk1/walk2 khác nhau, thiếu/cảnh báo/pageerror 0. Sprite 32×42 và collider 12×12/offset 10,29 giữ nguyên qua 11.584 frame quan sát; đổi Class, trang bị và pause đạt. [Kết quả](../.cache/qa/2026-10-09-P0-02/run02/result.json), [contact sheet Kiếm Sĩ](../.cache/qa/2026-10-09-P0-02/run02/primary-swordsman.png), [ngoại hình mẫu](../.cache/qa/2026-10-09-P0-02/run02/appearance.png). Giới hạn tổ hợp màu/loadout và tóc dài procedural ghi rõ trong nhật ký; art chưa approved.

- [ ] **P0-03 · Khả năng đọc địa hình, sương mù và đường đi** — `Art Reviewer / QA`
  - Kiểm tra thị trấn, rừng, hầm ngục; nhìn rõ người chơi, NPC, quặng, cổng, đường đi, vật cản và quái trên nền mới. Fog không che kín dấu hiệu tương tác hoặc làm lẫn đường với tường. Chỉ điều chỉnh palette/alpha/layer/contrast có bằng chứng gây khó nhìn.
  - **Đạt khi:** có ảnh before/after nếu đã chỉnh, đi qua các lối hợp lệ được, không xuyên tường hay chặn lối cũ.
  - **Tạm nhường ưu tiên theo yêu cầu nâng cấp B, chưa DONE và không mất tiến độ:** đã rà tĩnh terrain/depth/fog, giữ ảnh ba khu ban ngày và `.cache/qa/2026-10-09-P0-03/`; probe năm tình huống chưa được tạo/chạy. Sau ART-B-02 tiếp tục WASD/E thật trong năm context thị trấn/rừng ngày–đêm/dungeon, fog trước/sau, save/Continue giữ discovery và góc nhà/cây/cửa. Không lặp UX-01/P0-02 khi source liên quan không đổi; xem bàn giao 19:54 trong nhật ký.

- [ ] **P0-04 · NPC, props và icon vật phẩm** — `Art Reviewer / QA`
  - Kiểm tra 5 NPC, frame idle/blink, vị trí trạm rèn/giả kim, quầy hàng, quặng, phong ấn, cổng. Kiểm tra icon thật của vật phẩm trong túi, cửa hàng, tooltip, số lượng/giá; fallback khi thiếu ảnh. **Không biến icon chuẩn bị thành vật phẩm thật.**
  - **Đạt khi:** toàn bộ NPC, trạm nghề và các icon đang dùng rõ, tương tác được, không đè chữ/hộp UI; lưu ảnh lỗi nếu có.

- [ ] **P0-05 · Animation quái và Boss** — `QA / Programmer`
  - Thử ba loại quái, aggro, đuổi người chơi, né vật cản, hit/flash; Boss cả hai pha, cảnh báo đòn/telegraph, đạn tỏa, chết và chiến lợi phẩm. Kiểm tra animation không khiến hitbox khác logic hoặc đánh trúng xuyên tường; pause không làm sai thời gian animation.
  - **Đạt khi:** cơ chế combat vẫn nhất quán, Boss hạ được bằng gameplay bình thường, không có lỗi runtime; ghi test/manual evidence.

- [x] **P0-06 · Full journey Kiếm Sĩ** — `QA`
  - Tạo nhân vật mới → gặp Trưởng làng An → đào 3 quặng → gặp Thợ rèn Lâm chế tạo → học Kiếm Sĩ tại Sư phụ Dạ → rừng/giải quyết phong ấn → hầm ngục/đánh Boss → về thị trấn nộp nhiệm vụ → đi lại và chơi tự do.
  - **Đạt khi:** không dùng debug/cheat để bỏ qua bước; quest/XP/loot/thưởng/cảnh chuyển đúng; có bằng chứng test mới nhất.
  - **Bằng chứng 09/10:** test #22 `tests/journey.spec.ts:103` đạt trong 2,5 phút bằng phím/chuột/UI thật, không tiêm tiến độ; kiểm tra Boss phase 2/telegraph, nộp quest, Continue và replay. [Ảnh nộp nhiệm vụ](../.cache/qa/2026-10-09-P0-01/previews-after/swordsman-ending.png); log chung của P0-01 và test model kiểm tra thưởng/XP/giao dịch.

- [x] **P0-07 · Full journey Pháp Sư** — `QA`
  - Làm lại toàn bộ đường đi với Pháp Sư; kiểm tra đánh thường, kỹ năng, MP, hồi chiêu, cự ly/va chạm đạn và hạ Boss bằng Pháp Sư.
  - **Đạt khi:** hoàn thành Boss và nộp nhiệm vụ; không lỗi riêng Class/animation/gameplay.
  - **Bằng chứng 09/10:** test #23 `tests/journey.spec.ts:103` đạt trong 2,5 phút, dùng đánh thường/hai kỹ năng/thuốc HP/MP, Boss hai phase, nộp quest, Continue và replay; không pageerror. [Ảnh nộp nhiệm vụ](../.cache/qa/2026-10-09-P0-01/previews-after/mage-ending.png). Các test cooldown/đường đánh cũng đạt; rà từng frame art vẫn thuộc P0-02/05.

- [x] **P0-08 · Save/Load & bảo toàn dữ liệu** — `QA / Programmer`
  - Kiểm tra lưu thủ công, Continue, bản mới chưa lưu không ghi đè bản cũ, xuất JSON, xem trước khi nhập, xác nhận khôi phục, lịch sử backup giữ lại, lưu inventory/equipment/quest/điểm khám phá sau chuyển cảnh và reload. Test không được xóa save của chủ project.
  - **Đạt khi:** dữ liệu gốc không mất, các trường hợp lỗi version/JSON có thông báo và giữ được bản cũ; các test liên quan qua.
  - **Bằng chứng 09/10:** `demo`, `polish-ui`, `save-transfer`, `state`, hai journey và `world` đều đạt trong verify: lưu/Continue, nhân vật mới chưa lưu, export/preview/restore, giữ mọi backup, lỗi JSON/version/quota, hồi sinh/chuyển cảnh và phong ấn đang dở. Test dùng context Playwright biệt lập và MemoryStorage; không mở hoặc xóa save trong profile Edge chủ project. Chi tiết test và bảo toàn file ở nhật ký.

- [x] **P0-09 · UI/responsive và trải nghiệm thật** — `QA / Art Reviewer`
  - Chơi tại 1280×720, 1366×768, 1920×1080 và một cửa sổ hẹp; kiểm tra không tràn, không che canvas, tiếng Việt dễ đọc, hướng dẫn `H`, nhiệm vụ `J`, bảng túi đồ/đổi Class/mua bán, màn hình đầu và fullscreen.
  - **Đạt khi:** đọc được nội dung, không click nhầm, không lỗi JS/console mới; có screenshot đối chiếu.
  - **Đạt10/10 trên build sau sửa modal:** Edge1280×720/1366×768/1920×1080/500×800,21ảnh; canvas phủ cửa sổ, HUD không tràn/chồng nhau, nền HUD nhận click xuyên đúng, B2portrait32×42, phông12px trở lên. Menu/help/settings/inventory/quests/craft/map/save-data, đổi Class bằng nút thật, lưu Class/loadout, vào/thoát nativefullscreen đạt;0pageerror/outbound/HTTPfail. Đã sửa icon☰che nút đóng modal500×800 bằng stacking phạm vi utility panel; regression mới mở/đóng cả bảy bảng bằng pointer không force đã đạt. [Kết quả](../.cache/qa/2026-10-10-b2-regression/ui-final/result.json), [game1920](../.cache/qa/2026-10-10-b2-regression/ui-final/game-1920x1080.png), [settings500sau sửa](../.cache/qa/2026-10-10-b2-regression/ui-final/settings-500x800.png). Lỗi/ảnh trước sửa được giữ trong cùng thư mục.

- [ ] **P0-10 · Chốt bản ổn định + gửi người dùng duyệt art** — `Game Director`
  - Chạy lại `npm run verify` sau các thay đổi thực tế; cập nhật `docs/ART_PROGRESS.md` và `docs/DEMO_CHECK.md`. Nhóm art chỉ đánh dấu `integrated` nếu có kiểm chứng runtime; đánh dấu `approved` **chỉ khi người dùng duyệt**. Tổng hợp còn lỗi nào thực sự cản chơi thử.
  - **Đạt khi:** có kết quả test cuối, danh sách lỗi còn lại, link/đường dẫn screenshot cục bộ và cách chạy demo; chưa tự triển khai công khai.
  - **Cập nhật10/10:** người dùng đã chấp nhận demo hiện tại/Tro Tàn. Verify99/99 và gallery đã có; phần tổng hợp kỹ thuật cùngP0-03/04/05 còn giữTODO trong V02-00. Không cần hỏi duyệt lại cùng bản art hoặc chạy verify lại chỉ vì sửa tài liệu kế hoạch.

### P1 — Chỉ làm khi P0 đã ổn và dựa trên lỗi hoặc phản hồi thật

- [ ] **P1-01 · Sửa UX gây khó chơi** — `Gameplay / UI`: chỉ giải quyết điểm bị người dùng thấy khó hiểu: gợi ý tương tác, hiển thị nhiệm vụ, đường đi, phản hồi nút và lời thoại. Có repro và test trước/sau.
- [ ] **P1-02 · Cân bằng nhịp độ demo** — `Game Designer / QA`: ghi số lần chết, thời gian đánh Boss, lượng thuốc, giá quặng/loot. Chỉ điều chỉnh từng thông số thử nghiệm sau khi chơi thử, không ghi chúng thành luật GDD vĩnh viễn.
- [ ] **P1-03 · Tối ưu hiệu năng có số đo** — `Performance`: đo FPS/frame time, bộ nhớ, thời gian tải tại 3 khu; chỉ sửa đúng nút thắt đã đo. Không chuyển engine hoặc refactor đại trà vì build cảnh báo chunk.
- [ ] **P1-04 · Hoàn thiện âm thanh và phản hồi thao tác** — `Audio / Gameplay`: kiểm tra mute/volume, âm hit/né/loot/victory và rung/số sát thương hiện có. Chỉnh nếu thiếu thông tin phản hồi; không làm soundtrack lớn khi chưa được yêu cầu.
- [ ] **P1-05 · Tổng kết demo & tài liệu cho lần thử tiếp** — `Director / QA`: cập nhật README, hướng dẫn mở game, điều khiển, giới hạn demo, known issues; chuẩn bị biểu mẫu ngắn để người dùng chấm mức vui/khó nhìn/khó điều khiển.

### P2 — Tuyệt đối chưa tự thực hiện

Danh sách này giới hạn việc mở rộng **v0.1**. Cung Thủ/Tu Sĩ và một NPC đồng hành nay có trong [đề xuất v0.2](NEXT_PHASE_PLAN_V0_2.md); lập kế hoạch chưa phải cho phép triển khai. Các mục còn lại không tự chuyển vào v0.2.

- Multiplayer, máy chủ, đăng nhập/tài khoản, đồng bộ save online.
- Bang hội, bang chiến 5v5, PvP, chợ giao dịch người chơi.
- NPC đánh thuê, AI đồng hành phức tạp, thêm thành phố/vương quốc lớn.
- Class 3/4, tiến hóa Class, hệ thống cường hóa và buff mở rộng ngoài những gì đã code.
- Refactor kiến trúc lớn, thay Phaser/Vite, sinh hàng trăm asset không có mục tiêu demo.

**Điểm dừng:** Khi P0 hoàn thành và không có lỗi cản trở vòng chơi dân thường → Boss → nộp quest → chơi tự do, **dừng mở rộng tính năng**. Gửi người dùng thử game và chờ phản hồi/ưu tiên mới. P1 không tự khởi động nếu người dùng chưa đồng ý.

---

## D. Mẫu ghi vào `docs/AI_SESSION_LOG.md` sau mỗi phiên

Tạo file nếu chưa có và **ghi thêm một mục**, không xóa lịch sử cũ:

```md
# Nhật ký phiên AI — TÀN NGUYỆT

## [YYYY-MM-DD HH:mm] Phiên số N
- Task ID: P0-xx
- Trạng thái cuối: TODO / DOING / DONE / BLOCKED
- Đã đọc: ...
- Đã làm: ...
- File đã thay đổi: ... (hoặc Không)
- Backup local trước khi sửa: ... (hoặc Chưa sửa)
- Lệnh/kiểm tra đã chạy: ...
- Kết quả THỰC TẾ: PASS / FAIL / CHƯA CHẠY (số lượng test, lỗi nếu có)
- Ảnh/log minh chứng: ... (hoặc Chưa có)
- Vấn đề chưa giải quyết: ...
- Task tiếp theo: P0-yy, thao tác đầu tiên cần làm ...
- Cần chủ project duyệt gì?: ... (hoặc Không)
```

> Khi đánh dấu `[x] DONE`, ghi rõ bằng chứng trong nhật ký; không ghi đạt chỉ vì đã có mã nguồn hoặc vì README nói đợt cũ đạt.

## E. Prompt để dán vào Codex mỗi lần token/hạn mức được dùng lại

```text
TIẾP TỤC DỰ ÁN TÀN NGUYỆT, KHÔNG LÀM LẠI TỪ ĐẦU.

Thư mục local: D:\RPG GAMES

1. Đọc AGENTS.md, docs/AI_NEXT_TASKS.md và docs/AI_SESSION_LOG.md (nếu có).
2. Đọc docs/ART_PROGRESS.md, docs/DEMO_CHECK.md và file mã nguồn liên quan đến task kế tiếp.
3. Xem task nào đang DOING hoặc chưa DONE trong danh sách P0, kiểm tra trạng thái thực tế rồi tiếp tục đúng task đó.
4. Làm một task nhỏ đến mức kiểm chứng được; chỉ sửa code khi có lý do rõ. Nếu cần sửa thì backup local trước.
5. Chạy build/test tương ứng, ghi chính xác kết quả. Nếu có lỗi, ưu tiên sửa lỗi đã xác minh trước khi mở tính năng mới.
6. Cập nhật checkbox AI_NEXT_TASKS.md và ghi bàn giao vào docs/AI_SESSION_LOG.md, gồm file sửa, test, bằng chứng, việc tiếp theo.
7. Git/push repo gamingbite/TAN-NGUYET và xuất bản demo quaVercel tại tan-nguyet-game.vercel.app đã được phép10/10; tuân thủAGENTS/PUBLISHING hiện tại, khôngforce-push hoặcuploaddịchvụ khác. Không xóa save, backup hay code cũ. Không làm Multiplayer/bang hội/PvP hoặc thay framework.
8. Nếu bị giới hạn ngữ cảnh/token, ghi bàn giao trước khi kết thúc để phiên sau đọc tiếp.
9. Khi toàn bộ P0 đã đạt và không còn lỗi cản chơi thử, dừng và trình bày báo cáo để tôi duyệt; không tự làm P1/P2.

Bắt đầu bằng việc tóm tắt task tiếp theo và thực hiện nó theo quy tắc AGENTS.md.
```

## F. Lệnh cần dùng trên máy Windows

```powershell
Set-Location -LiteralPath 'D:\RPG GAMES'
node --version
npm --version
npm run verify
npm run dev
```

- Muốn backup khi chuẩn bị sửa tính năng: `npm run backup -- before-P0-03` (đổi tên task phù hợp).
- Nếu cổng preview `4173` đang bị server khác chiếm, dừng server cũ trước khi chạy Playwright.
- Không dùng Linux `node_modules` từ bản ZIP Windows để phán đoán source lỗi build.

---

**Ghi nhớ:** Việc Codex tự đọc file này chỉ xảy ra **khi có một phiên Codex đang chạy và được giao yêu cầu**. Việc hạn mức/token hồi lại không tự mở máy, tự đánh thức agent hay bảo đảm công việc tiếp tục nếu chưa có chức năng lập lịch/điều phối được thiết lập riêng.
