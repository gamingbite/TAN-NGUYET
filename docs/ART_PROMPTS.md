# Prompt nguồn art — Demo v0.1

Ngày triển khai: 09/10/2026. Dùng công cụ **imagegen tích hợp**, không dùng CLI/API key. Asset được tạo riêng cho project, không lấy sprite từ game khác. Các PNG nguồn giữ nguyên; loader chuẩn hóa nearest-neighbor, palette và alpha theo metadata trước khi đưa vào scene. Art guide và GDD gốc không sửa.


## B v2 — bản trình duyệt nhân vật ngày 09/10/2026

Theo phản hồi trực tiếp của người dùng: A/C/D approved về hình ảnh; B cần rõ đặc trưng chủng tộc và Class, đẹp/chi tiết hơn, có Hurt/Death/Né. Đã dùng **imagegen tích hợp** (không CLI/API key) tạo năm bảng concept và hai lượt sửa chi tiết trượng. Chưa thay PNG/runtime game. Ảnh thiết kế có nền và nhãn để duyệt, không phải PNG alpha hoặc atlas bốn hướng dùng trực tiếp.

Prompt nguyên văn và nguồn được lưu trong các JSON local:

- [Nhận diện 12 thiết kế](art-review/2026-10-09-b2/identity-generation.json): tạo mới từ mô tả; không dùng ảnh project làm đầu vào.
- [Hai bảng trạng thái Class](art-review/2026-10-09-b2/state-prompts.json): ảnh identity mới là tham chiếu, bốn chủng tộc × sáu keypose/Class.
- [Hai bảng chuỗi chuyển động](art-review/2026-10-09-b2/motion-prompts.json): identity tham chiếu, mỗi mẫu Class sáu hàng × bốn hình.
- [Hai lượt sửa có mục tiêu](art-review/2026-10-09-b2/revision-prompts.json): bổ sung tinh thể thiếu ở Human Mage/Attack, rồi trượng thiếu ở Elf Mage/Motion Attack03 và Hurt02; giữ bản draft.
- [Manifest B2](art-review/2026-10-09-b2/manifest.json): đường dẫn bản tạo/bản sửa, số ô tham chiếu, trạng thái chưa tích hợp và các yêu cầu sản xuất còn lại.

[Bộ xem B2](art-review/2026-10-09-b2/index.html) có cả năm PNG đã chọn; file được sao chép vào workspace, bản gốc trong thư mục generated_images được giữ. Các đặc điểm, màu tóc/da/lông/giới tính và đường viền trang phục là mẫu mỹ thuật để duyệt, không bổ sung quy tắc GDD hoặc khóa lựa chọn nhân vật.

## B2 production — tích hợp sau duyệt tất cả, 09–10/10/2026

Đã dùng **imagegen tích hợp** để tạo tám PNG RGBA trong suốt cho game; không dùng CLI, API key hoặc sprite bên thứ ba. Prompt nguyên văn và nguồn đã lưu local:

- [Bốn prompt body](art-review/2026-10-09-b2/production-prompts.json).
- [Bốn prompt bổ sung Hurt/Death/Dodge quay lưng](art-review/2026-10-09-b2/production-back-prompts.json), tham chiếu body cùng chủng tộc.
- [Tám nguồn tạo và file đã chọn](art-review/2026-10-09-b2/production-sources.json).

File game: `public/assets/atlases/player_{human,elf,dwarf,beast}_b2.png` và `player_{human,elf,dwarf,beast}_b2_back.png`. PNG gốc được giữ nguyên byte. Body thực tế1024×1536 có lưới không đồng đều; back có12sprite,1448×1086 (riêng Người Lùn1447×1087). `B2SourceBounds.ts` đo crop alpha, `B2PlayerSources.ts` ghi mapping/reuse/mirror, `B2PlayerArt.ts` chuẩn hóa nearest về32×42/groundY36. Không dùng bảng concept có nền/nhãn làm atlas.

Có384output base cho bốn chủng tộc/bốn hướng/sáu trạng thái/bốn frame. Đây không phải384hình vẽ độc lập: crop riêng H67/E91/D65/B84, một số pose dùng lại hoặc lật đã chú thích trong metadata. Lớp tóc/da/trang phục Class/giáp/vũ khí theo lựa chọn và loadout thật dùng chung cho world và portrait. Giữ collider12×12 offset10,29, timing combat/hồi sinh, save và fallbackv1/procedural. Kết quả kỹ thuật hiện tại nằm trong [ART_PROGRESS](ART_PROGRESS.md) và [DEMO_CHECK](DEMO_CHECK.md).

## Atlas đạo cụ

```text
Use case: stylized-concept. Asset type: production sprite atlas for an original 2D top-down 3/4 high-fantasy pixel RPG TAN NGUYET. Create ONE transparent square PNG atlas, exactly four columns and four rows of equal square cells, sixteen isolated props in row-major order. Each object centered within its own cell with generous transparent margins, no touching other cells, no grid lines, no labels, no text. True alpha transparency. Strong blocky pixel clusters designed to downsample to native game sizes 24-112 pixels, crisp edges, 1 pixel dark ink outline at native size, no soft blur or anti-aliasing, top-left light. Palette: midnight ink #171C2B, slate #586579, walnut #674533, warm wood #AE7548, old gold #D6AC59, moss #294C3D, leaves #5B8B54/#A1BD73, linen #E3D7B5; tiny violet #8778C6/cyan #6FC4CF only at rune objects.
ROW 1: cozy wood-and-stone village house with orange-tile roof and warm windows; compact blacksmith furnace with orange coals and anvil; alchemist worktable with blue/green glass bottles and herbs; merchant wooden stall with canvas canopy and crates.
ROW 2: rounded lush deciduous tree; tall dark mossy forest tree; clustered harvestable iron ore rock with visible silver veins; same ore rock depleted without veins.
ROW 3: small herb plant with three leaves; mossy standing stone engraved with cracked crescent and restrained cyan rune; circular ancient cracked crescent seal stone; stone arched dungeon portal with a dark opening and two rune side pillars.
ROW 4: small lit medieval lantern; closed walnut treasure chest with old-gold bands; tied linen loot sack; low mossy rock.
Keep warm welcoming town versus mysterious forest. No scenery/backdrop, ground plane or cast-shadow rectangles. Entire atlas at least 1024x1024, each cell exactly 1/4 sheet width and height. Do not include people. No 3D, isometric angle, smooth illustration, realistic texture noise, watermark or copyrighted designs.
```

## Atlas quái và Boss

```text
Use case: stylized-concept. Production animation sprite sheet for original TAN NGUYET top-down 3/4 high fantasy pixel RPG. One transparent PNG sheet laid out as EXACTLY SIX columns and FIVE rows, equal cell widths/heights, exactly thirty full-body separate sprites, no grid or text. Uniform transparent gutters and identical baseline/center in every cell of each row. Each row depicts ONE SAME CREATURE in six consecutive frames. Columns in order: idle neutral, walking left-foot forward, walking passing pose, walking right-foot forward, walking second passing pose, attack strike/contact. Preserve proportions and scale across all six frames, different readable limb/body movements rather than duplicates.
Row1: small friendly-looking hostile green moss slime, translucent green blob face, squish stretch walk, lunge attack.
Row2: compact moss-gray fantasy wolf seen slightly from above, slender quadruped, four-leg walk, readable biting attack, all facing right with head toward viewer-right.
Row3: mysterious hovering violet-blue wraith, ragged cloak, hood and cyan eyes, floating movement/arm strike; no gore.
Row4: original ancient moon-seal armored guardian boss, slate plate armor, broad shoulders, heavy warhammer, cracked crescent emblem on chest, restrained pale gray dim runes, facing down-right; heavy walking, hammer strike.
Row5: SAME boss from row4 with SAME armor proportions/warhammer/silhouette/poses, phase2 with violet-cyan glowing cracks and crescent rune; no explosive large aura.
Strong hard-edged pixel clusters, readable at native 28x24/32x28/28x36/48x56, thin dark ink outlines, restrained 12-24 color art palette: #171C2B #2A3448 #586579 #E3D7B5 #674533 #AE7548 #D6AC59 #294C3D #5B8B54 #A1BD73 #8778C6 #6FC4CF. Top-left lighting, clean transparency without floor/background/blur. No 3D, isometric angle, smooth gradients, bloom, motion trails, words, signatures, watermark or franchise designs. Square large sheet so equal cells can be extracted deterministically.
```

## Atlas nền và tường

```text
Use case: stylized-concept. Make one original TAN NGUYET pixel-art TERRAIN TILESET PNG for a 2D top-down 3/4 high-fantasy RPG. Exact FOUR columns by FOUR rows, sixteen equal square fully OPAQUE terrain cells. Each cell filled edge-to-edge with a seamless repeating FLAT surface pattern, no gutters, borders, labels, objects, props, perspective or cast shadows. Each individual tile can repeat in both directions without hard visible seams. Designed to downsample to exactly32x32 native pixels, hard crisp pixel clusters and low-detail low-contrast surfaces, gameplay actors remain legible. Warm welcoming village versus forest mystery and ancient slate dungeon; no overall dark horror.
Row1: sunlit meadow grass; slightly darker grass; warm packed ochre earth; broad worn pale cobblestone path.
Row2: deep moss-green forest grass; shadowed leaf litter; muted forest dirt trail; moss-and-root forest dirt.
Row3: clean slate-blue dungeon flagstones; slightly cracked slate-blue flagstones; alternate desaturated gray square stone floor; weathered slate stone wall/brick pattern.
Row4: moss-covered old stone wall; dark midnight-slate solid rock/wall texture; blue-green shallow water with simple crisp ripple clusters; warm stone-and-gravel border texture.
Restrained palette #171C2B #2A3448 #586579 #E3D7B5 #674533 #AE7548 #D6AC59 #294C3D #5B8B54 #A1BD73 #8778C6 #6FC4CF. Top-left highlights. No glow, plants sitting on tiles, uprightwalls/buildings, sky, scene composition, blending between cells, gradients, blur, antialiasing, 3D, isometric render, text or watermark. Output a square sheet with each cell exactly one quarter its width/height.
```


## Các lượt tạo bổ sung ngày 09/10/2026

Các sheet gốc được giữ nguyên. Các module local đo vùng crop, căn chân, đưa về kích thước native và dùng nearest-neighbor trong trình duyệt; không xem lưới AI là tọa độ đã chính xác. V2 quái sửa mép búa bị cắt của V1; V1 vẫn lưu để đối chiếu.

### Nhân vật — 64 frame, player_bases_v1.png

```text
Use case: stylized-concept. ONE ORIGINAL CHARACTER ANIMATION ATLAS PNG for TAN NGUYET 2D top-down 3/4 high-fantasy pixel RPG. True transparent background. EXACT EIGHT COLUMNS x EIGHT ROWS, exactly64 isolated full-body sprites, equal square cells, aligned feet baseline in every cell, each sprite fully inside its cell with clear transparent gutters. No text/grid lines. Follow this precise row/column mapping, no missing cells:
Rows0+1 = ordinary HUMAN villager;
Rows2+3 = ELF villager with pointed ears;
Rows4+5 = short stocky DWARF villager with broader body, same cell size and foot baseline;
Rows6+7 = BEASTKIN villager with modest furry ears and tail.
For each race, EVEN row has eight frames: idle down, idle left, idle right, idle up, walking left-foot down, walking left-foot left, walking left-foot right, walking left-foot up.
Each ODD row has eight frames: walking right-foot down, walking right-foot left, walking right-foot right, walking right-foot up, unarmed attack reaching-hand down, unarmed attack reaching-hand left, unarmed attack reaching-hand right, unarmed attack reaching-hand up.
Characters in simple moss-green/linen tunic, worn dark brown trousers/boots, small brown belt; no weapon, armor, magic, hat or bag obscuring silhouette. Gender-neutral young adult proportions. Plain short brown hair in #674533/#80533A and natural peach skin #E1BB96/#C89E7C, dark outline #171C2B; separate hair vs skin colors for palette customization. Maintain identity/clothing/body scale across ALL sixteen frames per race. Each walking frame moves feet/arms clearly; up views show back of head, never eyes; left/right actual side profiles, not all facing camera. Face/clothing simple for32x42 native-pixel downsampling. Chunky hard pixel clusters with 1-pixel outline at native size, coherent top-left light, restrained 12-24 colors, no antialiasing/no smooth blur/no painterly details/no 3D/no isometric perspective/no glow/no realistic shading. All64 sprites, each race two complete rows. Keep limbs within cells, consistent center/feet anchor, transparent padding. Square large image.
```

### NPC — 20 frame, npc_animations_v1.png

```text
Use case: stylized-concept. Original TAN NGUYET top-down3/4 pixel RPG NPC ANIMATION atlas. One transparent square PNG, EXACT FOUR columns x FIVE rows of equal-sized cells, twenty isolated full-body characters. Per-row SAME character proportions/clothing, consistent center and feet baseline. Each sprite entirely within cell with generous margins. Column0 idle facing down, column1 walking left foot forward facing down, column2 walking right foot forward facing down, column3 exactidlepose blinking eyes closed (same body). Needfour distinctframes perrow, no texts or grid.
Row0: kindly village elder, gray hair/beard, modest moss-green cloak, walking stick.
Row1: class teacher, practical muted slate/tan coat, sash, sword scabbard and small staff, no impressive armor.
Row2: blacksmith, stocky adult, brown leather apron, plain dark shirt, small smith hammer, warm copper accents.
Row3: alchemist, young woman, modest violet-trim travel robe, pale hair, herbal satchel and one mint-green vial, tiny cyan accents.
Row4: merchant, warm tan/brown clothing, cloth cap, belt purse, striped scarf, approachable expression.
Style matches original chunky crisp fantasy pixel sprites, native24x32 so simple expressive faces and readable silhouettes, top-leftlight, darkinkoutline#171C2B, mainpalette#2A3448#586579#E3D7B5#674533#AE7548#D6AC59#294C3D#5B8B54#A1BD73#8778C6#6FC4CF with natural skin/hair tones. Subtle medieval high fantasy, no modern clothes. No background/floor/cast-shadowrectangle, no UI/text, no blur/antialiasing/3D/isometric/renderedplastic, no huge magic glow, no signature or watermark. Keep all5rows physicallyalignedto the20equalcell grid.
```

### Sửa atlas quái/Boss — enemy_animations_v2.png

```text
Edit target: the provided enemy animation atlas. Keep the SAME original slime/wolf/wraith/armored guardian identities, pixel style, palette, all five rows, all six distinct poses per row including matching boss phase2, and transparent alpha. Change ONLY sprite placement and size to make a clean extractable production grid. Output EXACT6columns x5rows equal cells. Reduce EVERY sprite within a row uniformly to about70% of its current size. Register each torso at cell horizontal center and feet at85% of that cell's height, with generous transparent margins at least12% each side and top. ALL body parts, tails, attacks and warhammers must be COMPLETE within their own cell; reconstruct the right edge of the two last-column guardian attack hammers so neither touches/clips the image edge. NO overlap between neighboring sprites, rows or cells; no sprite should touch any edge. Retain distinct walk/strike poses and hard chunky pixels; do not redraw into smooth art or change gear/design. Keep row1slime,row2wolf,row3wraith,row4bossdimrunes,row5samebossglowingcyanvioletrunes. Columnsidle,walk1,walk2,walk3,walk4,attack. No grid lines, labels, words, floor/background, blur, antialiasing, watermark or extra characters. Entire30sprites visible fully and arranged on a transparent square canvas.
```

### Vật phẩm — 16 icon, item_icons_v1.png

```text
Create a production-oriented pixel-art item icon atlas for TÀN NGUYỆT, a cozy living fantasy town leading to a mysterious forest and moonlit stone dungeon. Transparent background, exactly 4 columns x 4 rows, sixteen equally sized non-overlapping cells, no letters or numbers, no borders/grid, each entire icon comfortably contained within its own cell with generous 15 percent padding, sharp pixel clusters, top-down game inventory symbols, consistent 32x32-native pixel readability, no blur or smooth gradients, no shadows beyond cell. Palette ink #171C2B slate #2A3448 #586579 linen #E3D7B5 walnut #674533 wood #AE7548 gold #D6AC59 moss #294C3D leaves #5B8B54 #A1BD73 violet #8778C6 cyan #6FC4CF mint #8FD5A3 coral #E47770 amber #F2BD70. Ordered left to right:
row1 gray iron ore with tiny silver glint; bundle of green medicinal herbs; short wood logs; ivory wolf fang.
row2 violet crescent moon crystal shard; simple steel sword brown grip; wooden magic staff with cyan crystal; practical leather chest armor.
row3 red health potion in round glass; blue mana potion in matching round glass; copper coin; silver coin.
row4 gold coin; iron pickaxe wooden shaft; small closed wood treasure chest; tan tied loot bag.
Icons centered, fully isolated, all edges complete, forms distinct at very small in-game size. One square atlas, real transparency.
```

### Nền màn hình đầu — title_landscape_v1.png

```text
Create a wide landscape pixel art background illustration for the title screen of TÀN NGUYỆT – The Cursed Kingdom. A warm living medieval fantasy town at dusk in the left and lower foreground: timber and cream plaster cottages, amber lit windows, cobbled street, forge roof and a small merchant canopy. A curved path leads into a mysterious rich moss green forest at the right, distant slate blue stone ruins high on a ridge and a restrained violet crescent moon in the evening sky. Beautiful calm adventurous mood, cozy town and curious forest, no horror gore. Art direction: sharp clearly visible pixel clusters, handcrafted high-end 2D RPG illustration, flat pixel shadows, top-down three-quarter buildings in foreground, limited consistent palette ink #171C2B, slate #2A3448 #586579, linen #E3D7B5, walnut #674533, wood #AE7548, gold #D6AC59, moss #294C3D, leaves #5B8B54 #A1BD73, violet #8778C6, cyan #6FC4CF, amber #F2BD70. Crisp pixel forms, no smooth airbrush, no soft focus, no exaggerated bloom, no 3D render, no isometric grid. Wide 16:9 composition. Keep upper left sky and central middle visually calm and darker for a real Vietnamese HTML title to be overlaid later; frame the lower corners with town and forest detail. No text, letters, logo, UI, border, menu, people or sprites. Opaque background.
```

