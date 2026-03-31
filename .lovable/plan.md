

## Plan: Fix Logo Display in Onboarding Step 3

### Problem
The logo `<img>` tag has no `onError` handler, so broken/unreachable URLs show a broken image icon. There's also no file upload capability for the logo.

### Changes in `src/pages/ProOnboard.tsx`

**1. Add `onError` fallback to logo image (line 332)**
- Add `onError` handler that hides the broken image and shows the initials fallback instead
- Use a local state flag `logoFailed` to toggle between image and initials

**2. Add file upload for logo**
- Add a hidden `<input type="file" accept="image/*">` element
- Add an "Upload logo" button next to the current logo display
- On file select, create an object URL (`URL.createObjectURL`) for immediate preview and update `logoUrl`
- Reset `logoFailed` when a new logo is set

**3. Improve initials fallback styling**
- Use terracotta background (`bg-[#D4713B]`) with white text instead of the current `bg-primary/10`

### Implementation Detail

Add state:
```tsx
const [logoFailed, setLogoFailed] = useState(false);
```

Replace the logo section (lines 328-340) with:
- Image with `onError={() => setLogoFailed(true)}`
- Show initials when `!logoUrl || logoFailed`
- Hidden file input + "Upload" button that sets `logoUrl` via `URL.createObjectURL` and resets `logoFailed`
- Replace "Logo can be changed after publishing" text with the upload button

### Files Modified
- `src/pages/ProOnboard.tsx`

