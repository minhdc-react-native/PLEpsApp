export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Nếu đã bắt đầu bằng http:// hoặc https:// thì giữ nguyên
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Giữ cùng quy ước với web client: URL ảnh từ API dùng HTTPS.
  return `https://${url}`;
}
