# TÀN NGUYỆT — TOWN PLANNING GUIDE

**Phiên bản:** 1.1 — Quy hoạch và nâng cấp mỹ thuật **Thị trấn Tro Tàn** cho demo v0.1  
**Mục đích:** Tài liệu triển khai trực tiếp cho Codex/AI lập trình và AI art.  
**Trạng thái:** TOWN-00/01/02/03 vàTOWN-05 nghiệm thu P0 hoàn thành10/10/2026 theo yêu cầu trực tiếp; verify99/99exit0. Người dùng đã chấp nhận demo hiện tại10/10 qua “demo vậy là oke rồi”. TOWN-04/P1 chưa mở; [kế hoạch giai đoạn tiếp](NEXT_PHASE_PLAN_V0_2.md) chỉ là đề xuất. Không coi tọa độ đề xuất là quy tắc GDD mới.  
**Phạm vi:** **Chỉ thị trấn `town`**. Không xây lại game, không thêm multiplayer, không biến quán trọ/thương mại thành hệ thống mới.

## 0. Đọc trước khi sửa — bắt buộc

Thứ tự ưu tiên: yêu cầu trực tiếp của người dùng → `AGENTS.md` hiện tại → GDD gốc → Art Guide → tài liệu này (quy hoạch mỹ thuật). Nếu có mâu thuẫn, **không tự ý sửa gameplay để phù hợp phối cảnh**.

Đọc các file **đang có trong project `D:\\RPG GAMES`**:

- `AGENTS.md` — **đang quy định chỉ thao tác local, tạm dừng toàn bộ thao tác Git**, kể cả `git status`.
- `TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md` — GDD gốc.
- `docs/TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md`, `docs/ASSET_GUIDE.md`, `docs/ART_PROGRESS.md` — art style, pipeline hiện tại và trạng thái nghiệm thu.
- `docs/DEMO_GUIDE.md`, `docs/DEMO_CHECK.md` — luồng chơi và baseline test.
- `src/game/world/maps.ts`, `src/game/model/types.ts`, `src/game/scenes/DemoScene.ts`, `src/game/world/ArtManifest.ts`, `src/game/world/RasterArt.ts`, `src/game/world/textures.ts` — vị trí cần xem trước khi bổ sung hình ảnh/thế giới.
- `tests/world.spec.ts`, `tests/navigation.spec.ts`, `tests/journey.spec.ts`, `tests/art.spec.ts` — hồi quy liên quan.

**Không xóa/sửa save của người dùng**; trước thay đổi lớn dùng `npm run backup -- before-town-visual-upgrade` theo quy định repo. Không tự chạy Git, upload, push hay deploy. Không thay Phaser/TypeScript/Vite và dependency nếu không thật sự cần.

## 1. Hiện trạng ĐÃ XÁC NHẬN từ `RPG GAMES.zip`

> Đây là số liệu từ bản ZIP người dùng gửi. Nếu thư mục máy có thay đổi sau bản ZIP, phải ưu tiên mã nguồn **hiện tại** trên máy.

**Đối chiếu source local10/10:** đã có15nhà/8dân nền(3đêm),5NPC/11object,9path/43obstacle. Nâng P0 trên bố cục này, giữ khung hình hiện tại; không tái thiết từ ZIP5nhà. Layer art mới ở `TownVisuals.ts`/`VillageLife.ts`, không sửa `maps.ts`. Tiến độ và bằng chứng mới: [TOWN_UPGRADE_REPORT.md](TOWN_UPGRADE_REPORT.md).

| Thành phần | Hiện trạng trong source |
|---|---|
| Map thị trấn | `ZONES.town`, `src/game/world/maps.ts`, **960 × 640 world units** |
| Điểm spawn nhân vật | `(480, 400)` |
| Đường sang Rừng Vọng Nguyệt | `town-forest` tại **(916, 320)**, cổng ra **phía Đông (bên phải)** |
| Trưởng làng An | `(480, 213)` |
| Sư phụ Dạ | `(276, 324)` |
| Thợ rèn Lâm | `(186, 502)` |
| Giả kim Liên | `(756, 247)` |
| Thương nhân Vũ | `(620, 326)` |
| Quặng | `(755,486)`, `(820,500)`, `(874,456)` |
| Nguyệt thảo | `(672,212)`, `(580,468)` |
| Nhà hiện tại | Trung tâm Bắc `(480,128)`; Tây Bắc `(180,158)`; Đông Bắc `(760,168)`; Tây Nam `(180,430)`; Nam `(510,528)` |
| Địa hình | `paths`, `obstacles`, `decorations`, `objects` khai báo bằng TypeScript, chưa chuyển sang Tiled |
| Art nguồn đang dùng | `public/assets/atlases/world_props_v1.png`, `terrain_tiles_v1.png`; metadata ở `ArtManifest.ts`; có renderer procedural dự phòng |
| Nhân vật/NPC | NPC nghề và nhiệm vụ **đã tương tác thật**, lịch ngày/đêm đang hoạt động; không đổi `id`/`role`/tọa độ chỉ để trang trí |

**Sơ đồ bố trí trước đây chỉ là ý tưởng.** Tuyệt đối không đổi cổng từ Đông xuống Nam nếu chưa có yêu cầu riêng. Chỉ dùng sơ đồ mục 2 như **định hướng thị giác**, không coi là pathfinding/collision thật.

## 2. Bản đồ quy hoạch 8 cụm — DỰA TRÊN ĐỊA HÌNH HIỆN CÓ

Hướng **Bắc ở trên; Đông bên phải**. Bố cục dạng *cụm nhận diện*, không cần tám bản đồ hay tám hệ thống gameplay mới.

```text
             BẮC — nhà & biểu tượng Tàn Nguyệt
┌───────────────────────────────────────────────────────┐
│ [Cụm dân cư TB] [MẶT TIỀN ĐỀN/BIỂU TƯỢNG] [Dân cư ĐB]│
│                                                       │
│                  Trưởng làng An           Giả kim Liên │
│      Sư phụ Dạ      ┌──────────────┐   [Xưởng giả kim]│
│ [Sân luyện nhỏ]     │ QUẢNG TRƯỜNG │ [CHỢ: Thương nhân]├─→ RỪNG
│                     │ Mosaic/Đèn   │    + sạp hàng     │   (916,320)
│                     └──────────────┘                 │
│                        Spawn (480,400)                │
│ [LÒ RÈN/TÂY NAM]   [QUÁN TRỌ / NHÀ]    [Cụm QUẶNG]     │
│ Thợ rèn Lâm       [đồ trang trí]      [giữ điểm mỏ]   │
│              Cây / hoa / đèn / ghế / xe hàng           │
└───────────────────────────────────────────────────────┘
                          NAM
```

### Bảng quy hoạch theo cụm

| ID | Khu vực | Neo gần tọa độ đang có | Mục tiêu thị giác | Vật thể/hiệu ứng gợi ý | Mức |
|---|---|---|---|---|---|
| T01 | **Cổng Đông** | `(916,320)` | Lối ra rừng dễ nhìn; báo hiệu khu an toàn | Cổng đá/gỗ hai bên đường, cờ, đuốc, biển chỉ hướng | P0 |
| T02 | **Quảng trường** | Quanh `(480,340)`; **không che spawn `(480,400)`** | Trung tâm sáng, đẹp, dễ nhận diện | Hoa văn lát nền, biểu tượng trăng khuyết **phẳng**, chậu cây, đèn ấm; không đặt đài phun nước đặc ngay lối đi | P0 |
| T03 | **Chợ sầm uất** | Quanh Thương nhân Vũ `(620,326)` | Thấy có giao thương | Mái che, sạp nhỏ, thùng hàng, bao tải, xe đẩy; giữ vùng thao tác NPC trống | P0 |
| T04 | **Lò rèn** | Quanh Thợ rèn Lâm `(186,502)` | Cảm giác sản xuất, lao động | Bảng hiệu búa/đe, ánh lò cam, tia lửa nhỏ, giá giáp/kiếm; không che NPC và lối tới mỏ | P0 |
| T05 | **Giả kim** | Quanh Giả kim Liên `(756,247)` | Ma thuật nổi bật giữa phố | Bình thuốc, bàn gỗ, phù văn nhỏ, ánh tím/cyan nhẹ, khói rất ít | P0 |
| T06 | **Quán trọ** | Mặt tiền nhà gần `(510,528)` | Góc ấm cúng để cảm thấy thị trấn có đời sống | Biển quán trọ, cửa sổ sáng, thùng hàng, ghế gỗ. **Chỉ trang trí**, chưa thêm NPC thuê đồng hành hay nút giả | P0 trang trí / P2 chức năng |
| T07 | **Khu dân cư** | Quanh nhà `(180,158)`, `(760,168)`, `(180,430)` | Có người sống, khác nhau theo cụm | Hàng rào thấp, hoa, thùng nước, giếng nhỏ, khói bếp, ánh cửa sổ | P1 |
| T08 | **Dấu tích Tàn Nguyệt** | **Mặt tiền/đường dẫn** phía Bắc, quanh nhà `(480,128)`; không chiếm NPC `(480,213)` | Landmark gắn lore, điểm chụp hình | Biểu tượng trăng khuyết, đá khắc rune, ánh trăng mờ; **không mở map/quest mới** | P1 |

**Chú ý:** Không có khu "cổng Nam" trong map hiện tại. Với diện tích 960 × 640, các khu trên là **cụm trang trí nhỏ** quanh chức năng có sẵn, không mở rộng khu phố thật trong P0.

## 3. DNA mỹ thuật — PHỒN VINH nhưng VẪN là TÀN NGUYỆT

- **Góc nhìn:** 2D top-down Pixel Art, không thay thành isometric, 3D, tranh phẳng toàn màn hình hoặc hiệu ứng AI bóng loáng.
- **Không khí:** phố an toàn, đông vui, ấm vàng hổ phách; rìa rừng/di tích mang sắc lạnh, bí ẩn. Sự đối lập mới làm cuộc phiêu lưu hấp dẫn.
- **Nhận diện:** gỗ ấm, đá cổ, dây cờ, hoa văn trăng khuyết; điểm nhấn rune tím + cyan **không lạm dụng**.
- **Màu chủ đạo** theo Art Guide gốc:
  - Gỗ `#674533`, gỗ sáng `#AE7548`, vàng cổ `#D6AC59`.
  - Lá `#5B8B54`, cỏ sáng `#A1BD73`, đá cổ `#586579`.
  - Trăng huyền `#8778C6`, ma thuật `#6FC4CF`, cam hiệu ứng `#F2BD70`.
  - Viền tối `#171C2B`; chừa tương phản đủ lớn cho player và UI.
- **Chất lượng hình:** pixel rõ, ít nhiễu, silhouette vật thể nhận ra ở kích thước thật; không nhét chi tiết dày làm che đường.
- **Ánh sáng:** đuốc/cửa sổ/lò rèn sáng vào ban đêm; ban ngày chỉ có điểm lấp lánh nhỏ; không phủ lớp glow quá rộng lên sprite.
- **Quy luật thiết kế:** khu ở và khu nghề giàu chi tiết gần tâm hoạt động, **trục đường liên thông luôn thông thoáng**; vật thể cao đặt sau hoặc bên cạnh người chơi.

## 4. Bảng chi tiết asset và tính năng mỹ thuật

### P0 — Nâng cấp thị giác nhưng giữ nguyên gameplay

| Mã | Cần thêm | Tác động kỳ vọng | Thực hiện tối thiểu |
|---|---|---|---|
| A-01 | Mosaic lát đường ở quảng trường | Khu trung tâm có bản sắc | Pixel tile/overlay nằm ở depth dưới actor; không collider |
| A-02 | Biển hiệu gỗ cho Chợ, Lò Rèn, Giả Kim, Quán Trọ | Người chơi nhận diện khu dễ hơn | Chỉ thêm label/prop trang trí; không thêm tính năng mới |
| A-03 | Sạp hàng, mái vải, thùng, bao hàng | Chợ đông vui hơn | 2–4 cụm, tái sử dụng cùng texture có biến thể nhỏ |
| A-04 | Đuốc/lồng đèn, cửa sổ phát sáng | Đẹp về đêm | Hiệu ứng nhẹ theo thời gian ngày/đêm đã có |
| A-05 | Lò rèn hoạt động | Thấy NPC đang làm nghề | Tia lửa rơi ít, ánh cam ngắn; không tác động damage/hitbox |
| A-06 | Bình giả kim, rune, hơi sáng | Khu giả kim có cá tính | VFX tĩnh/nhẹ, không gây sát thương/skill |
| A-07 | Chậu hoa, cờ, ghế, xe kéo | Đỡ trống, nhiều tầng chi tiết | Chỉ bên lề, không chiếm đường hoặc vùng thao tác |
| A-08 | Cổng ra rừng nổi bật | Định hướng rõ | Hai cột/biển bên **cổng Đông**; thấy lối thoát tại `(916,320)` |

### P1 — Tạo chuyển động để **có sức sống** (sau khi P0 qua test)

| Mã | Nội dung | Giới hạn bắt buộc |
|---|---|---|
| L-01 | 2–4 NPC nền ở khu chợ/quảng trường, đứng/đi ngắn | **Không phải NPC nhiệm vụ**, không có `WorldObject`/interaction giả, đi đường trống, không cản người chơi |
| L-02 | 1–2 chim/mèo/vật nhỏ | Trang trí-only, số lượng ít, không hệ thú nuôi |
| L-03 | Từng chùm cờ/chong chóng gió rung nhẹ | Animation ít frame, không dịch chuyển anchor/collider |
| L-04 | Khói bếp/khói lò, đốm bụi sáng nhẹ | Giới hạn particle/tween; phải tắt/giảm khi pause hoặc rời zone |
| L-05 | Ánh đèn chuyển ngày/đêm | Dùng vòng ngày/đêm hiện có; không thêm mùa, thời tiết |
| L-06 | Mặt tiền nhà khác nhau | Giữ diện tích chiếm đất, gốc sprite và obstacle cũ; không tăng nhà to che toàn màn hình |
| L-07 | Dấu ấn trăng khuyết gần Bắc thị trấn | Không tạo nhiệm vụ/đền tương tác mới |

### P2 — **CHƯA TRIỂN KHAI**

Mở rộng map ngoài 960×640, mô phỏng lịch sống NPC hoàn chỉnh, NPC thuê từ quán trọ, chợ player-to-player, hệ thống bất động sản, chiến tranh, cư dân tăng số lượng động, phố nhiều tầng, nội thất quán trọ tương tác, cinematic, hệ thống kinh tế mới và multiplayer. Đừng triển khai những mục này trong yêu cầu làm đẹp thị trấn.

## 5. Quy tắc kỹ thuật cho Codex

1. **Trước hết khảo sát** `src/game/world/maps.ts`: `town.paths`, `town.obstacles`, `town.decorations`, `town.objects`. Đừng suy luận từ ảnh nền màn hình chính (`title_landscape_v1.png`), vì ảnh này **không phải tilemap chơi thật**.
2. **Không đổi các `id` và `role` của NPC, quặng, thảo dược, cổng ra rừng**. Nếu muốn dời vị trí nào, trước tiên chứng minh khu tương tác/quest vẫn hoạt động và cập nhật test, nhưng P0 **không dời**.
3. **Không đổi `town.spawn` `(480,400)` và `town-forest` `(916,320)`**, trừ khi người dùng phê duyệt tái thiết bản đồ thật.
4. Đừng đặt prop trùng vùng đường/điểm thao tác. Giữ một hành lang không bị vật cản từ spawn đến: An, Dạ, Lâm, Liên, Vũ, các mỏ/Nguyệt thảo và cửa sang rừng. **Kiểm tra bằng đường đi thực tế**, không chỉ nhìn bản vẽ.
5. `DecorationDefinition.kind` hiện chỉ có `tree|house|rock|bush|water|pillar|torch|flower|fence`. Nếu thêm loại `stall|sign|banner|lantern|barrel|moon-emblem|bench` thì phải bổ sung type + renderer + texture registration, hoặc dùng layer mỹ thuật town riêng. **Không ép type bằng `as any`**.
6. Renderer hiện tại dùng `DemoScene.drawTerrain()` cho decoration, depth theo trục y. Props cố định cần depth đúng để không che mặt/chân nhân vật; tile mặt đường phải nằm **dưới** actor. Không biến trang trí thành collider nếu người chơi chưa cần va chạm; mọi collider mới phải có lý do và test.
7. Nếu làm asset mới: **ưu tiên ảnh local rõ quyền sử dụng hoặc pixel art/procedural tự tạo**; lưu PNG gốc và metadata đúng hệ `ArtManifest.ts`/`RasterArt.ts`, giữ fallback procedural. Không thay nguyên atlas 4×4 hiện có rồi làm lệch key/crop mà không kiểm tra toàn bộ.
8. Không dùng hình concept/title as background của thị trấn để thay `world` map. Không thêm texture mờ làm mất cảm giác pixel-perfect.
9. Chỉ render chuyển động/particle/tween khi ở town; thu dọn khi scene shutdown; tôn trọng pause, chế độ giảm hiệu ứng nếu đã có; tránh số lượng lớn animation mỗi frame.
10. **Không giả vờ tạo tương tác**: biển quán trọ và sạp đồ chỉ có tính chất trang trí, cửa hàng Thương nhân Vũ vẫn dùng hệ có thật.
11. Không sửa navigation, combat, inventory, quest, save hoặc các zone `forest`, `dungeon` trừ khi test chứng minh bắt buộc để tránh regressions.
12. Lấy ảnh so sánh **trước/sau** cùng điểm nhìn, cả ngày và đêm (nếu có công cụ); **thành công phụ thuộc cả screenshot và gameplay**.

## 6. Quy trình thực hiện từng chặng (Codex không làm ồ ạt)

### TOWN-00 — Audit và chụp baseline

- [x] Đọc `AGENTS.md`, GDD, Art Guide, world map và render pipeline.
- [x] Chạy `npm run backup -- before-town-visual-upgrade` —116file,exit0; có thêm backup trước02/03.
- [x] `npm run build` + smoke mới9/9passed,21,3giây,exit0; không lấy test cũ thay thế.
- [x] Chụp12ảnh trước ngày/đêm: spawn/chợ/rèn/giả kim/cổng Đông và overviewQA riêng.
- [x] Reuse terrain/house/forge/alchemy/merchant/torch/NPC; bổ sung pixel art code cho khảm nền/biển/đèn/hàng/giá đồ/cổng, không sửa PNG nguồn.

### TOWN-01 — P0: Tạo điểm nhấn trung tâm và trục đường (làm trước)

- [x] Lát khảm trăng/bát giác quanh quảng trường **không chặn spawn `(480,400)`**.
- [x] Đường lát/mép ngoài/đèn và biển nghề/cổng; giữ logic `paths`, chỉ hướng và năm NPC.
- [x] Biển/cờ/đèn ở mặt tiền/trạm nghề, giữ toàn bộ tương tác thật.
- [x] Build exit0; village/navigation/art9/9passed,14giây,exit0;12ảnh trung gian đã xem.

### TOWN-02 — P0: Ba nơi có nghề và giao thương

- [x] Chợ quanh Vũ: giữ quầy lớn, thêm sạp nhỏ/hai kiện hàng/giỏ/cờ, chừa loop dân.
- [x] Lò rèn quanh Lâm: biển/giá kiếm/thùng, ánh lò và bốn tia lửa **nhẹ**; trạm đe cũ giữ.
- [x] Giả kim quanh Liên: khay ba bình thuốc, rune phẳng, ánh tím/cyan/hơi **nhẹ**.
- [x] Quán trọ nhà Nam: biển/ghế/thảm, giữ ánh cửa sổ cũ; không thêm chức năng thuê NPC.
- [x] Build exit0; art/village/rèn/giả kim/mua bán/NPCđêm10/10passed,39giây,exit0.

### TOWN-03 — P0: Cổng Đông + chi tiết hoàn thiện

- [x] Cổng sang rừng tại `(916,320)` có trụ/đèn/biển cả ngày/đêm; ảnh cuối đã xem.
- [x] Chậu hoa/ghế nằm bên lề, giữ hàng rào/cây và quặng/thảo dược/cửa ra.
- [x] Hai fulljourney mới Kiếm Sĩ/Pháp Sư bằng phím/chuột thật đã passed trong verify10/10: từ spawn làm nghề→rừng→Boss→quay về/nộp/save/Continue/chơi tiếp,3,1phút mỗi Class.

### TOWN-04 — P1: Đời sống nền (CHỈ SAU KHI P0 ĐẠT)

- [ ] NPC nền ít và khác NPC nhiệm vụ; đi qua lại ngắn trong vùng trống, không collider/cản gameplay.
- [ ] Đèn cửa sổ theo ngày/đêm; cờ, khói, chim hoặc thú nhỏ nếu hiệu năng cho phép.
- [ ] Kiểm tra FPS/bộ nhớ/số tween; tối ưu theo **số đo thực tế**.
- [ ] Dấu ấn Tàn Nguyệt ở Bắc bản đồ như landmark trang trí.

### TOWN-05 — Nghiệm thu

- [x] `npm run build` đạt trên môi trường người dùng, gồm build đầu verify99test cuối.
- [x] `npm run verify`:99/99passed,0failed,exit0,11phút; có2regression mới pixel đêm/pause-cleanup.
- [x] Các đường/gameplay thị trấn được kiểm bằng phím/chuột thật trên Edge tự động: hai fulljourney, nghề/mua bán/NPC ngày–đêm/Continue. Chưa thay đánh giá thẩm mỹ của người chơi bằng kết quả test.
- [x] So sánh12ảnh trước/sau cùng điểm nhìn;10ảnh gameplay1366×768/zoom2.048, hai overviewQA riêng. Khung/collider/NPC khớp trước; gallery slider đạt12case.
- [x] `docs/ART_PROGRESS.md` phân biệt created/loaded/tested/user approved; mỹ thuật mới chờ người dùng đánh giá.
- [x] Cập nhật queue/log/art/report và trình gallery trước/sau. Dừng mở rộng tại P0; TOWN-04/P1 vàP2 chưa triển khai.

## 7. Tiêu chí nghiệm thu (Definition of Done)

| Nhóm | Phải đạt |
|---|---|
| Thẩm mỹ | Nhìn **rõ** quảng trường, chợ, lò rèn, giả kim, mặt tiền quán trọ, cổng Đông; có chênh lệch ánh sáng/tone giữa các cụm |
| Định hướng | Người chơi từ `(480,400)` tìm được An/Dạ/Lâm/Liên/Vũ, ore/herb và lối rừng mà không bị props che hoặc lạc |
| Tương tác | Nói chuyện NPC, mining, crafting, quest, chuyển zone và quay về vẫn hoạt động |
| Logic | Không đổi Class, HP/MP, Boss, inventory, save version, các ID gameplay và collider vô cớ |
| Rendering | Props mới đúng pixel style, anchor, depth, ngày/đêm; không có missing texture/crop sai/layer che HUD |
| Hiệu năng | Không có giật tăng rõ rệt khi chạy quanh khu đông props; đo FPS nếu khả thi; không có loop/tween/particle rò khi đổi zone |
| Test | Build, kiểm tra world/navigation/art, tối thiểu smoke journey và save; mọi kết quả phải là chạy thật |
| Tài liệu | Có báo cáo file sửa, screenshots, asset/source, test đã chạy, lỗi chưa xử lý, việc tiếp theo |

## 8. Báo cáo mẫu sau mỗi phiên AI (ghi trong docs/AI_SESSION_LOG.md hoặc file log đang dùng)

```md
### TOWN SESSION — YYYY-MM-DD
- Nhiệm vụ: TOWN-__
- Đã làm:
- File đã sửa:
- Asset thêm/sửa:
- Trước/sau: [đường dẫn ảnh cục bộ]
- Kiểm thử thực tế: [lệnh] — [PASS/FAIL/BLOCKED + lý do]
- Điểm cần người dùng duyệt:
- Việc tiếp theo:
- Ghi chú an toàn: Git vẫn tạm dừng; không thay save/quest/collider nếu không cần.
```

## 9. Quy định giới hạn sau demo

Quy hoạch này không phải giấy phép để xây thị trấn khổng lồ. Nếu người dùng muốn **mở rộng map thật** sau khi demo ổn định, phải làm yêu cầu riêng với bản đồ, spawn/exit, NPC, camera, collision, navigation, save migration và test. Trong đợt hiện tại, **biến thị trấn hiện có trở nên đẹp, phồn vinh, có sức sống**, không xây lại toàn bộ thế giới.
