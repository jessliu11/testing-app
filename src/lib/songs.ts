export interface Song {
    id: string;
    title: string;
    album: string;
    year: number;
    albumColor: string;
}

export const allSongs: Song[] = [
  { id: "1", title: "All Too Well (10 Minute Version)", album: "Red (Taylor's Version)", year: 2021, albumColor: "#8B0000" },
  { id: "2", title: "Love Story", album: "Fearless", year: 2008, albumColor: "#D4AF37" },
  { id: "3", title: "Blank Space", album: "1989", year: 2014, albumColor: "#87CEEB" },
  { id: "4", title: "Anti-Hero", album: "Midnights", year: 2022, albumColor: "#1a1a2e" },
  { id: "5", title: "Cruel Summer", album: "Lover", year: 2019, albumColor: "#FFB6C1" },
  { id: "6", title: "Shake It Off", album: "1989", year: 2014, albumColor: "#87CEEB" },
  { id: "7", title: "Style", album: "1989", year: 2014, albumColor: "#87CEEB" },
  { id: "8", title: "Enchanted", album: "Speak Now", year: 2010, albumColor: "#9370DB" },
  { id: "9", title: "Cardigan", album: "Folklore", year: 2020, albumColor: "#808080" },
  { id: "10", title: "Willow", album: "Evermore", year: 2020, albumColor: "#8B4513" },
  { id: "11", title: "22", album: "Red", year: 2012, albumColor: "#8B0000" },
  { id: "12", title: "You Belong With Me", album: "Fearless", year: 2008, albumColor: "#D4AF37" },
  { id: "13", title: "Delicate", album: "Reputation", year: 2017, albumColor: "#2F4F4F" },
  { id: "14", title: "Lavender Haze", album: "Midnights", year: 2022, albumColor: "#1a1a2e" },
  { id: "15", title: "August", album: "Folklore", year: 2020, albumColor: "#808080" },
  { id: "16", title: "Champagne Problems", album: "Evermore", year: 2020, albumColor: "#8B4513" },
  { id: "17", title: "Begin Again", album: "Red", year: 2012, albumColor: "#8B0000" },
  { id: "18", title: "Getaway Car", album: "Reputation", year: 2017, albumColor: "#2F4F4F" },
  { id: "19", title: "Teardrops On My Guitar", album: "Taylor Swift", year: 2006, albumColor: "#98FB98" },
  { id: "20", title: "Out Of The Woods", album: "1989", year: 2014, albumColor: "#87CEEB" },
  { id: "21", title: "The 1", album: "Folklore", year: 2020, albumColor: "#808080" },
  { id: "22", title: "Maroon", album: "Midnights", year: 2022, albumColor: "#1a1a2e" },
  { id: "23", title: "Dear John", album: "Speak Now", year: 2010, albumColor: "#9370DB" },
  { id: "24", title: "I Knew You Were Trouble", album: "Red", year: 2012, albumColor: "#8B0000" },
  { id: "25", title: "Look What You Made Me Do", album: "Reputation", year: 2017, albumColor: "#2F4F4F" },
  { id: "26", title: "Fortnight", album: "The Tortured Poets Department", year: 2024, albumColor: "#F5F5DC" },
  { id: "27", title: "Down Bad", album: "The Tortured Poets Department", year: 2024, albumColor: "#F5F5DC" },
  { id: "28", title: "But Daddy I Love Him", album: "The Tortured Poets Department", year: 2024, albumColor: "#F5F5DC" },
  { id: "29", title: "Fresh Out the Slammer", album: "The Tortured Poets Department", year: 2024, albumColor: "#F5F5DC" },
  { id: "30", title: "I Can Do It With a Broken Heart", album: "The Tortured Poets Department", year: 2024, albumColor: "#F5F5DC" }
];

// simple seeded random function for consistent shuffling
function seededRandom(seed: number): () => number {
    return function() {
        seed = (seed * 9301 + 49497) % 233280;
        return seed / 233280;
    };
}

export function getTodaySongs(): Song[] {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const random = seededRandom(seed);

    const shuffled = [...allSongs].sort(() => random() - 0.5);
    return shuffled.slice(0,6);
}

export function getTodayKey(): string {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}