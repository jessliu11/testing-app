// RPC wrapper functions

import { supabase } from "./supabaseClient";

export async function getDailySet(categorySlug: string) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

    return supabase.rpc('get_daily_set', {
        category_slug: categorySlug,
        tz
    })
}

export async function submitRanking(
    dailySetId: string,
    rankedItemsIds: string[]
) {
    return supabase.rpc("submit_ranking", {
        p_daily_set_id: dailySetId,
        p_ranked_item_ids: rankedItemsIds
    })
}

export async function getGlobalRanking(dailySetId: string) {
    return supabase.rpc("get_global_ranking", {
        p_daily_set_id: dailySetId
    })
}

export async function getComments(dailySetId: string) {
    return supabase
        .from('comments')
        .select('id, user_id, display_name, top_pick, body, created_at')
        .eq('daily_set_id', dailySetId)
        .order('created_at', { ascending: false });
}

export async function submitComment(
    dailySetId: string,
    userId: string,
    displayName: string,
    body: string,
    topPick: string | null
) {
    return supabase
        .from('comments')
        .insert({ daily_set_id: dailySetId, user_id: userId, display_name: displayName, top_pick: topPick, body: body.trim() })
        .select('id, user_id, display_name, top_pick, body, created_at')
        .single();
}