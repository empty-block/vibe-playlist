// Thread sorting utilities for ThreadsPage
// Implements Hot, Latest, and Top sorting algorithms

import { Thread } from '../data/mockThreads';

export type SortType = 'hot' | 'latest' | 'top';

/**
 * Sort threads based on the selected filter
 * @param threads - Array of threads to sort
 * @param sortBy - Sort type (hot, latest, or top)
 * @returns Sorted array of threads
 */
export const sortThreads = (threads: Thread[], sortBy: SortType): Thread[] => {
  const threadsCopy = [...threads]; // Don't mutate original

  switch (sortBy) {
    case 'hot':
      // Trending algorithm: (replies + likes) / time_decay
      return threadsCopy.sort((a, b) => {
        const scoreA = calculateHotScore(a);
        const scoreB = calculateHotScore(b);
        return scoreB - scoreA;
      });

    case 'latest':
      // Most recent first
      return threadsCopy.sort((a, b) => {
        const timeA = new Date(a.initialPost.timestamp).getTime();
        const timeB = new Date(b.initialPost.timestamp).getTime();
        return timeB - timeA;
      });

    case 'top':
      // Highest engagement (all-time)
      return threadsCopy.sort((a, b) => {
        const scoreA = a.likeCount + (a.replyCount * 2); // Weight replies higher
        const scoreB = b.likeCount + (b.replyCount * 2);
        return scoreB - scoreA;
      });

    default:
      return threadsCopy;
  }
};

/**
 * Calculate "hot" score using time decay algorithm
 * Based on Hacker News ranking algorithm
 * @param thread - Thread to calculate score for
 * @returns Hot score (higher = hotter)
 */
const calculateHotScore = (thread: Thread): number => {
  const engagementScore = thread.likeCount + (thread.replyCount * 2);
  const ageInHours = (Date.now() - new Date(thread.initialPost.timestamp).getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.pow(ageInHours + 2, 1.5); // Gravity formula
  return engagementScore / timeDecay;
};
