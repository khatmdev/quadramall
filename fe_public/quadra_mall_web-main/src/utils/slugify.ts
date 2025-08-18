const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
};

export function slugify(text: string): string {
    if (!text) return '';

    // Chuyển đổi các ký tự có dấu thành không dấu
    let convertedText = text.toLowerCase().split('').map(char => vietnameseMap[char] || char).join('');

    // Chuẩn hóa Unicode và loại bỏ dấu
    convertedText = convertedText.normalize('NFD').replace(/\p{Diacritic}/gu, '');

    // Thay khoảng trắng bằng dấu gạch ngang
    convertedText = convertedText.replace(/\s+/g, '-');

    // Xóa ký tự đặc biệt (chỉ giữ chữ cái, số và dấu gạch ngang)
    convertedText = convertedText.replace(/[^\w-]/g, '');

    // Xóa nhiều dấu gạch ngang liên tiếp
    convertedText = convertedText.replace(/-+/g, '-');

    // Xóa dấu gạch ngang ở đầu và cuối
    return convertedText.replace(/^-|-$|\s+/g, '');
}