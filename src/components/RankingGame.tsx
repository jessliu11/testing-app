import { useState, useCallback, useRef } from 'react';
import { SongCard } from './SongCard';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from 'lucide-react';

interface Item {
    id: string;
    name: string;
    artist: string | null;
}

interface RankingGameProps {
    items: Item[]; 
    onSubmit: (ranking: string[]) => void;
}

export function RankingGame({ items, onSubmit }: RankingGameProps) {
    const [rankedItems, setRankedItems] = useState<Item[]>(items); 
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const currentTouchIndex = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        // Allow drag from anywhere on desktop
        e.dataTransfer.effectAllowed = 'move';
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...rankedItems];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setRankedItems(newItems);
        setDraggedIndex(index);
    };
    
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Touch handlers for mobile
    const handleDragHandleTouchStart = (e: React.TouchEvent, index: number) => {
        // Already prevented in SongCard, but ensure no propagation
        touchStartY.current = e.touches[0].clientY;
        currentTouchIndex.current = index;
        setDraggedIndex(index);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartY.current === null || currentTouchIndex.current === null) return;
        
        // Prevent scrolling during drag
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY.current;
        
        // Determine if we should swap based on movement
        if (Math.abs(deltaY) > 50) { // 50px threshold
            const currentIndex = currentTouchIndex.current;
            let targetIndex = currentIndex;
            
            if (deltaY > 0 && currentIndex < rankedItems.length - 1) {
                targetIndex = currentIndex + 1;
            } else if (deltaY < 0 && currentIndex > 0) {
                targetIndex = currentIndex - 1;
            }
            
            if (targetIndex !== currentIndex) {
                const newItems = [...rankedItems];
                const [draggedItem] = newItems.splice(currentIndex, 1);
                newItems.splice(targetIndex, 0, draggedItem);
                setRankedItems(newItems);
                currentTouchIndex.current = targetIndex;
                touchStartY.current = touchY;
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartY.current = null;
        currentTouchIndex.current = null;
        setDraggedIndex(null);
    };

    const handleSubmit = useCallback(() => {
        onSubmit(rankedItems.map(s => s.id));
    }, [rankedItems, onSubmit]);
    
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <p className="text-muted-foreground font-body">
                    Drag to reorder from <span className="text-gold font-medium">favorite</span> to least favorite
                </p>
            </div>

            <div 
                className="space-y-3 select-none"
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {rankedItems.map((item, index) => ( 
                    <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="animate-fade-in select-none"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <SongCard 
                            item={item}
                            rank={index + 1}
                            isDragging={draggedIndex === index}
                            onDragHandleTouchStart={(e) => handleDragHandleTouchStart(e, index)}
                        />
                    </div>
                ))}
            </div>

            <div className="pt-4">
                <Button 
                    onClick={handleSubmit}
                    className="w-full h-14 text-lg font-display font-semibold bg-gradient-gold hover:opacity-90 transition-opacity shadow-glow"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Submit My Ranking
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}
 