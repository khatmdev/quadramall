import { z } from 'zod';
import emojiRegex from 'emoji-regex';

export const bannerSchema = z.object({
  id: z.number().optional(),
  description: z.string()
    .min(1, 'Mô tả không được để trống')
    .max(255, 'Mô tả không được dài quá 255 ký tự'),
  image: z.string()
    .min(1, 'Đường dẫn hình ảnh không được để trống')
    .regex(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/, 'Hình ảnh phải là URL hợp lệ và có định dạng PNG, JPG, JPEG hoặc GIF'),
  toUrl: z.string()
    .regex(/^(https?:\/\/.*|\/.*)?$/, 'Liên kết phải là URL hợp lệ hoặc đường dẫn nội bộ bắt đầu bằng /')
    .nullable()
    .optional(),
  emoji: z.string().optional().refine(
    (val) => !val || emojiRegex().test(val),  // Skip regex nếu val falsy (empty, null, undefined)
    { message: 'Emoji không hợp lệ. Tham khảo: https://emojipedia.org/.' }
  ), 
  displayOrder: z.number().min(0, 'Số thứ tự phải là số không âm'),
  active: z.boolean(),
  isIntro: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>