# Kế hoạch phát triển Demo v0.1 – TÀN NGUYỆT

**Ngày lập:** 08/10/2026. **Nguồn:** [GDD v0.1](../TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md), đã đọc toàn bộ mục 1–8 và bảng 75 lựa chọn.

Đây là kế hoạch triển khai và nghiệm thu demo. Nền tảng local **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.3** được giữ. Gameplay của mốc **01–19 đã được tích hợp**, gồm tạo nhân vật, ba khu, hai Class, nghề/kinh tế, chuỗi ba nhiệm vụ, sự kiện phong ấn, Boss và lưu cục bộ. Mốc20 có lịch sử65test ngày08/10, baseline68test và chỉ hướng83test ngày09/10. **Đợt09–10/10 theo yêu cầu đã duyệt tất cả:** B2 sáu trạng thái/bốn hướng, game phủ cửa sổ/HUD/menu trong game và làng15nhà/8dân đã tích hợp; verify B2 đạt97/97exit0,UI QA bốn viewport đạt. Sau nâng cấp Tro Tàn P0, verify gần nhất **99/99exit0**. Người dùng đã chấp nhận demo hiện tại10/10 và yêu cầu lập [kế hoạch v0.2 PvE](NEXT_PHASE_PLAN_V0_2.md); chưa triển khai v0.2. Các checklistP0 còn lại theo [DEMO_CHECK.md](DEMO_CHECK.md), [ART_PROGRESS.md](ART_PROGRESS.md) và [queue](AI_NEXT_TASKS.md). Cảnh kỹ thuật cũ vẫn ở `/foundation.html`.

**Git/push/xuất bản demo đã được người dùng cho phép10/10/2026** vào [gamingbite/TAN-NGUYET](https://github.com/gamingbite/TAN-NGUYET); [quy trình và trạng thái web](PUBLISHING.md). Các tên commit bên dưới vẫn là nhãn mốc tham khảo. Tiếp tục sao lưu local bằng `npm run backup -- before-feature-name` và kiểm tra trước khi commit/push; quyền xuất bản không tự mở triển khai v0.2.

## 1. Phạm vi và cách làm

### Trạng thái triển khai hiện tại

| Mốc | Trạng thái code local | Việc cần kiểm chứng khi nghiệm thu |
| --- | --- | --- |
| 00 | Nền tảng đã kiểm tra ở đợt trước | Giữ cảnh cũ và build cả hai entry |
| 01–02 | Tạo bốn chủng tộc, input/physics/camera, HUD/pause | Ngoại hình, va chạm, phím/focus và pause đúng |
| 03–05 | Ba map thủ công, fog, năm NPC theo giờ, travel và bí mật | Đường đi liên thông, NPC tiếp cận được; khóa/mở travel và khám phá được lưu |
| 06–09 | Hai Class/hai kỹ năng mỗi Class, ba quái, hồi sinh, XP chung, túi/trang bị/loot | Chiến đấu cả hai Class, quái respawn, death và trang bị không mất dữ liệu |
| 10–11 | Ba quest và sự kiện phá/khép phong ấn | Chỉ quái sự kiện tăng mục tiêu; E lần nữa để khép; thưởng một lần |
| 12–15 | Đào quặng, rèn, giả kim HP/MP, mua/bán Đồng | Vòng đào → craft → sử dụng/bán; thiếu tiền/chỗ/nguyên liệu và cooldown |
| 16–18 | Hầm ngục ba phòng, Boss hai phase, endpoint nộp quest và chơi tiếp | Boss/telegraph/replay và trở về nhận thưởng bằng cả hai Class |
| 19 | Save version 1 và tiếp tục bằng localStorage | Giữa lượt/sau kết thúc, dữ liệu lỗi được giữ, origin trình duyệt được giải thích |
| 20 | Hoàn thiện local và tích hợp art đã duyệt theo từng checklist | B2/UI/làng có QA riêng; P0-03/04/05/10 còn kiểm tra theo queue. Lịch sử65/68/83test được giữ, kết quả cuối tại DEMO_CHECK |

Đợt hoàn thiện hiện có trong code: player idle/walk/attack theo bốn hướng; frame quái/NPC/Boss; giữ Space/chuột để đánh; quái truy đuổi vòng vật cản theo chân và kiểm tra đường đánh; Boss phase 2 thêm fan đạn; HUD hồi chiêu/Boss; volume/mute/rung/số sát thương lưu riêng; toàn màn hình; xuất ô save JSON và xem trước → xác nhận khôi phục với backup raw duy nhất. Đây là phần hoàn thiện v0.1, không thêm full vision. Source trước đợt này ở `.local-backups/2026-10-08T13-05-46-068Z-before-demo-polish-KTf5kr/`.

Các mô tả mốc dưới đây được giữ để tiếp tục sửa từng tính năng nhỏ và đối chiếu kết quả. Bằng chứng kiểm tra cùng giới hạn được ghi riêng trong biên bản; không đồng nhất demo với full game hoặc asset sản xuất cuối cùng. Hướng dẫn chơi thực tế nằm ở [DEMO_GUIDE.md](DEMO_GUIDE.md), vị trí module ở [ARCHITECTURE.md](ARCHITECTURE.md).

### Đợt UI và art ngày 09/10

**Hoàn thành ART-B-02 ngày10/10:** đã tích hợp B2 sáu state/bốn hướng và avatar cùng renderer; game phủ cửa sổ bằng Scale.RESIZE, HUD trong vùng chơi, menu icon góc phải trên chứa chức năng/hướng dẫn/cài đặt. Làng có15nhà và8dân trang trí, giữ đường/NPC/cổng/mỏ cũ. B2 có pose dùng lại/lật được ghi trong metadata; không đổi collider người chơi, save hoặc timing combat. Verify cuối97/97exit0;QA B2 vàUI bốn viewport đạt,P0-09 DONE. Các đoạn dưới ghi mốc UI/art trước lần tích hợp này, không thay kết quả mới trong DEMO_CHECK/AI_SESSION_LOG.

Vùng chơi dùng bề ngang cửa sổ, các nút chuyển lên thanh công cụ; cẩm nang nằm trong **Hướng dẫn** (`H`), tracker và bước hành trình trong **Nhiệm vụ** (`J`). Build và 25 test demo/polish đạt trong 55,2 giây; smoke Edge ở bốn kích thước cửa sổ không tràn ngang hoặc lỗi JavaScript. Thay đổi bố cục không đổi canvas logic 800×450, physics hoặc quy tắc quest.

Bộ atlas AI-assisted có nguồn PNG local cho player bốn chủng tộc/bốn hướng/pose, năm NPC, ba quái/Boss hai phase, props, terrain và icon. Loader chuẩn hóa crop/common bounds/nearest và icon UI đã nối vào source, build đạt; smoke dev nạp đủ 162 frame không thiếu/cảnh báo/lỗi JavaScript. Icon áp cho 10 vật phẩm thật, sáu icon khác mới chuẩn bị; nền minh họa title 1672×941 đã nối CSS. Kiểm tra cuối sau điều chỉnh độ rõ terrain/fog và hồi quy gameplay đang chờ. Không tự thêm vật phẩm hoặc gameplay. VFX hurt/death/dodge vẫn procedural; NPC có frame walk nhưng lịch chưa dùng route đi đường.

Làm và nghiệm thu từng nhóm nhỏ: terrain/props → nhân vật và lớp trang bị → NPC → quái/Boss → icon/backdrop → kiểm tra lại đường chơi và lưu/tải. Giữ fallback, layout/collider, thời điểm hit, GDD và art guide gốc; ghi screenshot cùng kết quả thực tế trong [ART_PROGRESS](ART_PROGRESS.md). Chỉ đánh dấu `approved` sau phản hồi duyệt hình ảnh từ người dùng. Snapshot trước đợt này: `.local-backups/2026-10-09T01-47-14-765Z-before-art-guide-assets-5ALmoP/`.

### Vòng chơi cần đạt

Mục tiêu là chơi được vòng: tạo dân thường cấp 1 → nhận nhiệm vụ → đào quặng, chế tạo → học Class → khám phá rừng, chiến đấu và xử lý sự kiện → hạ Boss → trở về thị trấn nhận thưởng → tiếp tục chơi tự do. Điểm kết thúc nội dung bắt buộc là **hạ Boss đầu tiên và quay về thị trấn nộp nhiệm vụ**, theo GDD 6.2.

Thứ tự phát triển bám ranh giới P0 của GDD 6: **điều khiển → thế giới → chiến đấu → nhiệm vụ → nghề cơ bản → hầm ngục/Boss → lưu game**. Thứ tự lập trình không thay đổi thứ tự trải nghiệm của người chơi trong lượt demo cuối cùng. Những bản giữa chặng được gọi là bản thử tính năng; khung game hoặc một cảnh đi lại được chưa đủ để nghiệm thu Demo v0.1.

- Mỗi bước dưới đây là một mốc nhỏ; sao lưu local và kiểm tra phần mới cùng đường chơi đã hoạt động trước đó. Các đề xuất commit chỉ áp dụng khi người dùng cho phép dùng lại Git.
- Bản sau mỗi mốc tính năng cần mở được trên trình duyệt PC bằng cách chạy ghi trong README, không phải sửa mã thủ công để vào game.
- Khi đã có công cụ, chạy build thực tế; chạy thêm lint, kiểm tra kiểu dữ liệu hoặc test nếu project có các lệnh đó và chúng phù hợp với thay đổi. Không ghi một kiểm tra là đạt khi chưa chạy.
- Ưu tiên phép thử trực tiếp trong game cho điều khiển, va chạm, nhịp chiến đấu và trải nghiệm. Dùng test tự động có ý nghĩa cho giao dịch vật phẩm, quest, tiền và lưu/tải khi những hệ thống này được tạo.
- Giữ code/module đang chạy; không thay framework, cấu hình quan trọng hoặc dữ liệu lưu một cách âm thầm. Ghi rõ giới hạn của mỗi bản thử trong README hoặc ghi chú commit.
- Các thao tác chưa làm không được hiện thành nút giả. Có thể ẩn chúng hoặc ghi rõ “Đang phát triển”; chỉ tuyên bố demo hoàn tất khi đáp ứng toàn bộ phần bắt buộc của GDD 6.1 và 6.5.

## 2. Các mốc tính năng và nhãn commit tham khảo

### Bước nền tảng – chốt công nghệ trước khi viết game

**00. `chore: establish browser development and build workflow` — Đã chuẩn bị nền tảng local**

- Công việc: thống nhất framework/engine phù hợp game 2D trên trình duyệt PC; sau đó tạo công cụ phát triển, entry point, cấu trúc module, script chạy và build, cập nhật README đúng các lệnh thực tế. Nếu về sau có code/framework sẵn thì dùng hệ thống đó, không thay tùy tiện.
- Kết quả chạy được: trình duyệt mở một cảnh kiểm tra đơn giản của project và bản build cũng mở được. Đây là nền tảng kỹ thuật, chưa phải demo gameplay.
- Nghiệm thu: cài được từ manifest/lockfile đã tạo; lệnh chạy và build đều thành công; tài liệu phân biệt môi trường dev với bản build; không cần đăng nhập hoặc máy chủ Multiplayer.

### P0.1 – điều khiển và nhân vật

**01. `feat: create a civilian character`**

- Công việc: màn hình bắt đầu và tạo nhân vật; Con Người, Tinh Linh, Người Lùn, Thú Nhân; tên, giới tính, tóc, màu da; ngoại hình cơ bản phân biệt được.
- Kết quả chạy được: tạo nhân vật rồi xuất hiện trong cảnh thị trấn thử nghiệm ở thân phận dân thường cấp 1.
- Nghiệm thu: cả bốn chủng tộc tạo được, có chỉ số khởi đầu cân bằng; lựa chọn ngoại hình hiển thị đúng sau khi vào game; thao tác nhập tên không kích hoạt điều khiển nhân vật.

**02. `feat: add movement collision and pause`**

- Công việc: điều khiển bàn phím/chuột, di chuyển top-down, va chạm, camera, tương tác gần, HUD cơ bản và menu pause.
- Kết quả chạy được: đi quanh cảnh thị trấn, chạm tường, tương tác một đối tượng và tạm dừng/tiếp tục.
- Nghiệm thu: không xuyên vật cản, không tăng tốc ngoài ý muốn khi đi chéo; pause dừng mô phỏng; rời rồi quay lại cửa sổ không làm nhân vật chạy liên tục; có hướng dẫn điều khiển trong game.

### P0.2 – thế giới

**03. `feat: connect town forest and dungeon entrance`**

- Công việc: dựng thủ công một thị trấn, một khu rừng và bố cục hầm ngục; nối đường đi/cửa chuyển khu; mở sương mù đơn giản theo vị trí khám phá.
- Kết quả chạy được: đi từ thị trấn vào rừng, tới cửa hầm ngục và trở lại; chưa có Boss ở bước này.
- Nghiệm thu: đường đi liên thông, điểm xuất hiện không nằm trong tường; khu chưa tới còn bị che, vùng đã đi được mở; bố cục hầm ngục cố định, không sinh ngẫu nhiên.

**04. `feat: add town NPC dialogue and daily schedules`**

- Công việc: 3–5 NPC quan trọng, thoại cố định, chu kỳ ngày/đêm và lịch sinh hoạt đơn giản. Có thể dùng năm vai trò: hướng dẫn, dạy Class, Thợ Rèn, Nhà Giả Kim, thương nhân; đây là phân vai đề xuất, chưa chốt tên hoặc nội dung thoại.
- Kết quả chạy được: tìm và trò chuyện với NPC ở những vị trí theo thời gian trong ngày.
- Nghiệm thu: lịch thực sự thay đổi hành vi/vị trí, thoại mở và đóng đúng; người chơi luôn có cách tiếp cận NPC cần cho tiến trình, không bị mắc kẹt vì lịch; không cần hệ trí nhớ hoặc mô phỏng xã hội sâu.

**05. `feat: unlock a visited travel point and a small secret`**

- Công việc: một điểm dịch chuyển mở sau lần đầu tự đi đến; một bí mật nhỏ tìm bằng khám phá, không cần marker nhiệm vụ.
- Kết quả chạy được: tự đi đến địa điểm rồi sử dụng dịch chuyển; tìm được tương tác/phần thưởng bí mật.
- Nghiệm thu: chưa tới thì không dịch chuyển được; sau khi tới thì dùng được; bí mật có kết quả thật, không chỉ là trang trí hay một nút rỗng.

### P0.3 – chiến đấu, Class và vật phẩm

**06. `feat: learn sword and mage classes with basic combat`**

- Công việc: học Kiếm Sĩ và Pháp Sư qua NPC; đòn đánh cơ bản, né/lướt, 1–2 kỹ năng cố định mỗi Class, HP/năng lượng và hồi chiêu; đổi Class đã mở ngoài chiến đấu, có hồi chiêu ngắn.
- Kết quả chạy được: học từng Class và thử đòn đánh/kỹ năng trên mục tiêu luyện tập.
- Nghiệm thu: hai Class có thao tác chiến đấu khác nhau và đều gây tác động thật; không dùng kỹ năng khi thiếu năng lượng hoặc đang hồi chiêu; đổi Class trong giao tranh bị chặn; có hiệu ứng và phản hồi trúng đòn. Các mức sát thương/hồi chiêu ban đầu là thông số thử nghiệm.

**07. `feat: add two or three enemy types with respawn`**

- Công việc: 2–3 loại quái tại khu vực xác định; tuần tra, phát hiện, truy đuổi, đánh và hồi sinh sau thời gian chờ.
- Kết quả chạy được: chiến đấu bằng cả hai Class trong rừng, hạ quái rồi thấy quái hồi sinh.
- Nghiệm thu: quái chuyển trạng thái đúng, không đánh từ ngoài phạm vi; chết thì ngừng đánh, không gây sát thương lặp sai; hồi sinh đúng vùng; âm thanh/hiệu ứng đánh hoạt động sau khi người chơi tương tác với trang game.

**08. `feat: add checkpoint revival and shared character progress`**

- Công việc: HP về 0 thì hồi sinh gần checkpoint; XP/cấp nhân vật chung từ chiến đấu, kỹ năng cố định mở theo cấp nếu dùng ngưỡng mở khóa trong bản thử.
- Kết quả chạy được: bị hạ gục, trở lại checkpoint và tiếp tục chiến đấu; tăng cấp thử bằng gameplay.
- Nghiệm thu: không mất túi đồ hoặc tiến độ; đổi Class không đổi thành một cấp riêng; không tự áp thời gian hồi sinh bang chiến vào PvE. Không thêm cây kỹ năng phân nhánh hoặc luật phạt chết chưa thống nhất.

**09. `feat: add inventory loot and class equipment`**

- Công việc: túi giới hạn ô/stack, nhặt đồ, mang/tháo trang bị; một bộ cơ bản cho mỗi Class; vũ khí theo Class và giáp dùng chung khi đủ điều kiện; ngoại hình phản ánh trang bị.
- Kết quả chạy được: nhặt vật phẩm rơi từ quái, mở túi, trang bị món hợp lệ và thấy chỉ số/hình ảnh thay đổi.
- Nghiệm thu: stack đúng, túi đầy được xử lý rõ và không làm mất đồ âm thầm; món sai Class không trang bị được; đổi Class không xóa vật phẩm; không xây hệ thời trang riêng.

### P0.4 – nhiệm vụ và hành động gây hệ quả

**10. `feat: add guided quests and a short quest log`**

- Công việc: trạng thái nhận/theo dõi/hoàn thành/nộp quest, chỉ dẫn, quest log và thưởng XP/vật phẩm. Chuỗi cuối cùng có 2–3 nhiệm vụ, đủ nối nghề nghiệp, sự kiện rừng và hầm ngục; tên/chỉ tiêu cụ thể sẽ được viết khi làm nội dung.
- Kết quả chạy được: nhận một nhiệm vụ có mục tiêu chiến đấu đã hỗ trợ, hoàn thành rồi quay lại NPC nộp và nhận thưởng; các mục tiêu nghề/Boss được tích hợp ở bước tương ứng sau.
- Nghiệm thu: mục tiêu tăng từ hành động thật; không nộp khi chưa đủ điều kiện; thưởng chỉ một lần; không báo chuỗi demo hoàn tất khi chưa có nghề hoặc Boss. Không cần tạo nhiệm vụ phụ chỉ để kiểm tra rồi giữ lại vượt phạm vi 2–3 quest.

**11. `feat: add a reversible player-triggered forest event`**

- Công việc: một tương tác cụ thể trong rừng kích hoạt hậu quả và nhiệm vụ giải quyết, ví dụ phá phong ấn làm quái xuất hiện rồi dọn dẹp. Ví dụ này là đề xuất nội dung, không phải quyết định mới sửa GDD.
- Kết quả chạy được: người chơi gây ra sự kiện, thấy thay đổi trong thế giới, làm nhiệm vụ và xử lý được hậu quả.
- Nghiệm thu: trước tương tác không có hậu quả; sau tương tác hậu quả xuất hiện có dấu hiệu nguyên nhân; dọn dẹp kết thúc sự kiện thật; tương tác lặp không nhân bản thưởng hoặc làm tiến trình kẹt.

### P0.5 – ba nghề, kinh tế và thuốc

**12. `feat: mine ore by holding an interaction`**

- Công việc: khai thác bằng cuốc và giữ nút trong vài giây; mỏ cạn rồi tái sinh; đưa quặng vào túi và nối vào mục tiêu nhiệm vụ nghề.
- Kết quả chạy được: đi tới mỏ, đào, nhận quặng, chờ mỏ tái sinh rồi đào tiếp.
- Nghiệm thu: rời phạm vi/nhả nút hủy hoặc xử lý tiến độ rõ; không nhận quặng nhiều lần từ một lượt khai thác; túi đầy không gây mất dữ liệu; không có mini-game.

**13. `feat: craft basic equipment from known recipes`**

- Công việc: bảng nghề/chế tạo, công thức cơ bản học/mua qua NPC, kiểm tra công thức và nguyên liệu; Thợ Rèn chế tạo trang bị cơ bản có thể dùng/bán.
- Kết quả chạy được: đào quặng → học công thức → chế tạo → mang trang bị; nhiệm vụ nghề theo dõi đúng hành động.
- Nghiệm thu: thiếu công thức/nguyên liệu thì không craft; thành công trừ đúng nguyên liệu, thêm đúng thành phẩm; chất lượng theo công thức, không ngẫu nhiên; xử lý túi đầy trước khi giao dịch. Cường hóa có thể để ngoài bản đầu vì GDD ghi “nếu đủ thời gian”.

**14. `feat: brew and use recovery potions`**

- Công việc: Nhà Giả Kim có một thao tác pha thuốc hoàn chỉnh; hỗ trợ thuốc hồi HP/MP và cooldown khi sử dụng. Buff chỉ thêm nếu có thời gian, luôn giới hạn một buff sức mạnh chính.
- Kết quả chạy được: pha thuốc từ nguyên liệu rồi dùng trong hoặc sau chiến đấu để hồi phục.
- Nghiệm thu: nguyên liệu/thành phẩm thay đổi đúng; không uống vượt cooldown; HP/MP không vượt giới hạn; nếu có buff thì thay thế hoặc chặn buff thứ hai theo quy tắc được ghi rõ; không thêm bom giả kim.

**15. `feat: trade with an NPC at fixed prices`**

- Công việc: một thương nhân mua/bán giá cố định; hiển thị Đồng/Bạc/Vàng cơ bản. Chưa tự chọn tỷ lệ quy đổi: đề xuất cho bản thử là giao dịch chỉ bằng Đồng và giữ các mệnh giá còn lại hiển thị riêng; phải ghi rõ giới hạn này trước khi triển khai.
- Kết quả chạy được: bán một vật phẩm đã chế tạo, nhận tiền, mua lại một vật phẩm với giá cố định.
- Nghiệm thu: không mua khi thiếu tiền/chỗ trống, không bán món không sở hữu; bấm nhanh không làm âm tiền hoặc nhân bản vật phẩm; tỷ lệ Đồng/Bạc/Vàng không bị ngầm mặc định. Nhiệm vụ mở đầu nối được đào quặng → chế tạo → học Class theo GDD 6.2.

### P0.6 – hầm ngục và Boss

**16. `feat: add playable handcrafted dungeon rooms`**

- Công việc: hoàn thiện các phòng hầm ngục đã dựng, điều kiện mở theo quest, quái và checkpoint; đường vào/ra rõ ràng.
- Kết quả chạy được: từ chuỗi nhiệm vụ vào hầm ngục, vượt vài phòng và đến khu vực Boss chuẩn bị cho bước kế tiếp.
- Nghiệm thu: bố cục thủ công cố định; cửa không gây mắc kẹt; chết giữ vật phẩm/quest; trở lại được đường chơi trước đó. Chưa tuyên bố nhiệm vụ Boss hoàn thành ở bước này.

**17. `feat: fight a two-phase boss and replay the dungeon`**

- Công việc: một Boss đổi giai đoạn theo HP, bộ đòn thay đổi và cảnh báo đòn nguy hiểm; Boss mới khi bắt đầu lượt hầm ngục mới.
- Kết quả chạy được: dùng Kiếm Sĩ hoặc Pháp Sư hạ Boss hai giai đoạn, rời hầm ngục rồi vào lại để chơi lượt mới.
- Nghiệm thu: hai giai đoạn quan sát được; cảnh báo xuất hiện trước đòn, có cơ hội né; cả hai Class hoàn thành được; chết hồi checkpoint; replay không dùng Boss đã chết hoặc tạo Boss trùng. Chưa thêm giới hạn thưởng hiếm ngày/tuần chưa chốt.

**18. `feat: finish the demo quest and keep free exploration`**

- Công việc: sau hạ Boss, trở về NPC thị trấn nộp quest, nhận thưởng và thông điệp kết thúc nội dung cốt truyện Demo v0.1; rà lại 2–3 quest và thứ tự lượt chơi GDD 6.2.
- Kết quả chạy được: hoàn thành toàn bộ lượt chơi bắt buộc; tiếp tục đào, craft, đánh quái và replay hầm ngục sau đó.
- Nghiệm thu: chỉ hiện thông điệp sau hạ Boss **và nộp nhiệm vụ tại thị trấn**; nhận thưởng một lần; thế giới vẫn hoạt động sau kết thúc; không khóa vào màn hình kết thúc vĩnh viễn. Chưa nghiệm thu toàn bộ demo trước khi có lưu/tải ở bước sau.

### P0.7 – lưu game và nghiệm thu

**19. `feat: save and continue local progress`**

- Công việc: lưu cục bộ có phiên bản dữ liệu; menu lưu/tiếp tục; lưu nhân vật/ngoại hình, level/XP, Class đã mở, túi/trang bị/tiền, quest, khám phá và điểm dịch chuyển; giữ trạng thái sự kiện và kết thúc demo nhất quán.
- Kết quả chạy được: lưu ở giữa lượt chơi, đóng/mở lại trình duyệt rồi tiếp tục đúng tiến trình; cũng tiếp tục chơi tự do từ bản lưu đã kết thúc nội dung demo.
- Nghiệm thu: tải lại không mất đồ hoặc cấp, không nhận thưởng quest lại, không che lại vùng đã khám phá hoặc khóa điểm đã mở; báo rõ khi không lưu/tải được; dữ liệu lỗi không bị ghi đè âm thầm. Lưu trình duyệt gắn với thiết bị/trình duyệt và địa chỉ chạy, không phải đồng bộ tài khoản online.

**20. `fix: verify the complete demo on a production build`**

- Công việc: sửa lỗi còn lại; kiểm tra giao diện, âm thanh/hiệu ứng đánh/nhặt đồ/craft; cập nhật README theo cách cài, chạy và build thực tế; đóng gói bản thử.
- Kết quả chạy được: bản build mở từ trình duyệt PC, tạo nhân vật mới và hoàn thành demo mà không chỉnh mã nguồn.
- Nghiệm thu: dùng ma trận mục 3 bên dưới; chạy lượt đầy đủ riêng với Kiếm Sĩ và Pháp Sư, thử chết/hồi sinh, lưu/tải giữa lượt và sau kết thúc. Ghi kết quả, trình duyệt đã thử, lỗi thực tế và phần tùy chọn đã hoãn; chỉ gọi là Demo v0.1 hoàn tất khi phần bắt buộc đạt.

## 3. Ma trận đối chiếu khi nghiệm thu

| Yêu cầu GDD 6.1/6.5 | Bước tích hợp | Kiểm tra cuối cùng |
|---|---|---|
| PC trình duyệt, không đăng nhập, bàn phím/chuột | 00–02, 20 | Bản build chạy và vào game từ màn hình bắt đầu |
| Bốn chủng tộc, tùy chỉnh cơ bản, dân thường cấp 1 | 01 | Tạo riêng cả bốn chủng tộc, ngoại hình/chỉ số đúng |
| Thị trấn + rừng + hầm ngục thủ công, nối đường | 03, 16 | Đi qua đủ ba khu và quay về |
| Sương mù và một điểm dịch chuyển sau khi tự tới | 03, 05, 19 | Không dịch chuyển trước khám phá; lưu/tải vẫn giữ trạng thái |
| Kiếm Sĩ/Pháp Sư học qua NPC, đổi ngoài giao tranh | 06, 15, 18 | Mỗi Class hoàn thành lượt chơi; đổi trong giao tranh bị chặn |
| Đòn cơ bản, né, 1–2 kỹ năng/Class, HP/năng lượng | 06–08 | Tấn công, cooldown, trúng đòn và hồi sinh hoạt động |
| 2–3 loại quái tuần tra/truy đuổi/đánh/respawn | 07 | Hạ quái, chờ rồi thấy hồi sinh đúng vùng |
| Boss hai giai đoạn, telegraph và dungeon replay | 16–17 | Hạ Boss và chơi lại lượt mới |
| 3–5 NPC, thoại và lịch ngày/đêm | 04 | Gặp NPC theo lịch, không bị chặn tiến trình |
| 2–3 quest có chỉ dẫn và một bí mật tự tìm | 05, 10–11, 15–18 | Theo chỉ dẫn đến Boss; bí mật tìm được bằng khám phá |
| Một sự kiện có nguyên nhân và cách giải quyết | 11, 19 | Tương tác kích hoạt, dọn dẹp kết thúc; lưu/tải nhất quán |
| Mỗi nghề có một thao tác hoàn chỉnh, không mini-game | 12–14 | Đào → craft → dùng/bán; pha và dùng thuốc |
| Túi giới hạn ô/stack, loot, bộ trang bị mỗi Class | 09, 13 | Túi đầy, stack, mang/tháo và hình ảnh trang bị đúng |
| Một thương nhân giá cố định; hiển thị Đồng/Bạc/Vàng | 15 | Mua/bán đúng tiền/đồ; không có tỷ lệ đổi tự đặt |
| Thuốc HP/MP có cooldown; buff tối đa một nếu có | 14 | Dùng liên tiếp bị chặn đúng; hồi phục đúng giới hạn |
| Start/tạo nhân vật, HUD, túi, thoại, quest log, nghề, pause, lưu/tiếp tục | 01–02, 04, 09–10, 13–14, 19 | Các màn hình thao tác được, không có nút giả |
| Phản hồi âm thanh/hiệu ứng, điều khiển mượt | 06–07, 09, 13, 20 | Có phản hồi khi đánh, nhặt và craft; không có đói/khát/ngủ |
| Kết thúc nội dung sau Boss và nộp quest, vẫn chơi tự do | 18–20 | Hiện đúng thông điệp rồi tiếp tục nghề/chiến đấu/replay |
| Lưu/tải nhân vật, level, đồ, quest, khám phá | 19–20 | Tiếp tục giữa lượt và sau kết thúc, không nhân bản thưởng |

Nâng cấp/cường hóa đơn giản là **tùy chọn nếu đủ thời gian** theo GDD 6.1, không dùng làm điều kiện chặn phát hành. Khi chưa làm thì không đưa nút cường hóa có vẻ sử dụng được vào bản thử.

## 4. Quyết định còn mở và kiểm tra tính nhất quán

- **Framework/engine:** nền tảng ban đầu đã chọn Phaser 3.90.0 + TypeScript + Vite cho web PC. Giữ framework đã có, không tự thay khi bổ sung tính năng. Thông số của cảnh thử chưa phải thông số gameplay cuối cùng.
- **Tỷ lệ Đồng/Bạc/Vàng:** chưa chốt ở GDD 4.3 và 6.3. Không mặc định 100:1 hoặc tỷ lệ khác. Cách giao dịch chỉ bằng Đồng ở bước 15 là đề xuất phạm vi thử nghiệm, không sửa thiết kế ba mệnh giá.
- **Cường hóa:** % thành công theo cấp chưa có thông số; thất bại mất nguyên liệu và không phá đồ đã chốt, nhưng **tụt cấp chưa chốt**. Nếu triển khai tùy chọn này, ghi rõ thông số thử và xử lý phần chưa chốt trước; không thêm luật tụt cấp.
- **Câu 76:** thời lượng, điểm mục tiêu và điều kiện thắng bang chiến chưa được chọn. Không biến đề xuất trước đó thành quy tắc, không kéo bang chiến vào v0.1.
- **Thông số cân bằng:** sát thương, HP, XP/ngưỡng cấp, giá cố định, kích thước túi/stack, thời gian khai thác/respawn/hồi chiêu và ngưỡng phase cần thử. Đưa vào dữ liệu/cấu hình dễ chỉnh và ghi rõ chưa phải thông số cuối cùng.
- **Nội dung chi tiết:** GDD không chốt tên NPC/quái/Boss, thoại, công thức hoặc số lượng/phần thưởng quest. Prototype hiện dùng Thị trấn Tro Tàn, Rừng Vọng Nguyệt, Hầm mộ Tàn Nguyệt; năm NPC và ba quest trong `catalog.ts`/`maps.ts`. Đây là nội dung playtest, không sửa GDD thành lựa chọn đã được xác nhận.
- **Phân biệt phạm vi:** bảng 75 lựa chọn ở GDD 7 có nhãn D/R/S ở cấp hệ thống, còn GDD 6.1 giới hạn phần phải có trong demo. Ví dụ câu 38 nhắc nâng túi/kho nhưng 6.1 chỉ yêu cầu túi giới hạn ô/stack; kế hoạch không tự thêm nâng túi/kho vào P0. Tương tự, full vision có bốn Class, preset/reset chỉ số và nhiều hệ thống dài hạn; nghiệm thu v0.1 bám phần đủ dùng ở mục 6.
- **Các mốc phù hợp nhau:** thứ tự lập trình P0 được giữ; vòng chơi cuối vẫn làm nghề trước học Class; chết giữ đồ/tiến độ; checkpoint PvE không dùng thời gian hồi sinh bang chiến; kết thúc demo vẫn mở chơi tự do. Không phát hiện yêu cầu bắt buộc của GDD 6.1 bị bỏ khỏi ma trận.

## 5. Quy trình kiểm tra đã áp dụng và dùng cho thay đổi tiếp theo

1. Chạy đường chơi thật từ tạo dân thường → tự đào → rèn → học Class → xử lý phong ấn → Boss → nộp tại thị trấn; làm riêng với Kiếm Sĩ và Pháp Sư.
2. Thử giao dịch/túi đầy/trang bị, kỹ năng/thuốc/hồi chiêu, giữ/nhả Space/chuột đánh, rời/nhả E khi đào, phím/focus khi đóng bảng và chuyển khu. Đối chiếu frame theo bốn hướng và loadout, pause không chạy animation; quái vòng vật cản và đòn không qua tường.
3. Thử death/checkpoint, lưu giữa chuỗi và sau kết thúc, tải lại không nhận thưởng lặp, tiếp tục chơi tự do và Boss mới trong lượt dungeon mới. Thử xuất đúng ô đã lưu, preview file chưa đổi dữ liệu, restore hợp lệ backup nguyên raw hiện tại kể cả lỗi; mỗi backup có khóa khác và lỗi backup chặn restore. Thử danh sách backup, tải bản lỗi, preview/restore mốc hợp lệ và giữ nguyên tất cả mốc cũ.
4. Chạy bản build, kiểm tra console/giao diện hẹp, HUD hồi chiêu/Boss và fan đạn phase 2. Thử volume/mute/rung/số sát thương áp dụng và giữ qua reload bằng khóa riêng, fullscreen thật; phản hồi/âm nền không cần tài nguyên ngoài.
5. Cập nhật biên bản theo kết quả thực tế và giữ mốc 40 test cũ làm lịch sử. Đợt này đã đối chiếu 16 file cần bảo toàn và GDD giữ nguyên; snapshot chốt dùng nhãn `demo-v01-polished-verified`, snapshot `demo-v01-verified` thuộc đợt trước. Không dùng Git hoặc upload.

Đợt art 09/10 thay từng nhóm procedural bằng PNG theo [ASSET_GUIDE.md](ASSET_GUIDE.md), giữ fallback và kiểm tra lại trong runtime. Kết quả UI mới đã có; nghiệm thu atlas mới được ghi riêng sau khi thử thực tế. Thông số playtest tiếp tục có thể chỉnh từng phần; cường hóa/buff đặc biệt và full vision không trở thành điều kiện chặn demo đầu.

## 6. Sau Demo v0.1 – không đưa vào kế hoạch chính

**Cập nhật10/10/2026:** người dùng chấp nhận demo và yêu cầu lên kế hoạch giai đoạn tiếp theo. [Kế hoạch v0.2 PvE](NEXT_PHASE_PLAN_V0_2.md) tách các chặng V02-00…06, phụ thuộc save/art, nghiệm thu và phạm vi cần chốt; mới là đề xuất, chưa triển khai. Các mốc00–20 ở trên được giữ làm lịch sử v0.1, không xây lại.

Theo GDD 6.3–6.4, chỉ cân nhắc khi v0.1 đã chơi và lưu/tải ổn định:

- **v0.2:** Cung Thủ/Tu Sĩ, một NPC đồng hành, thêm nội dung PvE và cân bằng. Cơ chế thuê/AI/lệnh cần kế hoạch riêng.
- **v0.3:** thử phòng bạn bè 2–4 người và đồng bộ cơ bản; chưa đặt mục tiêu 20–30 người là điều kiện của bản thử này.
- **Alpha:** kênh công cộng, chat, bạn bè, chợ, bất động sản, bang hội/bang chiến và thêm vùng đất; giải quyết các quyết định thiết kế còn mở trước mỗi hệ thống.
- **Full game:** nhiều vương quốc, chính trị, mô phỏng NPC sâu, truyện phân nhánh, tiến hóa Class và xã hội đầy đủ.

Không cài máy chủ Multiplayer, tạo đăng nhập, thêm chợ người chơi, NPC đánh thuê, bang hội, PvP hoặc hệ sinh tồn bắt buộc chỉ để chuẩn bị cho v0.1.
