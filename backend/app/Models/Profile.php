<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $table = 'profiles';

    protected $fillable = ['name'];

    // Relacionamento 1:N (Um perfil tem muitos usuários)
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
