// Types for API responses

export interface DailySetItem {
  daily_set_id: string;
  set_date: string;
  category_id: string;
  item_id: string;
  item_name: string;
  item_artist: string | null;
  display_order: number;
  group_name: string | null;
  group_color_hex: string | null;
  published_date: string | null;
}

export interface GlobalRankingItem {
  item_id: string;
  item_name: string;
  item_artist: string | null;
  score: number;
  first_place_votes: number;
}

export interface Item {
  id: string;
  name: string;
  artist: string | null;
}
