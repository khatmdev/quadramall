export const formatProvinceName = (name: string) =>
  name.replace(/^Tỉnh\s+/i, "").replace(/^Thành phố\s+/i, "");
