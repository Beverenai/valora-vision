

# Convert Agent Profile Components from Spanish to English

All the recently added agent profile components and the AgentProfile page itself use Spanish labels throughout. These need to be converted to English as the base language.

## Files to Update

### 1. `src/components/agent/AgentBreadcrumbs.tsx`
- "Inicio" → "Home"
- "Agentes" → "Agents"

### 2. `src/components/agent/AgentSalesStats.tsx`
- "ESTADÍSTICAS DE VENTA" → "SALES STATISTICS"
- "vendió" → "sold"
- "propiedades" → "properties"
- "con un precio de venta mediano de" → "with a median sale price of"
- "Propiedades vendidas" → "Properties sold"
- "Precio mediano" → "Median price"

### 3. `src/components/agent/AgentPropertyCards.tsx`
- "PROPIEDADES VENDIDAS" → "PROPERTIES SOLD"
- "Vendido" badge → "Sold"
- "Verificado" badge → "Verified"
- "Vendido por … de …" → "Sold by … from …"
- "Anterior" → "Previous"
- "Siguiente" → "Next"
- Date formatting locale: `es-ES` → `en-GB` (or `en-US`)

### 4. `src/pages/AgentProfile.tsx`
- "Necesito una valoración" → "I need a valuation"
- "Quiero vender" → "I want to sell"
- "Quiero comprar" → "I want to buy"
- "Alquiler" → "Rental"
- "Otro" → "Other"
- "CONTACTAR" → "CONTACT"
- "Contactar" → "Contact"
- "Mostrar número" → "Show number"
- "AGENCIA" → "AGENCY"
- "NUESTROS AGENTES" → "OUR AGENTS"
- All other Spanish strings in section labels, buttons, and headings

All changes are string replacements only — no logic or layout changes.

