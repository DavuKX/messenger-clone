<?php

namespace App\Models;

use App\Observers\MessageObserver;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


/**
 * @mixin Builder
 * @property int $id
 * @property string $message
 * @property int $sender_id
 * @property int $receiver_id
 * @property int $group_id
 * @property User $sender
 * @property User $receiver
 * @property Group $group
 * @property MessageAttachment[] $attachments
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[ObservedBy(MessageObserver::class)]
class Message extends Model
{
    use HasFactory;
    protected $fillable = [
        'message',
        'sender_id',
        'group_id',
        'receiver_id'
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }
}
