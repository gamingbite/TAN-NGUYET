# TÀN NGUYỆT — Art B2 để duyệt

Mở [index.html](index.html) trực tiếp bằng Edge/Chrome. Bộ xem local không cần dev server, API key hoặc mạng.

A/B2/C/D đã được người dùng duyệt hình ảnh ngày09/10 qua yêu cầu **“duyệt tất cả và tích hợp vào game”**. Các bảng ở đây giữ làm concept/keypose/chuỗi hình tham chiếu. Bộ sprite production trong suốt được dựng riêng; xem ART_PROGRESS và AI_SESSION_LOG để biết trạng thái kiểm tra mới nhất.

Năm PNG chính: identity.png (12 thiết kế), swordsman-states.png và mage-states.png (24 keypose mỗi Class), swordsman-motion.png và mage-motion.png (24 hình tham chiếu mỗi mẫu). Hai motion mẫu chỉ là Human Kiếm Sĩ và Elf Pháp Sư ở góc trước/ba phần tư, không phải bộ mọi chủng tộc/bốn hướng. Giới tính/tóc/màu trong hình là ví dụ.

Nguồn AI-assisted bằng imagegen tích hợp; prompt nguyên văn ở identity-generation.json, state-prompts.json, motion-prompts.json và revision-prompts.json; manifest.json ghi nguồn/bản sửa và giới hạn. Hai PNG draft được giữ để đối chiếu lỗi trượng đã sửa.

Chạy kiểm tra bộ xem: `node docs/art-review/2026-10-09-b2/check.mjs` từ thư mục project. Script dùng Edge/Playwright hiện có, tạo result.json và hai ảnh overview. Đây là kiểm tra HTML/ảnh, không thay build hoặc gameplay QA.

Production đã được tạo riêng và nối vào game: tám PNG trong suốt,384output base/bốn hướng/sáu trạng thái, avatar dùng cùng renderer. Prompt ở [production-prompts.json](production-prompts.json) và [production-back-prompts.json](production-back-prompts.json); nguồn/file chọn ở [production-sources.json](production-sources.json). Có pose dùng lại/lật ghi trong metadata, không phải384hình vẽ độc lập. Bảng concept ở đây giữ vai trò tham chiếu; `runtimeIntegration:false` trong manifest chỉ áp dụng các bảng này. Giữ frame32×42/footY36/collider12×12 offset10,29, save/combat timing và fallback. Tiếp tục theo [queue](../../AI_NEXT_TASKS.md) và [nhật ký](../../AI_SESSION_LOG.md), không làm lại nhiệm vụ đã DONE.

