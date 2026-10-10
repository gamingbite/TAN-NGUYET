# Kiểm tra nền tảng phát triển — 08/10/2026

## Phạm vi đã chuẩn bị

Theo yêu cầu chuẩn bị để làm game, tạo nền tảng mới trong `D:\RPG GAMES`: Phaser 3 + TypeScript + Vite, scene thử, scripts chạy/build/test/backup, cấu trúc module và tài liệu. Chỉ làm việc local; không chạy bất kỳ lệnh Git nào, không thao tác `.git`, tạo remote, commit, push hoặc publish.

Trước cập nhật tài liệu đã tạo snapshot `before-game-setup` trong `.local-backups/`. `docs/ENVIRONMENT_CHECK.md` được giữ làm biên bản ban đầu; lỗi ENOENT vì thiếu manifest ở lần đó đã được giải quyết bằng nền tảng mới. Không sửa GDD hoặc xóa code cũ.

## Công cụ và dependency thực tế

| Thành phần | Phiên bản |
| --- | --- |
| Node.js | 22.20.0 |
| npm | 10.9.3 |
| Phaser | 3.90.0 |
| TypeScript | 5.9.3 |
| Vite | 8.3.3 |
| Playwright Test | 1.64.0 |
| Node type definitions | 22.19.0 |

Đã cài bằng `npm install --ignore-scripts --no-fund`; manifest khóa phiên bản trực tiếp và `package-lock.json` khóa dependency tree. Npm báo cài 23 packages, audit 24 packages và **0 vulnerabilities** tại thời điểm cài. `npm ls --depth=0` xác nhận các dependency trên không bị thiếu. Không cài công cụ toàn máy hoặc tải trình duyệt mới; dùng Microsoft Edge sẵn có.

## Kết quả kiểm tra

| Lệnh/thao tác | Kết quả cuối cùng |
| --- | --- |
| `npm run build` | Exit code 0; `tsc --noEmit` và Vite build đạt, output trong `dist/` |
| `npm test` | Exit code 0; **3 passed**, kiểm tra trên bản build bằng Edge |
| `npm run dev` | Server khởi động ở `http://127.0.0.1:5173/`; scene mở được trong Edge |
| Kiểm tra lỗi runtime ở đường dev | Không có `pageerror` quan sát được khi tải trang/mở scene |
| Kiểm tra request trình duyệt ở đường dev | Chỉ request local; không tải engine/asset/font từ website bên ngoài |
| `npm run backup -- foundation-ready` | Thành công; snapshot source/config/tài liệu được tạo, không gồm dependency/build/Git |

Ba bài kiểm tra trình duyệt xác minh:

1. Bản build mở được, canvas hiển thị, nhân vật di chuyển, pause/tiếp tục/reset hoạt động và không đi ngoài biên bản đồ.
2. Nhà/vật cản static chặn đường đi của nhân vật.
3. Màn hình đầu không tràn ngang ở cửa sổ 390 px và vẫn mở được scene bằng chuột. Đây không phải kiểm tra hỗ trợ gameplay cảm ứng.

Ảnh dev đã được chụp để kiểm tra trực quan tại `.cache/previews/start.png` và `.cache/previews/scene.png`. File cache này không thuộc source snapshot.

## Cảnh báo và giới hạn còn lại

- Build cảnh báo chunk Phaser **1.196,46 kB trước gzip / 318,60 kB sau gzip**, lớn hơn 500 kB. Engine đã được tách chunk và lazy-load khi mở cảnh; cảnh báo vẫn được giữ để theo dõi tối ưu, không khiến build thất bại.
- Runner có cảnh báo `NO_COLOR`/`FORCE_COLOR` do biến môi trường của terminal; ảnh hưởng màu output, không làm test thất bại. Không đổi cấu hình môi trường toàn máy để che cảnh báo.
- Chưa làm gameplay GDD: tạo nhân vật thật, Class, combat, quest, ba nghề, Boss và save. Chỉ mốc nền tảng 00 được chuẩn bị; cảnh thử không được coi là demo v0.1 hoàn chỉnh.
- Chưa có audio; texture mẫu được tạo bằng code. Cần làm asset chính thức và thử âm thanh ở các mốc gameplay.
- Đã kiểm tra bằng Edge; chưa tuyên bố hỗ trợ Firefox/Safari hoặc chơi mobile. Test chạy headless, cần tiếp tục thử trải nghiệm trực tiếp khi bổ sung gameplay.
- Sao lưu local dựa vào tên để loại file bí mật, không quét nội dung. Không đưa token vào source hoặc mẫu cấu hình. Snapshot không thay thế bản sao trên thiết bị khác khi ổ đĩa hỏng.

## GDD gốc

SHA-256 vẫn là:

```text
8684051731445BABA17BEFDE4582924F97B02EEDCC7B2584EF5B4B94C5D85562
```

Hướng dẫn sử dụng nằm ở `README.md`; kiến trúc ở `docs/ARCHITECTURE.md`, asset ở `docs/ASSET_GUIDE.md`, thứ tự tính năng ở `docs/DEVELOPMENT_PLAN.md`. Trước tính năng tiếp theo tạo snapshot local rồi kiểm tra theo phạm vi thay đổi.
