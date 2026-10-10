# Tro Tàn — Nâng cấp mỹ thuật P0, 10/10/2026

Triển khai TOWN-00 → TOWN-03 trên thị trấn hiện có, theo yêu cầu trực tiếp của người dùng và [Town Planning Guide](Town_Planning_Guide.md). **Khung hình game giữ nguyên:** canvas phủ cửa sổ, HUD/menu hiện tại, camera zoom theo kích thước cửa sổ; map960×640, spawn480,400, cổng Đông916,320.

**Trạng thái:** **TOWN-00/01/02/03 vàTOWN-05 nghiệm thu P0 hoàn thành**, `npm run verify` cuối99/99passed,0failed,exit0,11phút. **Người dùng đã chấp nhận demo hiện tại10/10/2026** qua “demo vậy là oke rồi hãy lên plan vào giai đoạn tiếp theo”. Ghi nhận bản town này được chấp nhận làm nền; [kế hoạch v0.2 PvE](NEXT_PHASE_PLAN_V0_2.md) mới được lập, chưa triển khai. Các P0 cũ ngoài thị trấn vẫn theo [queue](AI_NEXT_TASKS.md); chưa mở TOWN-04/P1.

## Ảnh trước và sau

Mở [bộ so sánh có thanh kéo](../.cache/qa/2026-10-10-town/review.html), chọn vị trí/ngày–đêm. Có12ảnh trước và12ảnh sau;10ảnh gameplay cùngviewport1366×768/zoom2.048, hai overview dùng camera QA riêng có nhãn rõ. Gallery đã kiểm12tình huống/24PNG/slider0–50–100, không lỗi JavaScript hoặc request ngoài local.

| Vị trí | Trước, ngày | Sau, ngày | Sau, đêm |
|---|---|---|---|
| Quảng trường | [Trước](../.cache/qa/2026-10-10-town/before/spawn-day-1366x768.png) | [Sau](../.cache/qa/2026-10-10-town/after/spawn-day-1366x768.png) | [Đêm](../.cache/qa/2026-10-10-town/after/spawn-night-1366x768.png) |
| Chợ | [Trước](../.cache/qa/2026-10-10-town/before/market-day-1366x768.png) | [Sau](../.cache/qa/2026-10-10-town/after/market-day-1366x768.png) | [Đêm](../.cache/qa/2026-10-10-town/after/market-night-1366x768.png) |
| Lò rèn/quán trọ | [Trước](../.cache/qa/2026-10-10-town/before/forge-day-1366x768.png) | [Sau](../.cache/qa/2026-10-10-town/after/forge-day-1366x768.png) | [Đêm](../.cache/qa/2026-10-10-town/after/forge-night-1366x768.png) |
| Giả kim | [Trước](../.cache/qa/2026-10-10-town/before/alchemy-day-1366x768.png) | [Sau](../.cache/qa/2026-10-10-town/after/alchemy-day-1366x768.png) | [Đêm](../.cache/qa/2026-10-10-town/after/alchemy-night-1366x768.png) |
| Cổng Đông | [Trước](../.cache/qa/2026-10-10-town/before/east-gate-day-1366x768.png) | [Sau](../.cache/qa/2026-10-10-town/after/east-gate-day-1366x768.png) | [Đêm](../.cache/qa/2026-10-10-town/after/east-gate-night-1366x768.png) |

Ảnh art dùng bản lưu kiểm tra hợp lệ trước Continue trong context Edge riêng; mở sương thị trấn trước khi tải để so sánh toàn vùng. Đây không phải bằng chứng khám phá từ nhân vật mới. Hai fulljourney trong verify kiểm đường chơi thật riêng.

## Những gì đã đổi

- Quảng trường lát bát giác/khảm trăng khuyết phẳng, bốn inlay; đường lát đá dịu và mép ngoài liên tục theo các path cũ.
- Biển Chợ/Lò Rèn/Giả Kim/Quán Trọ và đèn bên lề. Chợ có sạp nhỏ, kiện hàng, giỏ và dây cờ; giữ nguyên quầy Vũ.
- Giá kiếm/thùng/ánh cam/bốn tia lửa tại lò rèn; khay ba bình thuốc/rune phẳng/hơi nhỏ tại giả kim. Quán trọ có biển, ghế, hàng và thảm; không có hệ thuê NPC hoặc tương tác giả.
- Hai trụ đá/cờ trăng/đèn và biển RỪNG→ ở cổng Đông, nền ngưỡng phẳng, ba chậu hoa bên lề. Không có thanh ngang hoặc collider mới chặn đường.
- Sửa lỗi hiển thị dusk của riêng town: fillAlpha0 trước đây làm setAlpha(.24) vô tác dụng. Nay màu đêm hoạt động; đo pixel nền thật153/139/110→118/110/93, không chỉ kiểm thuộc tính alpha.

Nguồn mới là **pixel art vẽ bằng code tự tạo**, tái sử dụng terrain, nhà và các trạm nghề PNG/procedural hiện có. Không sửa PNG/crop/manifest gốc hoặc tải asset bên ngoài. Nền tĩnh bake một texture960×640 nearest dùng lại khi quay về; hiệu ứng mới cập nhật10Hz trên Graphics cố định, không thêm tween/particle. Tám dân và sinh hoạt nền đã có được giữ.

## Bảo toàn và kiểm thử

Giữ nguyênbyte `maps.ts`, model/savev1, navigation/combat/balance, UI/camera/createDemoGame, package/lock/config, Foundation và toàn bộ PNG cũ. Còn15nhà/8dân/5NPC/11object/9path/43obstacle. Không di chuyển NPC ngày–đêm, quặng, thảo dược, spawn hoặc cổng; không thêm physics/input cho art.

| Chặng | Kết quả chạy thật |
|---|---|
| TOWN-00 | Build exit0; village/navigation/fullscreenUI9/9passed,21,3giây;12ảnh trước,0JS/HTTP/outbound |
| TOWN-01 | Build exit0; village/navigation/art9/9passed,14giây;12ảnh trung gian |
| TOWN-02 | Build exit0; art/village/nghề/NPC đêm10/10passed,39giây |
| TOWN-03 | Build exit0; village/navigation/guide11/11passed,49,9giây |
| Ảnh cuối |12ảnh/0JS/HTTP/outbound, canvas/zoom/bounds/collider và tọa độ actor khớp trước |
| Pause/cleanup |48vật art không body/input; pause giữ clock/commandBuffer;3vòng town↔forest không tăngnode/body/tween/listener, texture nền dùng lại |
| Verify cuối | **99/99passed,0failed,exit0,11phút**,session35830 đã kết thúc; gồm cả2regression town mới |
| Hai hành trình thật | Kiếm Sĩ3,1phút/Pháp Sư3,1phút: dân thường→nghề→Class→rừng→Boss→quay về/nộp/save/Continue/khám phá tiếp |

Các lượt focused có test trùng nhau, không cộng thành tổng riêng. Verify đầu bị lỗi typing trong2test mới, đã sửa và qua typecheck/lượt99test cuối; lưu `verify-typecheck-failed.log`. Hai regression mới trong `tests/town-art.spec.ts` kiểm pixel đêm thật và pause/cleanup/texture reuse; không khóa test vào màu hoặc bố cục trang trí cụ thể. Không còn lỗi build/test trong lượt cuối. Cảnh báo chunkPhaser>500KB/NO_COLOR và filejourney chậm là thông báo đã quan sát, không phải lỗi kiểm tra.

Bằng chứng: [verify](../.cache/qa/2026-10-10-town/verify.log), [kết quả cuối](../.cache/qa/2026-10-10-town/result.json), [ảnh sau/khung hình](../.cache/qa/2026-10-10-town/after/result.json), [lifecycle](../.cache/qa/2026-10-10-town/lifecycle-result.json), [gallery](../.cache/qa/2026-10-10-town/review-result.json), [so snapshot](../.cache/qa/2026-10-10-town/preservation.json). Đã đo số đối tượng/cleanup, chưa có phép đo FPS trước–sau tương đương; không suy ra hiệu năng từ số test PASS.

## File sửa và backup

- Source: mới `src/game/world/TownVisuals.ts`; sửa `VillageLife.ts` để compose update/destroy; sửa3dòng trong `DemoScene.ts` cho dusk town.
- Test: mới `tests/town-art.spec.ts`.
- Tài liệu: Town Planning Guide, AI_NEXT_TASKS/AI_SESSION_LOG, ART_PROGRESS, ASSET_GUIDE, ARCHITECTURE, DEMO_CHECK và báo cáo này. Scripts/ảnh/log/gallery QA ở `.cache/qa/2026-10-10-town/`.
- Backup trước toàn đợt116file: `.local-backups/2026-10-10T06-37-52-353Z-before-town-visual-upgrade-ujDBXT`; trướcchặng02117file: `2026-10-10T06-44-01-096Z-before-town-02-workshops-VnEYiz`; trướcchặng03117file: `2026-10-10T06-48-41-976Z-before-town-03-east-gate-ES0ZGt`.

`docs/CODEX_TOWN_BUILD_PROMPT.md` được yêu cầu đọc nhưng không có trong project/snapshot và không tìm thấy tên tương tự. Triển khai dựa trên yêu cầu trực tiếp đầy đủ, AGENTS, GDD và Town Guide hiện có; không tạo nội dung giả cho file thiếu.

Không dùng Git/upload/push/deploy, không mở/xóa save của người dùng. Sau nghiệm thu P0, người dùng đã chấp nhận demo hiện tại; TOWN-04/P1 và mở rộng bản đồ/P2 chưa triển khai. Các checklist P0-03/04/05/10 gốc vẫn giữ phạm vi cũ, không tự DONE vì đợt town; phần duyệt củaP0-10 đã nhận, phần QA được đưa vàoV02-00.
