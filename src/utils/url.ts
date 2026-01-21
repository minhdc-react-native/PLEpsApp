export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Nếu đã bắt đầu bằng http:// hoặc https:// thì giữ nguyên
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Nếu link chỉ là domain/ip + path → thêm http://
  return `http://${url}`;
}
