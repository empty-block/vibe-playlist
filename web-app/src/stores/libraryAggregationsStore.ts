import { createSignal, createMemo } from 'solid-js'
import type { LibraryAggregations, ArtistData, GenreData } from '../../../shared/types/library'
import { libraryApiService } from '../services/libraryApiService'
import { filters } from './libraryStore'

// State signals
const [aggregations, setAggregations] = createSignal<LibraryAggregations | null>(null)
const [isLoadingAggregations, setIsLoadingAggregations] = createSignal(false)
const [aggregationsError, setAggregationsError] = createSignal<string>('')

// Computed values
const artistsData = createMemo(() => aggregations()?.artists || [])
const genresData = createMemo(() => aggregations()?.genres || [])
const totalLibraryTracks = createMemo(() => aggregations()?.totalTracks || 0)

// Actions
const loadAggregations = async (forceRefresh = false) => {
  if (isLoadingAggregations()) return
  if (aggregations() && !forceRefresh) return

  setIsLoadingAggregations(true)
  setAggregationsError('')

  try {
    // Use empty filters for aggregations to get complete library stats
    // We want to see total counts for all artists/genres, not filtered counts
    const emptyFilters = {
      search: '',
      platform: 'all' as const,
      dateRange: 'all' as const,
      minEngagement: 0
    }
    const data = await libraryApiService.getLibraryAggregations(emptyFilters)
    setAggregations(data)
  } catch (error) {
    console.error('Failed to load aggregations:', error)
    setAggregationsError('Failed to load library statistics')
  } finally {
    setIsLoadingAggregations(false)
  }
}

export {
  // State
  aggregations,
  isLoadingAggregations,
  aggregationsError,
  
  // Computed
  artistsData,
  genresData,
  totalLibraryTracks,
  
  // Actions
  loadAggregations
}