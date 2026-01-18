import type { Song } from '@/lib/songs';
import { GripVertical, Music } from "lucide-react";

interface SongCardProps {
    song: Song;
    rank: number;
    isDragging?: boolean;
}

export function SongCard({ song, rank, isDragging }: SongCardProps) {
    return (
        <div
            className={`
                group relative flex items-center gap-4 p-4 rounded-xl
                bg-card border border-border/50
                shadow-soft hover:shadow-card transition-all duration-300
                ${isDragging ? 'scale-105 shadow-glow rotate-10' : ''}
            `}
        >
            (/* Rank Badge */)
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground"> {rank}</span>
            </div>

            {/* Album Art Placeholder */}
            <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: song.albumColor }}
            >
                <Music className="w-6 h-6 text-white/80" />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold text-foreground truncate">
                    {song.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                    {song.album} • {song.year}
                </p>
            </div>

            {/* Drag Handle */}
            <div className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-foreground" />
            </div>
        </div>
    );
}