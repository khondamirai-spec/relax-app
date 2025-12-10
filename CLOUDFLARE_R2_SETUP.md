# Cloudflare R2 Setup Guide

## Why Cloudflare R2?

- ✅ **Free tier**: 10GB storage, 1M Class A operations, 10M Class B operations/month
- ✅ **Zero egress fees**: No charges for data transfer
- ✅ **S3-compatible API**: Works with AWS S3 SDK
- ✅ **Fast CDN**: Global edge network
- ✅ **Great for large files**: Perfect for audio/video files like your 211MB `relax.weba`

## Step 1: Get Your R2 Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click on **"Manage R2 API Tokens"**
4. Click **"Create API Token"**
5. Set permissions:
   - **Permissions**: `Object Read & Write` (or `Object Read` for read-only)
   - **Bucket**: Select your bucket (e.g., `music`)
   - Click **"Create API Token"**
6. **IMPORTANT**: Copy the following values immediately (you won't see them again!):
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (shown in the token details or in your R2 dashboard URL)

## Step 2: Get Your Account ID

If you don't have your Account ID:
1. Go to your R2 dashboard
2. Look at the URL: `https://dash.cloudflare.com/{accountId}/r2/overview`
3. The `{accountId}` is your Account ID
4. Or go to any Cloudflare page and check the sidebar/URL

## Step 3: Configure Environment Variables

Create or update `.env.local` file in your project root:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=music

# Optional: If you set up a custom domain for public access
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

**Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

## Step 4: Choose Public or Private Access

### Option A: Enable Public Access (Easier)

If you enable public access for your bucket:

1. Go to your bucket settings in Cloudflare Dashboard
2. Enable **"Public Access"**
3. Files will be accessible at:
   ```
   https://pub-{accountId}.r2.dev/{bucketName}/{objectKey}
   ```
4. Example: `https://pub-ab31ac08e0f090fade1049d8a217.r2.dev/music/relax.weba`
5. Use `r2PublicUrl` in your dashboard items

### Option B: Use Private Access (More Secure)

If you keep public access disabled (current setting):

1. Files will be served through the API route: `/api/r2/stream?key={objectKey}`
2. The API route uses signed URLs or streams directly from R2
3. Use `r2Key` in your dashboard items

**Note**: The current setup works with both public and private access!

## Step 5: Add R2 Files to Your Dashboard

In `src/app/dashboard/page.tsx`, add your R2 file:

```typescript
{
  id: '9',
  title: 'Relax',
  subtitle: 'Relaxation Music',
  icon: <Moon className="w-7 h-7" />,
  colorClass: 'bg-indigo-100',
  category: 'Music',
  // Option 1: Use object key (works with private buckets)
  r2Key: 'relax.weba'
  
  // Option 2: Use public URL (if public access enabled)
  // r2PublicUrl: 'https://pub-ab31ac08e0f090fade1049d8a217.r2.dev/music/relax.weba'
}
```

## Step 6: Test Your Setup

1. Restart your dev server: `npm run dev`
2. Go to your dashboard
3. Click on the "Relax" item
4. The audio should play from your R2 bucket!

## Troubleshooting

### Error: "R2 not configured"
- Check that all environment variables are set in `.env.local`
- Restart your dev server after adding environment variables
- Make sure variable names match exactly (case-sensitive)

### Error: "File not found in R2 bucket"
- Verify the object key matches exactly (case-sensitive)
- Check that the file exists in your R2 bucket
- Verify the bucket name in `CLOUDFLARE_R2_BUCKET_NAME`

### Error: "Failed to stream file"
- Check your API token permissions (needs Object Read)
- Verify your Account ID is correct
- Check browser console for detailed error messages

### File plays but is slow
- Large files (200MB+) may take time to buffer
- Consider enabling R2 public access for faster direct CDN delivery
- The API route streams files, which is good for large files but may have initial delay

## Custom Domain Setup (Advanced)

For even better performance, you can set up a custom domain:

1. In R2 bucket settings, go to **"Public Access"**
2. Click **"Connect Domain"**
3. Follow instructions to add a CNAME record
4. Use the custom domain URL in `CLOUDFLARE_R2_PUBLIC_URL`

## File URL Priority

The player tries sources in this order:
1. `cloudinaryUrl` - Cloudinary direct URL
2. `r2PublicUrl` - R2 public URL (if public access enabled)
3. `localUrl` - Local file in `public/` folder
4. `r2Key` - R2 via API route (`/api/r2/stream`)
5. `fileId` - Google Drive via API route

## Benefits Over Other Services

| Feature | Google Drive | Cloudinary | Cloudflare R2 |
|---------|-------------|------------|---------------|
| Free Storage | 15GB | 25GB | 10GB |
| Free Bandwidth | Limited | 25GB/month | **Unlimited** ✅ |
| Large Files | Blocked | ✅ | ✅ |
| Speed | Slow | Fast | Very Fast |
| Reliability | CORS issues | Good | Excellent |
| **Best For** | Small files | Medium files | **Large files** ✅ |

## Your Current File

You have `relax.weba` (211.38 MB) in your R2 bucket. This is perfect for R2 because:
- ✅ Large file (over 200MB)
- ✅ Zero egress fees (unlimited streaming)
- ✅ Fast CDN delivery
- ✅ No CORS issues

Just add it to your dashboard with:
```typescript
r2Key: 'relax.weba'
```

