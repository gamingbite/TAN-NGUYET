# TÀN NGUYỆT — AI TASK QUEUE & RESUME

**Phiên bản:** 1.0 — 09/10/2026  
**Dành cho:** Codex / AI Game Director / AI QA / AI Art Reviewer  
**Đặt vào project:** `D:\RPG GAMES\docs\AI_NEXT_TASKS.md`  
**Nguồn:** Kiểm tra bản `RPG GAMES.zip` ngày 09/10/2026, `AGENTS.md`, `README.md`, `docs/ART_PROGRESS.md`, `docs/DEMO_CHECK.md`, `docs/DEVELOPMENT_PLAN.md`.

> **Mục tiêu:** Mỗi lần người dùng mở lại Codex sau khi hết hạn mức/token, AI đọc file này, biết việc đã làm và tiếp tục **một hạng mục nhỏ chưa hoàn tất**, không làm lại việc cũ, không tự mở rộng phạm vi. **File này không tự khởi chạy AI** khi hạn mức phục hồi: người dùng cần mở lại Codex và gửi prompt ở cuối tài liệu.

---

## A. Trạng thái project (không xây lại từ đầu)

- Project đã có: Phaser 3.90.0, TypeScript 5.9.3, Vite 8.3.3, Playwright.
- Gameplay hiện có: tạo 4 chủng tộc; Kiếm Sĩ/Pháp Sư; 3 khu (thị trấn/rừng/hầm ngục); NPC, nhiệm vụ, đào quặng, chế tạo/mua bán, quái/Boss 2 pha, lưu/tải và tiếp tục chơi sau khi nộp nhiệm vụ Boss.
- Đã có kiểm thử thành công **ở các phiên cũ**, nhưng **không suy ra** bản tích hợp atlas/terrain/fog/title mới nhất đã qua hồi quy đầy đủ.
- Source đã nối bộ atlas PNG mới; `docs/ART_PROGRESS.md` ghi **cần kiểm tra cuối và người dùng chưa duyệt art**. Animation hurt/death/dodge vẫn có thể dùng procedural; không tuyên bố có atlas cho toàn bộ trạng thái.
- `AGENTS.md` hiện yêu cầu **chỉ làm local tại `D:\RPG GAMES` và tạm dừng mọi lệnh Git**, kể cả `git status`. Không stage/commit/push/pull/remote/deploy khi chưa được chủ project cho phép.
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

### P0 — Ổn định bản đang có, làm trước mọi tính năng mới

- [ ] **P0-01 · Baseline runtime & test** — `QA / Programmer`
  - Kiểm tra `node --version`, `npm --version`, `package.json`, đường dẫn project; chạy `npm run verify` trên **Windows và bản source đang dùng**. Nếu test thất bại, ghi tên test, stack trace, môi trường và phân loại lỗi setup hay code; chỉ sửa lỗi khi đã khoanh vùng.
  - **Đạt khi:** có file log/đoạn kết quả thật của build + test; số test pass/fail; không mượn kết quả lịch sử 08/10 để kết luận 09/10.

- [ ] **P0-02 · Kiểm tra atlas người chơi** — `Art Reviewer / QA`
  - Chạy game; xem 4 chủng tộc, 4 hướng, đứng/đi/tấn công. Đổi Kiếm Sĩ ↔ Pháp Sư **ngoài chiến đấu**; kiểm tra tóc/da/trang bị và điểm neo chân. Quan sát nhấp nháy, lệch crop, giật frame, đè sprite, biến mất nhân vật.
  - **Đạt khi:** có checklist/runtimescreenshot cho các trường hợp cần thiết, không mất key/frame, không thay đổi collider chỉ vì hình ảnh.

- [ ] **P0-03 · Khả năng đọc địa hình, sương mù và đường đi** — `Art Reviewer / QA`
  - Kiểm tra thị trấn, rừng, hầm ngục; nhìn rõ người chơi, NPC, quặng, cổng, đường đi, vật cản và quái trên nền mới. Fog không che kín dấu hiệu tương tác hoặc làm lẫn đường với tường. Chỉ điều chỉnh palette/alpha/layer/contrast có bằng chứng gây khó nhìn.
  - **Đạt khi:** có ảnh before/after nếu đã chỉnh, đi qua các lối hợp lệ được, không xuyên tường hay chặn lối cũ.

- [ ] **P0-04 · NPC, props và icon vật phẩm** — `Art Reviewer / QA`
  - Kiểm tra 5 NPC, frame idle/blink, vị trí trạm rèn/giả kim, quầy hàng, quặng, phong ấn, cổng. Kiểm tra icon thật của vật phẩm trong túi, cửa hàng, tooltip, số lượng/giá; fallback khi thiếu ảnh. **Không biến icon chuẩn bị thành vật phẩm thật.**
  - **Đạt khi:** toàn bộ NPC, trạm nghề và các icon đang dùng rõ, tương tác được, không đè chữ/hộp UI; lưu ảnh lỗi nếu có.

- [ ] **P0-05 · Animation quái và Boss** — `QA / Programmer`
  - Thử ba loại quái, aggro, đuổi người chơi, né vật cản, hit/flash; Boss cả hai pha, cảnh báo đòn/telegraph, đạn tỏa, chết và chiến lợi phẩm. Kiểm tra animation không khiến hitbox khác logic hoặc đánh trúng xuyên tường; pause không làm sai thời gian animation.
  - **Đạt khi:** cơ chế combat vẫn nhất quán, Boss hạ được bằng gameplay bình thường, không có lỗi runtime; ghi test/manual evidence.

- [ ] **P0-06 · Full journey Kiếm Sĩ** — `QA`
  - Tạo nhân vật mới → gặp Trưởng làng An → đào 3 quặng → gặp Thợ rèn Lâm chế tạo → học Kiếm Sĩ tại Sư phụ Dạ → rừng/giải quyết phong ấn → hầm ngục/đánh Boss → về thị trấn nộp nhiệm vụ → đi lại và chơi tự do.
  - **Đạt khi:** không dùng debug/cheat để bỏ qua bước; quest/XP/loot/thưởng/cảnh chuyển đúng; có bằng chứng test mới nhất.

- [ ] **P0-07 · Full journey Pháp Sư** — `QA`
  - Làm lại toàn bộ đường đi với Pháp Sư; kiểm tra đánh thường, kỹ năng, MP, hồi chiêu, cự ly/va chạm đạn và hạ Boss bằng Pháp Sư.
  - **Đạt khi:** hoàn thành Boss và nộp nhiệm vụ; không lỗi riêng Class/animation/gameplay.

- [ ] **P0-08 · Save/Load & bảo toàn dữ liệu** — `QA / Programmer`
  - Kiểm tra lưu thủ công, Continue, bản mới chưa lưu không ghi đè bản cũ, xuất JSON, xem trước khi nhập, xác nhận khôi phục, lịch sử backup giữ lại, lưu inventory/equipment/quest/điểm khám phá sau chuyển cảnh và reload. Test không được xóa save của chủ project.
  - **Đạt khi:** dữ liệu gốc không mất, các trường hợp lỗi version/JSON có thông báo và giữ được bản cũ; các test liên quan qua.

- [ ] **P0-09 · UI/responsive và trải nghiệm thật** — `QA / Art Reviewer`
  - Chơi tại 1280×720, 1366×768, 1920×1080 và một cửa sổ hẹp; kiểm tra không tràn, không che canvas, tiếng Việt dễ đọc, hướng dẫn `H`, nhiệm vụ `J`, bảng túi đồ/đổi Class/mua bán, màn hình đầu và fullscreen.
  - **Đạt khi:** đọc được nội dung, không click nhầm, không lỗi JS/console mới; có screenshot đối chiếu.

- [ ] **P0-10 · Chốt bản ổn định + gửi người dùng duyệt art** — `Game Director`
  - Chạy lại `npm run verify` sau các thay đổi thực tế; cập nhật `docs/ART_PROGRESS.md` và `docs/DEMO_CHECK.md`. Nhóm art chỉ đánh dấu `integrated` nếu có kiểm chứng runtime; đánh dấu `approved` **chỉ khi người dùng duyệt**. Tổng hợp còn lỗi nào thực sự cản chơi thử.
  - **Đạt khi:** có kết quả test cuối, danh sách lỗi còn lại, link/đường dẫn screenshot cục bộ và cách chạy demo; chưa tự triển khai công khai.

### P1 — Chỉ làm khi P0 đã ổn và dựa trên lỗi hoặc phản hồi thật

- [ ] **P1-01 · Sửa UX gây khó chơi** — `Gameplay / UI`: chỉ giải quyết điểm bị người dùng thấy khó hiểu: gợi ý tương tác, hiển thị nhiệm vụ, đường đi, phản hồi nút và lời thoại. Có repro và test trước/sau.
- [ ] **P1-02 · Cân bằng nhịp độ demo** — `Game Designer / QA`: ghi số lần chết, thời gian đánh Boss, lượng thuốc, giá quặng/loot. Chỉ điều chỉnh từng thông số thử nghiệm sau khi chơi thử, không ghi chúng thành luật GDD vĩnh viễn.
- [ ] **P1-03 · Tối ưu hiệu năng có số đo** — `Performance`: đo FPS/frame time, bộ nhớ, thời gian tải tại 3 khu; chỉ sửa đúng nút thắt đã đo. Không chuyển engine hoặc refactor đại trà vì build cảnh báo chunk.
- [ ] **P1-04 · Hoàn thiện âm thanh và phản hồi thao tác** — `Audio / Gameplay`: kiểm tra mute/volume, âm hit/né/loot/victory và rung/số sát thương hiện có. Chỉnh nếu thiếu thông tin phản hồi; không làm soundtrack lớn khi chưa được yêu cầu.
- [ ] **P1-05 · Tổng kết demo & tài liệu cho lần thử tiếp** — `Director / QA`: cập nhật README, hướng dẫn mở game, điều khiển, giới hạn demo, known issues; chuẩn bị biểu mẫu ngắn để người dùng chấm mức vui/khó nhìn/khó điều khiển.

### P2 — Tuyệt đối chưa tự thực hiện

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
7. Không sử dụng bất kỳ lệnh Git nào; không push/deploy/upload. Không xóa save, backup hay code cũ. Không làm Multiplayer/bang hội/PvP hoặc thay framework.
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
