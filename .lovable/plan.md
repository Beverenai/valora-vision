

## Plan: Mirror hero structure in Final CTA section

The Final CTA section currently uses a standalone `GoogleAddressInput` (`AddressBlock`). It should instead replicate the hero's exact structure: heading text + `ValuationTicketCard` in input mode.

### Changes — `src/pages/Index.tsx` (lines 448–467)

Replace the Final CTA section content with the same structure as the hero (lines 138–166):

- **Keep** the gradient background and section wrapper
- **Replace** the inner content with:
  - Same badge ("Free property valuation")
  - Same heading (or the current CTA heading — "Ready to discover your property's true value?")
  - Same subtitle
  - `ValuationTicketCard` with the same input-mode props as the hero (sharing `addressData`, `handleAddressChange`, `handleGetValuation`, `mapExpanded`, `onMapPhaseChange`)
- **Remove** the `AddressBlock` usage and the "Join 12,400+" text
- Add a second `mapExpanded` state (e.g. `mapExpandedBottom`) so the two cards expand independently

### State addition

Add `const [mapExpandedBottom, setMapExpandedBottom] = useState(false);` alongside the existing `mapExpanded` state, so the bottom card's map phase doesn't affect the hero card.

### Resulting Final CTA structure

```tsx
<section className="w-full py-8 md:py-20 px-5 md:px-8 pb-32" style={{...gradient}}>
  <div className="flex flex-col items-center text-center gap-4 mb-2">
    <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-4 py-2 text-sm font-medium">
      Free property valuation
    </span>
    <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl ...">
      Ready to discover your property's true value?
    </h2>
    <p className="text-lg text-muted-foreground">
      Free, confidential, and takes less than 2 minutes
    </p>
  </div>
  <ValuationTicketCard
    address="" estimatedValue="" leadId="" accentType="sell"
    addressData={addressData}
    onAddressFieldChange={handleAddressChange}
    onLocationConfirmed={handleGetValuation}
    mapExpanded={mapExpandedBottom}
    onMapPhaseChange={(phase) => setMapExpandedBottom(phase === "verify")}
  />
</section>
```

### Cleanup

Remove the `AddressBlock` component definition (lines 123–131) since it will no longer be used anywhere.

