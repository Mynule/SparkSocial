<?php

use Illuminate\Support\Facades\Storage;

if (!function_exists('resolveStorageUrl')) {
    /**
     * Resolves a file URL from the media object using its disk with a fallback.
     *
     * @param object|null $media
     * @return string|null
     */
    function resolveStorageUrl(?object $media): ?string
    {
        if (!$media || !isset($media->file_path)) return null;

        $defaultDisk = config('filesystems.default');
        $fallbackDisk = 'public';
        $diskToUse = $media->disk ?? $defaultDisk;
        $filePath = $media->file_path;

        try {
            if (Storage::disk($diskToUse)->exists($filePath)) {
                return Storage::disk($diskToUse)->url($filePath);
            } elseif (Storage::disk($fallbackDisk)->exists($filePath)) {
                return Storage::disk($fallbackDisk)->url($filePath);
            }
        } catch (\Exception $e) {
            try {
                if (Storage::disk($fallbackDisk)->exists($filePath)) {
                    return Storage::disk($fallbackDisk)->url($filePath);
                }
            } catch (\Exception $ex) {
                return null;
            }
        }

        return null;
    }
}
