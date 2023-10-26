import { useEffect, useState } from 'react';

import GameForm from '@/app/(components)/game-form';
import { Leaderboard } from '@/app/(components)/leaderboard';

import supabase from '@/lib/providers/supabase';
import type { Match, Player } from '@/lib/types/api';

export const revalidate = 10;
export default async function Home() {
  const { data: players } = await supabase.from('players').select('*').returns<Player[]>();
  const { data: matches } = await supabase.from('matches').select('*').returns<Match[]>();

  return (
    <main className="mx-auto w-[750px] justify-center space-y-12">
      <GameForm matches={matches || []} players={players || []} />
      <Leaderboard players={players || []} matches={matches || []} />
    </main>
  );
}
