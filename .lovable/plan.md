

## Plan: Empty States and Error Boundaries

### Current State (already handled)
- No reviews: already shows "Be the first to review [Name]" (line 527)
- No team: already hides section (line 412)
- Service areas: currently hides entirely when empty — needs a fallback message instead

### Changes

**1. New file: `src/components/shared/ErrorBoundary.tsx`**
- React class component error boundary
- Catches render errors in children
- Fallback UI: "Something went wrong. Please try again." with a Retry button that calls `this.setState({ hasError: false })` to re-render children
- Accepts optional `fallback` prop for custom messages

**2. `src/pages/AgentProfile.tsx`**
- Wrap the main content (below Navbar) in `<ErrorBoundary>`
- Add an `error` state to the data-loading logic; if `profError` occurs, show error state with retry button instead of just silently failing
- Service areas (line 451): change from hiding entirely to showing "Service areas not specified" when `zones.length === 0` and the professional has no `service_zones`

**3. `src/pages/SellResult.tsx`**
- Wrap the main result content in `<ErrorBoundary>`
- The existing polling/error logic already shows toast on failure; add a visible error state with retry when fetch fails permanently

**4. `src/pages/RentResult.tsx`**
- Wrap main content in `<ErrorBoundary>`

### ErrorBoundary Component
```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto mb-3 text-muted-foreground" />
          <p>Something went wrong. Please try again.</p>
          <Button onClick={() => this.setState({ hasError: false })}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### AgentProfile Error + Service Areas Changes
- Line 127: instead of just `return` on error, set an `error` state
- Render error state with retry button that re-calls `load()`
- Line 451: replace `{zones.length > 0 && (...)}` with always-show section: if zones empty, render "Service areas not specified" text

### Files
- **New**: `src/components/shared/ErrorBoundary.tsx`
- **Modified**: `src/pages/AgentProfile.tsx`, `src/pages/SellResult.tsx`, `src/pages/RentResult.tsx`

