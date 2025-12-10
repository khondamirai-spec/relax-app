# How to Use Google Drive Files

## Step 1: Upload Your Music File

1. Go to [Google Drive](https://drive.google.com)
2. Upload your audio file (.mp3, .m4a, etc.)

## Step 2: Share the File (IMPORTANT!)

⚠️ **This step is critical!** If you skip this, your audio won't play.

1. Right-click on your audio file
2. Click **"Share"**
3. Look for the dropdown that says **"Restricted"** or **"Only people with access"**
4. Click the dropdown and change it to **"Anyone with the link"**
5. Make sure the permission is set to **"Viewer"** (not Editor or Commenter)
6. Click **"Done"**

### How to Verify It's Shared Correctly:
- After sharing, open the share link in an **incognito/private window**
- If you see the file (not a "Sign in" page), it's shared correctly ✅
- If you see "Sign in" or "You need access", it's NOT shared correctly ❌

## Step 3: Get the File ID

### Method 1: From Share Link
1. Right-click your file → **"Share"**
2. Click **"Copy link"**
3. The link looks like: `https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing`
4. Copy the **FILE_ID_HERE** part (the long string between `/d/` and `/view`)

### Method 2: From URL Bar
1. Open your file in Google Drive
2. Look at the URL: `https://drive.google.com/file/d/FILE_ID_HERE/view`
3. Copy the **FILE_ID_HERE** part

## Step 4: Add to Your App

In `src/app/dashboard/page.tsx`, add the file ID:

```typescript
{
  id: '3',
  title: 'Forest Sounds',
  subtitle: 'Nature',
  icon: <Wind className="w-7 h-7" />,
  colorClass: 'bg-green-100',
  category: 'Healing',
  driveFileId: 'YOUR_FILE_ID_HERE' // ← Paste your file ID here
}
```

## Example

If your share link is:
```
https://drive.google.com/file/d/18M2pXp7vj5w4An9X3h-NAlGVfvbg4vuC/view?usp=sharing
```

Then your file ID is:
```
18M2pXp7vj5w4An9X3h-NAlGVfvbg4vuC
```

## Troubleshooting

### ⚠️ Most Common Issue: "Sign in" Page or "Failed to load audio"

**Problem:** When you open the Google Drive link, you see a "Sign in" page instead of the file.

**Solution:**
1. The file is NOT shared publicly
2. Go back to Step 2 above
3. Make sure you changed it to **"Anyone with the link"**
4. Test in an incognito window to verify

### Error: "Failed to load audio"
- Make sure file is shared as **"Anyone with the link"** (not "Restricted")
- Make sure you're using the **FILE** link, not a folder or spreadsheet link
- Check that the file ID is correct (no extra spaces)
- Test the direct link: `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`

### Error: "File not accessible"
- The file might be too large (>100MB)
- Try compressing the audio file
- Make sure sharing permissions are correct
- Verify the file isn't in a shared folder with restricted access

### Still not working?
- Check browser console (F12) for detailed error messages
- Test the API directly: `http://localhost:3000/api/stream?id=YOUR_FILE_ID`

