# TÀN NGUYỆT — Kế hoạch giai đoạn tiếp theo: v0.2 PvE

**Ngày lập:** 10/10/2026. **Trạng thái:** đề xuất để người dùng xem và chốt phạm vi triển khai. Phiên này chỉ lập kế hoạch, chưa bắt đầu code v0.2.

Người dùng xác nhận **“demo vậy là oke rồi hãy lên plan vào giai đoạn tiếp theo”**. Ghi nhận bản demo hiện tại, gồm Tro Tàn đã nâng cấp, được chấp nhận làm nền phát triển tiếp. Giữ khung hình fullweb, HUD trong game, menu góc phải và phong cách art đã duyệt.

Nguồn: đã đọc toàn bộ [GDD](../TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md), nhất là §6.4; [AGENTS](../AGENTS.md), [kế hoạch cũ](DEVELOPMENT_PLAN.md), [queue](AI_NEXT_TASKS.md), [nhật ký](AI_SESSION_LOG.md), tài liệu art và code hiện có. GDD gốc không sửa. Những con số phạm vi bên dưới là **đề xuất cho v0.2**, không phải quyết định GDD mới.

## 1. Đích đến

**v0.2 tập trung làm PvE đáng chơi lại:** bốn Class cơ bản có lối đánh khác nhau, một NPC thuê đi cùng, thêm một chuyến phiêu lưu ngắn sau nội dung hiện tại; nhân vật cũ tiếp tục chơi được.

Vòng chơi đề xuất: tiếp tục nhân vật cũ hoặc tạo mới → học/thử Class → làm nghề, chuẩn bị trang bị/thuốc → chọn đi một mình hoặc thuê một NPC → vượt nội dung PvE → trở về nhận thưởng, đổi Class và chơi lại.

| Giữ từ v0.1 | Phần bổ sung đề xuất | Giới hạn v0.2 |
|---|---|---|
| Tro Tàn, rừng, hầm mộ, ba nghề, quest/chỉ hướng, save local | Cung Thủ và Tu Sĩ; mỗi Class một đòn thường, hai kỹ năng, vũ khí phù hợp | Chưa làm Class tiến hóa, cây kỹ năng hoặc hàng chục kỹ năng |
| Kiếm Sĩ/Pháp Sư và đường chơi solo hiện tại | Một NPC đồng hành thuê theo chuyến, năm lệnh cơ bản | Tối đa một NPC thuê cùng người chơi; chưa làm đội bốn người hoặc AI xã hội |
| Ba khu và tuyến demo cũ | Một nhánh PvE thủ công ngắn nối từ rừng, hai nhiệm vụ, một biến thể quái và một Boss cuối nhánh | Tái sử dụng môi trường; chưa mở vương quốc/thành phố mới |
| Rèn, giả kim và thương nhân hiện có | Hai vũ khí/công thức cho Class mới, phần thưởng phục vụ vòng chuẩn bị → chiến đấu | Chưa mở hệ kinh tế, cường hóa hoặc buff phức tạp |

Phạm vi nội dung mới có thể cắt còn một nhiệm vụ và một khu nhỏ nếu phần Class/đồng hành cần thêm thời gian. Không cắt bảo toàn save hoặc khả năng hoàn thành solo để giữ số lượng tính năng.

## 2. Điểm xuất phát và việc chưa xong

- Code hiện chạy bằng Phaser 3.90.0, TypeScript 5.9.3, Vite 8.3.3; hai Class, bốn chủng tộc, ba khu, ba nhiệm vụ, ba nghề, Boss hai pha, xuất/nhập/khôi phục save local. Không dựng lại nền tảng.
- Tro Tàn có 15 nhà, 8 dân trang trí và 5 NPC chức năng; giữ spawn480,400, cổng Đông916,320 và đường tương tác. Không mở lại đợt xây thị trấn đã hoàn thành.
- Baseline gần nhất: **`npm run verify` 99 passed / 0 failed, exit0**, ngày10/10, trước phiên lập kế hoạch; gồm hai hành trình thật Kiếm Sĩ/Pháp Sư. [Log](../.cache/qa/2026-10-10-town/verify.log), [báo cáo](TOWN_UPGRADE_REPORT.md).
- **P0-03/04/05 còn checklist QA riêng**: địa hình/fog/đường; NPC/props/icon; animation quái/Boss. Người dùng chấp nhận demo không tự tạo bằng chứng cho các mục chưa kiểm. **P0-10 đã có phần duyệt**, còn tổng hợp/chốt cùng các checklist này. Đưa vào chặng đầu, chỉ sửa khi tìm được lỗi thực tế.
- TOWN-04/P1 mỹ thuật tùy chọn không trở thành điều kiện bắt buộc của v0.2. Chỉ đưa lỗi UX/cân bằng/hiệu năng có bằng chứng vào công việc liên quan.

## 3. Các chặng triển khai

Thứ tự phụ thuộc: **V02-00 → V02-01 → V02-02 → V02-03 → V02-04 → V02-05 → V02-06**. Hoàn thành và kiểm chứng từng chặng trước khi mở chặng sau. Có thể chuẩn bị concept/art mới song song sau khi đặc tả Class được chốt; không tích hợp ảnh chưa được duyệt.

| ID | Công việc | Đầu ra để xem/thử | Điều kiện hoàn thành |
|---|---|---|---|
| **V02-00** | Chốt nền v0.1 đã được chấp nhận | Checklist P0-03/04/05/10, ảnh/lỗi thực tế, snapshot mốc ổn định | Kiểm năm context cũ; NPC/icon; quái/Boss/pause. Có known issues rõ, không còn lỗi chặn vòng chơi/lưu game |
| **V02-01** | Chốt thiết kế nhỏ, làm phần dữ liệu/migration tối thiểu | Đặc tả hai Class, NPC/chuyến đi, nhánh PvE; schema/di chuyển save và ma trận test | Chốt quyết định ảnh hưởng dữ liệu trước code; thử migration có kiểm tra và giữ bản lưu cũ trước khi tích hợp Class mới |
| **V02-02** | Làm Cung Thủ thành một lát cắt hoàn chỉnh | Học tại NPC → nhận/rèn cung → trang bị → đánh thường/hai kỹ năng → save/Continue | Chơi solo từ dân thường đến Boss/nộp quest bằng thao tác thật; đạn không xuyên tường; art/portrait/loadout đủ và rõ |
| **V02-03** | Làm Tu Sĩ thành một lát cắt hoàn chỉnh | Học Class, vũ khí, kỹ năng sát thương/hồi phục, trang bị và lưu | Solo hoàn thành được; hồi phục đúng mục tiêu/giới hạn/cooldown, không hồi sinh hoặc nhận thưởng sai; hai Class cũ không bị ảnh hưởng |
| **V02-04** | Một NPC đồng hành thuê theo chuyến | Thêm tương tác/giao diện thuê tại vị trí quán trọ hiện có, AI theo/đánh, năm lệnh, kết thúc hợp đồng | Đường đi/LOS/aggro/pause/chuyển khu/death/Continue đúng; tiền trừ một lần, NPC bị hạ về quán trọ; solo vẫn hoạt động |
| **V02-05** | Một chuyến PvE bổ sung có mở đầu/kết thúc | Nhánh nhỏ nối rừng, hai quest, một biến thể quái và Boss; nguyên liệu/phần thưởng dùng được | Chỉ dẫn dẫn đúng; nội dung mở sau tuyến cũ; nhận thưởng một lần; Boss/replay/checkpoint/save đúng; không dời cổng cũ |
| **V02-06** | Cân bằng, hiệu năng và nghiệm thu v0.2 | Bản local chơi được, bảng đo, ảnh, hướng dẫn và báo cáo | Bốn Class hoàn thành solo; thử đồng hành/không đồng hành; savev1→mới, journey/regression/UI/build đều đạt |

Chưa ấn định ngày hoàn thành khi chưa chốt đặc tả và khối lượng art. Mỗi Class/nhánh nội dung có bản chạy thử riêng để người dùng đánh giá trước khi tích lũy thêm thay đổi.

## 4. Đặc tả tối thiểu cần chốt ở V02-01

### Class và combat

- **Cung Thủ:** nhận diện rõ bằng cung/tư thế bắn; lối đánh giữ khoảng cách. Gợi ý hai vai trò kỹ năng: xuyên nhiều mục tiêu và kiểm soát khoảng cách. Tầm bắn, xuyên bao nhiêu mục tiêu, chi phí MP và hồi chiêu là thông số thử nghiệm; tường vẫn chặn đạn.
- **Tu Sĩ:** nhận diện riêng bằng áo/biểu tượng và phép; tự đánh solo được. Gợi ý hai vai trò kỹ năng: hồi phục và sát thương vùng. Phạm vi hồi cho bản thân/đồng hành, mục tiêu hợp lệ và cách ngắm phải được ghi trước khi làm. Không tự thêm hồi sinh đồng đội.
- Giữ một level nhân vật chung, học/đổi Class qua luồng hiện tại ngoài giao tranh; mỗi Class có loadout riêng, giáp dùng chung. Hai ô kỹ năng hiện tại đủ cho bản đầu.
- Bộ vũ khí đề xuất: cung và một pháp khí của Tu Sĩ; tên/ngoại hình/công thức do đặc tả chốt. Không tự đặt tỷ lệ tiền hoặc luật cường hóa để hỗ trợ chúng.

### NPC đồng hành

- Một NPC có Class/chỉ số/trang bị cố định; **thêm tương tác/giao diện thuê tại vị trí quán trọ hiện có**. Quán trọ v0.1 hiện chỉ có art/khu NPC tụ họp, chưa có giao diện thuê. Chưa cần xây nội thất hoặc Hội Mạo Hiểm Giả mới. Giá trả trước bằng Đồng, cấu hình thử nghiệm; giới hạn chênh cấp chưa được GDD chốt.
- Năm lệnh theo GDD: **Theo sau, Tấn công, Phòng thủ, Rút lui, Giữ vị trí**. Đặc tả phải mô tả mục tiêu, cự ly, ưu tiên, khi mất mục tiêu và khi chuyển khu; không chỉ có năm nút đổi nhãn.
- Đề xuất một chuyến bắt đầu sau xác nhận thuê, kết thúc khi trở về thị trấn **sau khi đã thực sự rời thị trấn**, giải tán, NPC bị hạ hoặc người chơi hồi sinh. Có trạng thái đã xuất phát để không kết thúc ngay lúc thuê; đặc tả phải phân biệt đi qua cổng, dịch chuyển và hồi sinh. Rút lui kết thúc chuyến vẫn tính khoản thuê đã trả. **Đây là quy ước đề xuất cần chốt trước triển khai**, không biến thành luật đã duyệt.
- HP NPC về0: rời trận, trở lại quán trọ; muốn đi tiếp phải thuê lại. Không chết vĩnh viễn, không tự lên cấp/đổi đồ hoặc tạo trí nhớ/quan hệ.
- Chốt cách Continue giữa chuyến giữ hợp đồng/HP/trạng thái lệnh, không trừ tiền lại và không hồi máu miễn phí. Đòn NPC phải tính quest/loot/XP đúng một lần; người chơi vẫn sở hữu thưởng trong bản chơi đơn.
- Solo giữ độ khó chơi được; cấu hình Boss cho người chơi + một NPC được đo riêng, không tự áp dụng công thức đội bốn người.

### Nội dung PvE

- Một nhánh nhỏ thủ công mở từ rừng sau khi đã nộp quest Boss cũ, tận dụng palette/props hiện có. Giữ nguyên kết thúc nội dung v0.1; có mục tiêu v0.2 riêng, không đổi cờ cũ để tặng thưởng lại.
- Hai nhiệm vụ nối chuẩn bị ở thị trấn với khám phá/đánh Boss/trở về; dùng hệ chỉ hướng hiện có. Bí mật nếu có vẫn tìm bằng khám phá, không tự gắn marker cho mọi thứ.
- Một biến thể quái dùng lại bộ hành vi có thay đổi đọc được; một Boss có telegraph và cơ hội né rõ. Chốt layout/phần thưởng trước khi xây map. Chưa thêm raid, giới hạn thưởng ngày/tuần hoặc nhiều dungeon cùng lúc.

## 5. Dữ liệu và vị trí code cần mở rộng

| Phần hiện có | Phụ thuộc cần xử lý |
|---|---|
| `src/game/model/types.ts`, `catalog.ts`, `state.ts` | Class/item/recipe/quest/zone là tập ID đóng; loadout chỉ có swordsman/mage. Mở rộng từng lát cắt, giữ transaction và kiểm tra túi/tiền |
| `src/game/model/storage.ts` | Validator nhận version1, ba zone và loadout cố định. Phải có chính sách chuyển dữ liệu trước khi thêm ID/trường mới |
| `src/game/scenes/DemoScene.ts`, `runtime/balance.ts` | Combat đang chia mage và nhánh còn lại; tách đúng phần cần cho Class mới, giữ timing/collider của hai Class cũ |
| Enemy AI và projectile trong scene | Mục tiêu hiện xoay quanh người chơi, đạn phân biệt friendly. NPC/Tu Sĩ cần phân biệt đồng minh/địch và mục tiêu hợp lệ, tránh đòn tự gây hại hoặc hồi sai bên |
| `src/ui/DemoUI.ts`, `src/main.ts` | Trainer/HUD/loadout/craft/help/save-preview cùng nhận Class mới; không thêm nút rỗng hoặc thay bố cục game đã duyệt |
| `world/B2PlayerLayers.ts`, `PlayerArt.ts`, `PlayerAnimation.ts`, `B2Portrait.ts` | Thân B2 tái sử dụng; cần lớp vũ khí/áo/pose riêng, portrait/fallback đồng nhất. Giữ nguồn PNG/crop/anchor |
| `world/maps.ts`, `runtime/navigation.ts`, hệ quest và scene | Nhánh PvE/companion dùng đường tránh vật cản, LOS, chuyển khu và lifecycle hiện tại; cập nhật discovery/checkpoint/guide nhất quán |

**Đề xuất save schema v2**, chốt chi tiết tại V02-01; phiên lập kế hoạch không đổi format/save thật. Quy trình cần có:

1. Đọc/validate v1 → tạo trạng thái mới trong bộ nhớ bằng hàm chuyển đổi có kiểm tra; giữ đồ, tiền, level, appearance, hai loadout, quest, discovery và checkpoint cũ. Trường mới có mặc định được đặc tả rõ.
2. Không ghi lại localStorage chỉ vì xem trước hoặc chuyển đổi trong bộ nhớ. Trước **lần ghi định dạng mới đầu tiên**, kể cả autosave của phiên Continue hợp lệ, phải tạo backup raw bản cũ thành công; backup lỗi thì hủy ghi.
3. Giữ toàn bộ lịch sử, kể cả JSON lỗi/version chưa hỗ trợ; import/restore chỉ ghi sau xác nhận và validation đầy đủ. Nhân vật mới chưa lưu không được ghi đè nhân vật cũ.
4. Test v1 giữa quest/sau kết thúc, túi và loadout, chuyển khu/hồi sinh, save mới/Continue, import/export/restore, JSON/version/quota/backup lỗi. Dùng storage/context biệt lập, không lấy save thật làm dữ liệu test.
5. Phân biệt khôi phục source và dữ liệu: snapshot project không chứa save trình duyệt. Code v0.1 cũ có thể không đọc savev2; giữ bản JSONv1 để khôi phục theo thao tác của người chơi, không tự hạ version hoặc xóa dữ liệu mới.

Không refactor toàn bộ scene/model để “chuẩn bị online”; chỉ tách module khi phục vụ trực tiếp lát cắt đang làm.

## 6. Art và kiểm thử

- Giữ phong cách [art guide](TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md), frame người chơi32×42/groundY36, collider12×12 offset10,29 và cách nạp/fallback hiện tại. Không đổi physics để khớp ảnh.
- Hai Class mới phải đọc được trên **bốn chủng tộc**, bốn hướng, Idle/Walk/Attack/Hurt/Death/Dodge; vũ khí chỉ hiện khi trang bị. Có contact sheet, preview cỡ thật trong game và portrait; ghi rõ pose tái sử dụng/lật, không báo số output như số hình độc lập.
- Art mới đi qua concept → người dùng duyệt → production → crop/anchor/metadata → tích hợp/runtime QA. Bản demo đã duyệt không phải duyệt trước mọi art sẽ tạo.
- NPC đồng hành có nhận diện và trạng thái chiến đấu rõ, không lẫn với tám dân trang trí. Hiệu ứng mới nhẹ, pause/destroy/đổi khu không rò node/body/listener/tween.
- Trước mỗi lần sửa source: backup local. Sau mỗi chặng code: `npm run build` và test hành vi bị tác động; sau tích hợp mốc lớn/cuối bản: `npm run verify`. Không chạy lại toàn bộ chỉ cho thay đổi tài liệu.
- Bốn Class cần hành trình bàn phím/chuột thật; fixture được dùng cho tình huống hẹp, không thay full journey. Kiểm solo và thêm NPC, skill/MP/cooldown/LOS/đạn, chết/replay/thưởng/save, UI ở1280×720/1366×768/1920×1080/500×800, ngày/đêm/fog/cổng.
- Đo trước/sau thời gian tải, frame time/FPS và số object tại cùng viewport/địa điểm/đội hình. Chỉ tối ưu khi có số đo, không đổi engine hoặc tăng ngưỡng để che cảnh báo chunk.
- Cập nhật queue/log/art/biên bản bằng kết quả thật sau mỗi task; lưu ảnh trước/sau khi sửa hình và ghi lỗi còn lại. Chưa có tiêu chí nào của v0.2 được đánh dấu đạt ở phiên này.

## 7. Sau v0.2 và bước bắt đầu

**v0.3:** chỉ lập/triển khai kế hoạch phòng bạn bè2–4 và đồng bộ cơ bản sau khi PvE/save ổn, có yêu cầu riêng của người dùng. Multiplayer cần xét mô hình máy chủ, quyền dữ liệu và bảo mật riêng. Kênh20–30 người, chợ online, bang hội/PvP, bất động sản, mô phỏng xã hội sâu, Class tiến hóa thuộc các mốc sau trong GDD; không kéo vào v0.2.

**Task đầu tiên khi được giao triển khai tiếp:** V02-00, tiếp tục **P0-03** từ `.cache/qa/2026-10-09-P0-03/`, không tạo lại B2/UX/Tro Tàn. Kiểm năm context thị trấn/rừng ngày–đêm/hầm ngục bằng WASD/E thật, fog trước/sau, save/Continue giữ discovery và các góc nhà/cây/cửa; chỉ sửa nếu có repro. Sau đó P0-04/05 và chốt P0-10 rồi V02-01. Không tự mở P1 hoặc code Class/companion chỉ vì đã có kế hoạch này.

**Trạng thái bàn giao10/10:** V02-PLAN DONE; V02-00…06 TODO. Người dùng đã chấp nhận demo hiện tại; phạm vi triển khai v0.2 chưa được chốt. Yêu cầu tiếp theo đã cho phép dùng lại Git, push vào `gamingbite/TAN-NGUYET` và xuất bản demo hiện tại qua Vercel tại `https://tan-nguyet-game.vercel.app`; xem [PUBLISHING](PUBLISHING.md). Quyền xuất bản không tự cho phép code v0.2; tiếp tục phát triển tại `D:\RPG GAMES` với backup và bảo toàn save.
