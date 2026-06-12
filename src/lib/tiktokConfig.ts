export const DEFAULT_TIKTOK_PIXEL_ID = 'D848L8JC77UEN23MVLHG'

export function getTikTokPixelId(): string {
  return process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || DEFAULT_TIKTOK_PIXEL_ID
}
