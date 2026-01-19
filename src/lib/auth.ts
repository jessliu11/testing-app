// anonymous auth bootstrap (runs once per app load)

import { supabase } from "./supabaseClient";

export async function ensureAnonymousSession() {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        await supabase.auth.signInAnonymously()
    }
}