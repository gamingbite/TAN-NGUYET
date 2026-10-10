# TÀN NGUYỆT – THE CURSED KINGDOM
## GAME DESIGN DOCUMENT (GDD) — Bản định hướng & giới hạn Demo v0.1

**Phiên bản tài liệu:** 0.1 • **Ngày tổng hợp:** 08/10/2026  
**Trạng thái:** Tổng hợp những lựa chọn người thiết kế đã xác nhận từ **câu 01–75**. **Câu 76 chưa được chốt.**  
**Nguyên tắc:** GDD tổng thể mô tả hướng phát triển dài hạn; **phạm vi Demo v0.1 bên dưới là đề xuất rút gọn để thử gameplay**, không đồng nghĩa tất cả 75 hệ thống phải làm ngay.

---

## 1. Tầm nhìn game

**TÀN NGUYỆT** là game **2D pixel-art top-down, High Fantasy**, pha trộn **Fantasy Life Simulator** và **Action Adventure RPG**. Người chơi bắt đầu như một dân thường nghèo, làm nghề kiếm sống, học một Class chiến đấu, khám phá vùng đất, thực hiện nhiệm vụ, tìm hiểu bí ẩn Tàn Nguyệt và tự tạo những câu chuyện qua hành động của mình.

**Trụ cột thiết kế:**
1. **Tự do sống và phiêu lưu:** Đào quặng, chế tạo, mua bán, chiến đấu và khám phá đều là lối chơi hợp lệ.
2. **Thế giới phản ứng với hành động:** Sự kiện nảy sinh từ tương tác/nguyên nhân rõ ràng, không chỉ ngẫu nhiên vô nghĩa.
3. **Chiến đấu nhanh, dễ làm quen:** Tấn công thời gian thực, né đòn, Class có kỹ năng riêng, Boss nhiều giai đoạn.
4. **Tiến trình có ý nghĩa:** Từ dân thường đến người hùng, công thức và bí mật mở qua NPC/nhiệm vụ/khám phá.
5. **Đủ hỗn loạn để vui:** Tình huống bất ngờ do hành động người chơi/NPC, nhưng không làm mất sạch công sức khi chết.

### 1.1 Phong cách và nền tảng
- Đồ họa **2D pixel art nhìn từ trên xuống**; thế giới **High Fantasy** nhưng tên gọi tiến hóa Class có sắc thái **Dark Fantasy**.
- **PC trình duyệt web trước**, giao diện và cấu trúc có đường nâng cấp lên điện thoại sau.
- Phiên bản hoàn chỉnh hướng tới **chơi đơn + Multiplayer**, thế giới riêng và các kênh công cộng.

## 2. Thế giới và trải nghiệm dài hạn (Full Vision)

- Nhiều vương quốc liên thông; thành phố, rừng, núi, di tích, hầm ngục được **thiết kế thủ công**.
- Người chơi khám phá bản đồ phủ sương; **lần đầu phải tự đi đến địa điểm**, sau đó mới mở dịch chuyển nhanh.
- Chu kỳ ngày/đêm cơ bản; NPC làm việc ban ngày, nghỉ ban đêm; có quái hoạt động theo khung giờ.
- NPC có lịch sinh hoạt, tính cách, trí nhớ, quan hệ, công việc và phản ứng với người chơi; các hệ thống mô phỏng sâu là mục tiêu dài hạn.
- Vương quốc và phe phái có lợi ích chính trị, tài nguyên, đồng minh, đối thủ; người chơi có thể tác động bằng chiến đấu, ngoại giao, kinh tế và mưu lược.
- Truyện chính xoay quanh bí ẩn **Tàn Nguyệt**, nhiều nhánh kết thúc; có thể tiếp tục chơi tự do hoặc bỏ qua truyện chính.
- Sự kiện thế giới bắt nguồn từ hành động NPC/người chơi, hậu quả có thể kéo dài nhưng **có cách khắc phục**.
- Có khu đất riêng cho nhà, cửa hàng, quán trọ, nông trại; hoạt động sản xuất, thuê nhân công và giao thương liên vùng về sau.

## 3. Nhân vật, Class và chiến đấu

### 3.1 Tạo nhân vật
- Chọn **Con Người / Tinh Linh / Người Lùn / Thú Nhân**; khác ngoại hình và văn hóa nhưng chỉ số khởi đầu cân bằng.
- Tùy chỉnh **giới tính, tóc, màu da, tên**. Trang phục hiển thị đúng trang bị đang mặc; **không có hệ thống thời trang riêng** ở phạm vi đã chốt.
- Khởi đầu là **dân thường cấp 1**.

### 3.2 Tiến trình
- **Một cấp nhân vật chung** từ chiến đấu và nhiệm vụ, không chia cấp riêng theo từng Class.
- Khi lên cấp nhận điểm chỉ số để phân bổ; Class có đặc trưng riêng; hỗ trợ preset chỉ số theo Class và đặt lại ở khu an toàn.
- Kỹ năng **cố định theo từng Class**, mở khóa theo cấp nhân vật, **không có cây kỹ năng phân nhánh**.
- Học Class từ NPC/trường phái; Class nâng cao mở qua cấp/nhiệm vụ; Class huyền thoại qua bí mật.
- Được đổi sang Class đã mở khóa **ở ngoài chiến đấu**, có hồi chiêu ngắn.
- Vũ khí dành riêng theo Class; giáp và phụ kiện dùng chung nếu đủ điều kiện; có bộ trang bị lưu riêng theo Class.

### 3.3 Bốn Class cơ bản và tiến hóa tuyến tính
| Class gốc | Nâng cao | Huyền thoại |
|---|---|---|
| Kiếm Sĩ | Hắc Kỵ Sĩ | Kỵ Sĩ Tận Thế |
| Pháp Sư | Huyền Thuật Sư | Hư Không Pháp Chủ |
| Cung Thủ | Ảnh Xạ Thủ | Dạ Nguyệt Thần Tiễn |
| Tu Sĩ | Nguyệt Tư Tế | Kẻ Phán Xét |

- Action RPG thời gian thực: tấn công, di chuyển, né/lướt, combo và kỹ năng; có thể hỗ trợ khóa mục tiêu.
- Quái thường: xuất hiện tại khu vực xác định, đi tuần, phát hiện và đuổi đánh, hồi sinh sau thời gian chờ.
- Boss có **nhiều giai đoạn** theo ngưỡng HP, bộ đòn và tín hiệu cảnh báo thay đổi.
- Khi nhân vật chết, hồi sinh gần checkpoint, **không mất túi đồ hay tiến độ**, có thể có tổn thất nhẹ.
- Hầm ngục **bản đồ cố định làm thủ công**, có thể chơi lại; boss được tạo mới khi vào phiên hầm ngục, phần thưởng hiếm có giới hạn ngày/tuần về sau.
- Chơi nhiều người: mỗi người có phần thưởng cá nhân, không giành đồ của nhau.

## 4. Đời sống, kinh tế và chế tạo

### 4.1 Ba nghề khởi đầu
1. **Thợ Mỏ:** Cầm cuốc, giữ nút khai thác quặng trong vài giây, mỏ tái sinh theo thời gian; không có mini-game.
2. **Thợ Rèn:** Chế tạo và cường hóa trang bị; **cường hóa có tỷ lệ thành công theo cấp**, thất bại **mất nguyên liệu nhưng không phá hủy trang bị**. Quy định tụt cấp chưa chốt, không tự thêm.
3. **Nhà Giả Kim:** Chế thuốc HP/MP và thuốc tăng sát thương, tốc độ, phòng thủ, kháng nguyên tố, tàng hình ngắn hạn. **Không chốt hệ bom giả kim.** Thuốc hồi phục có thời gian hồi chiêu; chỉ duy trì **một hiệu ứng tăng sức mạnh chính** cùng lúc.

### 4.2 Chế tạo và học công thức
- Biết công thức + đủ nguyên liệu → bấm chế tạo; **không mini-game**, chất lượng thành phẩm theo công thức xác định, không ngẫu nhiên từ chế tạo.
- Công thức thường mua từ NPC; công thức nâng cao qua cấp/nhiệm vụ; công thức huyền thoại qua bí mật/di tích.
- Trang bị có cấp chất lượng, thuộc tính, bộ trang bị, vật phẩm huyền thoại; chi tiết mở rộng về sau.

### 4.3 Tiền tệ, mua bán và hành trang
- Ba mệnh giá: **Đồng – Bạc – Vàng**, tỷ lệ đổi cụ thể **chưa chốt**.
- **Giá NPC cố định**; người chơi tự định giá khi bán cho nhau.
- Túi đồ giới hạn ô, vật phẩm giống nhau có thể xếp chồng, có thể mở rộng túi và dùng rương/kho.
- Có chợ giao dịch tập trung, tìm/lọc và mua từ xa trong phiên bản Multiplayer hoàn chỉnh; đăng bán miễn phí trong giới hạn số món, thu phí khi bán thành công.
- Vật phẩm phù hợp được giao dịch **trước khi trang bị/kích hoạt lần đầu**, sau đó khóa chủ sở hữu.
- Kinh doanh tài sản có chi phí vận hành nhẹ, **không bị tịch thu tài sản vì offline**.

### 4.4 Không có sinh tồn bắt buộc
- Nhân vật **không cần ăn, uống, ngủ** để tồn tại.
- Thức ăn chỉ hồi HP hoặc tăng chỉ số tạm thời; không có thanh đói/khát/mệt.

## 5. Multiplayer, NPC đồng hành, bang hội (Full Vision)

### 5.1 Chế độ chơi
- Thế giới riêng (một mình/mời bạn) và kênh công cộng; dùng chung nhân vật, cấp độ và trang bị trên hệ thống máy chủ.
- Chuyển giữa các thế giới có đồng bộ có giới hạn đối với một số tài nguyên/vật phẩm hiếm.
- Mục tiêu **20–30 người/kênh công cộng** (còn phải kiểm tra hiệu năng thực tế).
- Chat văn bản: gần, thế giới, tổ đội, bang hội, tin riêng. Không chốt voice chat hoặc emote nâng cao.
- Danh sách bạn bè, mời tổ đội, có thể dịch chuyển tới bạn **chỉ nếu địa điểm đã tự mở khóa và khu vực cho phép**.
- PvP kiểm soát: thành phố an toàn, đấu tay đôi, đấu trường, bang chiến/khu tranh chấp, bảo vệ tài sản cá nhân.

### 5.2 Tổ đội và NPC đánh thuê
- Tổ đội tối đa **4 thành viên tính cả NPC**; có thể đi một mình hoặc với người chơi/NPC.
- Boss điều chỉnh độ khó theo đội hình.
- NPC tự chiến đấu theo Class và nhận 5 lệnh: **Theo sau, Tấn công, Phòng thủ, Rút lui, Giữ vị trí**.
- Thuê tại **quán trọ/Hội Mạo Hiểm Giả**, trả **một khoản cố định trước mỗi chuyến**; hợp đồng hết khi xong chuyến, giải tán hoặc NPC bị hạ gục.
- NPC có **cấp, chỉ số, kỹ năng, trang bị cố định**; muốn mạnh hơn thuê NPC khác.
- Giới hạn cấp NPC theo cấp nhân vật; mức **cao hơn 5 cấp chỉ là ví dụ**, chưa chốt thông số.
- Khi HP NPC về 0: **rời ngay trận chiến, trở về quán trọ**, phải thuê lại nếu muốn tiếp tục. NPC không chết vĩnh viễn.

### 5.3 Bang hội
- Tối đa **10 thành viên/bang**.
- Chỉ hai vai trò: **Bang Chủ** (mời, duyệt, khai trừ, giải tán) và **Thành Viên** (quyền ngang nhau).
- **Không có kho hay quỹ bang hội chung**, mỗi người tự giữ đồ và tiền.
- Bang chiến **5v5 chiếm cứ điểm**, tích điểm từ quyền kiểm soát khu vực; trận riêng, không mất tài sản.
- Khi bị hạ gục trong bang chiến: chờ **khoảng 10–15 giây** rồi hồi sinh tại căn cứ, không áp dụng cho PvE.
- **Chưa chốt câu 76** về thời gian, điểm mục tiêu hay điều kiện thắng chính thức.

---

## 6. Demo v0.1 — Chỉ làm một lát cắt chơi được

**Mục tiêu:** Chứng minh vòng lặp **Dân thường → Làm việc → Học Class → Khám phá → Chiến đấu → Chế tạo → Đánh Boss → Trở về thị trấn**, trước khi xây Multiplayer hay mô phỏng xã hội toàn diện.

**Nền tảng:** Chạy ngay trên trình duyệt PC, điều khiển bằng bàn phím/chuột, không cần đăng nhập hoặc máy chủ Multiplayer ở v0.1. Có lưu tiến độ chơi thử cục bộ. Phần game nên có cấu trúc module để mở rộng online/mobile về sau.

### 6.1 Nội dung phải làm trong Demo v0.1 (ưu tiên P0)

| Hạng mục | Đủ cho demo, không làm quá |
|---|---|
| Bản đồ | **1 thị trấn + 1 khu rừng + 1 hầm ngục thủ công**, kết nối đường đi. Có sương mù khám phá ở mức đơn giản, một điểm dịch chuyển sau khi đã tới. |
| Nhân vật | Tạo nhân vật từ **4 chủng tộc** với khác biệt hình ảnh cơ bản, tên/giới tính/tóc/màu da; bắt đầu dân thường cấp 1. |
| Class | **2 Class chơi được trước: Kiếm Sĩ và Pháp Sư**. Cung Thủ/Tu Sĩ và mọi tiến hóa vẫn nằm trong GDD full, **chưa bắt buộc ở demo đầu**. Học Class qua NPC, đổi Class đã mở khóa ngoài giao tranh. |
| Chiến đấu | Di chuyển, đòn đánh cơ bản, né/lướt, 1–2 kỹ năng/Class, máu/năng lượng, phản hồi trúng đòn; **2–3 loại quái** có đuổi đánh và hồi sinh. |
| Boss | **1 Boss 2 giai đoạn**, có báo hiệu đòn nguy hiểm; hầm ngục replay được. Chết hồi sinh ở checkpoint và giữ trang bị. |
| NPC và quest | **3–5 NPC quan trọng**, hội thoại cố định + lịch ngày/đêm đơn giản; **2–3 nhiệm vụ có chỉ dẫn**, một bí mật nhỏ có thể tự tìm. |
| Hành động gây hệ quả | **1 sự kiện rõ nguyên nhân**, ví dụ người chơi phá phong ấn trong rừng làm quái xuất hiện, rồi có nhiệm vụ dọn dẹp. Không cần mô phỏng AI xã hội. |
| Ba nghề | Mỗi nghề **1 thao tác hoàn chỉnh**: khai thác quặng, chế tạo vật phẩm cơ bản, pha thuốc hồi phục hoặc buff. Không mini-game. |
| Trang bị & vật phẩm | Túi đồ giới hạn ô/stack; 1 bộ trang bị cơ bản/Class, nhặt đồ, mang trang bị; nâng cấp đơn giản có khả năng thất bại nhưng không phá hủy đồ (nếu đủ thời gian). |
| Kinh tế | 1 NPC thương nhân mua/bán với giá cố định; tiền Đồng/Bạc/Vàng hiển thị cơ bản; **chưa mở chợ người chơi**. |
| Thuốc | Hồi HP/MP có hồi chiêu; nếu có buff thử nghiệm thì mỗi lúc chỉ cho phép 1 buff chính. |
| Giao diện | Màn hình bắt đầu/tạo nhân vật, HUD, túi đồ, thoại NPC, quest log ngắn, bảng nghề/chế tạo, menu pause và lưu/tiếp tục. |
| Trải nghiệm | Có phản hồi âm thanh/hiệu ứng khi đánh, nhặt đồ, chế tạo; điều khiển trơn tru. Không có hệ đói/khát/ngủ. |

**Ranh giới triển khai:** Nếu cần cắt tiếp để bản demo chạy ổn, **ưu tiên P0 theo thứ tự**: điều khiển → thế giới → chiến đấu → nhiệm vụ → nghề cơ bản → hầm ngục/Boss → lưu game. Không được trì hoãn bản chơi thử chỉ để làm tính năng phụ.

### 6.2 Một lượt chơi demo từ đầu đến điểm dừng

1. **Tạo nhân vật**, xuất hiện tại thị trấn trong thân phận dân thường.
2. **Gặp trưởng làng/NPC hướng dẫn**, nhận nhiệm vụ đầu tiên.
3. **Ra mỏ gần thị trấn**, đào quặng, mang về gặp Thợ Rèn để chế tạo một món trang bị cơ bản; có thể thử Nhà Giả Kim tại thị trấn.
4. **Gặp người dạy Class**, chọn Kiếm Sĩ hoặc Pháp Sư; học cách tấn công, dùng kỹ năng và né đòn.
5. **Vào khu rừng**, khám phá bản đồ, đánh quái, tìm vật phẩm và chứng kiến một sự kiện nhỏ do tương tác gây ra.
6. **Mở hầm ngục thủ công**, vượt vài phòng, chiến đấu với **Boss hai giai đoạn**.
7. **Trở về thị trấn**, hoàn thành nhiệm vụ, nhận phần thưởng và xem thông điệp **“Kết thúc nội dung cốt truyện của Demo v0.1 – thế giới vẫn có thể tự do khám phá.”**
8. Sau điểm kết thúc, người chơi **tiếp tục tự do khai thác, chế tạo, đánh quái và chơi lại hầm ngục** để thử hệ thống. Không cần có toàn bộ truyện Tàn Nguyệt hay ending chính thức.

**Điểm DỪNG chính xác của Demo v0.1:** **Người chơi hạ Boss đầu tiên và quay lại thị trấn nộp nhiệm vụ.** Đây là hết **chuỗi nội dung bắt buộc** để thử game; các tính năng đã tạo vẫn chơi tự do sau đó.

### 6.3 Có trong GDD nhưng CHƯA làm ở Demo v0.1

- **Online/Multiplayer:** public/private worlds, 20–30 người/kênh, đồng bộ tài khoản, chat, bạn bè, party online, PvP/bang chiến.
- **Bang hội:** giới hạn 10 người, cấp bậc, bang chiến chiếm cứ điểm/hồi sinh — giữ luật thiết kế cho về sau; **không xây trong demo đầu**.
- **NPC đánh thuê:** hệ hợp đồng trả trước, 5 lệnh, AI hỗ trợ chiến đấu, đội 4 người — **để bản thử nghiệm tiếp theo**, không bắt Codex làm trong v0.1.
- **Thế giới lớn:** nhiều vương quốc, toàn bộ tuyến cốt truyện/nhánh kết thúc, chính trị, liên minh, AI NPC mô phỏng sâu, chu kỳ kinh tế tự vận hành.
- **Bất động sản:** mua đất, xây nhà/quán trọ/cửa hàng, thuê nhân viên, kinh doanh có chi phí duy trì.
- **Thương mại mạng:** chợ tập trung, thu phí giao dịch, khóa vật phẩm theo tài khoản, chuyển vật phẩm liên thế giới.
- **Nội dung nâng cao:** hai Class còn lại nếu chưa kịp, tiến hóa Class, vật phẩm huyền thoại/set, thú nuôi, công thức bí mật lớn, dungeon bổ sung, raid, chiến tranh phe phái.
- **Tinh chỉnh chi tiết:** % cường hóa, tỷ lệ đổi tiền, giới hạn chênh cấp NPC, số điểm và thời lượng bang chiến, giới hạn thưởng ngày/tuần — thử rồi mới chốt.

### 6.4 Mốc triển khai về sau (không thuộc demo đầu)

- **Demo v0.2 – Hoàn thiện PvE:** thêm Cung Thủ/Tu Sĩ; thuê 1 NPC đồng hành, mở rộng kỹ năng/đồ, tối ưu cân bằng, thêm một ít nội dung.
- **Demo v0.3 – Thử nghiệm online:** phòng bạn bè 2–4 người, đồng bộ chiến đấu/inventory cơ bản nếu nền tảng ổn; không bắt buộc đạt 20–30 người ngay.
- **Alpha mở rộng:** kênh công cộng, chat, bạn bè, chợ, bất động sản, bang hội và bang chiến, nhiều vùng đất.
- **Full game:** vương quốc liên kết, AI thế giới sâu, chính trị, truyện phân nhánh, các Class tiến hóa và hệ thống xã hội toàn diện.

### 6.5 Tiêu chí nghiệm thu Demo v0.1

- Chạy được từ trình duyệt PC và bắt đầu game không cần chỉnh sửa mã nguồn thủ công.
- Nhân vật tạo được, đi lại, tương tác, đánh quái, có va chạm và hồi sinh.
- Hoàn thành ít nhất một vòng **đào quặng → chế tạo → sử dụng/bán đồ**.
- Hoàn thành quest dẫn đến hầm ngục, hạ Boss 2 phase và trở về nhận thưởng.
- Một sự kiện có nguyên nhân từ hành động người chơi thật sự kích hoạt và có cách kết thúc.
- Lưu/tải được tiến độ tối thiểu: nhân vật, level, vật phẩm, quest, khám phá bản đồ.
- Có thông điệp kết thúc **nội dung demo**, sau đó vẫn chơi tự do được.
- Những tính năng chưa triển khai **không xuất hiện như nút bấm giả** hoặc chức năng lỗi; nếu cần, hiển thị rõ “Đang phát triển”.

---

## 7. Biên bản 75 lựa chọn đã chốt

**Ký hiệu phạm vi:** **D** = làm trong demo v0.1 (đủ dùng); **R** = rút gọn/chỉ lấy một phần để thử; **S** = sau demo. Đây là **phạm vi đề xuất**, không thay đổi quyết định GDD gốc.

| Câu | Quyết định đã chọn | Phạm vi |
|---|---|:---:|
| 01 | C — Kết hợp Fantasy Life Simulator + Adventure RPG | D |
| 02 | D — Thế giới High Fantasy | R |
| 03 | A — Khởi đầu dân thường nghèo | D |
| 04 | D — Chơi đơn và Multiplayer | R |
| 05 | D — Thế giới mở đa vương quốc/liên vùng | R |
| 06 | B — Được đổi Class sau khi mở khóa | D |
| 07 | D — Class thường qua NPC; nâng cao qua cấp/nhiệm vụ; huyền thoại qua bí mật | R |
| 08 | D — Chiến đấu Action RPG thời gian thực, combo, né đòn, phép | D |
| 09 | D — Kinh tế nghề nghiệp, sản xuất, cửa hàng, thuê NPC, thương mại | R |
| 10 | D — NPC có đời sống, trí nhớ, quan hệ và phản ứng | R |
| 11 | D — Phe phái/chính trị/ngoại giao và ảnh hưởng của người chơi | S |
| 12 | D — Truyện bí ẩn Tàn Nguyệt, đa kết thúc, sandbox | R |
| 13 | C — Sự kiện từ hành động NPC/người chơi và hệ quả | R |
| 14 | B — Hậu quả kéo dài nhưng có thể sửa chữa | R |
| 15 | B — Sở hữu đất và tự xây công trình trong thế giới chung | S |
| 16 | D — Ma thuật chiến đấu, tiện ích và nghiên cứu rune | R |
| 17 | A — Chết hồi sinh checkpoint, không mất đồ/tiến độ | D |
| 18 | D — PvP kiểm soát, tài sản an toàn | S |
| 19 | D — Tổ đội, bang hội, liên minh, hoạt động hợp tác | S |
| 20 | D — NPC đồng hành có tính cách, trí nhớ, mục tiêu | S |
| 21 | A — Dungeon bản đồ cố định, thiết kế thủ công | D |
| 22 | D — Đồ có cấp chất lượng, thuộc tính, craft, cường hóa, set/legendary | R |
| 23 | B — Thuần hóa, chăm sóc và gắn bó với thú | S |
| 24 | A — Chu kỳ ngày/đêm cơ bản | R |
| 25 | A — 2D pixel art top-down | D |
| 26 | D — Web PC trước, mobile sau | D |
| 27 | D — Thế giới riêng + công cộng, nhân vật chung máy chủ | S |
| 28 | C — Chuyển vật phẩm/tài nguyên giữa thế giới có giới hạn | S |
| 29 | D — Quest thủ công, quest phát sinh từ thế giới, bí mật không marker | R |
| 30 | A — Một cấp nhân vật chung | D |
| 31 | D — Điểm chỉ số, bonus Class, preset, reset | R |
| 32 | A — Kỹ năng cố định theo Class, mở theo cấp | D |
| 33 | B — 4 Class: Kiếm Sĩ, Pháp Sư, Cung Thủ, Tu Sĩ | R |
| 34 | A — Mỗi Class tiến hóa một tuyến duy nhất | S |
| 35 | C — Tên nhánh tiến hóa phong cách Dark Fantasy | S |
| 36 | B — Đổi Class đã mở ở ngoài chiến đấu, có hồi chiêu | D |
| 37 | B — Vũ khí Class riêng, giáp chung, loadout Class | R |
| 38 | B — Túi giới hạn ô, stack, nâng túi/kho | D |
| 39 | A — Giá mua bán NPC cố định | D |
| 40 | B — Ba mệnh giá Đồng/Bạc/Vàng | D |
| 41 | B — Chi phí kinh doanh nhẹ, bảo vệ khi offline | S |
| 42 | A — Chế tạo bằng công thức/nguyên liệu, không mini-game | D |
| 43 | D — Công thức thường từ NPC, nâng cao qua nhiệm vụ, huyền thoại qua bí mật | R |
| 44 | C — Điểm dịch chuyển chỉ mở sau lần đầu tự đến | D |
| 45 | B — Bản đồ sương mù, khám phá mở dần | D |
| 46 | A — Quái tuần tra, truy đuổi, đánh, respawn | D |
| 47 | B — Boss nhiều phase theo HP, đòn mới và telegraph | D |
| 48 | B — Boss mới mỗi lượt dungeon, phần thưởng hiếm giới hạn | R |
| 49 | B — Phần thưởng riêng cho mỗi người tham gia | S |
| 50 | C — Vật phẩm khóa sau khi trang bị/kích hoạt | S |
| 51 | C — Chợ tập trung, tìm kiếm/mua từ xa | S |
| 52 | B — Đăng bán miễn phí giới hạn số món, phí khi bán được | S |
| 53 | A — 3 nghề đầu: Thợ Mỏ, Thợ Rèn, Nhà Giả Kim | D |
| 54 | A — Đào quặng giữ nút, quặng tái sinh | D |
| 55 | B — Cường hóa có xác suất, thất bại mất nguyên liệu không phá đồ | R |
| 56 | B — Giả kim thuốc cơ bản và buff đặc biệt | D |
| 57 | B — Thuốc hồi có cooldown, chỉ 1 buff sức mạnh chính | D |
| 58 | A — Không có nhu cầu sinh tồn; thức ăn là vật phẩm hồi/buff | D |
| 59 | B — 4 chủng tộc cân bằng: Người, Tinh Linh, Người Lùn, Thú Nhân | D |
| 60 | A — Tùy chỉnh cơ bản, trang phục theo trang bị | D |
| 61 | A — Chat chữ: gần, thế giới, đội, bang, riêng | S |
| 62 | B — Bạn bè, mời tổ đội, dịch chuyển có điều kiện mở khóa | S |
| 63 | B — Khoảng 20–30 người/kênh công cộng | S |
| 64 | B — Tổ đội tối đa 4, solo/bạn/NPC, Boss điều chỉnh theo đội | S |
| 65 | B — NPC tự đánh + 5 lệnh chỉ huy đơn giản | S |
| 66 | A — NPC đồng hành thuê bằng tiền ở quán trọ/hội | S |
| 67 | A — NPC thuê cấp/chỉ số/trang bị cố định | S |
| 68 | C — NPC bị hạ gục rời trận, về quán trọ | S |
| 69 | A — Tiền thuê trả trước theo chuyến, hợp đồng kết thúc theo chuyến | S |
| 70 | B — Cấp NPC thuê giới hạn gần với cấp nhân vật | S |
| 71 | A — Bang hội nhỏ tối đa 10 người | S |
| 72 | A — Chỉ Bang Chủ và Thành Viên, Bang Chủ quản lý toàn quyền | S |
| 73 | A — Không có kho/quỹ bang chung | S |
| 74 | B — Bang chiến 5v5 chiếm cứ điểm tích điểm | S |
| 75 | B — Bang chiến hồi sinh tại căn cứ sau khoảng 10–15 giây | S |

**Không có câu 76 trong danh sách quyết định:** thời lượng/điểm thắng bang chiến vẫn chưa được lựa chọn. Không tự mặc định đề xuất C trong câu hỏi trước là đã chốt.

## 8. Nguyên tắc áp dụng cho Codex khi triển khai demo

- **Chỉ triển khai mục 6.1–6.2** để ra bản chơi thử đầu tiên; không cố hiện thực tất cả mục 2–5.
- Tôn trọng các lựa chọn GDD đã chốt; phần chưa chốt để cấu hình hoặc nêu rõ **placeholder**, không biến ví dụ thành quy tắc.
- Ưu tiên game chạy được, điều khiển mượt, vòng lặp vui hơn số lượng tính năng.
- Không tạo button/tính năng rỗng để giả lập sự hoàn chỉnh.
- Tổ chức code theo module để nối Multiplayer, thêm Class và khu vực sau.

**Tóm lại:** GDD đã có 75 quyết định định hướng. **Bản demo chỉ cần chơi từ lúc tạo dân thường cho đến lúc hạ Boss đầu tiên, trở về thị trấn và nộp nhiệm vụ**, sau đó vẫn được tiếp tục chơi tự do. Phần còn lại để cập nhật khi người chơi thật sự thử được và có phản hồi.
