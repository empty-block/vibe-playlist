# Library API Optimization Notes

## Current Status: ✅ WORKING

The library sorting and aggregation implementation is **complete and functional**. All core requirements have been met:

- ✅ Accurate browse section counts from full library dataset
- ✅ Global sorting across entire library  
- ✅ Context/cast_text preserved during global operations

## Identified Limitations

### 1. Supabase Row Limit
**Issue**: Current implementation hits Supabase's default row limit at ~1000 results
- Aggregations show 1000 artists instead of full library count
- Global sorting limited to 1000 tracks maximum

### 2. Performance Concerns  
**Issue**: Global sort API responses are slower than ideal
- Multiple chunked database queries (users, casts, embeds)
- Client-side processing after fetching full dataset
- Network overhead from large result sets

## Proposed Solution: Custom PostgreSQL Function

### Benefits
- **Remove row limits**: Handle full library dataset (thousands of tracks)
- **Improve performance**: Single database roundtrip instead of multiple chunked queries
- **Server-side optimization**: Sorting and filtering at database level
- **Reduced data transfer**: Only return needed results

### Implementation Approach
Create custom PostgreSQL function that:
1. Handles sorting/filtering on full dataset server-side
2. Returns paginated results with accurate aggregations
3. Performs optimized joins in single query
4. Leverages database indexing for performance

### API Integration
The existing API structure supports easy integration:
- Modify `DatabaseService.queryLibrary()` to call custom function
- Maintain existing API contracts and response formats
- No frontend changes required

## Next Steps
1. Create custom PostgreSQL function for sorted library queries
2. Update `DatabaseService` to use custom function for global operations
3. Test performance improvements with large datasets
4. Validate aggregation accuracy with full library

---

**Note**: Current implementation provides excellent foundation and proof-of-concept. Custom function will be the performance optimization layer.