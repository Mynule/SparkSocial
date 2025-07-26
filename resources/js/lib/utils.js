import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getProfileImageUrl(user) {
    if ( user?.profile_image?.disk === 'public') {
        return user.profile_image?.url;
    } else if (user?.profile_image?.file_path) {
        return `/storage/${user.profile_image?.file_path}`;
    }
    return null;
};

export function getCoverImageUrl (user) {
    if (user?.cover_image?.disk === 'public') {
        return user.cover_image.url;
    } else if (user?.cover_image?.file_path) {
        return `/storage/${user.cover_image.file_path}`;
    }
    return null;
};

export function getMediaUrl(file){
    if (file?.disk === 'public') {
        return file.url;
    } else if (file?.file_path) {
        return `/storage/${file.file_path}`;
    }
    return null;
};

