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
        p_ranked_items_ids: rankedItemsIds
    })
}

export async function getGlobalRanking(dailySetId: string) {
    return supabase.rpc("get_global_ranking", {
        p_daily_set_id: dailySetId
    })
}