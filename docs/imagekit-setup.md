# ImageKit setup

Goal: move product image delivery off Vercel while keeping Yupoo as the upstream source.

## 1. Create the origin in ImageKit

In the ImageKit dashboard:

1. Go to `External Storage`.
2. Add a new origin of type `Web proxy`.
3. Keep default options for the first pass.
4. Save it.

Official docs:
- https://imagekit.io/docs/integration/web-proxy
- https://imagekit.io/docs/integration/connect-external-storage

## 2. Attach the origin to your URL endpoint

When your first external origin is added, ImageKit usually exposes it through the default endpoint:

`https://ik.imagekit.io/your_imagekit_id`

If you create a dedicated endpoint, attach the web proxy origin to it.

## 3. Add environment variables

Set these on Vercel and locally:

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
NEXT_PUBLIC_IMAGEKIT_DEFAULT_TRANSFORM=f-auto,q-75
```

## 4. Redeploy

Once `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is present, the app will:

- use ImageKit first for Yupoo product images
- keep `/api/img` as fallback if ImageKit or the source fails

## 5. Validate in production

Open `Network` in DevTools on `/shop` and inspect image requests.

Expected request host after setup:

`ik.imagekit.io` or your ImageKit custom domain

Fallback host if something is wrong:

`/api/img`

## Notes

- This setup does not require copying the whole image library into storage.
- ImageKit can fetch remote files through its web proxy origin and serve them through its CDN.
- If Yupoo blocks ImageKit requests, check the response headers for ImageKit errors as described in their troubleshooting docs.
