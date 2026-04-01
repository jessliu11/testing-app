import { useState } from 'react';
import { MessageCircle, Send, User, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { submitComment } from '@/lib/api';
import type { Comment } from '@/lib/types';

const DISPLAY_NAME_KEY = 'rankie_display_name';

interface CommentsProps {
    dailySetId: string;
    currentUserId: string;
    topPick: string | null;
    comments: Comment[];
    onCommentAdded: (comment: Comment) => void;
}

export function Comments({ dailySetId, currentUserId, topPick, comments, onCommentAdded }: CommentsProps) {
    const [displayName, setDisplayName] = useState(() => localStorage.getItem(DISPLAY_NAME_KEY) ?? '');
    const [nameInput, setNameInput] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasName = displayName.trim().length > 0;

    const handleSaveName = () => {
        const trimmed = nameInput.trim();
        if (!trimmed) return;
        localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
        setDisplayName(trimmed);
        setNameInput('');
    };

    const handleSubmit = async () => {
        if (!body.trim() || !hasName || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        const { data, error: apiError } = await submitComment(dailySetId, currentUserId, displayName, body, topPick);

        if (apiError || !data) {
            console.error('Comment submit error:', apiError);
            setError('Failed to post comment. Please try again.');
        } else {
            onCommentAdded(data as Comment);
            setBody('');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-8 border-t border-border pt-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Comments</h2>
                {comments.length > 0 && (
                    <span className="text-sm text-muted-foreground">({comments.length})</span>
                )}
            </div>

            {/* Name prompt (first-time only) */}
            {!hasName && (
                <div className="rounded-xl border border-border bg-muted/60 p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                        What should we call you?
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            placeholder="Your name"
                            maxLength={32}
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button size="sm" onClick={handleSaveName} disabled={!nameInput.trim()}>
                            Set name
                        </Button>
                    </div>
                </div>
            )}

            {/* Comment form (only shown once name is set) */}
            {hasName && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Commenting as <span className="font-medium text-foreground">{displayName}</span></span>
                        <button
                            onClick={() => { setDisplayName(''); localStorage.removeItem(DISPLAY_NAME_KEY); }}
                            className="ml-1 underline hover:text-foreground transition-colors"
                        >
                            Change
                        </button>
                    </div>
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Share your thoughts on today's ranking..."
                            maxLength={280}
                            rows={2}
                            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!body.trim() || isSubmitting}
                            className="h-10 w-10 shrink-0 p-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            )}

            {/* Comment list */}
            {comments.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/60 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="rounded-xl border border-border bg-card p-3.5 space-y-1 animate-fade-in shadow-soft"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-semibold">{comment.display_name}</span>
                                    {comment.top_pick && (
                                        <div className="flex items-center gap-1">
                                            <Trophy className="h-3 w-3 text-gold" />
                                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{comment.top_pick}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{comment.body}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
