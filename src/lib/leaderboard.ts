import { getTodayKey } from './songs';
import type { Song } from './songs';

export interface RankingSubmission {
    ranking: string[]; // array of song IDs in order
    timestamp: number;
}

export interface LeaderboardEntry {
    songId: string;
    averageRank: number;
    totalVotes: number;
}

const STORAGE_KEY_PREFIX = "taylor-ranking-";
const SUBMISSIONS_KEY_PREFIX = "taylor-submissions-";

export function hasSubmittedToday(): boolean {
    const key = `${STORAGE_KEY_PREFIX}${getTodayKey()}`;
    return localStorage.getItem(key) !== null;
}

export function saveSubmission(ranking: string[]): void {
    const todayKey = getTodayKey();
    const submissionKey = `${STORAGE_KEY_PREFIX}${todayKey}`;
    const allSubmissionsKey = `${SUBMISSIONS_KEY_PREFIX}${todayKey}`;

    // Save individual submission
    localStorage.setItem(submissionKey, JSON.stringify(ranking));

    // Update submissions list
    const existingSubmissions = getAllSubmissions();
    existingSubmissions.push({ ranking, timestamp: Date.now() });
    localStorage.setItem(allSubmissionsKey, JSON.stringify(existingSubmissions));
}

export function getAllSubmissions() : RankingSubmission[] {
    const key = `${SUBMISSIONS_KEY_PREFIX}${getTodayKey()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

export function calculateLeaderboard( songs: Song[]): LeaderboardEntry[] {
    const submissions = getAllSubmissions();

    if (submissions.length === 0) {
        // return default rankings if no submissions yet
        return songs.map((song, index) => ({
            songId: song.id,
            averageRank: index + 1,
            totalVotes: 0,  
        })); 
    }

    const rankSums: Record<string, number> = {};
    const voteCounts: Record<string, number> = {};

    songs.forEach( song => {
        rankSums[song.id] = 0;
        voteCounts[song.id] = 0;
    });

    submissions.forEach(submission => {
        submission.ranking.forEach((songId, index) => {
            if (rankSums[songId] !== undefined) {
                rankSums[songId] += index + 1;
                voteCounts[songId] ++;
            }
        });
    });

    return songs 
        .map(song => ({
            songId: song.id,
            averageRank: voteCounts[song.id] > 0
                ? rankSums[song.id] / voteCounts[song.id]
                : 3.5, // neutral average if no votes
            totalVotes: voteCounts[song.id],
        }))
        .sort((a, b) => a.averageRank - b.averageRank);
}

export function getUserRanking(): string [] | null {
    const key = `${STORAGE_KEY_PREFIX}${getTodayKey()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}