# Biên bản chuẩn bị môi trường — 08/10/2026

## Phạm vi và hiện trạng ban đầu

Thư mục làm việc: `D:\RPG GAMES`, Windows, PowerShell. Đã liệt kê toàn bộ cây thư mục, gồm mục ẩn: ban đầu chỉ có `TAN_NGUYET_GDD_75_CAU_DEMO_V0_1.md` (26.226 byte). Đã đọc toàn bộ GDD. Không có `package.json`, README, AGENTS, mã nguồn, asset, lockfile hoặc cấu hình engine; không có `AGENTS.md` tại `D:\`.

GDD mô tả game web PC 2D pixel art, phạm vi demo v0.1 ở mục 6; câu 76 và một số thông số vẫn chưa chốt. Người dùng đã chọn **chỉ chuẩn bị Git và tài liệu, chưa tạo khung game**.

## Công cụ được kiểm tra

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `git --version` | `git version 2.52.0.windows.1` |
| `node --version` | `v22.20.0` |
| `npm --version` | `10.9.3` |
| `git rev-parse --show-toplevel` trước chuẩn bị | Exit code 1: `fatal: not a git repository (or any of the parent directories): .git` |
| `git init --initial-branch=main` | Thành công, tạo `.git/` cục bộ tại project |
| GitHub Desktop | Không thấy executable tại `%LOCALAPPDATA%\GitHubDesktop\GitHubDesktop.exe` và `%ProgramFiles%\GitHub Desktop\GitHubDesktop.exe`; chưa kết luận về đường dẫn cài đặt tùy chỉnh |
| Framework/thư viện | Chưa có manifest hoặc engine; không có dependency để kiểm tra |

Không cài thư viện, tạo framework hoặc sửa cấu hình công cụ toàn máy. Repository chưa có remote hoặc commit tại thời điểm chuẩn bị; commit đầu tiên do người dùng tạo trong GitHub Desktop.

## Build đã thực sự thử

Lệnh tại `D:\RPG GAMES`:

```powershell
npm run build
```

**Kết quả: thất bại, exit code 1.** Đầu ra chính:

```text
npm error code ENOENT
npm error syscall open
npm error path D:\RPG GAMES\package.json
npm error errno -4058
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open 'D:\RPG GAMES\package.json'
```

Nguyên nhân đã xác định: thiếu `package.json`. Chưa có build script, không có lỗi biên dịch để phân tích và chưa thể kiểm tra runtime game. Không tạo manifest rỗng hay script giả để làm lệnh trả về thành công. Sau khi người dùng bắt đầu phần lập trình, chọn framework và tạo nền tảng dev/build rồi chạy lại.

## Bảo toàn GDD gốc

SHA-256 của GDD trước thay đổi:

```text
8684051731445BABA17BEFDE4582924F97B02EEDCC7B2584EF5B4B94C5D85562
```

GDD được giữ nguyên; SHA-256 sau chuẩn bị trùng giá trị trên. Các tài liệu chuẩn bị được thêm mới. `.gitignore` bảo vệ dependency, output build, file môi trường chứa bí mật và dữ liệu tạm; không loại GDD, source, asset hay lockfile khỏi Git.

## Kiểm tra cấu hình và tài liệu sau chuẩn bị

- Đã dùng `git check-ignore --verbose --non-matching` với đường dẫn giả định để kiểm tra quy tắc, không tạo file bí mật hay dữ liệu thử. `node_modules`/`dist` ở cả gốc và thư mục con, build, `.env`, `.env.local`, `.env.production`, khóa riêng, cache, log và thư mục save cục bộ đều bị loại.
- Các template `.env.example`, `.env.sample`, `.env.template`, `.env.production.example` được phép theo dõi; source, asset, manifest, lockfile, GDD và tài liệu cũng không bị loại.
- Tất cả liên kết Markdown tới file cục bộ trong 5 tài liệu đều trỏ tới file đang tồn tại.
- `git status` xác nhận nhánh `main` chưa có commit, 6 file sẵn sàng cho commit đầu tiên; `git remote -v` trống và chưa có file nào trong Git index.
- Hướng dẫn thêm repository, tạo commit và revert trong README đã được đối chiếu với tài liệu chính thức của GitHub Desktop. Chưa thử giao diện Desktop trên máy vì chưa tìm thấy ứng dụng ở hai đường dẫn phổ biến.

## Việc còn lại

1. Tạo commit đầu tiên theo `README.md` để có mốc khôi phục cục bộ.
2. Khi bắt đầu lập trình, chọn nền tảng phù hợp GDD và tạo khung tối thiểu có lệnh cài, chạy, build đã được xác minh.
3. Triển khai từng tính năng nhỏ theo `docs/DEVELOPMENT_PLAN.md`, kiểm tra và commit sau mỗi mốc hoạt động tốt.

Đây là biên bản của lần chuẩn bị, không phải cam kết môi trường tương lai. Khi có code hoặc thay runtime, kiểm tra lại và cập nhật README theo trạng thái thực tế.
