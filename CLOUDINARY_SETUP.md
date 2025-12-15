# Cloudinary Setup Guide (Best for Large Files)

## Why Cloudinary?

- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month
- ✅ **No repo bloat**: Files stored in cloud, not in your code
- ✅ **CDN delivery**: Fast streaming worldwide
- ✅ **Works with large files**: No size restrictions
- ✅ **Easy to use**: Just upload and get URL

## Step 1: Sign Up

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Verify your email

## Step 2: Get Your Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy these values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (keep this secret!)

## Step 3: Upload Your Audio File

### Method 1: Via Dashboard (Easiest)

1. Go to [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. Click **"Upload"**
3. Select your audio file
4. Wait for upload to complete
5. Click on the uploaded file
6. Copy the **URL** from the details panel

The URL looks like:
```
https://res.cloudinary.com/your-cloud-name/video/upload/v1234567890/music/forest-sounds.mp3
```

### Method 2: Via API (Advanced)

You can also upload programmatically, but dashboard is easier for now.

## Step 4: Add to Your App

In `src/app/dashboard/page.tsx`, add the Cloudinary URL:

```typescript
{
  id: '3',
  title: 'Forest Sounds',
  subtitle: 'Nature',
  icon: <Wind className="w-7 h-7" />,
  colorClass: 'bg-green-100',
  category: 'Healing',
  cloudinaryUrl: 'https://res.cloudinary.com/your-cloud-name/video/upload/v1234567890/music/forest-sounds.mp3'
}
```

## Step 5: (Optional) Set Environment Variables

If you want to use Cloudinary API features later, add to `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Benefits Over Google Drive

| Feature | Google Drive | Cloudinary |
|---------|-------------|------------|
| Large files | ❌ Blocked | ✅ Works |
| Streaming | ❌ CORS issues | ✅ Works |
| CDN | ❌ No | ✅ Yes |
| Free tier | ✅ 15GB | ✅ 25GB |
| Repo size | ❌ Large | ✅ Small |

## File Size Recommendations

- **Small files (<10MB)**: Use `public/music/` folder (local)
- **Medium files (10-50MB)**: Use Cloudinary
- **Large files (>50MB)**: Use Cloudinary

## Troubleshooting

### URL not working?
- Make sure URL is from Cloudinary Media Library
- Check that file is uploaded (not processing)
- Try the direct URL in browser first

### Want to organize files?
- Create folders in Cloudinary dashboard
- Use folder path in URL: `video/upload/folder/track.mp3`












