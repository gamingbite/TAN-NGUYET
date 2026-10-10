# Kiến trúc Demo v0.1 local

## Công nghệ và entry point

Phaser **3.90.0** quản lý canvas, scene, input và Arcade Physics; TypeScript **5.9.3** kiểm tra kiểu; Vite **8.3.3** chạy/build. Dependencies được khóa bằng npm và `package-lock.json`. Game hiện chơi đơn trên web PC; không có backend, tài khoản, database hoặc Multiplayer.

`index.html` → `src/main.ts` → `DemoUI` tạo màn hình nhân vật/HUD/bảng; sau hành động bắt đầu hoặc tiếp tục mới tải `createDemoGame` và Phaser. Canvas phủ cửa sổ bằng **Scale.RESIZE**, dùng `pixelArt`, tắt antialias; camera zoom `1.2 × max(1, min(width/800, height/450))` giữ tỷ lệ thế giới. HUD/chỉ hướng/kỹ năng là các lớp DOM trong vùng chơi; menu icon góc phải trên mở những bảng chức năng hiện có. Ba khu có kích thước logic **960×640**, camera theo người chơi; đổi kích thước cửa sổ không đổi tọa độ hay physics.

Entry thử kỹ thuật gốc được giữ tại `foundation.html` → `src/foundation.ts` → `createGame`/`FoundationScene`, với canvas 640×360 của nền tảng cũ. Vite build cả hai entry; cảnh nền tảng không dùng hoặc ghi đè save của demo.

## Module đang có

| File/module | Trách nhiệm |
| --- | --- |
| `src/main.ts` | Tạo phiên chơi, nối UI với model/scene; pause/resume, kiểm tra NPC/giao tranh, lưu/đổi Class, xuất/khôi phục file, settings và Fullscreen API |
| `src/ui/DemoUI.ts`, `demo.css` | Màn hình nhân vật, HUD/hồi chiêu/Boss, các bảng gameplay, cài đặt, xuất file và xem trước/xác nhận nhập save |
| `src/game/createDemoGame.ts` | Cấu hình renderer, scale, Arcade Physics và scene demo |
| `src/game/model/types.ts` | ID, kiểu ngoại hình, vật phẩm, quest, state, session và dữ liệu bản đồ |
| `src/game/model/catalog.ts` | Tên Class/chủng tộc, vật phẩm/stack/giá, công thức, ba quest và thông số tiến trình thử nghiệm |
| `src/game/model/state.ts` | Tạo nhân vật, giao dịch túi/craft/tiền, trang bị, Class, XP, quest, thuốc và hồi sinh |
| `src/game/model/storage.ts` | Save version 1, validator dùng chung load/import, backup raw duy nhất trước khôi phục chủ động và bảo toàn bản lỗi khi lưu thường |
| `src/game/model/settings.ts` | Validate/load/save âm lượng, mute, rung màn hình và số sát thương bằng khóa riêng với nhân vật |
| `src/game/world/maps.ts` | Bố cục thủ công, collider, NPC, quặng/cây thuốc, cổng, phong ấn, điểm dịch chuyển, bí mật và spawn quái |
| `src/game/world/textures.ts` | Key/frame theo hướng/pose và generator procedural fallback; gọi base raster khi có |
| `src/game/world/ArtManifest.ts` | Path/grid/key/crop/native size/state/timing của atlas thế giới, quái/Boss/NPC và terrain |
| `src/game/world/RasterArt.ts` | Nạp/crop/chuẩn hóa PNG, common bounds/nearest/palette, đăng ký key gốc và vẽ terrain theo map hiện có |
| `src/game/world/PlayerArt.ts` | Base raster bốn chủng tộc/bốn hướng/pose; lớp màu/tóc/giới tính/Class/trang bị theo dữ liệu thật |
| `src/game/world/B2PlayerArt.ts`, `B2PlayerSources.ts`, `B2SourceBounds.ts` | Nạp tám PNG B2, crop/hướng/state/tái sử dụng/lật được khai báo riêng; chuẩn hóa384base32×42/groundY36 |
| `src/game/world/B2PlayerLayers.ts`, `B2Portrait.ts`, `PlayerAnimation.ts` | Ngoại hình/loadout thật, avatar cùng renderer và selector sáu state theo timer gameplay |
| `src/game/world/VillageLife.ts` | Tám dân trang trí/cờ/khói/đèn theo đồng hồ mô phỏng; không có physics/quest/save riêng |
| `src/game/world/TownVisuals.ts` | Layer art town P0: bake nền nearest dùng lại, biển/đèn/hàng chợ/xưởng/quán trọ/cổng Đông; compose update/destroy qua VillageLife, hiệu ứng10Hz theo elapsedSeconds, không body/input/save |
| `public/assets/atlases/` | PNG nguồn AI-assisted local; không chứa dữ liệu tiến độ nhân vật |
| `src/game/world/ActorVisuals.ts` | Chọn frame quái/Boss/NPC theo đồng hồ mô phỏng, giữ nguyên kích thước/collider/tint |
| `src/game/runtime/balance.ts` | Tốc độ, đòn/kỹ năng, khai thác, hồi sinh tài nguyên/quái và các chỉ số combat thử nghiệm |
| `src/game/runtime/navigation.ts` | Kiểm tra đoạn đánh qua vật cản và route truy đuổi trên lưới tọa độ chân |
| `src/game/scenes/DemoScene.ts` | Mô phỏng khu hiện tại: vật lý, input, NPC theo giờ, khai thác, event, quái, đạn, Boss, loot, fog và checkpoint |
| `src/game/audio/SoundFeedback.ts` | Phản hồi và âm nền tổng hợp theo khu bằng Web Audio, master volume/mute và dọn tài nguyên audio |
| `src/foundation.ts`, `src/game/createGame.ts`, `config.ts`, `scenes/FoundationScene.ts`, `src/styles.css` | Nền tảng kỹ thuật cũ được bảo toàn |
| `tests/` | Kiểm tra model và bản build trên trình duyệt, gồm cảnh nền tảng được giữ lại |
| `scripts/backup.mjs` | Snapshot source/config/tài liệu local, loại dependency/build/Git/bí mật có tên nhận diện |

Tên file, ID và trách nhiệm có thể mở rộng khi có tính năng thật. Chưa dựng thư mục hoặc API giả cho full vision.

## Dữ liệu và vòng đời phiên chơi

`GameState` là trạng thái bền vững có `version: 1`: ngoại hình, Class đang dùng/đã học, cấp/XP/HP/MP, hành trang/trang bị/công thức, ba ví tiền riêng, quest/progress, vị trí/thời gian, khám phá và checkpoint. Một cấp nhân vật dùng chung mọi Class; loadout kiếm/trượng lưu riêng, giáp dùng chung.

`GameSession` thêm trạng thái phiên `inCombat`/`paused` và callback thông báo/cập nhật UI. Scene quản lý dữ liệu ngắn hạn: tốc độ, thời gian đòn/kỹ năng/né, AI và HP quái, đạn, cảnh báo Boss, vật phẩm đang nằm đất và hồi sinh tài nguyên. Các dữ liệu ngắn hạn này **không được serialize**; chuyển khu/tải lại dựng phiên khu vực mới từ tiến trình bền vững. Quái sự kiện còn phải xử lý dựa trên số quái đã hạ; Boss mới được tạo khi vào lượt hầm ngục mới.

UI gọi các hành động khai báo, không trực tiếp cộng tiền hoặc đổi quest. `main.ts` chặn thao tác nghề/mua bán/học Class nếu không đứng cạnh đúng NPC; chặn dịch chuyển/lưu/đổi Class trong giao tranh theo điều kiện thực tế. Bảng mở sẽ pause scene; đóng bảng đặt lại input và trả focus về canvas để tránh phím bị giữ từ thao tác UI. Rời cửa sổ tự pause.

`state.ts` kiểm tra một giao dịch đầy đủ trước khi thay đổi inventory/tiền: thiếu công thức/nguyên liệu/chỗ trống không làm mất vật phẩm hoặc Đồng. Quest chỉ thưởng một lần tại thị trấn. `bossDefeated` đánh dấu hạ Boss; `demoCompleted` chỉ bật khi nộp nhiệm vụ Boss cho Trưởng làng, sau đó không khóa hoạt động chơi tự do.

## Bản đồ, va chạm và hiển thị

`maps.ts` tách `paths`, `obstacles`, `decorations`, `objects` và `enemies`. Rect đường/collider dùng **góc trên trái**, sprite và điểm tương tác dùng **tâm**. Trang trí không mặc nhiên có va chạm; nhà, thân cây và tường dùng collider khai báo riêng. Hitbox người chơi đặt ở chân thay vì lấy toàn bộ tóc/vũ khí; depth thay đổi theo vị trí để giữ cảm giác top-down.

Khi truy đuổi bị vật cản che, `NavigationGrid` tìm route trên lưới 8 px theo **tọa độ chân** và khoảng hở tương ứng quái thường/Boss. Scene chuyển điểm route về tâm sprite để không nhầm offset collider. Đường thẳng thông thoáng dùng truy đuổi trực tiếp; route được tính lại theo nhịp, không mở rộng sang AI mô phỏng xã hội. `segmentBlocked` chặn đòn cận chiến/kỹ năng/đòn vùng qua vật cản; đạn dùng collider vật lý với tường.

Người chơi có texture **32×42** theo bốn hướng và sáu state Idle/Walk/Attack/Hurt/Death/Dodge, mỗi state bốn output cùng các biến thể ngoại hình/loadout. `PlayerAnimation` chỉ chọn hình; sát thương, né và hồi sinh vẫn theo timer gameplay cũ. Metadata ghi rõ pose dùng lại/lật; không gọi384output là384hình độc lập. Collider chân12×12 offset10,29 không đổi. `ActorVisuals` chọn frame quái/Boss/NPC; năm NPC nhiệm vụ vẫn đổi vị trí trực tiếp theo lịch. `VillageLife` dựng tám dân trang trí đi vòng, ba người ngoài đường ban đêm, cập nhật/dừng theo đồng hồ mô phỏng. Giữ Space/chuột trái lặp đòn theo hồi chiêu; HUD nhận trạng thái thật từ scene.

Boss phase 2 mở khi HP còn nửa: đổi frame/rune, nhịp và vùng đánh, đồng thời bắn ba đạn tỏa sau đòn telegraph. Quy tắc này là nội dung cân bằng thử của Boss demo, không sửa lore/thông số GDD chưa chốt.

Fog khám phá dùng ô **32 px**, lưu danh sách ô theo từng khu. Bảng bản đồ chỉ vẽ phần đã khám phá và không gắn marker cho bí mật. Dịch chuyển chỉ mở sau khi người chơi tự đến bia rừng; giữ flag trong save. Hai ví Bạc/Vàng không quy đổi sang Đồng.

Chu kỳ thử hiện tại dài **300 giây mô phỏng**; đêm bắt đầu ở 65% chu kỳ. NPC chuyển từ chỗ làm tới vị trí nghỉ khai báo, vẫn có thể tương tác để tránh khóa tiến trình. Khi pause, thời gian mô phỏng cũng dừng.

## Lưu và bảo toàn dữ liệu

`storage.ts` lưu JSON bằng key `tan-nguyet-save-v1` trong `localStorage`. Validator kiểm tra phiên bản, ID, số lượng/giới hạn stack, vị trí, HP/MP, Class, trang bị thuộc túi, chuỗi quest và các trạng thái sự kiện/kết thúc nhất quán trước khi scene sử dụng dữ liệu. Sai JSON, phiên bản chưa hỗ trợ, storage bị chặn hoặc hết dung lượng đều trả lỗi cụ thể. Bản lưu cũ lỗi được giữ nguyên; game không ghi đè để “sửa” dữ liệu.

Xuất JSON đọc **raw của ô lưu hiện có**, không serialize phiên đang chơi hoặc tự lưu trước khi xuất; giao diện nhắc lưu thủ công nếu muốn giữ tiến độ mới nhất. Có thể xuất nội dung lỗi đọc được để giữ riêng. File nhập giới hạn 200 KB, qua `parseSave` trước khi hiện xem trước; chỉ thao tác **Khôi phục bản lưu này** gọi import. Sau nhập thành công, main mở phiên tiếp tục từ nhân vật đã kiểm tra.

`importGame` là thao tác thay ô lưu chủ động, khác `saveGame` thông thường. Nó validate file mới rồi chép **nguyên raw** của ô lưu cũ, kể cả sai JSON/khác version, sang khóa bắt đầu bằng `tan-nguyet-save-backup-v1-` trước khi thay. Khóa gồm thời gian/phần ngẫu nhiên/lần thử và được kiểm tra chưa tồn tại trước mỗi write, nên không ghi đè backup cũ. Không tạo được backup thì không nhập; lỗi ghi ô mới giữ dữ liệu cũ và backup. Không tự xóa hoặc khôi phục backup. Các khóa dự phòng ở cùng origin, không thay thế file xuất trên thiết bị khác.

UI liệt kê các khóa dự phòng qua `listSaveBackups`, validate raw để hiện thông tin hoặc lỗi. Bản hợp lệ được xem trước rồi xác nhận theo cùng đường `importSave`; bản lỗi vẫn xuất được qua `exportBackup`. Xem trước không ghi dữ liệu, khôi phục giữ các backup cũ và tạo thêm backup của ô hiện tại. Giao diện không có thao tác xóa; khôi phục mốc dự phòng không cần mở công cụ phát triển trình duyệt.

Giao diện hiện có một ô save. Bắt đầu phiên mới không lập tức xóa save, nhưng lưu phiên mới thay bản hợp lệ trước đó. Save/load gắn với origin và hồ sơ trình duyệt; dev 5173 và preview 4173 có vùng lưu riêng. Dữ liệu `localStorage` không nằm trong snapshot source hoặc Git.

Lưu thủ công chỉ ngoài giao tranh và sau hồi sinh. Khi về màn hình đầu, phải lưu thành công trước khi hủy phiên. Khi tải lại/đóng trang, `autosaveAllowed` chỉ cho phép thử lưu với phiên tiếp tục bản lưu hoặc sau khi lưu thủ công thành công; nhân vật mới chưa lưu không tự ghi đè save trước đó. Việc thử lưu vẫn cần trạng thái an toàn. Save version tương lai phải có đường chuyển đổi dữ liệu cũ hoặc báo chưa hỗ trợ và giữ nguyên; không tự reset nhân vật.

`GameSettings` gồm volume 0–1 và ba boolean `muted/screenShake/showDamageNumbers`, lưu riêng tại `tan-nguyet-settings-v1`. Thiết lập hợp lệ áp dụng ngay vào audio/scene sau khi ghi thành công; lỗi settings không chặn mở game, không sửa save nhân vật. File save version 1 không chứa settings. Toàn màn hình dùng Fullscreen API của trình duyệt qua nút có tương tác người dùng; trạng thái fullscreen không phải tiến độ nhân vật và không được serialize.

## Asset và âm thanh

Đợt art ngày 09/10 có atlas PNG AI-assisted tạo bằng công cụ `imagegen` trong `public/assets/atlases/`; không tải asset bên thứ ba. `DemoScene.preload` gọi `loadWorldArt`/`loadPlayerArt`; lúc tạo scene, `ArtManifest`/`RasterArt` và `PlayerArt` nạp base/props/terrain/quái/NPC/icon trước generator procedural. Frame nguồn được crop theo metadata, normalize bằng nearest và common bounds; game giữ tên key, native size, chân/collider, bố cục TypeScript và logic gây sát thương. Runtime dùng atlas quái `enemy_animations_v2.png`, v1 giữ lại. Không chuyển map sang Tiled hoặc đổi canvas theo thông số gợi ý chỉ để nhập ảnh.

Player B2 giữ các lớp ngoại hình, áo Class/robe và kiếm/trượng/giáp theo loadout thật, có Hurt/Death/Dodge cùng feedback/VFX cũ. Quái/Boss giữ idle/bốn frame walk/một pose attack; thời điểm sát thương không đổi. Thiếu body PNG của một chủng tộc sẽ dùng v1/procedural của chủng tộc đó; các chủng tộc còn đủ B2 vẫn chạy. Portrait dùng helper DOM thuần, không tạo Phaser trước khi bắt đầu game hoặc ghi dữ liệu. Tình trạng nguồn/tích hợp/duyệt và giới hạn dùng lại pose nằm trong [ART_PROGRESS](ART_PROGRESS.md).

`DemoScene` tạo VFX cho đòn đánh, khai thác, loot, né và Boss; `DemoUI` dùng CSS và font hệ thống có dấu tiếng Việt. `getItemIcon` cung cấp data URL của texture PNG 32×32 cho 10 vật phẩm catalog, fallback Unicode khi chưa nạp; sáu icon tiền/cuốc/rương/lootbag chỉ chuẩn bị. CSS màn hình đầu dùng nền minh họa opaque `public/assets/ui/title_landscape_v1.png` 1672×941 với `cover`/lớp tối, không dùng ảnh làm map gameplay. Hướng mỹ thuật và thông số gợi ý trong [art guide gốc](TAN_NGUYET_ART_GUIDE_DEMO_V0_1.md) được giữ; metadata/dimension thực tế ghi tại [ASSET_GUIDE](ASSET_GUIDE.md).

Âm thanh ngắn và âm nền nhẹ theo thị trấn/rừng/hầm ngục được tổng hợp bằng `AudioContext`; master gain nhận volume/mute, không cần tải file ngoài. Module dừng âm nền khi về màn hình đầu và dọn audio khi dispose. Phaser audio tắt vì phản hồi dùng module Web Audio riêng. Game không tải engine/asset/font từ CDN. Khi bổ sung file asset, dùng manifest/metadata và đường dẫn local ổn định; không gắn collider/gameplay vào kích thước ảnh tùy ý.

## Kiểm tra và bước sửa tiếp

`npm run build` chạy TypeScript rồi build hai entry. `npm test` chạy test model và trình duyệt, tự mở preview ở `127.0.0.1:4173` nên cần build trước và cổng trống. `npm run verify` chạy cả hai. Playwright mặc định Edge, có thể dùng Chrome qua `PLAYWRIGHT_CHANNEL`.

Nghiệm thu bám ma trận trong [kế hoạch](DEVELOPMENT_PLAN.md): lượt đầu đến nộp Boss bằng cả hai Class; nghề/mua bán; sự kiện phong ấn; chết/hồi sinh; save/load và dungeon replay; kiểm tra console/UI/input. Mốc hoàn thiện **08/10** đã chạy `npm run verify` đạt 63 test, gồm hai full journey. Sau phần backup UI mới, `npm run build` đạt và `npx playwright test tests/polish-ui.spec.ts` đạt 10 test. Tổng 65 test khác nhau: 40 test gốc, 3 navigation, 12 save-transfer và 10 polish-ui; các test chạy lại chỉ tính một lần. Đây là lịch sử kiểm tra trước khi thay art.

Giao diện vùng chơi rộng **09/10** đã build và qua 25 test demo/polish trong 55,2 giây; smoke Edge ở bốn kích thước cửa sổ không tràn ngang hoặc lỗi JavaScript. Sau nối loader/core art/icon UI, `npm run build` đạt; smoke dev tải sáu atlas HTTP 200 và nạp đủ 98 world/icon + 64 player frame, không thiếu/cảnh báo/lỗi JavaScript. Contact sheet native và ảnh ba khu đã rà; kiểm tra cuối sau tinh chỉnh độ rõ art và hồi quy gameplay đang chờ. Bằng chứng và giới hạn nằm tại [DEMO_CHECK.md](DEMO_CHECK.md) và [ART_PROGRESS.md](ART_PROGRESS.md); không coi mô tả source hoặc test trước thay đổi là kết quả của art mới.

Đợt hoàn thiện 08/10 đã đối chiếu 16 file cần bảo toàn với snapshot trước đó: nội dung giữ nguyên, gồm GDD và nền tảng cũ. Mốc snapshot chốt dùng nhãn `demo-v01-polished-verified`; mốc 40 test và snapshot `demo-v01-verified` của đợt trước vẫn giữ làm lịch sử. Snapshot trước đợt art 09/10 là `.local-backups/2026-10-09T01-47-14-765Z-before-art-guide-assets-5ALmoP/`. Trước thay đổi lớn dùng `npm run backup -- before-feature-name`, giữ GDD/code/config cũ và so sánh nội dung file bằng công cụ local. Hiện không dùng Git hoặc publish.

Các thông số cân bằng, tên/lore chi tiết và texture prototype là nội dung thử nghiệm; không tự chốt tỷ lệ tiền, luật tụt cấp cường hóa hoặc câu 76. Chỉ bổ sung module/dependency khi tính năng được yêu cầu cần tới; giữ stack đang chạy và ưu tiên tính năng nhỏ có thể thử riêng.
