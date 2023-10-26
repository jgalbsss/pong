'use client';

import React, { useState } from 'react';

import supabase from '@/lib/providers/supabase';
import { Match, Player } from '@/lib/types/api';
import { computeNewRatings } from '@/lib/utils/calculate-elo';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface GameFormProps {
  players: Player[];
  matches: Match[];
}

const GameForm: React.FC<GameFormProps> = ({ players, matches }) => {
  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null);
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMatch = async () => {
    if (!selectedPlayerA || !selectedPlayerB || !selectedWinner) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select players and a winner',
      });
      return;
    }

    setIsSubmitting(true);

    const playerA = players.find((p) => p.id === selectedPlayerA);
    const playerB = players.find((p) => p.id === selectedPlayerB);

    if (!playerA || !playerB) {
      console.error('Player not found');
      return;
    }

    // Construct the new match object
    const newMatch = {
      id: Math.floor(Math.random() * 10000), // Temporary id
      playerA_id: selectedPlayerA,
      playerB_id: selectedPlayerB,
      winner_id: selectedWinner,
      date_played: new Date().toISOString(),
    };

    // Compute new ratings based on the match
    const [newRatingA, newRatingB] = computeNewRatings(playerA, playerB, newMatch, matches);

    // Upsert the new Elo ratings for both players
    try {
      const { data: updatedPlayersA, error: errorA } = await supabase
        .from('players')
        .update({ elo: newRatingA })
        .eq('id', playerA.id);

      const { data: updatedPlayersB, error: errorB } = await supabase
        .from('players')
        .update({ elo: newRatingB })
        .eq('id', playerB.id);

      if (errorA || errorB) {
        console.log('Error updating ELO', errorA, errorB);
        toast({
          variant: 'destructive',
          title: 'Error updating ELO',
          description: errorA?.message || errorB?.message,
        });
        throw errorA || errorB;
      }

      // Insert the new match if ELO ratings update was successful
      const { data, error } = await supabase.from('matches').insert(newMatch);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error adding match',
          description: error.message,
        });
        throw error;
      }

      toast({
        title: 'Match and ELO ratings updated successfully',
        description: `Player ${selectedWinner} won!`,
      });
      setSelectedPlayerA(null);
      setSelectedPlayerB(null);
      setSelectedWinner(null);
    } catch (error) {
      console.error('There was an error', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter a match</CardTitle>
        <CardDescription>Select players & result</CardDescription>
        <CardContent>
          <div className="flex justify-between py-5">
            <div className="space-y-2 text-lg">
              <div>Player A</div>
              <Select onValueChange={(value) => setSelectedPlayerA(Number(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Player A" />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((player) => player.id !== selectedPlayerB)
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-4xl font-bold">VS</div>
            <div className="space-y-2 text-lg">
              <div>Player B</div>
              <Select onValueChange={(value) => setSelectedPlayerB(Number(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Player B" />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((player) => player.id !== selectedPlayerA)
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedPlayerA && selectedPlayerB && (
            <div className="w-full space-y-2 pb-5 text-lg">
              <div>Winner</div>
              <Select onValueChange={(value) => setSelectedWinner(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={selectedPlayerA} value={selectedPlayerA.toString()}>
                    {players.find((p) => p.id === selectedPlayerA)?.name}
                  </SelectItem>
                  <SelectItem key={selectedPlayerB} value={selectedPlayerB.toString()}>
                    {players.find((p) => p.id === selectedPlayerB)?.name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => addMatch()}
            disabled={!selectedWinner || isSubmitting}
          >
            Submit
          </Button>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default GameForm;
