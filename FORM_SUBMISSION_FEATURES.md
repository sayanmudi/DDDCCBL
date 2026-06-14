# Form Submission Features Documentation

## Overview
This document describes the new features added to the form submission system, including recurring submissions, due dates, post-due-date restrictions, and two-stage approval workflow.

## Features Implemented

### 1. Recurring/One-Time Submission Option

When creating a form, admins can now specify whether the form accepts:
- **One-Time Submission**: Form can only be submitted once by each user
- **Recurring Submission**: Form can be submitted multiple times based on a frequency schedule

#### Frequency Options (for Recurring Forms)
- **Daily**: Form can be submitted every day
- **Weekly**: Form can be submitted once per week
- **Fortnightly**: Form can be submitted once every two weeks
- **Monthly**: Form can be submitted once per month

**Location**: Form Builder UI (`components/FormBuilder.tsx`)

**Database Fields**:
```javascript
{
  submissionType: "one-time" | "recurring",
  frequency: "daily" | "weekly" | "fortnightly" | "monthly" | null
}
```

---

### 2. Due Date Management

Admins can set an optional due date for forms. After the due date:
- **Teller/PACS users** cannot see or submit the form (it disappears from their view)
- **Submissions are blocked** with an error message
- **Supervisors** cannot approve/reject submissions unless unlocked by a Manager

**Location**: Form Builder UI (`components/FormBuilder.tsx`)

**Database Field**:
```javascript
{
  dueDate: Date | null  // ISO 8601 datetime
}
```

**Implementation Details**:
- Forms past due date are filtered out in `/api/forms/templates` GET endpoint for Teller/PACS users
- Submission attempts are blocked in `/api/forms/submissions` POST endpoint
- Approval/rejection is restricted in `/api/forms/submissions/[id]` PATCH endpoint

---

### 3. Post-Due-Date Restrictions

#### Supervisor Restrictions
After a form's due date has passed:
- Supervisors **cannot approve or reject** submissions
- Error message: "This submission is past the due date. Please request a Manager to unlock it for review."

#### Manager Unlock Functionality
Managers (and Admins) can unlock post-due-date submissions for review:

**API Endpoint**: `PATCH /api/forms/submissions/[id]`

**Request Body**:
```json
{
  "action": "unlock"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Submission unlocked successfully.",
  "submission": { ... }
}
```

**Database Fields Added to Submissions**:
```javascript
{
  isUnlocked: boolean,
  unlockedBy: string,  // User ID of Manager who unlocked
  unlockedAt: Date
}
```

Once unlocked, Supervisors can approve/reject the submission even after the due date.

---

### 4. Two-Stage Approval Workflow

Admins can optionally configure forms to require two levels of approval:

#### Configuration
**Location**: Form Builder UI (`components/FormBuilder.tsx`)

**Options**:
- **None (Single Approval)**: Default behavior - one approval required
- **Manager**: Requires first approval, then Manager as second approver
- **Supervisor**: Requires first approval, then Supervisor as second approver

**Database Fields**:
```javascript
{
  secondApprovalRole: "Manager" | "Supervisor" | null,
  requiresTwoStageApproval: boolean
}
```

#### Workflow

**Stage 1 - First Approval**:
- Any user with approval role (except the second approval role) can approve
- Submission status remains "Pending"
- Fields added to submission:
  ```javascript
  {
    firstApprovedBy: string,
    firstApprovedAt: Date,
    firstApproverRole: string
  }
  ```

**Stage 2 - Second Approval**:
- Only the designated second approval role can approve
- Submission status changes to "Approved"
- Fields added to submission:
  ```javascript
  {
    secondApprovedBy: string,
    secondApprovedAt: Date,
    secondApproverRole: string
  }
  ```

**Rejection at Any Stage**:
- Clears all approval fields
- Submission status changes to "Rejected"
- User can resubmit

---

## API Changes

### Form Creation API (`POST /api/forms/create`)

**New Request Body Fields**:
```json
{
  "formName": "string",
  "description": "string",
  "fields": [...],
  "submissionType": "one-time" | "recurring",
  "frequency": "daily" | "weekly" | "fortnightly" | "monthly",
  "dueDate": "ISO 8601 datetime string",
  "secondApprovalRole": "Manager" | "Supervisor" | null
}
```

**Validation**:
- Due date must be in the future
- Frequency is required if submissionType is "recurring"

---

### Form Templates API (`GET /api/forms/templates`)

**Behavior Change**:
- For Teller/PACS users: Filters out forms past their due date
- For Manager/Supervisor/Admin: Shows all forms regardless of due date

---

### Form Submission API (`POST /api/forms/submissions`)

**New Validation**:
- Blocks submission if form is past due date
- Error: "This form has passed its due date and is no longer accepting submissions."

---

### Submission Review API (`PATCH /api/forms/submissions/[id]`)

**New Actions**:
1. **unlock**: Manager/Admin can unlock post-due-date submissions
2. **approve**: Enhanced to support two-stage approval
3. **reject**: Clears all approval stages

**New Validations**:
- Supervisor cannot approve/reject post-due-date submissions unless unlocked
- Two-stage approval role enforcement
- First approver cannot be the second approval role
- Second approver must be the designated second approval role

---

## Database Schema Updates

### Form Templates Collection
```javascript
{
  // Existing fields...
  formName: string,
  description: string,
  fields: array,
  status: string,
  assignedRoles: array,
  approvalRoles: array,
  
  // New fields
  submissionType: "one-time" | "recurring",
  frequency: "daily" | "weekly" | "fortnightly" | "monthly" | null,
  dueDate: Date | null,
  secondApprovalRole: "Manager" | "Supervisor" | null,
  requiresTwoStageApproval: boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Form Submissions Collection
```javascript
{
  // Existing fields...
  templateId: string,
  templateName: string,
  submittedBy: string,
  submittedById: string,
  data: object,
  status: string,
  locked: boolean,
  
  // New fields for unlock functionality
  isUnlocked: boolean,
  unlockedBy: string,
  unlockedAt: Date,
  
  // New fields for two-stage approval
  firstApprovedBy: string,
  firstApprovedAt: Date,
  firstApproverRole: string,
  secondApprovedBy: string,
  secondApprovedAt: Date,
  secondApproverRole: string,
  
  // Existing approval fields (for single-stage)
  approvedBy: string,
  approvedAt: Date,
  rejectedBy: string,
  rejectedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## User Interface Changes

### Form Builder (`components/FormBuilder.tsx`)

**New Sections Added**:

1. **Submission Settings**:
   - Submission Type dropdown (One-Time/Recurring)
   - Frequency dropdown (shown only for Recurring)
   - Due Date datetime picker
   - Helper text explaining due date behavior

2. **Approval Settings**:
   - 2nd Approval Role dropdown
   - Options: None, Manager, Supervisor
   - Helper text explaining two-stage approval

---

## Usage Examples

### Example 1: Daily Recurring Form with Due Date
```javascript
// Admin creates a daily attendance form valid for 30 days
{
  formName: "Daily Attendance",
  submissionType: "recurring",
  frequency: "daily",
  dueDate: "2026-07-14T23:59:59Z",
  secondApprovalRole: null
}
```

### Example 2: One-Time Form with Two-Stage Approval
```javascript
// Admin creates a loan application requiring Manager and Supervisor approval
{
  formName: "Loan Application",
  submissionType: "one-time",
  frequency: null,
  dueDate: null,
  secondApprovalRole: "Manager"
}
```

### Example 3: Manager Unlocking Post-Due-Date Submission
```javascript
// Manager unlocks a submission for Supervisor review
PATCH /api/forms/submissions/507f1f77bcf86cd799439011
{
  "action": "unlock"
}
```

---

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| Due date in past | "Due date must be in the future" |
| Submission after due date | "This form has passed its due date and is no longer accepting submissions." |
| Supervisor reviewing post-due-date | "This submission is past the due date. Please request a Manager to unlock it for review." |
| Wrong second approver | "This submission requires approval from [Role] as second approver." |
| Second approver before first | "This submission requires first approval before second approval." |

---

## Testing Checklist

- [ ] Create form with one-time submission
- [ ] Create form with recurring submission (all frequencies)
- [ ] Create form with due date
- [ ] Verify form disappears for Teller/PACS after due date
- [ ] Verify submission blocked after due date
- [ ] Verify Supervisor cannot approve post-due-date submission
- [ ] Verify Manager can unlock post-due-date submission
- [ ] Verify Supervisor can approve after unlock
- [ ] Create form with two-stage approval
- [ ] Verify first approval keeps status as Pending
- [ ] Verify second approval changes status to Approved
- [ ] Verify rejection clears all approval stages
- [ ] Verify role enforcement in two-stage approval

---

## Notes

- All datetime values are stored in UTC and should be converted to user's timezone in the UI
- The recurring submission frequency is stored but not yet enforced (future enhancement)
- Admins can always see and manage all forms regardless of due date
- The unlock functionality is permanent - once unlocked, it stays unlocked
