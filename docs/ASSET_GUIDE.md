# Asset hiện có và cách tích hợp Demo v0.1

Cập nhật **10/10/2026**. Project dùng **atlas PNG AI-assisted** tạo bằng công cụ `imagegen`, lưu trực tiếp trong `public/assets/atlases/`. Không tải sprite, ảnh hoặc audio từ bên thứ ba. Các module chuẩn hóa PNG/icon và B2 sáu trạng thái/bốn hướng đã nối vào source, build/QA B2 đạt; các checklist art còn lại theo [ART_PROGRESS.md](ART_PROGRESS.md) và queue. Texture v1/procedural cũ vẫn được giữ để fallback khi thiếu ảnh/frame. VFX combat, UI CSS và âm thanh tổng hợp tiếp tục hoạt động bằng code.

Giữ nguyên [art direction gốc](TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md) và [GDD](../TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md). GDD được ưu tiên khi hai tài liệu khác nhau; các thông số frame gợi ý trong art guide không tự thay kích thước/collider đang dùng. `approved` chỉ dùng sau khi người dùng duyệt hình ảnh; có atlas hoặc loader chưa đồng nghĩa đã nghiệm thu.

**Trạng thái sau phản hồi “duyệt tất cả và tích hợp vào game”: A/B2/C/D đã được duyệt thiết kế.** Tám PNG production B2 trong `public/assets/atlases/` đã nối vào game, gồm Hurt/Death/Dodge. Năm bảng concept ở [bộ xem B2](art-review/2026-10-09-b2/index.html) chỉ là tham chiếu; không nạp bảng có nhãn/nền vào renderer. **ART-B-02 hoàn thành10/10**, verify cuối97/97exit0 và UI QA bốn viewport đạt; xem [ART_PROGRESS](ART_PROGRESS.md) và [nhật ký](AI_SESSION_LOG.md). Duyệt hình ảnh không tự hoàn tất các mục P0 kỹ thuật còn lại.

## Manifest thực tế

| Nhóm/ID art guide | Nguồn hiện có | Nội dung | Tình trạng |
| --- | --- | --- | --- |
| ART-001 — nhân vật | `player_*_b2{,_back}.png`, `B2PlayerArt/Sources/SourceBounds.ts`, `PlayerArt.ts` | 384 output: bốn chủng tộc × bốn hướng × sáu state × bốn frame; native32×42, footY36 | B2 đã duyệt thiết kế và nối runtime; curated384base/4test B2 đạt. Có pose dùng lại/lật được ghi trong metadata; v1 giữ dự phòng |
| ART-002/003 — Class | `B2PlayerLayers.ts`, `PlayerAnimation.ts`, `DemoScene.ts` | Tóc/da/kiểu tóc, áo Class, robe Pháp Sư, kiếm/trượng/giáp theo loadout thật | Kiểm 12 nhận diện/1.152 texture; tháo đồ/đổi ngoại hình/Hurt/Death/Né/pause/hồi sinh đạt; không thêm đòn dân thường |
| ART-004 — NPC | `npc_animations_v1.png`, `world/ArtManifest.ts`, `ActorVisuals.ts` | Atlas 4×5: năm vai trò × idle/walk1/walk2/blink, thành frame 24×32 | Đã có nguồn/loader; lịch hiện chuyển trực tiếp vị trí, chưa đi đường bằng animation |
| ART-005/006/007 — thế giới | `terrain_tiles_v1.png`, `world_props_v1.png`, `RasterArt.ts`, `maps.ts`, `VillageLife.ts` | Tile32px/16props; ba map TypeScript. Làng15nhà/8dân trang trí, sân/vườn/cờ/khói/đèn | Nhà mới trên lô cỏ có footprint; giữ đường/NPC/cổng/mỏ và footprint cũ. Không đổi map để khớp ảnh hoặc thêm hệ xã hội |
| TOWN P0 — mỹ thuật Tro Tàn | `world/TownVisuals.ts`, compose trong `VillageLife.ts`; tái sử dụng các PNG/trạm hiện có | Nền khảm trăng/đường, biển/đèn, hàng chợ/giá kiếm/thuốc/ghế/cổng Đông; code pixel art tự tạo, không có file PNG mới | Created/loaded/tested: build/99test/ảnh/lifecycle đạt; người dùng chấp nhận demo hiện tại10/10. [Báo cáo](TOWN_UPGRADE_REPORT.md). Không body/input/save mới |
| ART-008 — quái | `enemy_animations_v2.png`, `ArtManifest.ts`, `ActorVisuals.ts` | Slime, sói, linh thể; mỗi loại có idle, bốn frame walk và một pose attack | Atlas 6×5 dùng chung với Boss; v1 giữ làm nguồn cũ, runtime dùng v2; chờ kiểm tra trong game |
| ART-009 — Boss | `enemy_animations_v2.png`, `DemoScene.ts` | Hai hàng phase 1/2, cùng kích thước 48×56; cảnh báo và fan đạn từ scene | Hai bộ frame đã có; pose attack hiện lúc đòn phát ra, timing sát thương không đổi |
| ART-010 — khai thác | `world_props_v1.png`, `textures.ts`, `DemoScene.ts` | Quặng/quặng cạn raster; cuốc, bụi và thanh giữ E bằng code | Vòng khai thác thật giữ nguyên |
| ART-011/012 — rèn/giả kim | `world_props_v1.png`, `npc_animations_v1.png`, `DemoUI.ts` | Props/NPC trạm nghề; bảng công thức và phản hồi craft | Props là ảnh tĩnh; chưa có atlas hoạt ảnh trạm nghề riêng |
| ART-013 — đồ/loot | `item_icons_v1.png`, `world_props_v1.png`, `model/catalog.ts`, `DemoUI.ts` | Atlas 4×4, icon 32×32; 10 vật phẩm catalog dùng ảnh trong UI; loot/secret ngoài world dùng props | Nguồn/icon UI đã nối; icon tiền/cuốc/rương/lootbag chuẩn bị, chưa dùng để tạo tính năng mới |
| ART-014/015 — UI/ending | `title_landscape_v1.png`, `demo.css`, `DemoUI.ts`, `B2Portrait.ts` | Game phủ cửa sổ; HUD trong vùng chơi, menu icon góc phải trên; portrait B2/cẩm nang/quest/settings/save/ending | Bố cục và chức năng được kiểm ở bốn kích thước; portrait/fallback dùng cùng dữ liệu ngoại hình/loadout |
| Audio | `src/game/audio/SoundFeedback.ts` | Combat, khai thác, loot, craft, lên cấp, quest, né và ambience theo khu | Web Audio tổng hợp, có volume/mute; chưa có bộ file nhạc sản xuất |
| Foundation | `scenes/FoundationScene.ts`, `src/styles.css` | Asset và cảnh kỹ thuật cũ tại `/foundation.html` | Giữ nguyên làm mốc kiểm tra |

PNG nguồn được giữ riêng; crop/resize/palette thực hiện khi nạp vào texture manager. Chi tiết grid, frame, nguồn và kết quả từng nhóm nằm ở [ART_PROGRESS](ART_PROGRESS.md); prompt của đợt sản xuất ghi trong [ART_PROMPTS](ART_PROMPTS.md).

## Thông số đang chạy

| Thành phần | Runtime hiện tại | Spec gợi ý trong art guide gốc |
| --- | --- | --- |
| Canvas demo | Scale.RESIZE phủ cửa sổ; zoom1.2×max(1,min(width/800,height/450)); giữ khung hình này trong đợt town | 640×360, ưu tiên scale nguyên |
| Nhân vật | B2:32×42; bốn hướng × sáu state × bốn output, collider12×12offset10,29 | Frame 32×48 |
| NPC | 24×32; idle, blink và hai frame walk chuẩn bị | Bộ sprite thống nhất theo format nhân vật |
| Quái | Slime 28×24, sói 32×28, linh thể 28×36 | Quái nhỏ 32×32/32×48 tùy silhouette |
| Boss | 48×56 ở cả hai phase | Gợi ý 96×96/128×128 |
| Nhà/cây | Nhà 112×96, cây 48×64 | Tỷ lệ với tile 32 px |
| Terrain/map | Tile 32×32 trên map TypeScript 960×640; fog ô 32 px | Tiled JSON và PNG tileset 32 px |
| Hurt/death/dodge | B2 có bốn output/state/hướng, cộng phản hồi/VFX scene | Sáu state ở native32×42; metadata ghi pose dùng lại/lật |

Các kích thước runtime bảo toàn gameplay, không sửa spec gốc như thể đã được duyệt. Không chuyển spawn/collider chỉ để khớp ảnh mới. Canvas dùng Scale.RESIZE; camera giữ tỷ lệ và nearest, zoom có thể không nguyên ở mọi cửa sổ. Kiểm tra cả độ rõ và khả năng nhìn telegraph.

## Pipeline raster và lớp nhân vật

`ArtManifest.ts` khai báo path, grid, key, kích thước đích, state/hướng, nhóm scale, vùng crop đo từ ảnh và timing cần thiết. `RasterArt.ts` nạp PNG, trích vùng alpha, giữ common bounds trong mỗi nhóm animation, resize bằng nearest và đưa màu về palette. Tile phủ toàn ô thay vì trim transparency. Các vùng crop props/quái/NPC được khai báo riêng khi padding ảnh nguồn không đều. Anchor/hitbox, tọa độ map và thời điểm gây sát thương vẫn do gameplay quản lý.

`PlayerArt.ts` ưu tiên B2 rồi giữ v1/procedural dự phòng cho chủng tộc thiếu ảnh. `B2SourceBounds.ts` đo crop không đều; `B2PlayerSources.ts` khai báo từng pose/hướng, lật hoặc dùng lại có chú thích. Normalizer giữ một tỷ lệ mỗi chủng tộc, hiệu chỉnh tỷ lệ nguồn back-view và neo chân36; không kéo cao pose ngồi/nằm thành thân đứng. `B2PlayerLayers.ts` áp tóc/da/kiểu tóc/chi tiết giới tính/áo Class/giáp/vũ khí theo dữ liệu thật. `B2Portrait.ts` dùng cùng normalizer/layer. Frame32×42, collider12×12 offset10,29 và save version1 giữ nguyên.

Loader chạy trước `generateWorldTextures`; procedural chỉ tạo key còn thiếu. `ActorVisuals.ts` chọn frame quái/NPC bằng đồng hồ mô phỏng; `PlayerAnimation.ts` chọn sáu state B2 theo timer scene. Pause dừng animation. Quái/Boss vẫn có một pose attack, timing hit thuộc gameplay. Năm NPC nhiệm vụ vẫn đổi vị trí trực tiếp theo lịch; tám dân trang trí có tuyến riêng không tương tác. B2 có384output, không phải384hình vẽ độc lập; giới hạn tái sử dụng pose ghi trong ART_PROGRESS và source mapping.

`DemoUI` nhận `getItemIcon` và dùng data URL từ texture đã nạp cho 10 ID vật phẩm catalog; khi chưa có texture vẫn dùng biểu tượng Unicode cũ. Icon tiền/cuốc/rương/lootbag còn lại là tài nguyên chuẩn bị, không tự mở chức năng. `public/assets/ui/title_landscape_v1.png` là nền minh họa opaque **1672×941**, dùng CSS `cover` và lớp nền tối để giữ chữ/form dễ đọc; ảnh này không phải map đi lại hoặc thay bố cục thị trấn trong game.

## Các bước art nhỏ tiếp theo

1. Hoàn tất kiểm tra tải/normalize các atlas hiện có ở cả ba khu; xác nhận không thiếu key, crop cắt tay/vũ khí, trượt chân hoặc đổi kích thước giữa frame. Lưu screenshot runtime và kết quả thật trước khi đánh dấu `integrated`.
2. Kiểm tra bốn chủng tộc, tóc/da/giới tính và mang/tháo/đổi Class; giữ trang bị khớp inventory/loadout. Điều chỉnh crop/lớp overlay theo từng lỗi nhìn thấy.
3. Kiểm tra quái/Boss khi di chuyển, telegraph/hit/death, tránh tường, pause và chuyển phase. Không che đường né hoặc biến art thành thay đổi combat.
4. Kiểm tra icon PNG của các món thật và backdrop màn hình đầu đã nối; thử stack/giá, dấu tiếng Việt, nút và cửa sổ hẹp. Không thêm vật phẩm hoặc nút chưa có chức năng để dùng hết ảnh.
5. Người dùng đánh giá screenshot/chơi thử, rồi ghi nhóm nào được duyệt. Nếu cần thêm hurt/death/dodge hoặc hoạt ảnh nghề, làm từng bộ nhỏ với metadata/timing riêng.
6. Chỉ thay âm tổng hợp bằng audio file khi có yêu cầu và nguồn/quyền dùng rõ; thử volume/format trên Edge/Chrome sau thao tác người dùng.

Buff đặc biệt là tùy chọn theo GDD 6.1 dù art guide liệt kê icon buff ở P0. Game hiện chỉ có thuốc HP/MP; ảnh buff đề xuất không được tự tạo tính năng hoặc nút giả. Không thêm Cung Thủ/Tu Sĩ, NPC đánh thuê, skin tiến hóa hoặc asset Multiplayer trong đợt này.

## Quy ước lưu asset

- PNG RGBA cho sprite, pixel rõ và nearest filtering. Metadata phải chỉ rõ grid/crop/native size, state/hướng, thứ tự/tốc độ frame, anchor và hit timing; không đoán index từ ví dụ tài liệu.
- Hitbox gameplay tách khỏi bóng, tóc, vũ khí và VFX; decoration chỉ có collider khi map khai báo. Giữ texture procedural cũ trong quá trình thay art.
- Atlas hiện tại ở `public/assets/atlases/`; có thể thêm nhóm `characters`, `bosses`, `tilesets`, `items`, `equipment`, `vfx`, `ui`, `audio` khi có nhu cầu thật. Tên lowercase ASCII `snake_case`; tên hiển thị/lore ở dữ liệu.
- Cập nhật manifest/loader cùng file thật, kiểm tra path/key trong build. Ghi nguồn/công cụ/prompt, trạng thái, screenshot, lỗi còn lại và bước sửa tiếp ở ART_PROGRESS.
- Nếu nhập tài nguyên ngoài về sau, ghi tác giả, license và credit tương ứng; không suy luận quyền phân phối từ việc tải được ảnh.
- Font cần đủ dấu tiếng Việt; hiện dùng font hệ thống, không tải CDN. PNG/asset được phục vụ local, không cần đăng nhập hoặc API key để chơi.

Kiểm tra 65 test ở mốc 08/10 là lịch sử của gameplay/procedural. Đợt UI ngày 09/10 đã build và qua 25 test demo/polish cùng smoke responsive. Smoke art trên dev đã tải sáu atlas HTTP 200, nạp 98 world/icon và 64 player frame, không thiếu key/cảnh báo hoặc lỗi JavaScript; contact sheet 114 texture native và ảnh ba khu đã được xem để rà art. Kiểm tra cuối sau điều chỉnh độ rõ terrain/fog và hồi quy gameplay vẫn đang chờ, xem ART_PROGRESS; không tự kế thừa kết quả cũ.

Lịch sử trước B2: **P0-01 đã đạt68/68test**, **P0-02 kiểm playerv1 bằng Edge,16tình huống/276texture và năm contact sheet**. Khi đó A/C/D approved, Bv1 cần sửa và B2 chưa approved. Sau phản hồi “duyệt tất cả và tích hợp vào game”, A/B2/C/D đều approved thiết kế và B2 đã nối runtime; kết quả kỹ thuật mới nằm ở đầu tài liệu và [ART_PROGRESS](ART_PROGRESS.md). Các checklist terrain/fog, NPC/props/icon và quái/Boss còn lại theo queue.
