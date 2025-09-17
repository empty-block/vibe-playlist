# Library Table Column Layout Fixes - Design Plan

**Date**: 2025-09-10  
**Component**: LibraryTable retro terminal design  
**Issue**: Context and When columns have text wrapping and layout issues

## Current Problems Identified

### Context Column Issues
- **Width**: 200px is too narrow for longer context text
- **Text Behavior**: Using `line-clamp-2` causing multi-line wrapping instead of single-line truncation
- **Examples**: Text like "Eddie Vedder's...", "Chris Cornell and Eddie...", "First Pearl Jam song I..." are wrapping to multiple lines

### When Column Issues
- **Text Format**: Showing full format "6 hours ago", "8 hours ago" instead of compact "6h", "8h"
- **Wrapping**: Text breaking across lines due to width constraints
- **Function**: `formatTimeAgo` needs to return consistently compact format

### Row Height Impact
- Target: Maintain compact ~24px row height
- Current: Multi-line text is increasing row heights inconsistently

## Design Solution

### 1. Context Column Fixes

**CSS Updates** (`/src/components/library/retro-table.css`):
```css
/* Context Column - Increased width for better text accommodation */
.retro-data-grid th:nth-child(4),
.retro-data-grid td:nth-child(4) {
  width: 280px;        /* Increased from 200px */
  min-width: 280px;    /* Increased from 200px */
}

/* Tablet responsive adjustment */
@media (min-width: 768px) and (max-width: 1023px) {
  .retro-data-grid th:nth-child(4),
  .retro-data-grid td:nth-child(4) {
    width: 220px;      /* Increased from 170px */
    min-width: 220px;  /* Increased from 170px */
  }
}
```

**Component Updates** (`/src/components/library/LibraryTableRow.tsx`):
- Replace `line-clamp-2` with `truncate` for single-line behavior
- Ensure consistent single-line text presentation

### 2. When Column Fixes

**Component Updates** (`/src/components/library/LibraryTableRow.tsx`):
- Update `formatTimeAgo` function to always return compact format
- Ensure consistent single-line presentation

**Updated formatTimeAgo function**:
```typescript
const formatTimeAgo = (timestamp: string) => {
  // If it's already a relative time string, ensure it's compact
  if (timestamp.includes('ago') || timestamp === 'now') {
    // Convert verbose format to compact format
    return timestamp
      .replace(' hours ago', 'h')
      .replace(' hour ago', 'h') 
      .replace(' days ago', 'd')
      .replace(' day ago', 'd')
      .replace(' weeks ago', 'w')
      .replace(' week ago', 'w')
      .replace(' months ago', 'm')
      .replace(' month ago', 'm')
      .replace(' ago', '');
  }
  
  // Parse actual timestamp and return compact format
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return timestamp;
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}m`;
};
```

### 3. CSS Text Formatting Updates

**Single-line enforcement**:
```css
/* Ensure all text content stays single-line */
.retro-grid-cell {
  white-space: nowrap;    /* Prevent text wrapping */
  overflow: hidden;       /* Hide overflow text */
  text-overflow: ellipsis; /* Show ellipsis for truncated text */
}

/* Context column specific override for tooltip functionality */
.retro-grid-cell .line-clamp-2 {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
}
```

## Implementation Steps

### Phase 1: CSS Column Width Updates
1. Update context column widths in `retro-table.css`
2. Update responsive breakpoint adjustments
3. Test on different screen sizes

### Phase 2: Text Formatting Updates  
1. Update `formatTimeAgo` function for compact format
2. Replace `line-clamp-2` with `truncate` in context cells
3. Add CSS overrides for single-line behavior

### Phase 3: Validation
1. Test with various content lengths
2. Verify row height consistency (~24px)
3. Ensure tooltip functionality still works
4. Test responsive behavior

## Expected Results

### Context Column
- ✅ Single line text with proper truncation
- ✅ Increased width accommodates more content before truncation  
- ✅ Maintains tooltip functionality for full text viewing
- ✅ No more multi-line text wrapping

### When Column
- ✅ Compact format: "6h", "8h", "2d" instead of "6 hours ago"
- ✅ Consistent single-line presentation
- ✅ Proper alignment and spacing

### Overall Table
- ✅ Consistent ~24px row height across all rows
- ✅ Clean, terminal-like appearance maintained
- ✅ Better content hierarchy and readability
- ✅ Responsive design preserved

## Design Philosophy Adherence

This solution follows core design principles:
- **Simplicity**: Single-line text creates cleaner, more scannable interface
- **Consistency**: All rows maintain uniform height and text behavior  
- **Functionality**: Tooltip system preserves access to full content
- **Hierarchy**: Better visual organization through consistent spacing
- **Responsive**: Maintains mobile-first approach with appropriate breakpoints

## Technical Notes

- Column width changes maintain golden ratio proportions where possible
- Text truncation uses CSS ellipsis for professional appearance
- Tooltip integration preserved for accessibility
- Mobile responsive adjustments included
- Performance impact minimal (CSS-only changes)

## Files to Modify

1. **`/src/components/library/retro-table.css`** - Column width and text formatting
2. **`/src/components/library/LibraryTableRow.tsx`** - Component text handling logic

## Testing Checklist

- [ ] Context column shows single-line text with ellipsis
- [ ] When column shows compact time format (6h, 2d, etc.)
- [ ] Row heights are consistent across all rows
- [ ] Tooltips work correctly for truncated content
- [ ] Mobile responsive design functions properly
- [ ] All table functionality (sorting, clicking, etc.) preserved