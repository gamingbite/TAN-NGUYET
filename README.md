# TÀN NGUYỆT – The Cursed Kingdom

Game 2D pixel art top-down, kết hợp đời sống nghề nghiệp và Action Adventure RPG trong thế giới High Fantasy. Demo v0.1 dành cho chơi đơn trên trình duyệt PC.

## Trạng thái project

Cập nhật **10/10/2026**. Project dùng **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.3**, npm và `package-lock.json`. Demo v0.1 local đã chơi được từ tạo nhân vật đến nộp nhiệm vụ Boss theo [GDD](TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md). Art A/B2/C/D đã được người dùng duyệt và tích hợp: nhân vật có sáu trạng thái/bốn hướng, game phủ cửa sổ web, HUD trong game và menu góc phải trên. Làng có15nhà và8dân trang trí đi vòng ngắn; giữ đường, năm NPC nhiệm vụ, vị trí tương tác và dữ liệu lưu hiện có.

**Kiểm tra gần nhất10/10:** sau nâng cấp Tro Tàn P0, `npm run verify` **exit0,99/99test đạt**, Playwright11phút trên Edge; gồm hai fulljourney Kiếm Sĩ/Pháp Sư, lưu/Continue/backup, hồi quy B2/UI/làng và hai test mới cho ánh sáng đêm/pause/cleanup. QA B2 kiểm384base/12nhận diện/1.152texture; UI có21ảnh ở bốn kích thước cửa sổ, đổi Class/lưu/fullscreen đạt,0lỗi JavaScript hoặc request ra host ngoài trong lượt UI. Đã sửa lỗi icon menu che nút đóng bảng ở cửa sổ hẹp. Xem [biên bản kiểm tra](docs/DEMO_CHECK.md), [tiến độ art](docs/ART_PROGRESS.md) và [ảnh trước/sau Tro Tàn](docs/TOWN_UPGRADE_REPORT.md).

**Giai đoạn tiếp theo:** người dùng chấp nhận demo hiện tại ngày10/10 và yêu cầu lập [kế hoạch v0.2 PvE](docs/NEXT_PHASE_PLAN_V0_2.md): Cung Thủ/Tu Sĩ, một NPC đồng hành và một nhánh phiêu lưu nhỏ. Đây là kế hoạch đề xuất; gameplay/save của project vẫn là v0.1, chưa triển khai các tính năng mới. Phiên kế hoạch chỉ sửa tài liệu, không chạy lại build/test;99/99 là kết quả của lượt kiểm tra trước đó.

Các mốc65test ngày08/10,68test baseline và83test chỉ hướng ngày09/10 được giữ làm lịch sử trong biên bản/nhật ký. Kiểm tra mới dùng context Edge riêng, không mở hoặc xóa nhân vật của người dùng. Mỹ thuật và cân bằng tiếp tục nhận phản hồi khi chơi thử.

- Tạo nhân vật từ bốn chủng tộc, khởi đầu dân thường cấp 1; học Kiếm Sĩ hoặc Pháp Sư tại NPC.
- Thị trấn Tro Tàn, Rừng Vọng Nguyệt và Hầm mộ Tàn Nguyệt; sương mù khám phá, điểm dịch chuyển, ngày/đêm và năm NPC.
- Đào quặng, rèn vũ khí/giáp, pha thuốc HP/MP, hành trang, trang bị và mua/bán giá cố định.
- Chiến đấu thời gian thực, né/lướt, hai kỹ năng mỗi Class, ba loại quái và Boss hai giai đoạn; hồi sinh giữ đồ và tiến độ.
- Ba nhiệm vụ nối từ làm nghề đến phong ấn, Boss và trở về nhận thưởng; một bí mật nhỏ, lưu/tiếp tục cục bộ và chơi tự do sau tuyến demo.
- Nhân vật có frame đứng/đi/đánh/trúng đòn/chết/né theo bốn hướng; quái có frame hành động, Boss giai đoạn hai có đạn tỏa. Có giữ nút đánh thường, hiển thị hồi chiêu, cài âm lượng/hiệu ứng và toàn màn hình.
- Có xuất ô lưu ra file JSON, xem trước file nhập rồi chủ động khôi phục; bản lưu hiện tại được giữ thêm một bản dự phòng local trước khi thay thế.
- Game phủ cửa sổ web, HUD/chỉ hướng trong vùng chơi; **☰ → Hướng dẫn**/`H` mở cẩm nang, `J` mở nhật ký và tiến độ nhiệm vụ.
- Atlas PNG AI-assisted cho nhân vật, NPC, quái/Boss, props, terrain và icon vật phẩm đã nối vào source; nền minh họa màn hình đầu là ảnh riêng. B2 có384output base, một số pose dùng lại/lật được ghi trong metadata. Texture v1/procedural được giữ làm fallback; VFX và âm thanh vẫn tạo bằng code. Không có Multiplayer, tài khoản hoặc máy chủ game.

**Xuất bản web đã được phép10/10/2026:** source tại [gamingbite/TAN-NGUYET](https://github.com/gamingbite/TAN-NGUYET); người dùng chốt địa chỉ Vercel [tan-nguyet-game.vercel.app](https://tan-nguyet-game.vercel.app). Đang kiểm thử và chờ xác thực tài khoản Vercel, chưa xác nhận website hoạt động. Xem [trạng thái và quy trình xuất bản](docs/PUBLISHING.md). Tiếp tục phát triển tại `D:\RPG GAMES`, giữ lịch sử Git và backup; cache/build/save/bí mật nằm ngoài Git.

Cảnh thử kỹ thuật cũ vẫn có tại **`/foundation.html`**. [Biên bản nền tảng](docs/FOUNDATION_CHECK.md) và [biên bản môi trường ban đầu](docs/ENVIRONMENT_CHECK.md) được giữ làm lịch sử; kết quả của cảnh nền tảng không thay thế nghiệm thu gameplay mới. Xem [kế hoạch và tiêu chí nghiệm thu](docs/DEVELOPMENT_PLAN.md).

## Cài đặt

Môi trường đã chuẩn bị trên Windows: **Node.js 22.20.0**, **npm 10.9.3**. Manifest yêu cầu Node `^22.12.0 || >=24.0.0`, npm từ 10. Dependencies được khóa phiên bản; giữ stack đang có khi phát triển tiếp.

Mở PowerShell tại project:

```powershell
Set-Location -LiteralPath 'D:\RPG GAMES'
node --version
npm --version
npm ci --ignore-scripts
```

Máy hiện đã có dependencies; `npm ci --ignore-scripts` dùng khi cần cài lại từ lockfile. Project không cần `.env`, API key, đăng nhập, database hoặc công cụ đồ họa để chạy. Không có script cài đặt dependency cần chạy ở cấu hình hiện tại.

## Chạy thử, build và kiểm tra

| Mục đích | Lệnh |
| --- | --- |
| Phát triển tại `http://127.0.0.1:5173` | `npm run dev` |
| Kiểm tra TypeScript | `npm run typecheck` |
| Kiểm tra kiểu và build vào `dist/` | `npm run build` |
| Mở bản build tại `http://127.0.0.1:4173` | `npm run preview` |
| Chạy test trên bản build có sẵn | `npm test` |
| Build rồi chạy toàn bộ test | `npm run verify` |
| Sao lưu source/config/tài liệu local | `npm run backup -- before-feature-name` |

Chạy `npm run dev`, mở địa chỉ local, chọn ngoại hình và bấm **Bắt đầu hành trình**. Bấm **Tiếp tục hành trình** để tải bản lưu ở trình duyệt này. Game phủ cửa sổ web; bấm icon **☰** ở góc phải trên để mở hành trang, nhiệm vụ, chế tạo, bản đồ, hướng dẫn, cài đặt và lưu/sao lưu. `H` mở cẩm nang trực tiếp. Dừng server bằng `Ctrl+C`. Dev và preview chỉ bind loopback.

Bảng mục tiêu trong vùng chơi và mũi tên vàng cạnh nhân vật chỉ bước nhiệm vụ kế tiếp, đi vòng vật cản và dẫn qua cửa khi cần chuyển khu. Chỉ dẫn tự đổi theo tiến độ/NPC ngày đêm, rồi ẩn sau khi nộp nhiệm vụ Boss. Xem [hướng dẫn chơi](docs/DEMO_GUIDE.md) để biết các thao tác.

Game dùng module nên cần server local; không mở `index.html` hoặc `dist/index.html` bằng nhấp đôi. Preview dùng bản build có sẵn: build lại sau khi sửa code. Nếu cổng 5173/4173 bị chiếm, dừng server cũ hoặc dùng `npm run dev -- --port 5174`. Test tự mở/đóng preview ở 4173 và cần cổng đó trống.

Kiểm tra trình duyệt mặc định dùng Microsoft Edge đã cài trên máy. Để dùng Chrome đã cài:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run verify
```

Trở lại Edge bằng `Remove-Item Env:PLAYWRIGHT_CHANNEL`. Gameplay hiện cần bàn phím/chuột PC, chưa có điều khiển cảm ứng.

## Điều khiển và lượt chơi đầu tiên

Trong game, cẩm nang nằm trong menu **☰ → Hướng dẫn** (`H`); **Nhiệm vụ** (`J`) chứa các bước hành trình. HP/MP, tiền, kỹ năng và chỉ hướng nằm ngay trong vùng chơi. Canvas đổi kích thước theo cửa sổ, camera giữ đúng tỷ lệ thế giới. **Toàn màn hình** trong menu hoặc Cài đặt có thể ẩn cả thanh trình duyệt; mặc định game đã phủ cửa sổ web.

| Phím/thao tác | Chức năng |
| --- | --- |
| WASD / mũi tên | Di chuyển |
| Space / chuột trái trên canvas | Đánh theo hướng nhìn / hướng trỏ; giữ để đánh liên tục theo hồi chiêu |
| Shift | Né/lướt theo hướng di chuyển |
| 1 / 2 | Hai kỹ năng của Class đã học |
| E | Tương tác NPC, phong ấn, cửa; giữ tại mỏ để khai thác |
| Q / R | Thuốc HP / MP, dùng chung hồi chiêu |
| I / J / C / M | Hành trang / nhiệm vụ / nghề và chế tạo / bản đồ |
| H | Hướng dẫn |
| Esc | Đóng bảng hoặc tạm dừng/tiếp tục |

Gặp Trưởng làng An ở phía bắc quảng trường → nhận **Từ đôi bàn tay** → tự đào ba quặng ở mỏ đông nam → học công thức tại Thợ rèn Lâm và rèn kiếm hoặc trượng → học Class tại Sư phụ Dạ → nộp nhiệm vụ đầu và nhận **Vết nứt dưới trăng** → vào rừng, phá phong ấn, hạ ba quái sự kiện rồi **bấm E vào phong ấn lần nữa để khép vết nứt** → về Trưởng làng nộp và nhận nhiệm vụ Boss → qua cửa đông bắc rừng, hạ Boss → **trở về thị trấn nộp nhiệm vụ**.

Lúc đó mới hiện thông điệp kết thúc nội dung Demo v0.1; vẫn có thể tiếp tục làm nghề, khám phá và chơi lại hầm ngục. Xem [hướng dẫn chơi chi tiết](docs/DEMO_GUIDE.md) để tìm NPC, pha thuốc và sử dụng dịch chuyển.

Mở **Cài đặt** ở màn hình đầu hoặc menu **☰** góc phải trên để chỉnh âm lượng, tắt âm thanh, rung màn hình và số sát thương. Thiết lập áp dụng ngay và được lưu riêng trên trình duyệt; không thay dữ liệu nhân vật. Nút **Mở toàn màn hình** dùng chế độ của trình duyệt, có thể thoát bằng nút tương ứng hoặc Esc.

## Lưu tiến độ và sao lưu project

**Lưu game** giữ nhân vật, Class, cấp/XP, túi/trang bị/tiền, nhiệm vụ, sự kiện, vùng khám phá và điểm dịch chuyển trong `localStorage` của trình duyệt. Dùng nút **Lưu game** ngoài giao tranh; **Về màn hình đầu** lưu trước khi rời phiên chơi.

Khi đóng/tải lại trang, game chỉ thử lưu tự động cho phiên **Tiếp tục hành trình** hoặc nhân vật mới **đã được lưu thủ công thành công**, và chỉ khi đang ở trạng thái an toàn. Nhân vật mới chưa lưu sẽ không tự ghi đè bản lưu trước khi đóng/tải lại trang. Hãy lưu thủ công trước khi rời nếu muốn giữ hành trình mới.

Hiện có **một ô lưu đang dùng**. Tạo nhân vật mới chưa lập tức xóa bản cũ; lưu phiên mới sẽ thay thế bản lưu hợp lệ trước đó. Lưu thông thường vẫn giữ nguyên và báo lỗi khi bản cũ bị lỗi hoặc khác phiên bản. Không xóa dữ liệu trình duyệt nếu muốn giữ tiến độ.

Bản lưu gắn với trình duyệt, hồ sơ và địa chỉ chạy. `http://127.0.0.1:5173`, `http://127.0.0.1:4173`, `http://localhost:5173` và website Vercel có vùng lưu riêng; dùng cùng địa chỉ khi muốn tiếp tục nhân vật cũ. Có thể mang tiến độ giữa những địa chỉ/trình duyệt này bằng file JSON; không có đồng bộ tài khoản. Bạn bè chơi bản web có nhân vật/save riêng trong trình duyệt của mình.

Trong **Bản lưu & sao lưu**, bấm **Tải bản lưu JSON** để tải nội dung **ô lưu đã ghi**. Tiến độ phiên đang chơi chưa lưu không nằm trong file xuất: bấm **Lưu game** trước nếu muốn giữ phần mới nhất. Xuất file đọc nội dung hiện có, không tự sửa bản lưu lỗi.

Để khôi phục, chọn file JSON local, đọc phần xem trước tên/Class/cấp/địa điểm rồi bấm **Khôi phục bản lưu này**. Chọn file chỉ kiểm tra, chưa đổi tiến độ. File sai định dạng/phiên bản hoặc quá 200 KB sẽ bị từ chối. Khi khôi phục hợp lệ, game giữ nguyên nội dung ô lưu trước đó, kể cả dữ liệu lỗi, ở một khóa `localStorage` dự phòng riêng rồi thay ô lưu và mở nhân vật đã nhập. Mỗi bản dự phòng có khóa duy nhất, không ghi đè bản dự phòng cũ; nếu không tạo được bản dự phòng thì không nhập. Bản dự phòng vẫn thuộc trình duyệt này, nên dùng file JSON riêng khi muốn giữ bản sao trên thiết bị khác.

Phần **Bản lưu dự phòng** trong cùng bảng liệt kê các mốc đã giữ. Với bản hợp lệ, bấm **Xem trước** rồi **Khôi phục bản lưu này** để quay lại nhân vật đó; xem trước chưa thay ô lưu. **Tải bản sao** tải nguyên nội dung từng bản, kể cả bản lỗi, để giữ riêng. Khôi phục giữ các bản dự phòng đã có và tạo thêm bản của ô lưu đang thay; giao diện không có thao tác xóa chúng.

**Sao lưu source** bằng `npm run backup -- before-feature-name` tạo thư mục timestamp riêng tại `.local-backups/`, gồm source, asset, cấu hình và tài liệu cùng `.snapshot-manifest.json`. Script không sửa source, ghi đè bản sao cũ hoặc dùng Git. Các bản trước nền tảng và trước gameplay được giữ tại đây.

Snapshot trước đợt hoàn thiện: `.local-backups/2026-10-08T13-05-46-068Z-before-demo-polish-KTf5kr/`. Mốc sao lưu chốt của bản đã kiểm tra dùng nhãn **`demo-v01-polished-verified`** tại `.local-backups/`; `demo-v01-verified` được giữ như mốc của đợt trước.

Snapshot trước đợt art ngày 09/10: `.local-backups/2026-10-09T01-47-14-765Z-before-art-guide-assets-5ALmoP/`. Kết quả kiểm tra và tình trạng duyệt của từng nhóm asset mới được ghi riêng trong [ART_PROGRESS.md](docs/ART_PROGRESS.md).

Snapshot không chứa `.git`, `node_modules`, `dist`, cache, log, `.env` thật, khóa riêng, thư mục save thử hoặc symlink. Template `.env.example` được giữ. Dữ liệu `localStorage` không thuộc snapshot source. Quy tắc loại bí mật dựa vào tên file: giữ token ngoài source và file mẫu.

Để khôi phục code, dừng server, sao lưu trạng thái hiện tại rồi chép **các file cần khôi phục** từ snapshot về đường dẫn tương ứng. Đối chiếu manifest và nội dung trước/sau; không xóa source hàng loạt. Nếu khôi phục manifest/lockfile, chạy `npm ci --ignore-scripts`, rồi `npm run verify`. Có thể tự chép snapshot sang thiết bị khác để bảo vệ trước hỏng ổ đĩa.

## Cấu trúc và tài liệu

```text
RPG GAMES/
├── index.html / src/main.ts              Entry demo, nối UI với phiên chơi
├── foundation.html / src/foundation.ts   Entry cảnh kỹ thuật được giữ lại
├── src/ui/                              HUD, bảng NPC/quest/túi/nghề và CSS
├── src/game/
│   ├── model/                           Kiểu dữ liệu, vật phẩm, giao dịch và lưu
│   ├── world/                           Map, manifest/loader PNG và texture fallback
│   ├── runtime/balance.ts               Thông số combat/khai thác thử nghiệm
│   ├── audio/SoundFeedback.ts           Âm thanh phản hồi Web Audio
│   ├── scenes/DemoScene.ts              Điều khiển, thế giới và combat
│   └── scenes/FoundationScene.ts        Cảnh kỹ thuật gốc
├── public/assets/atlases/               Atlas PNG local AI-assisted
├── public/assets/ui/                    Nền minh họa màn hình đầu
├── tests/                               Kiểm tra dữ liệu và trình duyệt
├── scripts/backup.mjs                   Sao lưu local
├── docs/                                Kế hoạch, kiến trúc, art, hướng dẫn
├── package.json / package-lock.json     Dependencies và script
├── AGENTS.md / .gitignore               Quy tắc AI và file sinh ra
└── TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md     GDD gốc
```

Đọc [GDD](TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md) trước khi sửa gameplay và tuân thủ [AGENTS.md](AGENTS.md). [Kiến trúc](docs/ARCHITECTURE.md) chỉ vị trí module; [asset](docs/ASSET_GUIDE.md) mô tả atlas, metadata và fallback; [tiến độ art](docs/ART_PROGRESS.md) phân biệt nguồn đã có, tích hợp và duyệt; [kế hoạch](docs/DEVELOPMENT_PLAN.md) giữ các mốc tính năng và ma trận kiểm tra.

Các chỉ số sát thương, HP/MP, giá, túi/stack, thời gian ngày/đêm, khai thác và hồi chiêu là **thông số playtest tạm thời**, dễ chỉnh trong dữ liệu/config. Giao dịch dùng Đồng; Bạc và Vàng giữ riêng, chưa có tỷ lệ quy đổi. Cường hóa, buff đặc biệt, hai Class còn lại và nội dung online thuộc bước sau.

Engine được tách chunk và chỉ tải khi bắt đầu/tiếp tục phiên chơi. Build có thể cảnh báo chunk Phaser khoảng 1.196 kB trước gzip / 319 kB sau gzip, vượt ngưỡng 500 kB. Đây là cảnh báo kích thước; cần đo khi tối ưu asset và tải game. Không che cảnh báo bằng cách tăng ngưỡng.

## Tạo commit đầu tiên bằng GitHub Desktop

**Đã cho phép dùng Git và xuất bản vào repo chỉ định ngày10/10/2026.** Các bước Desktop dưới đây là cách thao tác thủ công tham khảo; pipeline hiện tại xem [PUBLISHING](docs/PUBLISHING.md).

Repository đã tồn tại tại `D:\RPG GAMES`. Tham khảo [hướng dẫn thêm repository cục bộ của GitHub](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop):

1. Mở GitHub Desktop, chọn **File → Add local repository…**.
2. Chọn `D:\RPG GAMES`, bấm **Add repository**. Không cần tạo repository mới hoặc clone vào thư mục này.
3. Nếu ứng dụng yêu cầu, cấu hình tên/email tác giả commit tại **File → Options → Git**.
4. Chọn nhánh `main`, mở **Changes**, đọc source, tài liệu, cấu hình, GDD và lockfile. Dependencies, build, backup local và bí mật cần được `.gitignore` loại bỏ.
5. Nhập **Summary**, chẳng hạn `feat: prepare Tan Nguyet local demo v0.1` sau khi gameplay đã kiểm tra.
6. Bấm **Commit to main**, mở **History** để xác nhận commit xuất hiện. Xem [tài liệu tạo commit của GitHub Desktop](https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop).

Commit tạo mốc khôi phục **cục bộ**. **Publish repository** và **Push origin** đưa dữ liệu lên GitHub, chỉ dùng khi người dùng cho phép rõ ràng việc upload. Cho phép Git cục bộ không đồng nghĩa cho phép push.

## Mốc khôi phục khi Git được cho phép trở lại

Tiếp tục giữ snapshot local và lịch sử Git. Hoàn thành một tính năng nhỏ, kiểm tra rồi commit với mô tả cụ thể theo [kế hoạch](docs/DEVELOPMENT_PLAN.md). Push code vào `main` kích hoạt workflow kiểm build/đường dẫn asset; xuất bản Vercel theo [PUBLISHING](docs/PUBLISHING.md). Trước thay đổi lớn, giữ mốc đã kiểm tra và làm trên nhánh riêng.

Nếu một commit gây lỗi, lưu/commit hoặc stash công việc chưa commit trước khi đổi trạng thái, rồi mở **History**, nhấp phải **commit gây lỗi**, chọn **Revert changes in commit**. Revert tạo commit đảo ngược thay đổi và giữ lịch sử; không revert commit tốt trước đó. Khi có nhiều commit gây lỗi, xử lý từ mới đến cũ, kiểm tra xung đột và chạy lại kiểm tra. Xem [hướng dẫn revert của GitHub](https://docs.github.com/en/desktop/managing-commits/reverting-a-commit-in-github-desktop).

Git chỉ khôi phục nội dung đã commit; dữ liệu trình duyệt nằm riêng. `.gitignore` giữ dependency, build, cache, log, `.env` và dữ liệu tạm ngoài repository; vẫn giữ source, asset, GDD và lockfile. File bí mật đã được theo dõi không tự biến mất chỉ vì thêm ignore. Không dùng reset/clean phá dữ liệu để xử lý lỗi thông thường.
