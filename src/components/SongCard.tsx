import { GripVertical, Music } from "lucide-react";

interface Item {
    id: string;
    name: string;
    artist: string | null;
    groupName?: string | null;
    groupColorHex?: string | null;
    publishedDate?: string | null;
}

interface SongCardProps {
    item: Item;
    rank: number;
    isDragging?: boolean;
    onDragHandleMouseDown?: (e: React.MouseEvent) => void;
    onDragHandleTouchStart?: (e: React.TouchEvent) => void;
}

export function SongCard({ item, rank, isDragging, onDragHandleMouseDown, onDragHandleTouchStart }: SongCardProps) {
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling when touching the handle
        if (onDragHandleTouchStart) {
            onDragHandleTouchStart(e);
        }
    };

    return (
        <div
            className={`
                group relative flex items-center gap-4 p-4 rounded-xl
                bg-card border border-border/50
                shadow-soft hover:shadow-card transition-all duration-300
                ${isDragging ? 'scale-105 shadow-glow' : ''}
            `}
        >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-foreground"> {rank}</span>
            </div>

            {/* Album Art Placeholder */}
            <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: item.groupColorHex || '#6b7280' }}
            >
                <Music className="w-6 h-6 text-white/80" />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-medium text-foreground truncate">
                    {item.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                    {item.groupName && item.publishedDate 
                        ? `${item.groupName} (${new Date(item.publishedDate).getFullYear()})`
                        : item.artist || 'Unknown Artist'}
                </p>
            </div>

            {/* Drag Handle */}
            <div 
                className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 -mr-2 touch-none"
                onMouseDown={onDragHandleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <GripVertical className="w-5 h-5 text-foreground" />
            </div>
        </div>
    );
}