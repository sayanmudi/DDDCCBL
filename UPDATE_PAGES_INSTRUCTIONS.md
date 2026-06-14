# Instructions to Update Remaining Pages

All pages that use AppShell need to be updated to fetch and pass organization settings.

## Pages to Update:
1. app/users/page.tsx
2. app/settings/page.tsx
3. app/reports/page.tsx
4. app/reports/[report]/page.tsx
5. app/reports/cbs-reports/page.tsx
6. app/reports/manager-reports/page.tsx
7. app/reports/submissions/page.tsx
8. app/reports/teller-reports/page.tsx

## Changes Required for Each Page:

### 1. Add import at the top:
```typescript
import { getOrganizationSettings } from '../../lib/organizationSettings';
// or '../../../lib/organizationSettings' for nested pages
```

### 2. Fetch settings in the component:
```typescript
const { organizationName, logoPath } = await getOrganizationSettings();
```

### 3. Pass to AppShell:
```typescript
<AppShell
  // ... existing props
  organizationName={organizationName}
  logoPath={logoPath}
>
```

## Summary of Changes Made:
✅ Database updated with organization name and logo path
✅ Helper function created: lib/organizationSettings.ts
✅ AppShell component updated to accept and use org settings
✅ Login page updated to fetch and display org name
✅ Dashboard page updated
✅ Forms page updated

## Remaining:
- Update all report pages and other pages listed above
- The changes are simple and follow the same pattern