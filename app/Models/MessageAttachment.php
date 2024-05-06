<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * @mixin Builder
 * @property int $id
 * @property int $message_id
 * @property string $name
 * @property string $path
 * @property string $mime
 * @property int $size
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'name',
        'path',
        'mime',
        'size'
    ];
}
