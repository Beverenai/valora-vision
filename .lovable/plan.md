

# Fix Remaining Spanish Strings + Breadcrumb Logic in AgentProfile.tsx

## Issues Found

1. **Breadcrumb shows wrong name**: Currently displays `contact_name` ("August raae") instead of `company_name` ("La Sala homes") for agency profiles. Also, the breadcrumb should show the company/profile name as the final crumb, not a team member's name.

2. **Many Spanish strings remain** in `AgentProfile.tsx` that were missed in the previous translation pass.

## Changes — Single File: `src/pages/AgentProfile.tsx`

### Breadcrumb Fix (line 548)
- Change `agentName` prop from `professional.contact_name || professional.company_name` to just `professional.company_name` — the breadcrumb final crumb should always be the profile/company name.

### Remaining Spanish → English Translations

| Line | Spanish | English |
|------|---------|---------|
| 527 | `miembros` | `members` |
| 539 | `ventas` | `sales` |
| 564 | `SOBRE NOSOTROS` | `ABOUT US` |
| 684 | `NUESTRO EQUIPO` | `OUR TEAM` |
| 760 | `ZONAS DE SERVICIO` | `SERVICE AREAS` |
| 771 | `Zonas de servicio no especificadas` | `Service areas not specified` |
| 777 | `OPINIONES DE CLIENTES` | `CLIENT REVIEWS` |
| 785 | `opiniones` | `reviews` |
| 841 | `Ver todas las {n} opiniones` | `View all {n} reviews` |
| 849 | `Opiniones disponibles pronto` | `Reviews available soon` |
| 850 | `Google reviews importadas` | `Google reviews imported` |
| 857 | `Sé el primero en opinar sobre...` | `Be the first to review...` |

No logic or layout changes — purely string fixes and one prop correction.

