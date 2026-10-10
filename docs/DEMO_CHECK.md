# Biên bản kiểm tra Demo v0.1 local

Cập nhật: **10/10/2026**. Phạm vi: chơi đơn PC, Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.3, tại `D:\RPG GAMES`. Không dùng Git hoặc upload project.

## Nâng cấp Tro Tàn P0 — kiểm tra mới10/10

Quảng trường/đường/biển/đèn, chợ/rèn/giả kim/quán trọ và cổng Đông đã nối bằng `TownVisuals.ts` qua `VillageLife.ts`. Giữ khung hình fullweb/HUD/menu, camera và map960×640/spawn/cổng/NPC/collider/save. Chỉ sửa hiển thị dusk riêng town để màu đêm thực sự xuất hiện; pixel nền ban ngày153/139/110→đêm118/110/93. [Báo cáo và ảnh trước–sau](TOWN_UPGRADE_REPORT.md).

- Baseline build+smoke9/9exit0; chặng01build+9/9,02build+10/10,03build+11/11exit0. Các lượt focused có test trùng, không cộng thành tổng.
- Ảnh cuối12ảnh/0JS/HTTP/outbound; cùngviewport1366×768/zoom2.048, canvas/collider/actor/camera khớp trước. Gallery12tình huống/24PNG/slider đạt.
- Lifecycle48vật art không body/input; pause giữclock/graphics,3roundtrip town↔forest không tăngnode/body/tween/listener, nền texture dùng lại. Không suy ra FPS trước–sau khi chưa đo tương đương.
- **Verify cuối99/99passed,0failed,exit0,11phút**,session35830 đã kết thúc, [log](../.cache/qa/2026-10-10-town/verify.log). Hai fulljourney Kiếm Sĩ/Pháp Sư3,1phút mỗi Class đạt, gồm Boss/quay về/nộp/save/Continue/chơi tiếp. Hai regression mới pixel đêm/cleanup đạt. Lượt đầu dừngtypecheck do typing test mới, đã sửa/tsc+99testđạt; log lỗi giữ riêng.

TOWN-00/01/02/03 vàTOWN-05 nghiệm thu P0 hoàn thành. Người dùng đã chấp nhận demo hiện tại10/10 qua “demo vậy là oke rồi” và yêu cầu lập [kế hoạch giai đoạn tiếp](NEXT_PHASE_PLAN_V0_2.md). TOWN-04/P1 chưa mở; các P0-03/04/05/10 gốc vẫn theoqueue, phần duyệt củaP0-10 đã nhận. Auditlocal đợt town giữ107file cũ nguyênbyte,9file đúng phạm vi đổi,0mất,3file mới; logappend-only, PNG/map/UI/camera/model/save giữ nguyên. PreviewQA4174 đã dừng;4173tựđóng khiverifykết thúc. Không còn lỗi build/test trong lượt cuối. Phiên kế hoạch chỉ sửa tài liệu, không chạy lại build/test và không coi99/99 là kết quả mới của phiên này.

## Tích hợp B2/UI/làng sau duyệt tất cả — 10/10

Art A/B2/C/D được người dùng duyệt hình ảnh và yêu cầu tích hợp. Game phủ cửa sổ web, HUD/menu trong vùng chơi; làng15nhà/8dân trang trí, giữ đường/NPC/cổng/mỏ cũ. B2 có384base/sáu trạng thái/bốn hướng, portrait cùng renderer và lớp ngoại hình/trang bị thật; frame32×42/groundY36 và collider chân12×12 offset10,29 giữ nguyên. Một số pose dùng lại/lật ghi trong metadata; không gọi384output là384hình vẽ độc lập.

| Kiểm tra đợt hiện tại | Kết quả thật |
| --- | --- |
| Build/typecheck source tích hợp và sau sửa modal | Exit0; giữ cấu hình/dependency, Foundation được build cùng demo |
| Curated B2 | 384/384base,12nhận diện chủng tộc/Class;0crop rỗng/chạm biên. [Kết quả](../.cache/qa/2026-10-09-b2-runtime/curated-result.json), [nhận diện](../.cache/qa/2026-10-09-b2-runtime/class-identities.png) |
| Runtime B2 | 4test kiểm1.152texture,8PNG thật; ngoại hình/loadout/portrait, WASD/né/hit/death/pause/hồi sinh và fallback thiếu ảnh đạt. Bốn test selector và ba test làng cũng đạt |
| UI cuối sau sửa modal | Edge1280×720/1366×768/1920×1080/500×800;21ảnh/8bảng;0pageerror/outbound/HTTPfail. Đổi Class bằng nút thật, lưu Class/loadout, settings, nativefullscreen và pointer qua HUD đạt. [Kết quả](../.cache/qa/2026-10-10-b2-regression/ui-final/result.json) |
| Hồi quy source cuối10/10 | **`npm run verify`:exit0,97passed/0failed,Playwright11,4phút**. Hai fulljourney từ nhân vật mới đếnBoss/nộp/save/Continue/khám phá tiếp: Kiếm Sĩ3,2phút,Pháp Sư3,1phút. Bao gồm4testB2/4selector/3làng/3fullscreenUI. [Log cuối](../.cache/qa/2026-10-10-b2-regression/verify-complete.log) |
| Lịch sử lỗi và focused | Lượt đầu87pass/9fail; lượt sau95pass/1fail/96test,exit1. Sau sửa đọc tọa độ HUD sau keyup, Mage fulljourney + guide ba mỏ + đóng bảy modal500×800 đạt3/3exit0,3,6phút, rồi chạy lại toàn bộ97test ở trên. Giữ log/ảnh lỗi, không lấy focused thay verify. [Focused](../.cache/qa/2026-10-10-b2-regression/mage-modal-focused.log) |

Các lỗi đã xử lý có phạm vi rõ: selector avatar cũ chuyển sang PNG thật; route thử rèn đi qua đường thay vì lô cỏ có nhà mới; save fixture tránh aggro trong khi vẫn kiểm Continue/travel; nhả phím trong một thao tác native và chờ tọa độ được publish. Lỗi thực tế icon☰che nút đóng modal ở500×800 đã sửa bằng stacking của utility panel; giữ ảnh trước/sau và regression click không force. Không nới tiêu chí nhiệm vụ/đích đến, không bỏ collider hoặc sửa balance/save để test đạt.

Ảnh ba khu và QA làng dùng context/fixture hợp lệ riêng, không thay fulljourney từ nhân vật mới. Không mở/xóa profile/save của người dùng. Backup91file trước tích hợp,114file trước hồi quy và115file trước sửa đọc HUD được ghi trong AI_SESSION_LOG. Kiểm toán local giữ nguyên GDD/package/lock/config/model/runtime cũ và PNG nguồn; nhật ký append-only.

**ART-B-02 vàP0-09 DONE**; P0-03/04/05/10 vẫn theo [queue](AI_NEXT_TASKS.md). Không còn lỗi build/test trong lượt cuối đã chạy; chưa thay thế các checklist hình ảnh/fog còn lại bằng kết quả tự động. Cảnh báo chunk Phaser>500KB và NO_COLOR/FORCE_COLOR đã biết, không phải lỗi TypeScript/build.

## Lịch sử kiểm tra 08/10 — trước B2/UI/làng

## Trạng thái kiểm tra

**Demo v0.1 local cùng lượt hoàn thiện hình ảnh, chiến đấu, cài đặt và sao lưu đã đạt các kiểm tra bên dưới.** Cả hai Class đi từ nhân vật mới đến nộp nhiệm vụ Boss, lưu/tải và vào hầm ngục có Boss mới. Không phát hiện lỗi runtime trong các lượt thử này; cân bằng và chất lượng mỹ thuật cần phản hồi từ người chơi.

| Lệnh/kiểm tra | Kết quả thực tế |
| --- | --- |
| `npm run verify` trong lượt hoàn thiện | Exit 0: TypeScript + Vite build đạt; 63 test đạt trong 6,7 phút, gồm hai lượt chơi đầy đủ |
| `npm run build` sau khi bổ sung danh sách bản dự phòng | Exit 0: TypeScript + Vite build đạt trên source cuối |
| `npx playwright test tests/polish-ui.spec.ts` trên build cuối | Exit 0: 10 test đạt trong 15,3 giây; gồm hai test mới về khôi phục mốc cũ và tải nguyên dữ liệu lỗi |
| Tổng test khác nhau đã đạt | 65: 40 test gameplay/nền tảng trước đó + 3 đường đi/vật cản + 12 lưu/cài đặt + 10 UI hoàn thiện. Hai lệnh 63 và 10 có 8 test trùng, không cộng thành 73 |
| Chrome smoke trên source cuối | Cài đặt được giữ, mở/thoát toàn màn hình, tạo/di chuyển, xuất nguyên ô lưu, xem trước/khôi phục giữ bản cũ, reload và Continue đạt; 0 pageerror, 0 request ra host ngoài |
| Tài liệu và bảo toàn file | Liên kết local/UTF-8 đạt; 21 mốc kế hoạch được giữ; 16 file GDD, dependency, cấu hình và nền tảng cũ không đổi so với snapshot trước hoàn thiện |

Môi trường thực tế: Windows, Node **22.20.0**, npm **10.9.3**; Edge **154.0.4258.62** kiểm tra bản build tại `127.0.0.1:4173`; Chrome **154.0.8037.98** kiểm tra nhanh tại `127.0.0.1:5173`. Hai lượt journey dài khoảng 2,4 phút/lượt, dùng bàn phím/chuột và giao diện thật. `npm run verify` lần sau tự phát hiện cả 65 test; không cần server preview mở sẵn.

Lịch sử trước lượt hoàn thiện: `npm run verify` đạt 34 test trong 5,6 phút, sau đó `npx playwright test tests/world.spec.ts` đạt thêm 6 test trong 56,2 giây. Mốc 40 test này được chạy lại trong lượt 63 test ở trên.

Cảnh báo quan sát: chunk Phaser lớn; test runner có cảnh báo môi trường `NO_COLOR`/`FORCE_COLOR`. Không có lỗi build hay test còn lại trong phạm vi đã chạy.

## Nội dung và bằng chứng

| Phần demo | Cách kiểm tra |
| --- | --- |
| Nhân vật, điều khiển và pause | Tạo riêng cả bốn chủng tộc, tùy chỉnh ngoại hình, dân thường cấp 1/100 HP/60 MP; đi bằng phím, Shift lướt, mở/đóng bảng và pause |
| Nghề và kinh tế | Giữ E đào; học công thức, rèn kiếm/trượng, pha HP/MP; thiếu nguyên liệu/sai NPC bị từ chối; mua/bán theo giá, không quy đổi tiền |
| Class và trang bị | Học cả Kiếm Sĩ/Pháp Sư, giữ XP chung và bộ vũ khí riêng, đổi ngoài giao tranh với cooldown; bảo vệ món đang trang bị khi bán |
| Thế giới | Ba map thủ công, NPC theo lịch đêm/ngày, sương mù lưu theo khu, điểm dịch chuyển sau khi tự tới; cảnh nền tảng cũ vẫn chạy |
| Tái sinh và bí mật | Quặng cạn hồi sinh rồi đào được lần hai; slime được hạ, tự hồi sinh trong cùng scene rồi cho XP/Đồng lần hai; bí mật không thưởng lại sau Continue |
| Chuỗi bắt buộc | Lượt chơi mới bằng cả hai Class: nhận quest → đào/rèn/pha → học Class → phá phong ấn → hạ ba quái sự kiện → E khép vết nứt → nộp quest → Boss hai phase → trở về nộp quest |
| Điểm kết thúc và replay | Không kết thúc ngay khi hạ Boss; thông điệp chỉ hiện khi nộp tại thị trấn. Lưu/tải sau kết thúc, tiếp tục khám phá và vào hầm ngục có Boss mới |
| Bảo toàn dữ liệu | Lưu/tải túi, Class, XP, quest, khám phá; quái đánh chết và hồi checkpoint giữ tiến độ; bản lưu HP0 hồi sinh; JSON lỗi được giữ nguyên |
| Nhân vật mới và save cũ | Nhân vật mới chưa lưu không ghi đè save khi reload; chỉ thay save hợp lệ sau thao tác lưu thành công |
| Sự kiện đang làm dở | Lưu/tải phong ấn 1/3 giữ trạng thái; chỉ cần hạ hai quái còn lại và E khép vết nứt để quest sẵn sàng nộp |
| Logic giao dịch | Test độc lập về stack/túi đầy, craft/mua/bán nguyên tử, XP, quest thưởng một lần, potion cooldown và kiểm tra định dạng save |
| Hoạt ảnh và chiến đấu | Kiểm tra trình duyệt nhân vật quay hướng/đi/đánh, quái và Boss dùng frame mới; hai journey vẫn hoàn tất sau thay đổi giữ nút đánh, chặn đòn qua tường và đạn phase 2 |
| Đường đi và vật cản | Test tuyến quái qua cửa nối phòng hầm ngục, tránh thân cây và kiểm tra đường nhìn qua tường/cửa; không thêm dependency điều hướng |
| Cài đặt và HUD | Âm lượng/tắt âm/rung/số sát thương lưu riêng; mở bảng tạm dừng thế giới; lỗi ghi cài đặt giữ giá trị cũ; cooldown phản ánh kỹ năng/né thật |
| Xuất/nhập và lịch sử save | Xuất nguyên dữ liệu đã lưu; chọn file chỉ xem trước; xác nhận giữ nguyên ô cũ dưới key riêng rồi mới thay; file lỗi/quá lớn, lỗi backup hoặc lỗi ghi không làm mất dữ liệu |
| Khôi phục bản dự phòng | Chọn mốc cũ không ghi; xác nhận quay lại đúng nhân vật và giữ mọi mốc trước đó; bản lỗi vẫn tải nguyên byte và không được đưa vào HTML như mã thực thi |

`tests/journey.spec.ts` chơi từ đầu bằng bàn phím/chuột và các nút thật, không tiêm vị trí, vật phẩm, sát thương hoặc tiến độ. Các test tập trung khác dùng bản lưu đầu vào hợp lệ để dựng tình huống, rồi kiểm tra thao tác thực tế trên bản build. Test model chạy logic độc lập; không thay thế test trình duyệt.

## Sửa lỗi trong tích hợp

- Chặn việc frame cũ ghi đè tọa độ spawn sau khi yêu cầu chuyển khu.
- Hồi sinh bản lưu 0 HP trước khi mở phiên chơi; giữ dữ liệu nhân vật và tiến độ.
- Texture vũ khí phụ thuộc trang bị thực tế; tháo vũ khí đổi sang hình không cầm vũ khí.
- Rời mỏ hoặc nhả E hủy tiến độ khai thác; đặt lại timer đòn/kỹ năng/né khi dựng lại scene.
- Quái thường đã chết được xử lý timer trước kiểm tra sprite active để có thể hồi sinh.
- Phiên nhân vật mới chưa lưu không tự ghi đè save cũ khi đóng/tải lại trang.
- Quái dùng đường đi qua cửa khi đường đuổi trực tiếp gặp vật cản; đòn cận chiến/vùng sát thương kiểm tra tường.
- Cài đặt chỉ áp dụng sau khi lưu thành công; lỗi quota không để giao diện hiển thị một lựa chọn chưa được giữ.
- Nhập save kiểm tra trước, tạo bản dự phòng không trùng key và không thay ô chính nếu việc giữ bản cũ thất bại.

Trong phát triển bài thử, thao tác E tức thời giữa hai frame không được engine nhận, nên test giữ phím qua frame như thao tác thật. Lượt chơi phải đánh hoặc thoát khỏi quái đang đuổi trước khi dùng cửa/dịch chuyển; đứng chờ ngay cạnh quái không phải trạng thái an toàn.

## Giới hạn và phần còn lại

- Hình ảnh procedural đã có các frame quay hướng, đi, đánh và Boss phase 2; âm nền/hiệu ứng tổng hợp phục vụ thử gameplay. Chưa phải bộ asset/animation sản xuất cuối cùng. Thông số cân bằng và tên/lore chi tiết là thử nghiệm.
- Một ô lưu chính localStorage, gắn với trình duyệt/hồ sơ/origin; có xuất/nhập JSON và khôi phục từ các bản dự phòng được giữ khi thay ô lưu. Đây không phải lịch sử tự động sau mỗi lần lưu. Snapshot source không chứa save trình duyệt; muốn giữ tiến độ riêng phải xuất JSON.
- Không có Multiplayer, NPC đánh thuê, bang hội, chợ online, tiến hóa Class hoặc mô phỏng xã hội sâu. Cường hóa và buff là phần tùy chọn chưa triển khai.
- Build có cảnh báo chunk Phaser lớn hơn 500 kB: khoảng 1.20 MB minified, 319 kB gzip. Chưa thay engine hoặc tăng ngưỡng để che cảnh báo.
- Bước tiếp theo là người dùng thử nhịp chiến đấu, giá/loot và đường chỉ dẫn; sửa từng tính năng nhỏ rồi chạy kiểm tra liên quan và tạo snapshot local.

## Bảo toàn project

So sánh byte với snapshot trước demo: `FoundationScene`, `createGame`, cấu hình nền tảng, CSS cũ, TypeScript/Playwright config, `.gitignore`, `.npmrc`, script backup, favicon và GDD giữ nguyên. `src/main.ts` cũ được giữ nguyên tại `src/foundation.ts`; HTML nền tảng được giữ ở `foundation.html`. Các script và phiên bản dependencies không đổi; manifest/lockfile đồng bộ version project 0.1.0.

GDD SHA256: `8684051731445BABA17BEFDE4582924F97B02EEDCC7B2584EF5B4B94C5D85562`.

Snapshot trước demo: `.local-backups/2026-10-08T07-02-30-906Z-before-demo-v01-PfMrIw`. Giữ nguyên các snapshot cũ; không tự khôi phục hoặc xóa bản sao.

Snapshot sau kiểm tra mang nhãn `demo-v01-verified` tại `.local-backups/`, chứa source/config/tài liệu và biên bản này cùng manifest. Dùng mốc này khi cần đối chiếu hoặc khôi phục từng file; giữ một bản sao của trạng thái hiện tại trước khi khôi phục.

Snapshot trước lượt hoàn thiện: `.local-backups/2026-10-08T13-05-46-068Z-before-demo-polish-KTf5kr` (45 file). So sánh file không có file cũ bị mất; thay đổi chỉ nằm trong module demo và tài liệu, thêm module animation/đường đi/cài đặt và các bài kiểm tra liên quan. GDD, `package.json`, lockfile, cấu hình và nền tảng cũ giữ nguyên byte.

Snapshot cuối mang nhãn `demo-v01-polished-verified` tại `.local-backups/`, chứa source/config/tài liệu của lượt hoàn thiện đã kiểm tra. Giữ nguyên các mốc trước đó; không tự khôi phục hoặc xóa dữ liệu.

## Cập nhật 09/10/2026 — UX-01 chỉ hướng nhiệm vụ

Theo yêu cầu người dùng, demo đã có bảng mục tiêu ngay dưới canvas, mũi tên vàng theo waypoint tránh vật cản và vòng đích trong vùng đã khám phá. Hướng dẫn theo đúng nhận/nộp quest, nguyên liệu nghề, NPC ngày/đêm, quái phong ấn còn sống, Boss và các cửa chuyển khu; ẩn sau nộp Boss. Đổi Class đã học chỉ nhắc mở I tại chỗ; dữ liệu save/map/collider và các tính năng demo giữ nguyên.

- **Hồi quy trên source cuối đạt:** `npm run verify` exit 0, TypeScript + Vite build và **83/83 test** trong 8,1 phút Playwright. Gồm cả hai full journey Kiếm Sĩ (2,6 phút)/Pháp Sư (2,5 phút), lưu/tải/backup, cảnh foundation và 15 test mới: 10 logic/đường đi, 5 browser UI/quest. UI chỉ hướng đã kiểm tại 1280×720, 1366×768, 1920×1080 và 500×800. [Log thật](../.cache/qa/2026-10-09-quest-guidance/verify.log), [kết quả](../.cache/qa/2026-10-09-quest-guidance/result.json).
- **Runtime route-run03 đạt**, exit 0: 5 tình huống, 119 mẫu; WASD thật tới Boss và quay ra qua đủ tiền sảnh/phòng giữa/hành lang trên/đấu trường, 0 waypoint/đoạn đường xuyên tường, 0 lỗi collider/góc mũi tên/runtime. Fixture hợp lệ trước Continue; không phải thay thế hai full journey. NPC ban đêm/đứng nhầm người và đổi Class tại chỗ cũng đạt.
- Ảnh 1280×720 đã xem: [bắt đầu](../.cache/qa/2026-10-09-quest-guidance/route-run03/initial-guide-start.png), [đi tới Boss](../.cache/qa/2026-10-09-quest-guidance/route-run03/to-boss-dungeon-path.png), [đường trở ra](../.cache/qa/2026-10-09-quest-guidance/route-run03/to-exit-dungeon-path.png). Mũi tên có đuôi và cách đầu nhân vật; bảng hướng dẫn nằm dưới canvas, không che Boss HUD hoặc lời nhắc tương tác.
- [Kết quả runtime](../.cache/qa/2026-10-09-quest-guidance/route-run03/result.json), [script QA](../.cache/qa/2026-10-09-quest-guidance/probe-route.mjs). Dùng context Edge riêng, không mở/xóa save thật.
- Đã giữ bằng chứng lỗi trước sửa ở route-run02: đường cached bỏ qua bước ngắn quanh góc cửa làm mất mũi tên. Helper hiện chọn điểm nhìn thấy tiến xa nhất theo thứ tự path, kể cả bước ngắn; regression dùng đúng tọa độ lỗi và đi từng bước nhỏ qua cửa. Lượt verify đầu bị dừng để sửa, không tính là đạt.

Backup trước mã nguồn: `.local-backups/2026-10-09T07-30-12-932Z-before-quest-guidance-K7pQOz`. Phạm vi này không chốt art toàn demo hoặc các mục P0-03/04/05/09/10; chưa thay trạng thái approved. Không Git, upload hoặc deploy.
