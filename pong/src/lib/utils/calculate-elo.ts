import type { Match, Player } from '@/lib/types/api';

export const K_BASE = 32;
export const MAX_K = 48;
export const MIN_K = 16;

// Get the expected outcome of a match between two players.
function getExpectedOutcome(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate the new Elo rating for a player.
function calculateElo(
  oldRating: number,
  expectedOutcome: number,
  actualOutcome: number,
  K: number,
): number {
  return oldRating + K * (actualOutcome - expectedOutcome);
}

// Get the dynamic K-factor for a player based on recent performances.
export function getDynamicK(player: Player, allMatches: Match[]): number {
  let K = K_BASE;

  const recentMatches = allMatches
    .filter((match) => match.playerA_id === player.id || match.playerB_id === player.id)
    .sort((a, b) => Number(b.date_played) - Number(a.date_played))
    .slice(0, 10);

  for (const match of recentMatches) {
    const isPlayerA = match.playerA_id === player.id;
    const winner = isPlayerA ? match.playerB_id : match.playerA_id;

    if (match.winner_id === winner) {
      K -= 1;
    } else {
      K += 2;
    }
  }

  return Math.max(MIN_K, Math.min(MAX_K, K));
}

export function computeNewRatings(
  playerA: Player,
  playerB: Player,
  match: Match,
  allMatches: Match[],
): [number, number] {
  const K_A = getDynamicK(playerA, allMatches);
  const K_B = getDynamicK(playerB, allMatches);

  const expectedOutcomeA = getExpectedOutcome(playerA.elo, playerB.elo);
  const expectedOutcomeB = 1 - expectedOutcomeA;

  const actualOutcomeA = match.winner_id === playerA.id ? 1 : 0;
  const actualOutcomeB = 1 - actualOutcomeA;

  const newRatingA = calculateElo(playerA.elo, expectedOutcomeA, actualOutcomeA, K_A);
  const newRatingB = calculateElo(playerB.elo, expectedOutcomeB, actualOutcomeB, K_B);

  return [newRatingA, newRatingB];
}
