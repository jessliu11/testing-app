// Types for API responses

export interface DailySetItem {
  daily_set_id: string;
  set_date: string;
  category_id: string;
  item_id: string;
  item_name: string;
  item_artist: string | null;
  display_order: number;
}

export interface GlobalRankingItem {
  item_id: string;
  item_name: string;
  item_artist: string | null;
  score: number;
}

export interface Item {
  id: string;
  name: string;
  artist: string | null;
}
