# TÀN NGUYỆT — THE CURSED KINGDOM
## ART DIRECTION & ASSET SPECIFICATION — DEMO v0.1

> **Tên gợi ý trong repository:** `docs/ART_GUIDE.md`  
> **Phiên bản:** 0.1 — 08/10/2026  
> **Dành cho:** Codex, AI tạo hình ảnh, pixel artist, level designer và người tích hợp asset  
> **Tài liệu liên quan:** `TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md`  
> **Mục đích:** Quy định một ngôn ngữ hình ảnh nhất quán để làm **demo chơi thử**, không phải bắt buộc sản xuất toàn bộ asset cho game hoàn chỉnh.

---

# 0. HƯỚNG DẪN BẮT BUỘC CHO AI

Khi AI đọc tài liệu này, phải tuân thủ thứ tự ưu tiên:

1. **Quyết định GDD đã chốt** là yêu cầu sản phẩm; không được tự thay đổi. Nếu tài liệu này xung đột với GDD, hãy báo xung đột và ưu tiên GDD.
2. **Art direction** trong file này là hướng mỹ thuật được **đề xuất cho demo**, chưa phải tất cả đã được người thiết kế duyệt từng chi tiết. Dùng làm mặc định thống nhất để tạo prototype; các lựa chọn màu/kích thước có thể chỉnh khi playtest.
3. **P0 = tài nguyên bắt buộc để chơi được demo; P1 = cải thiện; P2 = để sau.** Ưu tiên làm xong P0 trước khi thêm chi tiết.
4. Đừng tự ý tạo thêm Class, chủng tộc, bản đồ, boss, hệ sinh tồn hay những hệ thống ngoài phạm vi Demo v0.1.
5. **Không dùng hình do AI tạo một cách trực tiếp nếu pixel bị bẩn, kích cỡ sai, không đúng hướng nhìn, có viền/nhòe khó tích hợp.** Hãy chuẩn hóa hoặc vẽ lại trước khi đưa vào game.
6. **Tách phần mỹ thuật và logic.** Không hardcode tên hoặc kích thước file hình tùy tiện. Chuyển asset qua manifest/đường dẫn cấu hình.
7. Nếu thiếu asset, dùng placeholder pixel art có ghi chú rõ; **không chặn gameplay vì chờ đồ họa hoàn chỉnh**.
8. Kết thúc mỗi đợt làm asset, cập nhật bảng manifest, báo file nào hoàn thành/file nào còn placeholder và ảnh chụp màn hình để duyệt.

**Quy tắc tránh mở rộng phạm vi:** Demo kết thúc tuyến nhiệm vụ đầu tiên khi người chơi đánh bại Boss trong hầm ngục rồi trở về thị trấn nhận thưởng; sau đó vẫn có thể chơi tự do.

---

# 1. DNA HÌNH ẢNH CỦA TÀN NGUYỆT

## 1.1 Những điều đã được GDD chốt

| Quyết định | Áp dụng vào mỹ thuật |
|---|---|
| Thế giới **High Fantasy** | Vương quốc cổ, phép thuật, tinh thể, tàn tích, sinh vật huyền bí; không biến toàn bộ game thành kinh dị hoặc hậu tận thế. |
| **2D Pixel Art nhìn từ trên xuống** | Mọi sprite, tilemap, hiệu ứng và UI phải phù hợp góc nhìn 2D top-down/3/4 top-down. |
| **PC browser trước, mobile sau** | Art đủ rõ trên màn hình PC nhưng có thể thu nhỏ UI/hit area về sau. |
| Bắt đầu là **dân thường cấp 1** | Trang phục đầu game giản dị, không mặc giáp huyền thoại ngay khi sinh ra. |
| **4 chủng tộc cân bằng** | Con Người, Tinh Linh, Người Lùn, Thú Nhân: khác silhouette/đặc điểm hình thể, không thể hiện chủng tộc nào mặc định ưu việt về sức mạnh. |
| Tạo nhân vật cơ bản | Tên, giới tính, tóc, màu da, chủng tộc; **ngoại hình trang phục phản ánh đúng trang bị**, không có ô cosmetic/transmog riêng trong demo. |
| 4 Class dài hạn, **2 Class demo** | Demo chỉ cần chơi được **Kiếm Sĩ** và **Pháp Sư**. Cung Thủ/Tu Sĩ và nhánh tiến hóa là mục tiêu sau demo. |
| Quái thường và Boss đa giai đoạn | Hình ảnh phải có tín hiệu nhận biết nguy hiểm; boss demo 2 giai đoạn. |
| 3 nghề | Thợ Mỏ, Thợ Rèn, Nhà Giả Kim — làm đủ hình ảnh để người chơi hiểu thao tác. |
| Chu kỳ ngày/đêm cơ bản | Có thể thay ánh sáng/tint môi trường đơn giản; không cần thời tiết hay 4 mùa. |

## 1.2 Ba trụ cột cảm xúc (đề xuất nghệ thuật)

**1. Phiêu lưu kỳ ảo, dễ yêu:** Thị trấn có ánh đèn ấm, quán trọ và xưởng nghề sinh động; người chơi cảm thấy thế giới đáng khám phá.  
**2. Bí ẩn Tàn Nguyệt:** Biểu tượng trăng khuyết bị nứt, phù văn, ánh tím lam nhạt, công trình cổ — xuất hiện có chủ đích ở di tích và boss, **không phủ tím mọi nơi**.  
**3. Hỗn loạn nhưng đọc được:** Combat, bụi đất, phép thuật và quái kéo đến có thể đông vui; **silhouette nhân vật, đạn và vùng nguy hiểm luôn phải rõ**.

### Cụm từ nhận diện

`handcrafted 2D pixel art`, `top-down fantasy RPG`, `high fantasy`, `mysterious shattered crescent moon`, `readable combat`, `warm living town versus eerie forest and ancient dungeon`.

### Không đi theo

- Không 3D, isometric giả 3D, render bán hiện thực, photobash hoặc anime illustration phóng to làm sprite.
- Không photorealistic, gradient mịn phủ toàn hình, anti-aliasing, motion blur, glow đục làm mất pixel.
- Không quá nhiều hạt sáng lấp màn hình hoặc chi tiết nhỏ hơn kích thước pixel lưới.
- Không copy sprite, logo, HUD, bản đồ, nhân vật được bảo hộ của game khác.
- Không nhầm tên tiến hóa Class có sắc thái **Dark Fantasy** với việc biến **toàn bộ thế giới** thành Dark Fantasy.

---

# 2. HỆ QUY CHUẨN KỸ THUẬT ĐỀ XUẤT CHO DEMO

Các giá trị dưới đây là **default implementation spec**, không phải các con số đã được người dùng chốt qua câu hỏi GDD. Chỉ đổi sau khi xem screenshot trong game.

| Thành phần | Chuẩn đề xuất | Ghi chú |
|---|---|---|
| Hướng nhìn | Top-down 3/4 nhẹ | Thấy đầu, vai, phần trên của vật thể; giữ góc nhất quán giữa cảnh và sprite. |
| Đơn vị tile | **32 × 32 px** | Một cơ sở thống nhất cho bản đồ/collision. |
| Nhân vật — ô chứa sprite | **32 × 48 px / frame** | Chân đặt ở đáy frame; pixel nhân vật có thể nhỏ hơn ô chứa. |
| Người Lùn | Vẫn trong ô 32 × 48 | Thân thấp hơn bằng khoảng trống phía trên; **không** ép kéo sprite. |
| Quái nhỏ | 32 × 32 hoặc 32 × 48 | Giữ tỉ lệ với người chơi. |
| Quái trung | 48 × 48 hoặc 64 × 64 | Tùy silhouette, không phóng giãn từ sprite nhỏ. |
| Boss demo | 96 × 96 hoặc 128 × 128 | Độ lớn trong game phải hợp lý so với cửa phòng và telegraph. |
| Vật phẩm nằm đất | 16 × 16 hoặc 24 × 24 | Ưu tiên nhận diện bằng hình khối/màu. |
| Icon UI | 24 × 24 hoặc 32 × 32 | Một icon = một ý nghĩa, viền rõ. |
| Độ phân giải gameplay gốc | **640 × 360** | Render lớn lên x2 hoặc hệ số nguyên, phù hợp 1280 × 720. |
| Texture filtering | **Nearest-neighbor** | Không dùng linear filtering cho pixel art. |
| Scale | Ưu tiên **integer scaling** | Tránh tạo pixel méo/kích cỡ bất nhất. |
| Xuất ảnh | PNG RGBA | Sprite/item/VFX có nền trong suốt. |
| Bản đồ | Tiled JSON + PNG tileset | Có layer vẽ và layer collision/event riêng. |
| Texture atlas | PNG sprite sheet + JSON metadata | Có kích thước frame, state, hướng và anchor. |

**Quy tắc pixel:** dùng các cụm pixel rõ ràng; giữ nét viền dày nhất quán (thường 1 px ở độ phân giải gốc); không trộn asset 16 px thô với asset 64 px nhiều chi tiết nếu chưa cân chỉnh lại.

## 2.1 Sprite phải căn đúng vị trí

- Nhân vật **đứng trên một mặt phẳng**; chân/bóng tiếp xúc mặt đất thống nhất.
- Physics hitbox/collision dựa vào **vị trí chân**, không lấy toàn bộ hình tóc/kiếm làm collider.
- Vũ khí/tay vung có thể vượt 32 × 48: sử dụng frame rộng hơn hoặc layer vũ khí riêng, nhưng **không tự cắt mất animation**.
- Không dùng sprite sheet thiếu hướng mà chỉ lật trái-phải cho tất cả chuyển động nếu điều đó làm sai vũ khí/động tác.
- Giữ padding 1–2 px và xử lý atlas chống texture bleeding nếu engine yêu cầu.

## 2.2 Sơ đồ hướng đi và animation

- Hướng mặc định: `down`, `left`, `right`, `up`.
- Dải state P0: `idle`, `walk`, `attack`, `hurt`, `death`, `dodge` (các state không phù hợp được ghi `N/A`, không dựng nút giả).
- Gợi ý frame: idle 2–4; walk 4–6; attack 4–6; hurt 1–2; death 4–6; dodge 3–5.
- Gợi ý nhịp: idle 2–4 fps; walk 6–10 fps; attack tùy hit frame; telegraph boss phải dễ nhìn hơn tốc độ animation thường.
- **Hit frame phải khớp logic combat.** AI code không được đoán frame gây sát thương nếu chưa khai báo trong metadata.
- UI, sprite sheet và game code dùng **cùng một cách viết state**.

---

# 3. BẢNG MÀU (PALETTE) ĐỀ XUẤT

**Nguyên tắc:** Mỗi asset ưu tiên khoảng 12–24 màu chính, giới hạn sắc độ rõ; không buộc tất cả asset dùng chính xác một bộ 16 màu. Bảng sau xác lập tông và vai trò màu.

| Vai trò | Màu | Hex | Ứng dụng |
|---|---|---|---|
| Outline sâu | Midnight Ink | `#171C2B` | Viền, hốc tối, cửa ngục |
| Xanh đá tối | Slate Night | `#2A3448` | Đá tối, chất liệu kim loại, shadow |
| Đá cổ | Ancient Slate | `#586579` | Tường, nền đá, đồ kim loại |
| Ánh sáng nền | Soft Linen | `#E3D7B5` | Text sáng, vải nhạt, phản xạ |
| Gỗ tối | Tavern Walnut | `#674533` | Nhà gỗ, bàn, cửa |
| Gỗ ấm | Amber Wood | `#AE7548` | Quán trọ, cửa hàng, đèn |
| Đồng/vàng | Old Gold | `#D6AC59` | Tiền, viền đồ quý, mục tiêu tương tác |
| Lá rừng tối | Deep Moss | `#294C3D` | Rừng bóng râm, bụi |
| Lá rừng | Verdant Leaf | `#5B8B54` | Cỏ, tán cây |
| Sáng tự nhiên | Meadow Light | `#A1BD73` | Đồng cỏ, lá có nắng |
| Tàn Nguyệt | Moon Violet | `#8778C6` | Rune, bóng nguyền, lore |
| Ma thuật xanh | Arcane Cyan | `#6FC4CF` | Phép, tinh thể, năng lượng |
| Sinh mệnh | Healing Mint | `#8FD5A3` | HP/heal, Nhà Giả Kim |
| Cảnh báo | Danger Coral | `#E47770` | Đòn Boss, sát thương, cảnh báo |
| Phép bùng nổ | Spell Amber | `#F2BD70` | Lửa, tia lửa, xưởng rèn |

### Quy tắc đối chiếu màu

- **Thị trấn:** gỗ ấm + xanh lá + ánh sáng vàng; mời gọi, an toàn.
- **Rừng:** xanh lá đậm, màu đất, sương mỏng; có điểm nhấn lam tím ở khu bí ẩn.
- **Hầm ngục:** đá xanh xám, bóng sâu, điểm phát sáng ma thuật; nguy hiểm nhưng **không tối đến mức khó thấy đường**.
- **Enemy telegraph:** Danger Coral đỏ/cam, vùng hình học rõ hơn màu nền.
- **Friendly spell:** Arcane Cyan/tím nhạt với hình dáng khác đòn địch; không phụ thuộc **chỉ** vào màu để phân biệt.
- **Độ hiếm vật phẩm:** nếu cần demo, sử dụng viền/màu icon tối giản; bảng tier đầy đủ để cân bằng sau.

---

# 4. NGÔN NGỮ HÌNH KHỐI VÀ CHẤT LIỆU

## 4.1 Silhouette

- Nhân vật chơi: đầu và thân rõ, hai tay/đạo cụ đọc được ở kích thước gốc.
- **Kiếm Sĩ:** vũ khí/cách đứng cận chiến, kiếm có hình dáng rõ, áo giáp không che kín silhouette.
- **Pháp Sư:** trượng hoặc sách phép, tay chuẩn bị niệm, hiệu ứng phép nhỏ nhưng phân biệt được từ xa.
- **Con Người:** tỷ lệ trung bình, dáng phổ thông.
- **Tinh Linh:** tai nhọn hoặc kiểu tóc/áo thể hiện văn hóa, không cần bonus sức mạnh.
- **Người Lùn:** vóc thấp, vai/râu/đồ nghề tạo nhận diện, không bóp méo từ sprite Người.
- **Thú Nhân:** tai/đuôi/đường nét thú dễ nhận ra, vẫn phù hợp body slot mặc giáp.
- Quái: dùng silhouette độc lập. Không thay màu một sprite để coi là ba loại quái nếu người chơi không phân biệt được cách đánh.

## 4.2 Chất liệu

- **Gỗ:** gân lớn theo khối, không vẽ vân li ti gây nhiễu.
- **Đá:** cụm cạnh sáng/tối sắc nét, ít texture noise.
- **Kim loại:** highlight sắc, phản chiếu ít màu; kiếm và cuốc nhìn ra được khi thu nhỏ.
- **Vải:** mảng bóng đơn giản, đường viền rõ.
- **Phép thuật:** pixel clusters với vài hạt rời, thời gian hiện ngắn, không dùng nhiều bloom.

---

# 5. THIẾT KẾ CÁC KHU VỰC TRONG DEMO

## 5.1 Khu 1: THỊ TRẤN KHỞI ĐẦU — P0

**Cảm giác:** an toàn, bình dị, có dân cư sinh sống; người chơi là dân thường vừa bắt đầu cuộc phiêu lưu.

**Tiles và props cần có:**

- Cỏ, đất, đường lát đá, rìa đường, bậc thềm, hàng rào, bụi, cây.
- Nhà gỗ/đá nhỏ có mái, cửa, cửa sổ, biển hiệu.
- Quán trọ hoặc hội mạo hiểm giả (một điểm tương tác đủ dùng).
- Xưởng rèn: lò, đe, búa, giá vũ khí, than đỏ.
- Quầy giả kim: bình thuốc, bàn pha chế, kệ dược liệu.
- Quầy thương nhân, bảng nhiệm vụ, đèn/đuốc, cổng ra rừng.
- Một điểm khai thác quặng gần thị trấn; không cần tạo cả vùng mỏ lớn.

**Phân lớp bản đồ đề xuất:** `Ground`, `Ground_Detail`, `Walls`, `Props_Below_Player`, `Player_And_NPC`, `Props_Above_Player`, `Shadows`, `Collision`, `Interactions`.

**Tránh:** Quá nhiều props làm chặn đường, mái nhà che nhân vật, hiệu ứng đèn mạnh che icon tương tác.

## 5.2 Khu 2: RỪNG CỔ NGỮ — P0

**Cảm giác:** phiêu lưu, hơi bí ẩn, có đường dẫn tự nhiên vào hầm ngục.

**Tiles và props cần có:**

- Đất rừng, cỏ đậm, lối mòn, rễ cây, cây cao, gốc cây, đá rêu.
- Bụi rậm, cỏ cao, nấm, đèn đom đóm tiết chế.
- 2–3 dấu hiệu hướng đi: cột mốc, tấm bia, cổng đá.
- Một **phong ấn trăng nứt** tương tác được gây ra một sự kiện nhỏ có nguyên nhân rõ ràng.
- Spawn quái có nền thông thoáng để nhìn vùng tấn công.

**Tránh:** Sương dày, cây che quá 1/3 vùng chiến đấu, layout rừng tạo cảm giác procedural dù dungeon đã chọn làm thủ công.

## 5.3 Khu 3: HẦM NGỤC TÀN NGUYỆT — P0

**Cảm giác:** đá cổ, phù văn tắt dần, bí mật kỳ ảo và Boss đầu tiên.

**Bố cục:** tiền sảnh → hành lang thử thách → phòng chiến đấu → phòng Boss. Có checkpoint hoặc cổng hồi về rõ ràng.

**Tiles và props cần có:**

- Nền đá 32 px, mép tường, góc tường, cột đá, cửa/cổng, bậc thềm.
- Rune, biểu tượng mặt trăng khuyết nứt, tinh thể ma thuật, rương thưởng.
- Vùng sàn sạch để đọc hitbox Boss.
- Boss có 2 phase: phase 1 màu/độ sáng thường; phase 2 thêm dấu nguyền/tinh thể phát sáng hoặc thay hiệu ứng để người chơi biết Boss chuyển trạng thái.

**Tránh:** Cả phòng là màu đỏ/tím chói; boss gần giống quái nhỏ; VFX che vùng an toàn để né.

---

# 6. NHÂN VẬT, NPC, QUÁI VÀ BOSS

## 6.1 Người chơi (P0)

**Bắt buộc về gameplay:** 4 chủng tộc có nhận diện cơ bản; sprite đồng bộ hệ nhân vật. Việc tùy chỉnh tên không ảnh hưởng hình. Giới tính/tóc/màu da cần hỗ trợ ở mức cơ bản mà không nhân số lượng sprite lên không kiểm soát.

**Chiến lược tiết kiệm asset:**

1. Dùng base body tương thích cùng format animation cho mỗi chủng tộc; người lùn cần dáng vẽ riêng trong cùng frame.
2. Màu da/tóc có thể dùng palette swap **được kiểm tra để không ảnh hưởng outline**.
3. Trang bị nên có layer/biến thể hình trực tiếp khi thay giáp/vũ khí; không thay bằng cosmetic không có gameplay.
4. Nếu thiếu thời gian, làm đầy đủ nhân vật demo bằng 1 bộ trang bị cơ bản/Class, các món mới có thể thay vũ khí trước; đánh dấu art còn placeholder, không tuyên bố tất cả armor đã hiện độc lập.
5. Dù chỉ có 2 Class hoạt động trong demo, 4 chủng tộc phải không biến thành bốn kiểu Class riêng.

### Nhân vật dân thường ban đầu

- Áo tunic/vải thô, quần/giày đơn giản, túi đeo nhỏ tùy biến.
- Không phát sáng, không giáp quá ngầu, không vũ khí truyền thuyết.
- Nhìn từ xa vẫn phân biệt với NPC bằng tóc/tone màu/vòng chọn nhẹ nếu cần.

### Hai Class trong Demo

| Class | Hình ảnh | Hiệu ứng nhận diện |
|---|---|---|
| Kiếm Sĩ | Kiếm một tay/kiếm dài vừa, tư thế vững | Cung chém 2–4 frame, vệt sáng nhỏ, va chạm rõ |
| Pháp Sư | Trượng/tay niệm phép, áo vải có điểm nhấn rune | Đạn phép cyan/tím; vòng niệm ngắn; không quá chói |

**Để sau P2:** Cung Thủ, Tu Sĩ, 8 nhánh tiến hóa Class, skin huyền thoại, avatar portrait phức tạp.

## 6.2 NPC quan trọng (P0)

Số lượng đề xuất **3–5 NPC lõi**, có thể gộp vai trò để demo không phình:

1. NPC hướng dẫn/nhận-trả nhiệm vụ: dễ nhận diện, đứng ở trung tâm thị trấn.
2. NPC dạy Class: dấu hiệu kiếm hoặc trượng, icon tương tác.
3. NPC Thợ Rèn: tạp dề, búa, cạnh lò rèn.
4. NPC Nhà Giả Kim: áo choàng/túi dược liệu, cạnh bàn chế thuốc.
5. NPC Thương Nhân/Quán trọ: quầy hàng/biển hiệu rõ.

NPC có thể có animation `idle` và `walk` cơ bản. **Không bắt làm hệ biểu cảm, voice, hoạt ảnh hội thoại hoặc mô phỏng xã hội phức tạp trong demo.**

## 6.3 Quái thường (P0)

Tạo **2–3 loại** (tên và mô tả dưới đây là **đề xuất mỹ thuật**, không phải lore chính thức):

- **Sói Rêu:** di chuyển nhanh, màu đất xanh, hình dáng gọn.
- **Tàn Linh:** linh thể tím lam, có bóng tách khỏi mặt đất, tấn công phép/tiếp cận.
- **Giáp Cốt Cổ:** xương/giáp đá, thân chắc, đánh cận chiến dễ nhận.

Phải có: silhouette khác nhau, idle/walk/attack/hurt/death cơ bản, bóng chân, ít nhất một feedback khi bị đánh.

## 6.4 Boss đầu tiên (P0)

**Concept tạm:** `Kẻ Gác Ấn Nguyệt` — một giáp binh cổ canh cánh cổng bị nguyền. **Tên và lore chưa chốt**, có thể đổi, không tự khóa cứng vào cốt truyện.

- Kích thước hình ảnh đề xuất ~3 lần nhân vật thường (không nhất thiết tile footprint x3).
- Silhouette lớn với vai/đầu/vũ khí khác quái thường.
- **Phase 1:** đá cổ, vũ khí nặng, chuyển động rõ.
- **Phase 2:** rune trăng nứt sáng lên, thêm tia tím lam và đòn đánh mới; hình vẫn nhận ra là cùng Boss.
- **Telegraph:** vòng/quạt/đường nguy hiểm xuất hiện đủ sớm, màu coral đỏ rõ, không dùng đúng cùng hình với VFX sát thương của người chơi.
- **Tránh:** kéo người chơi ra màn hình bằng hiệu ứng vô tội vạ; camera shake cường độ lớn; boss full-screen.

---

# 7. TRANG BỊ, NGHỀ NGHIỆP VÀ VẬT PHẨM

## 7.1 Sprite props nghề (P0)

| Nghề | Props cốt lõi | Hoạt ảnh/phản hồi tối thiểu |
|---|---|---|
| Thợ Mỏ | Cuốc, 1 cụm quặng thường, quặng đã cạn | Thanh giữ nút/nhát cuốc, bụi và viên quặng bật ra |
| Thợ Rèn | Đe, lò than, búa, thanh kiếm cơ bản | 2–3 spark pixel + âm thanh kim loại; panel công thức |
| Nhà Giả Kim | Bàn pha, bình thủy tinh, cây thuốc | Bình sủi 2–4 frame + hiệu ứng tạo thành công |

### Thuốc

P0: `hp_potion`, `mp_potion`, `basic_buff_potion` (để thử cơ chế 1 buff chính).  
P1: thuốc tăng tốc/tấn công/phòng thủ/kháng nguyên tố/tàng hình với icon riêng.  
Không tự tạo bom giả kim hay hệ ném vật phẩm vì chưa được GDD chọn.

### Trang bị

P0: 1 kiếm cơ bản, 1 trượng cơ bản, 1 bộ giáp/vải khởi đầu, 1 cuốc, biểu tượng vài nguyên liệu.  
P1: một số biến thể giáp/vũ khí để thử hiển thị trang bị; hiệu ứng cường hóa rất tiết chế.

**Hạn chế palette rối:** icon phải dễ phân biệt ở 24–32 px; không dùng chữ quá nhỏ nhét vào icon.

---

# 8. UI/UX MỸ THUẬT DEMO

## 8.1 Phong cách giao diện

- Khung tối xanh đá/gỗ, đường viền vàng cũ hoặc bạc xỉn, ô chứa vật phẩm sắc nét.
- Font UI ưu tiên hỗ trợ **tiếng Việt đầy đủ dấu**. Không dùng font pixel chỉ có ASCII rồi làm mất dấu/chữ lỗi.
- Dùng icon đủ rõ và text đơn giản; không cần khung chạm trổ phức tạp.
- UI quan trọng không được che khu vực di chuyển/telegraph phía trước nhân vật.
- Dùng bố cục co giãn phù hợp trình duyệt. Mobile để sau nhưng tránh đặt tất cả control ở tọa độ cứng.

## 8.2 Màn hình P0

| Màn hình | Art cần có |
|---|---|
| Start menu | Logo text `TÀN NGUYỆT`, trăng khuyết nứt đơn giản, nền phong cảnh pixel |
| Tạo nhân vật | Bảng chọn 4 chủng tộc, tùy chỉnh cơ bản, preview nhân vật |
| HUD | HP/MP, hotbar, icon nhiệm vụ/tương tác, nhận diện Class |
| Inventory | Lưới slot, item icon, tooltip và vùng thông tin |
| Hội thoại NPC | Panel tên NPC, khung nội dung, nút lựa chọn/tiếp tục |
| Quest log | Panel ngắn, có mục tiêu hoàn thành/chưa hoàn thành |
| Crafting | Danh sách công thức, nguyên liệu yêu cầu, nút chế tạo |
| Cửa hàng | Danh sách hàng, giá tiền Đồng/Bạc/Vàng, mua/bán |
| Pause/settings | Resume, settings cơ bản, lưu/tiếp tục nếu game hỗ trợ |
| Demo ending | Thông điệp hoàn thành tuyến demo, nút tiếp tục chơi tự do |

## 8.3 Phân cấp ưu tiên trên HUD

1. **Sống còn tức thời:** HP, MP, trạng thái bị đánh/được hồi.
2. **Điều khiển:** hotbar và cooldown kỹ năng.
3. **Tiến trình:** quest tracker ngắn, tương tác `[E]`, vật phẩm nhặt được.
4. **Thứ yếu:** tiền, ngày/đêm, menu.

Không thêm thanh đói/khát/ngủ. Không xuất hiện UI bang hội/chợ/Multiplayer như nút chức năng thật trong demo nếu chúng chưa được xây dựng.

---

# 9. VFX, ÁNH SÁNG VÀ KHẢ NĂNG ĐỌC COMBAT

## 9.1 Hiệu ứng P0

- Kiếm chém: cung sáng mỏng, 3–5 frame, lệch theo hướng đánh.
- Phép: đạn màu cyan/tím + hạt nhỏ, bóng và đường đạn rõ ràng.
- Hit: flash ngắn trên nhân vật/quái; không flash trắng toàn màn hình.
- Dodge: afterimage/bụi 2–4 frame; thể hiện hướng di chuyển.
- Nhặt item: một chấm sáng nhỏ + icon bay lên nhẹ.
- Khai thác: mảnh đá/bụi pixel và cụm quặng đổi trạng thái.
- Craft thành công: sparkle vàng hoặc xanh nhỏ.
- Boss phase change: rune sáng lên, ánh tím xuất hiện có kiểm soát.
- Telegraph Boss: hình quạt/tròn/đường đỏ coral bán trong suốt nhưng viền sắc và đủ tương phản.

## 9.2 Luật bắt buộc

- **VFX không che ẩn hitbox của Boss.**
- Không chỉ dựa màu để báo đòn: thêm hình dạng, chuyển động hoặc dấu viền.
- Có thể tùy chọn giảm hiệu ứng/chớp và rung màn hình.
- Khi nhiều quái cùng lên màn hình, giới hạn số particle để đảm bảo FPS trình duyệt.
- Không dùng blur để che thiếu chất lượng pixel art.

## 9.3 Ngày và đêm

- Ban ngày: palette nền nguyên bản, đèn lò/lửa hiện vừa phải.
- Ban đêm: dùng lớp tint xanh đậm nhẹ; vẫn thấy đường, NPC và dấu tương tác.
- Ánh sáng từ đèn/quầy rèn: vùng ấm cục bộ; không cần hệ thống đổ bóng động phức tạp.

---

# 10. ASSET MANIFEST ƯU TIÊN CHO DEMO

Danh mục này là **đơn vị công việc** chứ không phải cam kết số lượng từng frame. Có thể gộp nhiều sprite vào cùng atlas.

| ID | Asset group | Độ ưu tiên | Đầu ra tối thiểu |
|---|---|:---:|---|
| ART-001 | Player base — 4 chủng tộc | P0 | Idle/Walk + animation combat tương thích hai Class demo; biến thể cơ bản |
| ART-002 | Kiếm Sĩ | P0 | Kiếm, animation chém và 1–2 skill/VFX |
| ART-003 | Pháp Sư | P0 | Trượng, cast, projectile, 1–2 skill/VFX |
| ART-004 | NPC thị trấn | P0 | 3–5 sprite NPC rõ vai trò; icon tương tác |
| ART-005 | Town tileset | P0 | Tile đất/đường/nhà/quầy xưởng/props |
| ART-006 | Forest tileset | P0 | Tile cỏ/đường/cây/đá/rune/sự kiện |
| ART-007 | Dungeon tileset | P0 | Tile đá/tường/cửa/rune/phòng Boss |
| ART-008 | Common enemies | P0 | 2–3 quái có state cơ bản |
| ART-009 | Boss phase 1+2 | P0 | Boss sprites, rune pha 2, telegraph |
| ART-010 | Nghề Thợ Mỏ | P0 | Cuốc/quặng/bụi khai thác |
| ART-011 | Nghề Thợ Rèn | P0 | Đe/lò búa/kiếm/icon công thức |
| ART-012 | Nghề Giả Kim | P0 | Bàn pha/bình HP-MP/hiệu ứng chế |
| ART-013 | Items & drops | P0 | Quặng, tiền, potion, kiếm, trượng, rương |
| ART-014 | HUD & panels | P0 | Menu, HP/MP, inventory, dialog, quest, crafting, pause |
| ART-015 | Logo + demo ending | P0 | Logo chữ đọc được, màn hoàn thành tuyến nhiệm vụ |
| ART-016 | World atmospheric extras | P1 | Chim, đom đóm, props phụ, ambient |
| ART-017 | Equipment variety | P1 | 1–2 biến thể giáp/vũ khí hiển thị trực tiếp |
| ART-018 | Polish animation & VFX | P1 | Chỉnh tốc độ, hướng, độ mượt, thêm feedback |
| ART-019 | Archer/Cleric/evolutions | P2 | Dành cho Demo v0.2+ |
| ART-020 | Guild/PvP/large kingdoms | P2 | Dành cho Alpha/Full Game |

**Quy tắc P0 thực tế:** Không cần vẽ xong mọi sprite độc lập của từng biến thể quần áo, giới tính, tóc, màu da trước khi có gameplay. Chỉ cần hệ thống và asset đại diện hoạt động, những mục chưa hoàn thiện ghi rõ `placeholder` trong manifest. Không bỏ hẳn 4 lựa chọn chủng tộc trong màn tạo nhân vật.

---

# 11. CẤU TRÚC FILE ĐỀ XUẤT

```text
project-root/
├─ docs/
│  ├─ GDD.md
│  ├─ ART_GUIDE.md
│  └─ ART_PROGRESS.md
├─ public/
│  └─ assets/
│     ├─ characters/
│     │  ├─ player/
│     │  ├─ npc/
│     │  └─ enemies/
│     ├─ bosses/
│     ├─ tilesets/
│     ├─ maps/
│     ├─ items/
│     ├─ equipment/
│     ├─ vfx/
│     ├─ ui/
│     └─ audio/       # Âm thanh, quản lý riêng với art
└─ src/
   └─ ...
```

## 11.1 Quy tắc tên file

- Tất cả lowercase, `snake_case`, không dấu, không dấu cách.
- Ưu tiên `<group>_<subject>_<state>_<direction>.png` nếu xuất riêng từng hàng animation.
- Ví dụ:
  - `player_human_civilian_walk_down.png`
  - `player_elf_mage_cast_left.png`
  - `npc_blacksmith_idle_down.png`
  - `enemy_moss_wolf_attack_right.png`
  - `boss_moon_seal_guard_phase2.png`
  - `tile_town_32.png`
  - `item_hp_potion.png`
  - `ui_inventory_panel.png`
  - `vfx_boss_warning_cone.png`

**Không ghi đường dẫn giả vào code.** Khi tạo tài nguyên mới, cập nhật asset manifest/loader trước khi gọi asset trong scene.

## 11.2 Metadata sprite animation (minh họa)

```json
{
  "id": "player_human_civilian",
  "image": "/assets/characters/player/player_human_civilian.png",
  "frameWidth": 32,
  "frameHeight": 48,
  "anchor": { "x": 0.5, "y": 1.0 },
  "animations": {
    "idle_down": { "frames": [0, 1], "fps": 3, "loop": true },
    "walk_down": { "frames": [2, 3, 4, 5], "fps": 8, "loop": true }
  }
}
```

**Lưu ý:** Các chỉ số frame chỉ là **ví dụ schema**; AI phải khớp với **atlas xuất ra thật**. Cần định nghĩa đầy đủ các hướng/state đang sử dụng; không đoán frame index từ ví dụ.

## 11.3 Hướng dẫn tích hợp với Phaser/Tiled (nếu dùng stack này)

- Bật `pixelArt` hoặc cấu hình tương đương của renderer, filtering nearest.
- Hiển thị scene qua camera có zoom hợp lý; kiểm tra pixel không bị rung khi di chuyển/camera follow.
- Tiled map lưu `.tmj`/`.json`, tileset PNG; collision bằng tile property/layer riêng.
- Dùng map object layer cho spawn, NPC, cổng, quặng, Boss, sự kiện; giữ logic spawn trong dữ liệu, không hardcode vị trí theo ảnh.
- Asset load trước khi đổi scene, báo lỗi thiếu file thay vì màn đen.
- Mọi UI phải hỗ trợ hiển thị Unicode tiếng Việt; kiểm tra ký tự `à, ă, â, đ, ê, ô, ơ, ư` và các dấu thanh.

---

# 12. PROMPT MẪU CHO AI TẠO HÌNH

**Cách dùng:** Sao chép phần `BASE STYLE` rồi nối với prompt từng nhóm. Với image generator, hình tổng quan giúp thống nhất mood; **sprite sheet, tileable pattern, kích thước frame và transparency vẫn phải được kiểm tra/chỉnh thủ công**. Không coi ảnh concept là spritesheet production-ready.

### BASE STYLE (English — dùng chung)

```text
Original handcrafted-looking 2D pixel art for a top-down 3/4-view high-fantasy RPG named TAN NGUYET (The Cursed Kingdom). Consistent 32x32 tile visual grid, chunky readable pixel clusters, restrained color palette, crisp 1-pixel outlines and highlights at native resolution, expressive silhouettes, coherent lighting from top-left, charming lived-in medieval fantasy world with subtle shattered-crescent-moon mystery. Gameplay readability first. No photorealism, no painterly gradients, no 3D, no isometric camera, no antialiasing, no smooth blur, no excessive bloom, no text, no watermark, no copied copyrighted characters.
```

### P01 — Thị trấn (scene concept; không phải tilemap xuất thẳng)

```text
A small warm medieval high-fantasy starter village seen in top-down 3/4 pixel art: cobblestone crossroads, wood-and-stone homes, cozy tavern, blacksmith with orange furnace, alchemist stall with glass potions, merchant counter, quest board, a path leading to a forest. Lively but uncluttered, clear walkable roads and readable entrances, natural green-brown-gold palette, faint crescent moon emblem on one sign. No UI, no labels, no characters blocking paths.
```

### P02 — Rừng Cổ Ngữ (scene concept)

```text
An explorable high-fantasy forest in top-down 3/4 pixel art: mossy trees, dirt trail, mushrooms, ancient standing stones and a small cracked crescent-moon seal, muted dark green palette, subtle violet cyan rune glow concentrated near the seal, multiple open combat spaces, clear navigation and silhouettes, no dense fog.
```

### P03 — Hầm ngục Tàn Nguyệt (scene concept)

```text
Ancient moon-seal dungeon, handcrafted top-down 3/4-view pixel art, slate stone floors, worn columns, rune doors, a central circular boss chamber, cracked moon emblem and very subtle cool-violet arcane light. Wide clean combat floor for dodge telegraphs, readable walls and passage boundaries, atmospheric but not too dark.
```

### P04 — Nhân vật khởi đầu (character concept / sprite reference)

```text
A small ordinary level-1 human villager in 2D top-down 3/4 pixel art, simple linen tunic, worn trousers and boots, humble adventurer silhouette, believable body proportions for a 32x48 frame, viewed slightly from above, neutral pose, clean hard pixel edges, limited colors, consistent overhead light, no dramatic spell aura, no advanced armor, plain transparent background.
```

**Biến thể chủng tộc:** thay `human villager` bằng `elf villager with visible pointed ears`, `short stocky dwarf villager`, `beastkin villager with subtle visible ears and tail`; giữ góc nhìn và kích thước chứa sprite như nhau.

### P05 — Kiếm Sĩ (character concept)

```text
A beginner swordsman in 2D top-down 3/4 high-fantasy pixel art, simple practical steel sword, light armor over cloth, determined readable combat silhouette, no legendary spiked armor, clean pixel outlines, body proportions matching a 32x48 player sprite cell, plain transparent background, consistent native-pixel rendering.
```

### P06 — Pháp Sư (character concept)

```text
A beginner mage in 2D top-down 3/4 high-fantasy pixel art, plain travel robes with modest blue-violet trim, short staff with a small cyan crystal, simple spellcasting silhouette, restrained spark particles, clean native pixel edges, body proportions matching a 32x48 player sprite cell, plain transparent background.
```

### P07 — Boss demo (character concept)

```text
Original ancient armored guardian of a broken crescent-moon seal, large top-down 3/4 high-fantasy pixel-art boss, cracked slate armor, heavy weapon, recognizable single silhouette, moon-shaped rune on torso, phase one dim rune; phase two glowing violet and cyan cracks with subtly increased menace, readable attack poses, clean chunky pixels and restrained magic, transparent background, not overly grotesque, not a full-screen monster.
```

### P08 — UI (concept reference)

```text
Minimal readable pixel-art RPG interface for a desktop browser game: dark slate and worn walnut panels, thin antique-gold borders, clean 32px item slots, simple HP/MP bars, hotbar, compact quest tracker, inventory grid, generous margins for Vietnamese Unicode labels. Medieval fantasy but practical and unobtrusive. No tiny illegible decorations or crowded controls.
```

### P09 — VFX (concept reference)

```text
Compact 2D pixel-art combat effects on a plain transparent background, separate examples of: narrow sword slash arc, cyan arcane projectile, small stone mining dust burst, quick golden crafting spark, clear coral-red circular danger telegraph. Hard pixel edges, high readability, minimal particles, no screen-filling bloom.
```

### NEGATIVE STYLE (bổ sung khi công cụ hỗ trợ)

```text
3D render, isometric camera, photorealism, digital painting, anime key visual, high-resolution smooth illustration, blurred pixels, gradient shading, glossy plastic, huge bloom, noisy details, inconsistent pixel sizes, realistic cast shadows, watermark, signature, logo from an existing franchise, copyrighted characters, unreadable UI text, excessive gothic horror, gore
```

### Cách dùng prompt khi cần asset thật

1. Dùng concept để thống nhất silhouette, mood và palette.
2. Pixel artist/AI hỗ trợ vẽ lại trên lưới sprite 32 × 48 hoặc tileset 32 × 32.
3. Xuất **PNG RGBA đúng kích thước**, asset không có nền/không chữ.
4. Dựng từng animation theo state/hướng, kiểm tra lệch chân/độ rung giữa frame.
5. Tích hợp vào game ở tỉ lệ thật và xem **screenshot gameplay**, không duyệt chỉ dựa ảnh đứng riêng.

---

# 13. WORKFLOW DÀNH CHO CODEX / AI AGENT

Khi được giao một nhóm asset, AI nên làm theo quy trình:

1. **Đọc** `docs/GDD.md` và `docs/ART_GUIDE.md`; kiểm tra phiên bản hiện tại và asset có sẵn.
2. **Xác định một phạm vi nhỏ**, ví dụ `ART-005 Town tileset`, đừng đồng thời làm toàn bộ thế giới.
3. **Kiểm tra license** của asset lấy từ bên ngoài. Không sử dụng sprite lấy ngẫu nhiên từ Google Image hoặc game thương mại.
4. **Tạo/chuẩn hóa** asset theo spec; chấp nhận placeholder rõ ràng khi chưa có art cuối.
5. **Cập nhật manifest và map/animation metadata**, kiểm tra đường dẫn/case-sensitive.
6. **Tích hợp và chạy thử**: render nearest, kiểm tra scale, transparency, collider, depth sorting, interaction, thiếu texture.
7. **Báo cáo thay đổi**: liệt kê file mới/sửa, ảnh minh họa, lỗi còn lại, asset nào cần vẽ lại.
8. **Không tự xoá tài nguyên khác, không push Git khi chưa được yêu cầu**, và không âm thầm đổi style vì model tạo ảnh đưa ra kết quả khác.

## 13.1 Định dạng bàn giao mỗi asset

```md
### ART-xxx — [Tên]
- Status: concept | placeholder | integrated | approved
- Source: original | AI-assisted | third-party (license + link)
- Files: `public/assets/...`
- Native size / frame: ...
- Animation states: ...
- Palette/style conformity: pass | revise
- In-game screenshot reviewed: yes | no
- Known issues: ...
- Next action: ...
```

## 13.2 Chấp nhận asset (Definition of Done)

Một asset chỉ được ghi `integrated` khi:

- [ ] Đường dẫn file tồn tại và loader đọc được.
- [ ] Native pixel size/frame size đúng metadata; không bị stretch, blur, viền rác.
- [ ] Nền trong suốt đúng chỗ, không viền trắng/đen ngoài ý muốn.
- [ ] Góc nhìn, ánh sáng, outline, palette nhất quán với khu vực.
- [ ] Đọc được khi thu về độ phân giải gameplay thực tế.
- [ ] Animation chạy không nhảy vị trí/đứt khung.
- [ ] Không che mất collision, UI hoặc tín hiệu nguy hiểm.
- [ ] Có screenshot hoặc kết quả kiểm thử trong game.
- [ ] Nguồn/license được ghi lại; không dùng asset vi phạm bản quyền.

---

# 14. RANH GIỚI ART CỦA DEMO

**Làm trong Demo v0.1 (P0):**

- 1 thị trấn + 1 rừng + 1 hầm ngục thủ công.
- 4 chủng tộc tạo nhân vật với tùy biến cơ bản.
- 2 Class chơi được: Kiếm Sĩ và Pháp Sư.
- 3–5 NPC chính, 2–3 quái thường, 1 Boss 2 giai đoạn.
- Asset tối thiểu cho 3 nghề, vật phẩm, HUD, menu và loop quest.
- Một hình ảnh phong ấn/biểu tượng trăng nứt để dẫn sự kiện theo hành động người chơi.

**Để sau (P2):**

- Toàn bộ vương quốc, các mùa, thời tiết phức tạp, NPC hoạt ảnh hàng trăm nghề.
- Cung Thủ, Tu Sĩ, nhánh tiến hóa và các bộ trang phục huyền thoại.
- Nhà/cửa hàng do người chơi xây; chợ Multiplayer; bang hội, đấu trường, chiến tranh.
- Boss thế giới, raid 10v10, thú cưỡi/thuần hóa chuyên sâu, cinematic lớn.
- Hệ cosmetic riêng; GDD hiện chọn **trang phục theo trang bị**, không có transmog tách riêng.

---

# 15. CÂU LỆNH NGẮN GỌN ĐỂ ĐƯA VÀO CODEX

```text
Hãy đọc kỹ docs/GDD.md và docs/ART_GUIDE.md trước khi làm bất cứ asset hay scene nào cho TÀN NGUYỆT. Triển khai art theo P0 của Demo v0.1, dùng 2D top-down pixel art và chuẩn được mô tả. Nếu project đã có framework/asset thì tái sử dụng và chuẩn hóa, không viết lại vô cớ. Không tự triển khai Multiplayer hoặc hệ thống ngoài demo. Ưu tiên sprite rõ ở kích thước thật, tilemap thủ công, animation chính xác theo metadata, PNG trong suốt, nearest-neighbor và giao diện hỗ trợ tiếng Việt. Nếu art chưa sẵn sàng, dùng placeholder nhất quán và ghi rõ. Sau mỗi phần, chạy game, chụp/kiểm tra kết quả trong gameplay, cập nhật art manifest và báo asset đã hoàn thành.
```

---

## CÂU CHỐT CHO AI

**TÀN NGUYỆT không cần hàng nghìn asset ngay lúc này.** Bản demo phải trông **thống nhất, có bản sắc High Fantasy bí ẩn, dễ đọc combat, thị trấn có sức sống**, và quan trọng nhất là **chơi được từ dân thường đến khi hạ Boss đầu tiên**. Khi loop game đã vui, mới mở rộng số lượng asset và chiều sâu mỹ thuật.
