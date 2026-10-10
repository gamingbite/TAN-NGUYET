# Tiến độ mỹ thuật Demo v0.1 — 10/10/2026

Đợt này áp dụng [art guide gốc](TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md) vào game local đang chạy. Người dùng đã duyệt A/B2/C/D và yêu cầu tích hợp, game phủ cửa sổ, HUD/menu trong game, chữ rõ hơn và làng nhiều nhà/dân hơn. [GDD](../TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md), stack, save và collider người chơi được giữ; nhà mới có footprint riêng trên lô cỏ theo yêu cầu làng, không dời lối/NPC/cổng/mỏ cũ để khớp ảnh.

Nguồn hình ảnh: **AI-assisted bằng công cụ `imagegen`**, tạo cho project, không tải sprite/ảnh bên thứ ba. PNG được lưu local; chơi game không gọi công cụ AI hoặc cần API key. Prompt/quy trình tạo ảnh do đợt tích hợp ghi tại [ART_PROMPTS.md](ART_PROMPTS.md). Việc tạo ảnh, kiểm tra kỹ thuật và người dùng duyệt art là ba trạng thái riêng.

## Trạng thái hiện tại

- **Tro Tàn P0,10/10 hoàn thành:** TOWN-00/01/02/03 vàTOWN-05 qua kiểm tra; `npm run verify` cuối99/99passed,0failed,exit0,11phút. [Báo cáo/ảnh trước–sau](TOWN_UPGRADE_REPORT.md), [gallery](../.cache/qa/2026-10-10-town/review.html). Asset mới là pixel art code trong `TownVisuals.ts`, compose qua `VillageLife.ts`, tái sử dụng PNG/trạm/nhà hiện có. **Created: có; loaded: có; tested: build/focused/99test/ảnh/lifecycle đạt; user approved: bản demo hiện tại được chấp nhận10/10 qua “demo vậy là oke rồi”.** Giữ15nhà/8dân/map/khung hình/gameplay; không mởP1. [Kế hoạch v0.2](NEXT_PHASE_PLAN_V0_2.md) mới là đề xuất; art mới của giai đoạn sau chưa được duyệt trước.

- **Nguồn đã có:** PNG đã nằm trên disk, grid/frame có metadata và loader.
- **Integrated hiện tại:** B2/UI/làng đã nối và kiểm runtime riêng; verify cuối10/10 đạt97/97exit0. Các checklist artP0-03/04/05/10 còn lại giữ trong queue.
- **Integrated:** chỉ đánh dấu sau build, thử runtime và đối chiếu screenshot/key/frame thật.
- **Approved:** người dùng đã duyệt **A/B2/C/D**, sau phản hồi “duyệt tất cả và tích hợp vào game”. Duyệt thiết kế không thay kết quả QA runtime. Các mục “B2 chờ duyệt” ở phần lịch sử bên dưới được thay bằng trạng thái mới này.

### Tích hợp B2/UI/làng — hoàn thành10/10, sau duyệt tất cả

- Tám PNG production trong `public/assets/atlases/player_{human,elf,dwarf,beast}_b2{,_back}.png`, RGBA trong suốt; tạo bằng imagegen tích hợp từ thiết kế B2. Bốn sheet body và bốn sheet bổ sung quay lưng. PNG nguồn giữ nguyên; crop đo riêng trong `B2SourceBounds.ts`, mapping trong `B2PlayerSources.ts`; không nạp các bảng concept có nền/nhãn.
- Runtime có **384 base = 4 chủng tộc × 4 hướng × 6 trạng thái × 4 output**, chung frame32×42/groundY36. `PlayerAnimation.ts` chọn Hurt/Death/Né theo timer hiện có; giữ sát thương, tốc độ/miễn thương né, fade và hồi sinh350ms. Death giữ tư thế nằm cuối. Không thêm đòn chiến đấu cho dân thường.
- `B2PlayerLayers.ts` xử lý tóc/da/kiểu tóc và loadout thật trên base: áo Kiếm Sĩ/Pháp Sư khác chất liệu, Pháp Sư có thân áo choàng/viền/tay áo; chỉ vẽ giáp khi mặc, kiếm/trượng khi trang bị. `B2Portrait.ts` dùng cùng normalizer/layer cho avatar tạo nhân vật, HUD và xem trước bản lưu; không tạo Phaser hay ghi save để dựng portrait. Bộ v1/procedural còn làm dự phòng.
- **Giới hạn art được ghi thật:** crop nguồn H67/E91/D65/B84; một số pose dùng lại/lật, đặc biệt body đánh quay lưng, human hurt/dodge, dwarf guard/dodge và side death human dùng lại prone trước. Metadata có chú thích từng output. Không gọi384output là384hình độc lập. Scale cố định ưu tiên đủ thân nằm ngang trong32px; thân đứng khoảng26–27px, giữ tỷ lệ/anchor qua frame và collider chân12×12 offset10,29.
- Giao diện dùng `Scale.RESIZE`, phủ cửa sổ với camera giữ tỷ lệ. HUD HP/MP/tiền/kỹ năng/chỉ hướng nằm trong vùng chơi; icon☰góc phải trên mở chức năng, hướng dẫn và cài đặt. Chữ UI12–16px trở lên tùy thành phần; nhãn world12px bold/resolution2, tránh chồng nhãn gần nhau.
- Thị trấn có **15nhà tổng**,8dân trang trí đi vòng an toàn (3ngoài đường ban đêm), sân/vườn/giỏ/cờ/khói nhẹ/đèn; pause dừng chuyển động. Không thêm NPC nhiệm vụ, hội thoại giả hoặc hệ xã hội/save mới.
- **QA đã đạt trên source cuối10/10:** `npm run verify` **exit0,97/97test,11,4phút**, gồm cả hai fulljourney,4testB2/4selector/3làng/3fullscreenUI. Curated384/384base,12nhận diện,0crop rỗng/chạm biên; runtimeB2 kiểm1.152texture/8PNG/avatar/trang bị/tóc/da/hit/death/né/hồi sinh/pause/fallback. UI cuối21ảnh/bốn viewport1280×720/1366×768/1920×1080/500×800,8bảng/đổiClass/lưu/fullscreen đạt,0pageerror/outbound/HTTPfail. Đã sửa icon menu che close utilitymodal ở500×800 và giữ regression click không force. [Verify cuối](../.cache/qa/2026-10-10-b2-regression/verify-complete.log), [UI QA](../.cache/qa/2026-10-10-b2-regression/ui-final/result.json), [ảnh game cuối](../.cache/qa/2026-10-10-b2-regression/ui-final/game-1920x1080.png).
- Bằng chứng: [curated-result](../.cache/qa/2026-10-09-b2-runtime/curated-result.json), [source mapping](../.cache/qa/2026-10-09-b2-runtime/source-mapping.json), [12nhận diện](../.cache/qa/2026-10-09-b2-runtime/class-identities.png), [thị trấn trong game](../.cache/qa/2026-10-09-b2-runtime/town-fullscreen.png), [ba cảnh runtime](../.cache/qa/2026-10-09-b2-runtime/capture-result.json). Ảnh ba khu dùng fixture hợp lệ trước Continue trong context QA riêng; không thay bằng chứng full journey. [Prompt production](art-review/2026-10-09-b2/production-prompts.json), [prompt back-view](art-review/2026-10-09-b2/production-back-prompts.json), [nguồn](art-review/2026-10-09-b2/production-sources.json).

## Lịch sử trước tích hợp B2/UI/làng

Các mục dưới ghi trạng thái tại thời điểm kiểm tra v1 và trình art trước lần duyệt tất cả. Kích thước canvas FIT800×450, Hurt/Death/Dodge procedural và các ghi chú B2 chưa duyệt dưới đây là lịch sử; trạng thái hiện tại nằm ở mục tích hợp phía trên.

### Atlas và nền minh họa đã tạo

| File nguồn | Grid và nội dung | Kích thước runtime | Tình trạng |
| --- | --- | --- | --- |
| [world_props_v1.png](../public/assets/atlases/world_props_v1.png) | 4×4: nhà, trạm rèn/giả kim, quầy hàng, hai cây, quặng/quặng cạn, thảo dược, bia, phong ấn, cổng, đuốc, bí mật, loot và đá | Giữ native size hiện có: nhà 112×96, cây 48×64; từng key có size/crop trong manifest | Nguồn/metadata/loader đã có; kiểm tra tích hợp đang chờ |
| [terrain_tiles_v1.png](../public/assets/atlases/terrain_tiles_v1.png) | 4×4: 16 ô đất/cỏ/đường/rừng/tường/nước/sỏi | 32×32, vẽ trên tọa độ map TypeScript hiện có | Nguồn/metadata/loader đã có; kiểm tra tích hợp đang chờ |
| [player_bases_v1.png](../public/assets/atlases/player_bases_v1.png) | 8×8: Con Người/Tinh Linh/Người Lùn/Thú Nhân × down/left/right/up × idle/walk1/walk2/attack, 64 frame | 32×42, chung mốc chân; lớp ngoại hình/trang bị áp theo nhân vật thật | **Integrated — P0-02, 09/10**: đủ 64 base, runtime/ảnh kiểm tra bên dưới; **chưa approved** |
| [npc_animations_v1.png](../public/assets/atlases/npc_animations_v1.png) | 4×5: Trưởng làng, Sư phụ, Thợ rèn, Giả kim, Thương nhân × idle/walk1/walk2/blink | 24×32, giữ vị trí/collider đang dùng | Nguồn/metadata/loader đã có; kiểm tra tích hợp đang chờ |
| [enemy_animations_v2.png](../public/assets/atlases/enemy_animations_v2.png) | 6×5: slime/sói/linh thể/Boss phase 1/Boss phase 2 × idle/walk1/walk2/walk3/walk4/attack | 28×24 / 32×28 / 28×36 / 48×56; hai phase Boss cùng size | Runtime dùng v2; [v1](../public/assets/atlases/enemy_animations_v1.png) giữ nguồn cũ; kiểm tra trình duyệt đang chờ |
| [item_icons_v1.png](../public/assets/atlases/item_icons_v1.png) | 4×4: quặng, thảo dược, gỗ, nanh, mảnh nguyệt, kiếm, trượng, giáp, thuốc HP/MP, Đồng/Bạc/Vàng, cuốc, rương, túi loot | 32×32; 10 vật phẩm catalog dùng ảnh UI, sáu icon còn lại chuẩn bị | Nguồn/metadata/icon UI đã nối; kiểm tra trình duyệt đang chờ |
| [title_landscape_v1.png](../public/assets/ui/title_landscape_v1.png) | Minh họa opaque thị trấn → rừng/di tích dưới trăng; không phải atlas hoặc map đi lại | PNG nguồn 1672×941; CSS `cover`/lớp tối cho màn hình đầu | Đã có file và nối CSS; kiểm tra cuối đang chờ |

Sáu sheet runtime có **162 ô frame** theo metadata (64 player, 20 NPC, 30 quái/Boss, 16 props, 16 terrain, 16 icon); số ô không thay thế kiểm tra độ rõ hoặc animation trong game. Atlas quái v1 được giữ nhưng không tính vào số frame runtime hiện tại. Nền minh họa title là ảnh riêng, không tính vào số frame và không thay map/collider.

## Chuẩn hóa và bảo toàn runtime

`ArtManifest.ts` khai báo key, grid, crop đo riêng khi padding nguồn không đều, state/hướng, native size, scale group và timing. `RasterArt.ts` trích alpha, resize nearest, dùng common bounds giữ thân không co/nhảy giữa pose, palette gần hướng mỹ thuật rồi đăng ký key hiện có. Terrain phủ cả ô thay vì trim alpha. PNG nguồn giữ riêng; không ghi đè bằng crop runtime.

`PlayerArt.ts` giữ common crop/scale cho mỗi chủng tộc; chỉ nhận bộ đủ 16 frame, thiếu thì giữ procedural cho cả bộ. Màu da/tóc, kiểu tóc, chi tiết giới tính, áo Class và loadout kiếm/trượng/giáp được vẽ theo state, không lấy một vũ khí cố định từ base. Frame cùng native 32×42; collider chân và thứ tự depth do gameplay quản lý.

Atlas quái/Boss có một pose attack, hiện trong 0,18 giây sau windup lúc đòn phát ra; sát thương vẫn theo scene, không phát sinh hit từ index ảnh. `ActorVisuals.ts` chọn frame bằng đồng hồ mô phỏng và dừng lúc pause. **Hurt/death/dodge vẫn dùng tint/flash, chuyển động và VFX procedural**, chưa có bộ frame AI đầy đủ cho mọi state. NPC có frame walk nhưng lịch ngày/đêm hiện chuyển trực tiếp vị trí, chưa có route đi từ nhà đến trạm nghề. Props trạm nghề là ảnh tĩnh.

Icon đã được nối vào `DemoUI` qua `getItemIcon`/data URL cho 10 vật phẩm catalog, với fallback Unicode khi texture chưa có. Ba mệnh giá, cuốc, rương và túi loot là icon chuẩn bị; không có quy đổi tiền hoặc chức năng mới vì các ô đó. Loot/bí mật ngoài bản đồ vẫn dùng props riêng.

Canvas demo vẫn **800×450**, map logic **960×640**, tile/fog **32 px**, nhà/cây/quái/Boss giữ kích thước đang dùng. Đây là quyết định giữ hệ thống hiện tại khi tích hợp, không sửa thông số gợi ý 640×360/32×48/Boss 96–128 px trong art guide gốc. Map chưa chuyển sang Tiled.

Buff là tùy chọn theo GDD 6.1: không thêm thuốc buff/nút giả chỉ vì art guide đề xuất icon. Các loại quái/tên Boss hiện có giữ nội dung playtest; không đổi thành lore đã được chốt bằng một prompt ảnh.

## Kiểm tra đã có và phần còn chờ

| Đợt | Bằng chứng thực tế | Phạm vi |
| --- | --- | --- |
| Hoàn thiện 08/10 — lịch sử trước art mới | `npm run verify`: 63 test/6,7 phút; sau backup UI mới build đạt và `npx playwright test tests/polish-ui.spec.ts`: 10 test/15,3 giây; tổng 65 test khác nhau | Hai full journey Kiếm Sĩ/Pháp Sư, gameplay/save/settings/backup; không dùng làm nghiệm thu atlas mới |
| Vùng chơi rộng 09/10 — đã đạt | Build; 25 test demo/polish trong 55,2 giây; Edge responsive smoke ở bốn kích thước cửa sổ, không tràn ngang hoặc lỗi JavaScript | Toolbar, bố cục canvas, Help `H`, tracker trong `J`, thao tác UI |
| Core art/icon — build và dev smoke đạt | `npm run build` đạt; sáu atlas HTTP 200; 98 world/icon + 64 player frame đã nạp, missing 0, warnings 0, page errors 0 | Contact sheet 114 texture native và ảnh town/forest/dungeon đã được rà; chưa dùng làm nghiệm thu cuối sau các tinh chỉnh độ rõ |
| P0-01 — hồi quy source hiện tại 09/10 đạt | `npm run verify` exit 0: TypeScript + Vite build, **68 test đạt / 0 lỗi**, Playwright 7,6 phút; log thật trong [nhật ký](AI_SESSION_LOG.md) | Gồm hai full journey, save/backup, ba test art; không thay checklist hình ảnh còn chờ |
| P0-02 — nhân vật 09/10 đạt | Runtime Edge: **16 tình huống / 276 texture**, đủ năm contact sheet đã xem; thiếu/cảnh báo/pageerror 0, collider không đổi | Bốn chủng tộc/bốn hướng, idle/walk1/walk2; hai Class có attack, đổi/tháo trang bị, pause và ngoại hình mẫu. Chỉ nhóm player integrated, chưa approved |
| Art cuối — còn checklist | P0-03/04/05/09/10 chưa hoàn tất; không dùng baseline để tự duyệt tất cả atlas | Địa hình/fog, NPC/props/icon, quái/Boss và responsive còn chờ kiểm tra theo queue |

Kích thước canvas đã đo trong smoke UI: **1244×700** ở cửa sổ 1280×900, **1042×586** ở 1366×768, **1596×898** ở 1920×1080. Đây là kích thước hiển thị do scale FIT, không đổi canvas logic; cửa sổ hẹp cũng đã thử. Hướng dẫn chi tiết trong bảng **Hướng dẫn** (`H`), tiến độ nhiệm vụ trong **Nhiệm vụ** (`J`); lời nhắc gần vật thể vẫn phục vụ tương tác.

Contact sheet native đã xem gồm **48** biến thể nhân vật (bốn chủng tộc × ba Class × bốn hướng), **30** frame quái/Boss, **20** NPC và **16** icon; không coi 48 biến thể mẫu là mọi tổ hợp ngoại hình/pose đã duyệt. QA screenshot ba khu giúp nhận diện nền có quá nhiều tương phản; đợt cuối đang tinh chỉnh terrain/fog cho actor/đường/cảnh báo rõ hơn, giữ nguyên địa hình và dữ liệu khám phá. Cảnh báo chunk Phaser >500 KB là giới hạn build đã biết, không bị ẩn.

Snapshot trước đợt art: `.local-backups/2026-10-09T01-47-14-765Z-before-art-guide-assets-5ALmoP/`. Snapshot `demo-v01-polished-verified` thuộc mốc đã kiểm tra 08/10. Source snapshot không chứa nhân vật trong `localStorage`; xuất JSON trong game giữ riêng tiến độ. Không dùng Git hoặc upload trong đợt này.

## Các bước dự kiến trước lần duyệt tất cả — lịch sử

1. Ưu tiên **ART-B-02** theo phản hồi trực tiếp: nâng chi tiết/nhận diện bốn chủng tộc và hai Class, chuẩn bị art B v2 với Hurt/Death/Dodge để duyệt. Đang chuẩn bị bằng imagegen tích hợp, chưa xác nhận tạo ảnh xong; chưa tích hợp vào game.
2. P0-03 tạm TODO để nhường ưu tiên, giữ rà tĩnh và ảnh hiện có; tiếp tục đúng probe năm tình huống trong nhật ký sau ART-B-02. P0-02 giữ DONE cho atlas/source v1 đã kiểm, không làm lại; phản hồi mới chỉ mở công việc B v2 riêng.
3. Thử quái/Boss hai phase, telegraph, hit/death, pause, vật cản và NPC blink; không nhận frame walk là lịch đi đường đã hoạt động.
4. Kiểm tra icon và backdrop đã nối; giữ đọc được chữ tiếng Việt/stack/giá ở các kích thước cửa sổ.
5. Chạy build và hồi quy phù hợp khi có thay đổi thật, ghi kết quả cùng screenshot trước khi đổi trạng thái kỹ thuật `integrated`. A/C/D đã approved về hình ảnh như bộ trình; B v2 cần duyệt riêng.

### Phản hồi duyệt và công việc B v2 — 09/10, 19:54 +07:00

Người dùng phản hồi: **“duyệt A C D”**, đồng thời yêu cầu B chi tiết, đẹp hơn, thể hiện đặc trưng từng nhân vật/chủng tộc và Class, có đầy đủ Hurt/Death/Né. Ghi nhận **A/C/D approved về thẩm mỹ đúng các hình đã trình lúc 19:48**; không coi đây là nghiệm thu kỹ thuật animation, fog, tương tác hoặc responsive.

| Nhóm đã trình | Trạng thái duyệt hình ảnh | Trạng thái kỹ thuật |
| --- | --- | --- |
| A — thế giới | **Approved** theo hình ba khu/nền minh họa trong bộ xem hiện có | P0-03 còn kiểm tra đường đi/fog/ngày–đêm; tạm TODO và giữ điểm tiếp tục |
| B — người chơi và hai Class | **Cần sửa v1**; **ART-B-02 DOING**, B v2 chưa approved | P0-02 DONE cho v1; game vẫn dùng v1/procedural Hurt/Death/Dodge, chưa tích hợp art mới |
| C — NPC/quái/Boss | **Approved** theo hình đã trình | P0-04/05 còn QA runtime/animation/tương tác; không tự đổi thành integrated đã kiểm |
| D — props/icon/terrain | **Approved** theo hình đã trình | P0-03/04/09 còn kiểm tra tương ứng; không tạo tính năng từ icon chuẩn bị |

B v2 chỉ mở rộng chất lượng mỹ thuật và trạng thái người chơi trong demo hiện có: bốn chủng tộc × dân thường/Kiếm Sĩ/Pháp Sư; giữ tóc/da/giới tính, loadout thật và renderer dự phòng. Đã tạo [bộ trình B v2](art-review/2026-10-09-b2/index.html) bằng imagegen tích hợp; **concept chờ duyệt, chưa tích hợp hoặc đủ atlas bốn hướng**. Có nhãn rõ concept/keypose/chuỗi hình; không lấy tư thế hoặc ảnh bảng làm bằng chứng hoạt ảnh đã chạy trong game. Backup trước đợt: `.local-backups/2026-10-09T12-54-38-401Z-before-player-art-v2-review-TTIu9L` (71 file, exit 0). Source, PNG game, collider/map/save/timing hiện chưa đổi.

Chi tiết kỹ thuật và quy ước asset nằm ở [ASSET_GUIDE.md](ASSET_GUIDE.md), module ở [ARCHITECTURE.md](ARCHITECTURE.md), kiểm tra gameplay ở [DEMO_CHECK.md](DEMO_CHECK.md).

### Bộ trình duyệt theo yêu cầu người dùng — 09/10, 19:48 +07:00

Đã trình [bộ xem local A–D](../.cache/art-review/2026-10-09/index.html); có thể mở HTML trực tiếp để xem lớn. Khi trình lúc 19:48 các nhóm chờ phản hồi; phản hồi lúc 19:54 đã duyệt A/C/D và yêu cầu sửa B như mục phía trên. Không sửa asset hoặc gameplay để làm bảng trình bày.

- **A — Thế giới:** [ba cảnh đang chạy](../.cache/art-review/2026-10-09/a-world.png), chụp từ source hiện tại trong context riêng, giữ fog theo khám phá; kèm [nền minh họa màn hình đầu](../.cache/art-review/2026-10-09/title.png).
- **B — Nhân vật:** [bốn chủng tộc và hai Class](../.cache/art-review/2026-10-09/b-characters.png), 20 texture mẫu hướng trước/đứng/tấn công từ P0-02; có link xem đủ hướng/khung đi. Lớp tóc/da/trang bị procedural và giới hạn animation vẫn giữ nguyên.
- **C — NPC/quái/Boss:** [năm NPC, ba quái và Boss hai pha](../.cache/art-review/2026-10-09/c-actors.png); 10 frame NPC đứng/chớp mắt và 10 frame quái/Boss đứng/tấn công lấy từ texture manager thật. Không đồng nhất bảng frame với nghiệm thu hoạt ảnh P0-04/05.
- **D — Props/vật phẩm:** [16 props, 10 icon catalog và 7 tile đang dùng](../.cache/art-review/2026-10-09/d-props-items.png). Không dùng sáu icon chuẩn bị để thêm vật phẩm/chức năng.

[Kết quả tạo bộ xem](../.cache/art-review/2026-10-09/result.json): exit 0, 0 pageerror; ba ảnh world dùng fixture save hợp lệ trước Continue để tới vị trí cần chụp, không phải full journey hoặc kiểm tra đường đi P0-03. PNG nguồn và source giữ nguyên. P0-03 hiện tạm TODO để ưu tiên ART-B-02 theo phản hồi; trạng thái kỹ thuật các nhóm giữ nguyên cho đến khi đủ QA. Trạng thái duyệt hình ảnh A/C/D đã đổi theo xác nhận rõ của người dùng.

### Bằng chứng nhóm player — P0-02, 09/10/2026

[Kết quả 16 tình huống](../.cache/qa/2026-10-09-P0-02/run02/result.json) và [ma trận/metrics](../.cache/qa/2026-10-09-P0-02/run02/analysis.json) được ghi trong Edge 154.0.4258.62, context QA riêng. Đã xem đủ năm contact sheet ở native 32×42 và phóng 2×: [dân thường](../.cache/qa/2026-10-09-P0-02/run02/primary-civilian.png), [Kiếm Sĩ](../.cache/qa/2026-10-09-P0-02/run02/primary-swordsman.png), [Pháp Sư](../.cache/qa/2026-10-09-P0-02/run02/primary-mage.png), [ngoại hình](../.cache/qa/2026-10-09-P0-02/run02/appearance.png), [trang bị](../.cache/qa/2026-10-09-P0-02/run02/equipment.png); cùng ảnh gameplay thật, ví dụ [Pháp Sư trong thị trấn](../.cache/qa/2026-10-09-P0-02/run02/human-mage-runtime.png).

Không thấy đầu/chân/vũ khí bị cắt, vũ khí còn lại sau tháo, mất nhân vật hoặc đổi collider trong mẫu đã thử. Foot canvas/groundY giữ nguyên; biến đổi pixel chân theo bước đi không dời physics anchor. Elf còn tai nhọn, Dwarf thấp/chắc, Beast còn tai/đuôi. Tóc dài phía sau là lớp procedural có khối vuông và che một phần lưng giáp, nhất quán giữa frame; giữ ghi chú prototype để người dùng đánh giá.

Phạm vi mẫu: mỗi chủng tộc được tạo qua form; long tóc nâu/da cát sáng, short tóc bạc/da nâu và braid tóc vàng/da ngà, có cả nam/nữ. Hai Class được dựng từ fixture hợp lệ rồi điều khiển/đổi đồ qua UI thật, không phải full journey mới. Tháo/đeo kiểm tại idle hướng cuối (Kiếm Sĩ right, Pháp Sư up); chưa thử mọi tổ hợp màu/giới tính/loadout/pose. Civilian attack không phải đòn gameplay; hurt/death/dodge vẫn procedural. P0-02 không tự duyệt thẩm mỹ hoặc nghiệm thu quái/Boss/NPC.

### ART-B-02 — B v2 concept trình duyệt (2026-10-09 20:09 +07:00)

- **Status: concept / chờ người dùng duyệt**, không integrated/approved. Bộ B v1 và renderer game vẫn giữ nguyên; A/C/D được duyệt đúng bộ cũ, không đổi theo ảnh B mới.
- Nguồn: AI-assisted, công cụ imagegen tích hợp, bảy lượt tạo/chỉnh có mục tiêu; không dùng CLI/API key hoặc sprite bên thứ ba. [Prompt và nguồn](ART_PROMPTS.md), [manifest riêng](art-review/2026-10-09-b2/manifest.json).
- [Bảng nhận diện](art-review/2026-10-09-b2/identity.png): 4 chủng tộc × dân thường/Kiếm Sĩ/Pháp Sư = 12 thiết kế. Làm rõ tai Tinh Linh, thân thấp/vai rộng/râu Người Lùn, mõm/tai/đuôi Thú Nhân; Class kiếm có giáp nhẹ/đai/kiếm, Class phép có tay áo/áo choàng/trượng cyan. Giới tính/tóc/màu trong hình là mẫu, không khóa lựa chọn nhân vật hoặc thêm cosmetic.
- [Kiếm Sĩ](art-review/2026-10-09-b2/swordsman-states.png) và [Pháp Sư](art-review/2026-10-09-b2/mage-states.png): mỗi bảng 4 chủng tộc × 6 keypose Idle/Walk/Attack/Hurt/Death/Dodge = 24 ô; death nằm xuống khác hurt co người và dodge hạ trọng tâm.
- [Chuỗi Kiếm Sĩ](art-review/2026-10-09-b2/swordsman-motion.png) và [chuỗi Pháp Sư](art-review/2026-10-09-b2/mage-motion.png): mỗi bảng 6 hàng × 4 hình, có diễn tiến trúng đòn → mất thăng bằng → hồi phục, khuỵu → ngã → nằm, và lấy đà → lướt ngang → thu chân. Chỉ mẫu Human Kiếm Sĩ và Elf Pháp Sư; không coi là mọi chủng tộc/giới tính/hướng.
- Đã xem đủ 5 PNG; sửa có mục tiêu tinh thể trượng Human Mage/Attack và trượng Elf Mage/Motion Attack03 + Hurt02. Giữ hai PNG draft để đối chiếu, không xóa ảnh nguồn.
- [Bộ xem offline](art-review/2026-10-09-b2/index.html) cho phóng lớn, bàn phím, nền sáng/tối. Kết quả kiểm tra browser được ghi ở [result.json](art-review/2026-10-09-b2/result.json); đây là QA bộ trình, không phải test gameplay/atlas.
- **Giới hạn phải xử lý khi sản xuất:** góc trước/ba phần tư hiện là tham chiếu, chưa đủ bốn hướng; chi tiết trang trí cần vẽ/chuẩn hóa trên pixel native, không thu toàn bảng thành atlas. Cần tay cầm/layer vũ khí nhất quán, vũ khí không bị VFX che; lớp tóc/da/giới tính/giáp/vũ khí thật; các state dân thường phù hợp (attack N/A). Chưa kiểm scale/crop/anchor/native32×42 trong game, chưa có selector Hurt/Death/Dodge mới.
- **Bước tiếp:** người dùng duyệt/sửa cụ thể B2; sau duyệt, backup mới rồi dựng frame/metadata/layer, giữ footY36/collider12×12 offset10,29/map/save/timing/fallback; build + kiểm runtime state/hồi sinh/đổi Class/trang bị/pause. ART-B-02 chưa DONE; P0-03 tiếp tục từ bước đã bàn giao sau đó.

