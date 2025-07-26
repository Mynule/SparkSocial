import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function PasswordVisibilityToggle({ visible, onToggle, className = '', ...props }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                'flex items-center gap-2 rounded-full bg-neutral p-2 ml-1 transition dark:bg-neutral',
                'hover:bg-neutral-300 dark:hover:bg-neutral-700',
                className
            )}
            {...props}
        >
            {visible ? (
                <EyeOff className="h-5 w-5 text-black dark:text-white" />
            ) : (
                <Eye className="h-5 w-5 text-black dark:text-white" />
            )}
        </button>
    );
}

