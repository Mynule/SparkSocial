<?php

namespace App\Services;

use Exception;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    protected Filesystem $disk;

    protected string $diskName;

    public function __construct(string $diskName)
    {
        $this->disk = Storage::disk($diskName);
        $this->diskName = $diskName;
    }

    public function getDiskName(): string
    {
        return $this->diskName;
    }

    public function store(File|UploadedFile|string $file): array
    {
        $now = now();
        $path = sprintf('%s/%s', $now->format('Y'), $now->format('m'));
        try {
            $result = $this->disk->putFile($path, $file);
        } catch (Exception $e) {
            $previous = $e;
            $result = false;
        }

        if ($result === false) {
            throw new Exception('Unable to store the file', 0, $previous ?? null);
        }

        return [$this->diskName, $result];
    }
}
