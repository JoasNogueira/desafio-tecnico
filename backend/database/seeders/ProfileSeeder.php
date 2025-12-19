<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria alguns perfis de exemplo
        \App\Models\Profile::create(['name' => 'Admin']);
        \App\Models\Profile::create(['name' => 'Usuario']);
        \App\Models\Profile::create(['name' => 'Convidado']);
    }
}
