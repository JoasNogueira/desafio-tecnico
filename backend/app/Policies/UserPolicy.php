<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determina se o usuário pode visualizar qualquer modelo.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode visualizar o modelo.
     */
    public function view(User $user, User $model): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode criar modelos.
     */
    public function create(User $user): bool
    {
        return $user->perfil_id === 1 || $user->perfil_id === 2;
    }

    /**
     * Determina se o usuário pode atualizar o model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->perfil_id === 1 || $user->perfil_id === 2;
    }

    /**
     * Determina se o usuário pode excluir o model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->perfil_id === 1;
    }
}
