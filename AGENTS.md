# Nguyên tắc làm việc cho AI — TÀN NGUYỆT

Áp dụng cho toàn bộ repository và các thư mục con, trừ khi có hướng dẫn cụ thể hơn tại thư mục đó. Yêu cầu rõ ràng của người dùng là căn cứ xác định phạm vi mỗi nhiệm vụ.

## Chế độ làm việc hiện tại — GitHub và xuất bản demo đã được phép

- Ngày10/10/2026, người dùng yêu cầu dùng lại Git, đẩy project lên `https://github.com/gamingbite/TAN-NGUYET` và xuất bản web để bạn bè chơi. Người dùng chốt địa chỉ `https://tan-nguyet-game.vercel.app`; được dùng Git, commit/push vào repo này và triển khai demo bằng Vercel. Quyền mới thay thế việc tạm dừng Git/local-only trước đó; giữ nguyên tên repo.
- Tiếp tục phát triển tại `D:\RPG GAMES`, giữ thư mục `.git` và lịch sử remote. Không force-push, xóa lịch sử, save hoặc backup. Quyền xuất bản demo không tự mở phạm vi gameplay v0.2 hay Multiplayer.
- Chỉ upload source/asset/config/tài liệu cần thiết; giữ bí mật, browser save, `.local-backups`, `.vercel`, cache, dependencies và build local ngoài Git. Website chỉ phục vụ bản build `dist`; GitHub Actions kiểm build, Vercel xuất bản demo.
- Không tự đưa project lên repo/dịch vụ khác ngoài phạm vi đã được cho phép. Ghi URL public, commit/workflow, kết quả kiểm tra và trạng thái triển khai thật vào tài liệu.

## Đọc trước khi sửa

1. Đọc toàn bộ `TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md` trước khi sửa code hoặc đề xuất thay đổi gameplay. Đặc biệt đối chiếu mục 6 (demo), 7 (quyết định đã chốt) và 8 (nguyên tắc triển khai).
2. Đọc `README.md`, `docs/DEVELOPMENT_PLAN.md`, tài liệu và `AGENTS.md` liên quan trong thư mục sẽ sửa. Đọc file cục bộ để nhận diện trạng thái hiện có; chỉ dùng `git status` khi người dùng đã cho phép dùng lại Git.
3. Nếu đã có mã nguồn, đọc `package.json`, lockfile, cấu hình và module liên quan để hiểu hệ thống đang chạy. Không tự chọn framework mới thay framework hiện có.

## Trạng thái và phạm vi ưu tiên

- Ban đầu ngày 08/10/2026, project chỉ có GDD và tài liệu. Theo yêu cầu tiếp theo chuẩn bị để làm game, đã tạo nền tảng local bằng Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.3. Giữ stack hiện có; dùng npm và `package-lock.json`. `FoundationScene` là cảnh thử kỹ thuật, chưa phải gameplay v0.1 hoàn tất.
- Gameplay local hiện có ở `src/main.ts` → `DemoScene`, với model/transaction/save tách trong `src/game/model/`, map/texture ở `src/game/world/` và UI ở `src/ui/`. Cảnh nền tảng cũ giữ nguyên tại `/foundation.html`; không xóa khi sửa demo. Đọc `docs/DEMO_GUIDE.md` và `docs/DEMO_CHECK.md` để nhận diện luồng chơi và bằng chứng kiểm tra hiện tại.
- Demo đã có animation theo hướng, đường đi tránh vật cản và kiểm tra tường khi đánh. Dùng `settings.ts` cho tùy chọn âm lượng/rung/số sát thương, giữ cài đặt tách khỏi dữ liệu nhân vật. Xuất/nhập JSON và danh sách bản lưu dự phòng là chức năng local thật; giữ nguyên các nguyên tắc bảo toàn dữ liệu bên dưới khi mở rộng.
- Khi sửa mỹ thuật, đọc `docs/TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md`, `docs/ASSET_GUIDE.md` và `docs/ART_PROGRESS.md`. Art raster local được nạp qua `ArtManifest.ts`, `RasterArt.ts` và `PlayerArt.ts`; B2 dùng thêm `B2PlayerArt/Sources/SourceBounds/Layers` và `PlayerAnimation`. Giữ PNG nguồn, crop/anchor/native size và renderer v1/procedural dự phòng. Không đổi collider hoặc map chỉ để khớp ảnh AI. Nền màn hình đầu là minh họa, không phải bản đồ chơi. B2 đã nối Idle/Walk/Attack/Hurt/Death/Dodge theo bốn hướng; metadata ghi rõ pose tái sử dụng/lật, không mô tả 384 output như 384 hình vẽ độc lập. Timing gameplay, frame32×42/groundY36 và collider12×12 offset10,29 được giữ.
- Theo yêu cầu tích hợp đã duyệt ngày09/10, game phủ cửa sổ web, HUD trong vùng chơi và menu icon góc phải trên chứa chức năng/hướng dẫn/cài đặt. `VillageLife.ts` thêm dân làng trang trí không có collider/quest/save riêng; thị trấn có15nhà,8dân đi vòng ngắn. Giữ lối, vị trí tương tác và năm NPC cũ; đây không phải hệ mô phỏng xã hội mới.
- Ưu tiên Demo v0.1, một lát cắt chơi được: dân thường → làm nghề → học Class → khám phá → chiến đấu → chế tạo → Boss → trở về thị trấn nộp nhiệm vụ; vẫn chơi tự do sau điểm kết thúc nội dung.
- Thứ tự P0: điều khiển → thế giới → chiến đấu → nhiệm vụ → nghề cơ bản → hầm ngục/Boss → lưu game. Chia mỗi bước thành tính năng nhỏ có thể thử riêng; backup và kiểm tra trước khi commit/push theo quyền đã được cấp.
- Hai Class đầu là Kiếm Sĩ và Pháp Sư. Multiplayer, bang hội, chợ online, NPC đánh thuê và mô phỏng xã hội sâu để sau demo.
- Không tự chốt tỷ lệ Đồng/Bạc/Vàng, quy tắc tụt cấp cường hóa, thông số thuê NPC hoặc câu 76. Thông số thử nghiệm phải ghi rõ tạm thời, có thể cấu hình, không sửa GDD như thể đã được xác nhận.

## Bảo vệ hệ thống và dữ liệu

- Giữ hệ thống đang chạy hoạt động. Đọc và tận dụng module hiện có trước khi thêm module mới; tránh refactor lớn chỉ để đổi phong cách.
- Không xóa code cũ, hoàn tác thay đổi của người dùng hay ghi đè cấu hình quan trọng trong nhiệm vụ không yêu cầu việc đó. Giữ nguyên GDD gốc khi chỉ chuẩn bị môi trường.
- Chỉ thêm dependency khi phục vụ trực tiếp tính năng được yêu cầu. Dùng package manager và lockfile hiện có; không nâng cấp hàng loạt hoặc thay engine ngoài phạm vi.
- Tổ chức module để có thể mở rộng về sau, nhưng không xây hạ tầng online trước khi demo chơi đơn chạy ổn.
- Không tạo nút giả hoặc luồng trông như đã hoàn thành mà chưa có chức năng. Tính năng chưa làm phải được bỏ khỏi luồng sử dụng hoặc ghi rõ đang phát triển khi cần.
- Không đưa bí mật vào repo, file mẫu hay bundle trình duyệt. Giữ dependency, build, cache, log và dữ liệu tạm ngoài Git theo `.gitignore`; giữ source, asset, GDD và lockfile cần tái lập môi trường.

## Kiểm tra trước khi hoàn thành

- So sánh nội dung file trước/sau bằng snapshot/diff để đảm bảo đúng phạm vi và không mất code/cấu hình hay thay đổi của người dùng; Git đã được phép trở lại theo chế độ ở đầu tài liệu.
- Trước thay đổi lớn, dùng `npm run backup -- before-feature-name` để có bản sao source/config/tài liệu trong `.local-backups/`; không sao lưu bí mật vào file được chia sẻ. Không tự khôi phục hoặc xóa bản sao của người dùng.
- Nền tảng hiện có: `npm run build` kiểm tra TypeScript và build; `npm test` kiểm tra bản build trên Edge, hoặc `npm run verify` để chạy cả hai. Test tự mở server preview ở 4173 nên cổng đó phải trống. Chạy `npm run dev` để kiểm tra trực tiếp ở 5173.
- Khi có project chạy được, chạy các kiểm tra phù hợp đã được định nghĩa: build, typecheck/lint/test nếu liên quan; thử gameplay bị ảnh hưởng trên trình duyệt. Chỉ thêm test khi có giá trị kiểm chứng hành vi thực tế.
- Với lưu game, bảo toàn dữ liệu cũ; khi đổi định dạng cần phiên bản dữ liệu và đường chuyển đổi phù hợp. Kiểm tra lưu/tải, inventory, quest, hồi sinh và chuyển cảnh khi các hệ thống đó bị sửa.
- Save hiện có một ô localStorage version 1. Nhân vật mới chưa lưu không được tự ghi đè bản cũ khi đóng/reload; autosave chỉ áp dụng cho phiên Continue hoặc sau lần lưu thủ công thành công. Không tự xóa bản lưu lỗi/khác version để làm test đạt.
- Nhập hoặc khôi phục chỉ được ghi sau thao tác xác nhận của người chơi và kiểm tra đầy đủ định dạng. Trước khi thay ô lưu, giữ nguyên dữ liệu cũ trong key dự phòng riêng, kể cả bản lỗi/khác version; nếu không tạo được bản dự phòng thì hủy thay thế. Xem trước và xuất file không ghi/xóa dữ liệu. Không xóa lịch sử khi khôi phục một mốc cũ; snapshot source không chứa save trình duyệt.
- Nếu thiếu manifest, dependency, công cụ hoặc có lỗi, báo đúng lệnh, kết quả và nguyên nhân đã quan sát. Không báo build/test đạt khi chưa chạy được.
- Tài liệu phải phản ánh khả năng hiện tại. Sau khi thêm nền tảng hoặc thay script, cập nhật hướng dẫn cài đặt, chạy thử và build.
- Báo ngắn gọn những file đã sửa, lý do, kiểm tra đã chạy, lỗi còn lại và bước tiếp theo; không gọi scaffold là demo hoàn chỉnh.

## Git và mốc khôi phục

- Chế độ ở đầu tài liệu được ưu tiên; người dùng đã cho phép dùng lại Git và xuất bản demo vào repo chỉ định ngày10/10/2026.
- Chia thay đổi nhỏ, dễ review và khôi phục. Khi Git được cho phép trở lại, đề xuất commit sau mỗi tính năng đã kiểm tra; khuyến khích có mốc tốt trước thay đổi lớn.
- Không tự commit khi nhiệm vụ chỉ yêu cầu hướng dẫn người dùng tạo commit. Không tự tạo remote, publish hoặc push lên GitHub khi chưa được yêu cầu.
- Không dùng lệnh phá hủy lịch sử/dữ liệu như `git reset --hard`, `git clean -fd` hoặc force push để xử lý lỗi thông thường. Ưu tiên nhánh thử nghiệm và revert commit đã xác định gây lỗi.
