<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminPerfil = \App\Models\Profile::create(['name' => 'Admin']);
        $usuarioPerfil = \App\Models\Profile::create(['name' => 'Usuario']);
        $convidadoPerfil = \App\Models\Profile::create(['name' => 'Convidado']);

        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@teste.com',
            'password' => bcrypt('123456'),
            'cpf' => '999.999.999-99',
            'profile_id' => $adminPerfil->id,
        ]);
    }
}
