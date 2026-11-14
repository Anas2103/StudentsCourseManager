<?php

namespace App\Support;

class CodeGenerator
{
    /**
     * Next sequential profile code (e.g. STU-0010), based on the highest existing
     * number rather than a row count, so deletions can never cause duplicates.
     */
    public static function next(string $modelClass, string $column, string $prefix): string
    {
        $max = $modelClass::where($column, 'like', $prefix . '%')
            ->pluck($column)
            ->map(fn ($code) => (int) substr($code, strlen($prefix)))
            ->max() ?? 0;

        return $prefix . str_pad($max + 1, 4, '0', STR_PAD_LEFT);
    }
}
