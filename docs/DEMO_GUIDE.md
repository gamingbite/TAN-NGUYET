# Hướng dẫn chơi Demo v0.1

Bản chơi thử local chạy tại `http://127.0.0.1:5173` sau lệnh `npm run dev`. Mục tiêu lượt đầu là tự làm nghề, học Class, giải quyết phong ấn, hạ Boss rồi **trở về thị trấn nộp nhiệm vụ**. Sau đó thế giới vẫn mở để khám phá và chơi lại.

Art A/B2/C/D đã được duyệt và tích hợp local. Game phủ cửa sổ web, HUD và chỉ hướng nằm trong vùng chơi; menu icon góc phải trên chứa các chức năng/hướng dẫn/cài đặt. Thị trấn có15nhà và8dân đi vòng ngắn để tạo không khí; năm NPC nhiệm vụ/nghề và vị trí tương tác được giữ. Xem [biên bản kiểm tra](DEMO_CHECK.md) và [tiến độ art](ART_PROGRESS.md) để biết kết quả thử mới nhất; hướng dẫn dưới đây mô tả các thao tác đang có.

## Bắt đầu và điều khiển

Chọn tên, Con Người/Tinh Linh/Người Lùn/Thú Nhân, giới tính, kiểu/màu tóc và màu da trên màn hình đầu. Bốn chủng tộc khác hình nhưng cùng khởi đầu dân thường cấp 1. Nhân vật mới có ít gỗ, thảo dược và Đồng để thử nghề; chưa có Class chiến đấu.

Icon **☰** ở góc phải trên mở các chức năng và cài đặt. Chọn **Hướng dẫn** hoặc bấm `H` để mở cẩm nang. **Nhiệm vụ** (`J`) chứa các bước hành trình; game phủ toàn cửa sổ và lời nhắc tương tác xuất hiện khi đứng gần đối tượng.

Bảng **bước tiếp theo** trong vùng chơi cho biết mục tiêu, nơi cần đến và thao tác cần làm. Đi theo **mũi tên vàng cạnh nhân vật**; mũi tên đổi hướng theo đường tránh vật cản và các cửa nối phòng. Vòng vàng đánh dấu đích khi đã khám phá chỗ đó. Tới gần, dùng thao tác trên bảng và lời nhắc tương tác (`E`, giữ `E` hoặc tấn công).

Chỉ dẫn tự chuyển khi nhận/nộp quest, đào quặng, rèn vũ khí, học Class, giải quyết phong ấn và hạ Boss. NPC đổi vị trí ban đêm vẫn được theo dõi; khi cần đi khu khác, mũi tên dẫn tới cửa của khu hiện tại. Nếu đang dùng Dân thường dù đã học Class, bảng nhắc mở `I` đổi Class ngay tại chỗ. Sau khi nộp nhiệm vụ Boss, chỉ dẫn tự ẩn để tiếp tục khám phá tự do; bí mật trong rừng vẫn dành cho người chơi tự tìm.

| Thao tác | Kết quả |
| --- | --- |
| WASD / mũi tên | Di chuyển; đi chéo không tăng tốc |
| Space | Đòn đánh thường theo hướng đang nhìn; giữ để đánh liên tục theo hồi chiêu |
| Chuột trái trên canvas | Đánh theo hướng trỏ; giữ để tiếp tục đánh |
| Shift cùng hướng đi | Né/lướt, có hồi chiêu |
| 1 / 2 | Kỹ năng riêng của Class; cần MP và hết hồi chiêu |
| E | Tương tác khi đứng gần NPC, phong ấn, vật thể hoặc cửa |
| Giữ E tại mỏ | Đào quặng đến khi thanh tiến độ đầy |
| Q / R | Uống thuốc HP / MP nếu có và cần hồi phục |
| I / J / C / M / H | Túi / nhiệm vụ / nghề / bản đồ / hướng dẫn |
| Esc | Đóng bảng đang mở hoặc tạm dừng/tiếp tục |

Đứng gần đối tượng để đọc lời nhắc ở đáy vùng chơi. Bảng thoại, túi, bản đồ và menu tạm dừng mô phỏng. Rời cửa sổ cũng tự pause; tiếp tục bằng nút trong menu.

Game phủ cửa sổ web, HUD nằm ngay trong vùng chơi. Bấm icon **☰** ở góc phải trên để mở hành trang, nhiệm vụ, chế tạo, bản đồ, hướng dẫn, cài đặt, lưu và bản lưu/sao lưu. Mở menu hoặc các bảng sẽ tạm dừng game; các phím tắt vẫn dùng được.

Mở **Cài đặt** từ màn hình đầu hoặc menu **☰** để chỉnh âm lượng, tắt âm thanh, rung màn hình và hiển thị số sát thương. Thiết lập áp dụng ngay, được giữ riêng trên trình duyệt và không đổi nhân vật/nhiệm vụ. **Mở toàn màn hình** ẩn thanh trình duyệt; dùng nút tương ứng hoặc Esc để thoát.

## Người cần gặp ở Thị trấn Tro Tàn

| NPC | Vị trí ban ngày | Việc làm |
| --- | --- | --- |
| Trưởng làng An | Phía bắc quảng trường | Nhận/nộp cả ba nhiệm vụ |
| Sư phụ Dạ | Phía tây quảng trường | Học Kiếm Sĩ hoặc Pháp Sư |
| Thợ rèn Lâm | Phía tây nam | Học công thức, rèn kiếm/trượng/giáp |
| Giả kim Liên | Phía đông bắc | Học công thức và pha thuốc |
| Thương nhân Vũ | Phía đông quảng trường | Mua/bán với giá Đồng cố định |

Mỏ có ba cụm quặng ở đông nam thị trấn. Lối ra rừng nằm ở phía đông. Ban đêm năm NPC về chỗ nghỉ ở phía nam thị trấn và vẫn tiếp chuyện; bản đồ `M` phản ánh vị trí theo giờ. Chu kỳ ngày/đêm chỉ tiến khi phiên chơi đang chạy.

## Nhiệm vụ 1 — Từ đôi bàn tay

1. Đến gần Trưởng làng An, bấm `E`, chọn **Nhận nhiệm vụ** cho *Từ đôi bàn tay*.
2. Đi tới mỏ đông nam, giữ `E` cạnh một cụm quặng cho đến khi nhận quặng. Tự khai thác đủ **ba quặng**; có thể dùng ba cụm hoặc chờ cụm cạn tái sinh. Mua quặng không thay thế chỉ tiêu tự đào.
3. Gặp Thợ rèn Lâm. Học công thức **Kiếm sắt** nếu muốn chơi Kiếm Sĩ hoặc **Trượng nguyệt** nếu muốn chơi Pháp Sư, rồi bấm **Chế tạo**. Mỗi vũ khí dùng ba quặng và hai gỗ; gỗ khởi đầu đủ làm một món.
4. Trở lại Trưởng làng nộp nhiệm vụ, nhận XP/Đồng và nhận nhiệm vụ kế tiếp. Có thể học Class ngay khi đã tự đào đủ ba quặng và rèn một vũ khí.
5. Gặp Sư phụ Dạ, học Class phù hợp. Vũ khí đúng Class đang có được trang bị khi học; mở `I` để kiểm tra hoặc mang/tháo. Giáp lữ hành dùng chung hai Class.

Class đã học có thể đổi trong hành trang khi ngoài giao tranh, với hồi chiêu ngắn. Cấp nhân vật và túi đồ giữ nguyên; vũ khí được lưu riêng cho Kiếm Sĩ/Pháp Sư. Muốn thử cả hai, học Class còn lại tại Sư phụ Dạ và chuẩn bị vũ khí tương ứng.

## Thử giả kim và thương nhân

Gặp Giả kim Liên, học công thức thuốc HP hoặc MP và pha bằng hai Nguyệt thảo. Có thể dùng thảo dược khởi đầu, nhặt cây ven đường bằng `E` hoặc mua nguyên liệu. Chế tạo chỉ thành công khi đứng cạnh đúng NPC, biết công thức và đủ nguyên liệu/chỗ trong túi.

Thuốc HP/MP dùng chung hồi chiêu **năm giây** trong thông số thử hiện tại. Khi HP hoặc MP đã đầy, thuốc tương ứng được giữ nguyên. Uống bằng `Q`/`R`, nút dưới HUD hoặc trong hành trang.

Thương nhân mua/bán một món mỗi lần bấm theo giá ghi trên nút. Bán quặng/chiến lợi phẩm để có Đồng mua gỗ, nguyên liệu, thuốc hoặc trang bị. Muốn bán món trang bị cuối cùng, tháo nó trong hành trang trước. Túi có **12 ô**; nguyên liệu và thuốc có thể xếp chồng. Túi đầy sẽ báo rõ, không âm thầm đổi tiền hoặc trừ nguyên liệu rồi mất thành phẩm.

Các con số này là thông số playtest. Bạc và Vàng hiển thị riêng; chưa có quy đổi tiền, cường hóa hoặc buff đặc biệt.

## Nhiệm vụ 2 — Vết nứt dưới trăng

1. Nộp nhiệm vụ nghề và **nhận Vết nứt dưới trăng tại Trưởng làng** trước khi đi. NPC cho mục tiêu trong thoại và nhật ký `J`.
2. Đi qua lối phía đông thị trấn, bấm `E` ở cửa để vào Rừng Vọng Nguyệt. Cần đã học Class chiến đấu.
3. Tự đi đến bia dịch chuyển phía tây rừng để mở điểm đã ghé. Sau khi mở, bảng `M` cho phép đi giữa thị trấn và bia rừng khi ngoài giao tranh. Trong hầm ngục không dùng dịch chuyển.
4. Đến phong ấn giữa rừng, bấm `E`. Hành động này giải phóng **ba quái sự kiện**; quái thường ở nơi khác không tăng chỉ tiêu phong ấn.
5. Hạ cả ba, rồi **quay lại phong ấn và bấm E lần nữa để khép vết nứt**. Chỉ hạ quái chưa đủ hoàn thành nhiệm vụ.
6. Rời giao tranh, về Trưởng làng nộp nhiệm vụ, nhận thưởng và nhận nhiệm vụ Boss. Có thể đi bộ về cửa phía tây rừng hoặc dùng điểm dịch chuyển đã mở.

Rừng có slime, sói và linh thể với cách tiếp cận khác nhau; quái thường tái sinh sau thời gian chờ. Có một bí mật nhỏ không có marker nhiệm vụ: hãy thử khám phá các góc rừng và đọc lời nhắc khi tới gần vật thể lạ.

## Hai Class và chiến đấu

| Class | Đánh thường | Phím 1 | Phím 2 |
| --- | --- | --- | --- |
| Kiếm Sĩ | Đòn cận chiến theo hướng nhìn/trỏ | Chém xoáy quanh người | Trảm nguyệt phạm vi rộng hơn |
| Pháp Sư | Đạn phép, dùng một ít MP | Tam nguyệt tiễn, ba đạn tỏa hướng | Nguyệt bùng nổ quanh người |

MP hồi dần khi chơi. Kỹ năng tiêu MP và có hồi chiêu riêng, được hiển thị ở thanh kỹ năng; đừng bấm liên tục khi chưa sẵn sàng. Giữ Space hoặc chuột trái để duy trì đòn thường theo hồi chiêu. Giữ khoảng cách với linh thể bắn đạn; dùng hướng chuột để ngắm, `Shift` để thoát vùng nguy hiểm và `Q` hồi HP nếu có thuốc. Quái tìm đường vòng vật cản; đòn cận chiến/kỹ năng cần đường đánh thông thoáng, đạn bị tường chặn.

Nếu HP về 0, nhân vật hồi sinh đầy HP/MP tại checkpoint của khu đang chơi. Túi, tiền, cấp, quest và khám phá được giữ. Quái/Boss được dựng lại cho phiên khu vực; đó là cơ hội thử lại, không phải mất tiến trình nhân vật.

## Nhiệm vụ 3 — Người canh Tàn Nguyệt

1. Đã nộp nhiệm vụ phong ấn tại thị trấn và nhận nhiệm vụ Boss. Từ rừng đi tới cửa **đông bắc**, bấm `E` để vào Hầm mộ Tàn Nguyệt.
2. Vượt ba phòng nối bằng hành lang thủ công. Phòng Boss ở phía đông bắc; cửa ra rừng nằm tại tiền sảnh phía tây nam.
3. Đánh Người Canh Tàn Nguyệt. Khi còn nửa HP, Boss sang giai đoạn hai: hình/frame đổi, vòng đánh rộng hơn, nhịp nhanh hơn và thêm ba đạn tỏa sau đòn. Đọc vòng cảnh báo trước đòn, rời vùng đó hoặc né, rồi tránh đạn; chuẩn bị thuốc thay vì đứng chịu tất cả đòn. HUD hiển thị HP, giai đoạn và cảnh báo Boss.
4. Sau khi hạ Boss, rời hầm ngục về rừng, rồi về thị trấn. Chỉ hạ Boss **chưa** kết thúc nội dung demo.
5. Gặp Trưởng làng và bấm **Nộp nhiệm vụ · nhận thưởng**. Game hiện:

> Kết thúc nội dung cốt truyện của Demo v0.1 – thế giới vẫn có thể tự do khám phá.

Chọn tiếp tục chơi tự do. Có thể khai thác, rèn, pha thuốc, đổi Class đã học, đánh quái, tìm bí mật còn lại và rời/vào hầm ngục để chơi Boss mới. Thưởng nhiệm vụ chỉ nhận một lần; tiến độ kết thúc vẫn được giữ khi chơi lại.

## Lưu và tiếp tục

Bấm **Lưu game** khi ngoài giao tranh, chờ thông báo thành công. Menu **Về màn hình đầu** lưu trước khi rời. Lần sau mở đúng trình duyệt/hồ sơ và địa chỉ, bấm **Tiếp tục hành trình**.

Đóng/tải lại trang chỉ thử lưu tự động khi đang tiếp tục bản lưu hoặc sau khi nhân vật mới đã được lưu thủ công thành công, và chỉ ngoài giao tranh. Nhân vật mới chưa lưu sẽ không tự thay bản lưu cũ; hãy bấm **Lưu game** trước khi rời nếu muốn giữ hành trình mới.

Có một ô lưu cục bộ đang dùng; lưu nhân vật mới sẽ thay bản lưu hợp lệ cũ. Lưu thông thường giữ nguyên và báo lỗi khi bản cũ bị lỗi hoặc khác phiên bản. Nếu có thông báo trình duyệt chặn lưu hoặc hết dung lượng, chưa coi là lưu thành công.

### Giữ hoặc chuyển tiến độ bằng file JSON

Mở **Bản lưu & sao lưu** ở màn hình đầu, menu hoặc thanh công cụ phía trên vùng chơi:

1. Muốn xuất tiến độ mới nhất, thoát giao tranh và bấm **Lưu game** trước. **Tải bản lưu JSON** xuất ô lưu đã ghi, không xuất những thay đổi chưa lưu trong phiên đang chơi.
2. Giữ file đã tải ở máy hoặc thiết bị khác. Có thể nhập file ở trình duyệt/địa chỉ local khác để chuyển nhân vật; các thiết lập âm thanh/hiệu ứng không nằm trong file nhân vật.
3. Để nhập, chọn file JSON không quá 200 KB. Game kiểm tra và hiện tên, chủng tộc, Class, cấp, địa điểm và tiến trình; chưa thay ô lưu chỉ vì chọn file.
4. Đọc xem trước, rồi bấm **Khôi phục bản lưu này** khi muốn dùng nhân vật đó. Game giữ nội dung bản cũ trong một bản dự phòng local riêng trước khi thay, rồi mở phiên từ nhân vật nhập.

File lỗi hoặc phiên bản chưa hỗ trợ bị từ chối. Nếu bản đang có bị lỗi, có thể xuất nội dung đọc được để giữ riêng; thao tác khôi phục chủ động vẫn sao lưu nguyên nội dung đó trước khi thay bằng file hợp lệ. Bản dự phòng có khóa riêng, không thay bản dự phòng cũ và không tự xóa. Nếu không tạo được bản dự phòng, ô lưu hiện tại được giữ nguyên và chưa nhập. Dữ liệu dự phòng ở cùng trình duyệt sẽ mất nếu xóa dữ liệu trình duyệt; file đã tải giúp giữ bản sao riêng.

Muốn quay lại một mốc đã giữ, xem danh sách **Bản lưu dự phòng** trong cùng bảng. Bản hợp lệ có nút **Xem trước**; đọc nhân vật/tiến trình rồi bấm **Khôi phục bản lưu này** để xác nhận. Có thể bấm **Tải bản sao** cho từng bản, kể cả dữ liệu lỗi, để lưu file riêng. Khôi phục không xóa mốc cũ và giữ thêm bản của ô lưu vừa thay; danh sách hiện không có nút xóa.

Save ở trình duyệt khác với snapshot source `.local-backups/`: snapshot khôi phục code/tài liệu, không chứa nhân vật trong `localStorage`. Chạy bằng cổng/hostname khác có vùng lưu riêng. Xem [README](../README.md) để cài, build và sao lưu project.
