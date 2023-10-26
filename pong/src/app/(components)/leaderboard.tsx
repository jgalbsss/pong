import { type FC, useMemo } from 'react';

import type { Match, Player } from '@/lib/types/api';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LeaderboardProps = {
  players: Player[];
  matches: Match[];
};

type PlayerRecord = {
  wins: number;
  losses: number;
};

export const Leaderboard: FC<LeaderboardProps> = ({ players, matches }) => {
  const playerRecords: Record<number, PlayerRecord> = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        const winnerId = match.winner_id;
        const loserId = winnerId === match.playerA_id ? match.playerB_id : match.playerA_id;

        acc[winnerId] = acc[winnerId] || { wins: 0, losses: 0 };
        acc[loserId] = acc[loserId] || { wins: 0, losses: 0 };

        acc[winnerId].wins++;
        acc[loserId].losses++;

        return acc;
      },
      {} as Record<number, PlayerRecord>,
    );
  }, [matches]);

  // Sort players by ELO in descending order
  const rankedPlayers = [...players].sort((a, b) => b.elo - a.elo);

  return (
    <Table>
      <TableCaption>Ping Pong Leaderboard</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Rank</TableHead>
          <TableHead>Player Name</TableHead>
          <TableHead>ELO Rating</TableHead>
          <TableHead className="text-right">Win - Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankedPlayers.map((player, index) => (
          <TableRow key={player.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{player.name}</TableCell>
            <TableCell>{Math.round(player.elo)}</TableCell>
            <TableCell className="text-right">
              {playerRecords[player.id]?.wins || 0} - {playerRecords[player.id]?.losses || 0}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
