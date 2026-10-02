# Quy tắc giao diện

## Empty state và error state

- Hiển thị empty state và error state trực tiếp trên nền của component cha.
- Không bọc toàn bộ state trong `Card`, `Surface` hoặc `View` có nền, viền, bo góc tạo cảm giác như một card.
- Chỉ dùng padding, khoảng cách và căn chỉnh để bố trí state. Quy tắc này áp dụng cả với nút thử lại.
- Chỉ dùng card cho nội dung dữ liệu thực tế; không dùng card để trình bày trạng thái không có dữ liệu hoặc lỗi.
