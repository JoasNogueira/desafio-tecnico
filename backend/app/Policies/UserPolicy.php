<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // Constantes para facilitar a leitura (opcional, mas recomendado)
    const ADMIN = 1;
    const USER = 2;
    const GUEST = 3;

    /**
     * Permissão para CRIAR usuários.
     */
    public function create(User $currentUser): bool
    {
        // Convidados não criam nada.
        // Usuários comuns também não devem criar outros (geralmente).
        // Apenas Admin cria.
        return $currentUser->profile_id === self::ADMIN;
    }

    /**
     * Permissão para ATUALIZAR usuários.
     */
    public function update(User $currentUser, User $targetUser): bool
    {
        // 1. Convidado: NUNCA edita nada.
        if ($currentUser->profile_id === self::GUEST) {
            return false;
        }

        
        if ($targetUser->profile_id === self::ADMIN) {
            // ...SÓ outro Admin pode editar. Usuário comum é barrado aqui.
            return $currentUser->profile_id === self::ADMIN;
        }

        // 3. Se eu sou Admin, posso editar qualquer um
        if ($currentUser->profile_id === self::ADMIN) {
            return true;
        }

        // 4. Usuário Comum: Só edita a si mesmo.
        return $currentUser->id === $targetUser->id;
    }

    /**
     * Permissão para DELETAR usuários.
     */
    public function delete(User $currentUser, User $targetUser): bool
    {
        // 1. Convidado: NUNCA apaga.
        if ($currentUser->profile_id === self::GUEST) {
            return false;
        }

        // 2. Usuário Comum: NUNCA apaga ninguém 
        if ($currentUser->profile_id === self::USER) {
            return false; 
        }

        // 3. Admin não pode apagar outro admin
        if ($targetUser->profile_id === self::ADMIN) {
            return false;
        }

        // 4. Admin apagando User ou Guest: PERMITIDO.
        return $currentUser->profile_id === self::ADMIN;
    }
}