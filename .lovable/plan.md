

## Plan: Onboarding Form Validation Polish

### Overview
Add real-time validation feedback to Step 1 of `/pro/onboard`, including visual indicators, format hints, email uniqueness check, and Google address autocomplete.

### Changes in `src/pages/ProOnboard.tsx`

**1. Add validation state (near line 58)**
```tsx
const [emailError, setEmailError] = useState("");
const [emailValid, setEmailValid] = useState(false);
const [emailChecking, setEmailChecking] = useState(false);
const [phoneError, setPhoneError] = useState("");
const [websiteError, setWebsiteError] = useState("");
const [addressConfirmed, setAddressConfirmed] = useState(false);
```

**2. Validation helpers**
- `validateEmail(val)` — regex check, sets `emailError` if invalid
- `checkEmailUniqueness(val)` — on blur, query `supabase.from('professionals').select('id').eq('email', val).maybeSingle()`. If found, set `emailError = "This email is already registered"`; otherwise set `emailValid = true`
- `validatePhone(val)` — accept `+XX XXX XXX XXX` pattern, show error if clearly invalid
- `validateWebsite(val)` — basic URL pattern check on blur

**3. Update Step 1 form fields (lines 309-336)**

Each field gets:
- Green checkmark icon (inside input or beside label) when valid and non-empty
- Red border + error message below when invalid
- Helper text where relevant

Specific changes:
- **Agency name**: green check when `companyName.trim().length > 0`
- **Your name**: green check when `contactName.trim().length > 0`
- **Email**: validate format on blur, then check uniqueness. Show spinner while checking, green check when valid+unique, red border + error text when invalid or taken
- **Phone**: replace plain `<Input>` with `<PhoneInput>` component (already exists at `src/components/shared/PhoneInput.tsx`). Add hint: "e.g., +34 612 345 678"
- **Website**: validate URL format on blur. Add helper text: "e.g., https://www.youragency.com" (already partially there, keep it)
- **Address**: replace plain `<Input>` with `<GoogleAddressInput>` component (already exists). Wire `onChange` to update `address` and capture `lat`/`lng`. Set `addressConfirmed` when location is confirmed. Show green check when confirmed.

**4. Visual validation wrapper**

Create a small inline helper to render the validation icon:
```tsx
const ValidationIcon = ({ valid, error }: { valid: boolean; error: string }) => (
  valid ? <Check className="w-4 h-4 text-green-600" /> :
  error ? <X className="w-4 h-4 text-destructive" /> : null
);
```

Add red border class to inputs conditionally: `className={cn(emailError && "border-destructive")}`

**5. Update `canProceedStep1` (line 82)**
- Add `!emailError` and `emailValid` conditions
- Require `addressConfirmed` (or at minimum non-empty address with lat/lng set)

### Address Integration Detail
The `GoogleAddressInput` component needs `addressData` as an object with `streetAddress`, `city`, `province`, etc. Create a local `addressData` state object, and derive the display `address` string from it. When `onLocationConfirmed` fires, set `addressConfirmed = true` and update `lat`/`lng` state.

### Files Modified
- `src/pages/ProOnboard.tsx` — add validation state, swap phone/address inputs, add visual feedback

