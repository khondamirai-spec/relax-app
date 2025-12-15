# File Storage Guide - Choose the Best Option

## Option Comparison

| Option | Best For | Pros | Cons |
|--------|----------|------|------|
| **Cloudinary** | Large files (>10MB) | ✅ Free 25GB<br>✅ CDN delivery<br>✅ No repo bloat<br>✅ Works reliably | ❌ Requires account<br>❌ External service |
| **Local (public/)** | Small files (<10MB) | ✅ Simple<br>✅ No external deps<br>✅ Fast local dev | ❌ Increases repo size<br>❌ Slower deployments |
| **Google Drive** | Not recommended | ✅ Free storage | ❌ CORS issues<br>❌ Blocks large files<br>❌ Unreliable |

## Recommended Approach: Hybrid

### Small Files (<10MB)
Put in `public/music/` folder:
```
public/
  music/
    intro.mp3          ← Small file, OK in repo
    notification.mp3   ← Small file, OK in repo
```

### Large Files (>10MB)
Use Cloudinary:
```typescript
{
  title: 'Long Meditation',
  cloudinaryUrl: 'https://res.cloudinary.com/.../long-meditation.mp3'
}
```

## Setup Instructions

### For Cloudinary (Large Files)

1. **Sign up**: [cloudinary.com](https://cloudinary.com) (free)
2. **Upload file**: Use dashboard to upload
3. **Get URL**: Copy URL from media library
4. **Add to code**: Use `cloudinaryUrl` field

See `CLOUDINARY_SETUP.md` for detailed steps.

### For Local Files (Small Files)

1. **Create folder**: `public/music/`
2. **Add files**: Copy your small audio files there
3. **Use in code**: Use `localUrl` field like `/music/track.mp3`

**Note**: Files in `public/` are served at the root URL:
- File: `public/music/track.mp3`
- URL: `/music/track.mp3`

## Example Usage

```typescript
const items: Item[] = [
  // Small file - use local
  {
    id: '1',
    title: 'Short Sound',
    subtitle: 'Effect',
    icon: <Music />,
    colorClass: 'bg-blue-100',
    category: 'Music',
    localUrl: '/music/short-sound.mp3'  // ← Small file, local
  },
  
  // Large file - use Cloudinary
  {
    id: '2',
    title: 'Long Meditation',
    subtitle: 'Relaxation',
    icon: <Moon />,
    colorClass: 'bg-purple-100',
    category: 'Sleeping',
    cloudinaryUrl: 'https://res.cloudinary.com/.../long-meditation.mp3'  // ← Large file, Cloudinary
  },
  
  // Fallback - Google Drive (not recommended)
  {
    id: '3',
    title: 'Forest Sounds',
    subtitle: 'Nature',
    icon: <Wind />,
    colorClass: 'bg-green-100',
    category: 'Healing',
    driveFileId: '18M2pXp7vj5w4An9X3h-NAlGVfvbg4vuC'  // ← May not work for large files
  }
];
```

## File Size Guidelines

- **<5MB**: Use `public/music/` (local) ✅
- **5-10MB**: Either works, Cloudinary recommended
- **>10MB**: Use Cloudinary ✅
- **>100MB**: Must use Cloudinary ✅

## Keeping Repo Small

If you use local files but want to exclude large ones from git:

1. Add to `.gitignore`:
   ```
   /public/music/*.mp3
   /public/music/*.m4a
   ```

2. Files will work locally but won't be in git
3. For deployment, upload files separately or use Cloudinary

## Best Practice

**Use Cloudinary for everything** - it's free, reliable, and keeps your repo clean!












