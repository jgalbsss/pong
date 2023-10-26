export type Match = {
  id: number;
  playerA_id: number;
  playerB_id: number;
  date_played: string;
  winner_id: number;
};

export type Player = {
  id: number;
  name: string;
  elo: number;
  last_date_played: string;
  joined_date: string;
};

export type RatingHistory = {
  id: number;
  player_id: number;
  match_id: number;
  elo: number;
  date_recorded: string;
};
