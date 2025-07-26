import { Check } from 'lucide-react';
import { useInitials } from '../hooks/use-initials';
import { getProfileImageUrl } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// const getProfileImageUrl = (user) => {
//     const url = user?.profile_image;
//     if (!url) return null;
//     if (url.startsWith('http://') || url.startsWith('https://')) {
//         return url;
//     }
//     return `/storage/${url}`;
// };
// const getProfileImageUrl = (user) => {
//     if (user?.profile_image?.disk === 's3') {
//         return user.profile_image?.url;
//     } else if (user?.profile_image?.file_path) {
//         return `/storage/${user.profile_image?.file_path}`;
//     }
//     return null;
// };
export function UserInfo({ user, showEmail = false }) {
    const getInitials = useInitials();
    return (
        <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                <AvatarImage src={getProfileImageUrl(user)} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gray-200 text-black dark:bg-gray-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left leading-tight">
                <div className="flex min-w-0 items-center gap-1">
                    <span className="max-w-full truncate text-[14.5px] text-gray-700 dark:text-neutral-300">@{user.username}</span>
                    {user.is_verified && (
                        <span className="flex flex-shrink-0 items-center rounded-lg bg-blue-500 p-0.5 text-xs font-medium text-white">
                            <Check className="h-3 w-3" />
                        </span>
                    )}
                </div>
                <span className="max-w-full truncate text-lg font-extrabold">{user.name}</span>
            </div>
        </div>
    );
}
