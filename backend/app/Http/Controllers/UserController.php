<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Carrega o usuário com o perfil
        $query = User::with('profile');

        // Filtro por Nome (busca parcial)
        $query->when($request->name, function ($q) use ($request) {
            return $q->where('name', 'like', '%' . $request->name . '%');
        });

        // Filtro por CPF (busca exata)
        $query->when($request->cpf, function ($q) use ($request) {
            return $q->where('cpf', $request->cpf);
        });

        // Filtro por Data (De... Até...)
        if ($request->data_inicio && $request->data_fim) {
            $query->whereBetween('created_at', [
                $request->data_inicio . ' 00:00:00',
                $request->data_fim . ' 23:59:59'
            ]);
        }

        // Retorna ordenado pelo mais recente
        return response()->json($query->orderBy('id', 'desc')->get());
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->user()->cannot('create', User::class)) {
            return response()->json(['error' => 'Ação não autorizada.'], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'cpf' => 'required|string|unique:users,cpf',
                'profile_id' => 'required|exists:profiles,id',
                'addresses' => 'required|array',
                'addresses.*.zip' => 'required|string',
                'addresses.*.street' => 'required|string',
                'addresses.*.number' => 'nullable|string',
                'addresses.*.complement' => 'nullable|string',
                'addresses.*.neighborhood' => 'nullable|string',
                'addresses.*.city' => 'required|string',
                'addresses.*.state' => 'required|string|max:2',
                'addresses.*.country' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cpf' => $validated['cpf'],
                'profile_id' => $validated['profile_id'],
                'password' => bcrypt('senha123'),
            ]);

            // Array para coletar IDs dos endereços
            $addressIds = [];

            foreach ($validated['addresses'] as $end) {
                $endereco = Address::firstOrCreate([
                    'zip' => $end['zip'],
                    'street' => $end['street'],
                    'number' => $end['number'] ?? null,
                    'complement' => $end['complement'] ?? null,
                    'neighborhood' => $end['neighborhood'] ?? null,
                    'city' => $end['city'],
                    'state' => $end['state'],
                    'country' => $end['country'] ?? 'Brasil',
                ]);
                
                $addressIds[] = $endereco->id;
            }

            // Sync é mais seguro até no create para evitar duplicidades se rodar 2x
            $user->addresses()->sync($addressIds);

            DB::commit();

            return response()->json([
                'message' => 'Usuário criado com sucesso!',
                'user' => $user->load('addresses', 'profile')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao criar usuário: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with(['profile', 'addresses'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        \Log::info('Endereços recebidos:', $request->addresses);
        $user = User::with(['profile', 'addresses'])->findOrFail($id);

        if ($request->user()->cannot('update', $user)) {
            return response()->json(['error' => 'Ação não autorizada.'], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'cpf' => 'required|string|unique:users,cpf,' . $user->id,
                'profile_id' => 'required|exists:profiles,id',
                'addresses' => 'required|array',
                'addresses.*.zip' => 'required|string',
                'addresses.*.street' => 'required|string',
                'addresses.*.number' => 'nullable|string',
                'addresses.*.complement' => 'nullable|string',
                'addresses.*.neighborhood' => 'nullable|string',
                'addresses.*.city' => 'required|string',
                'addresses.*.state' => 'required|string|max:2',
                'addresses.*.country' => 'nullable|string',
            ]);

            DB::beginTransaction();

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cpf' => $validated['cpf'],
                'profile_id' => $validated['profile_id'],
            ]);

            // Criamos um array para guardar os IDs que devem ficar vinculados
            $addressIds = [];

            foreach ($validated['addresses'] as $end) {
                // Busca ou cria o endereço baseado nos dados
                $endereco = Address::updateOrCreate(
                ['id' => $end['id'] ?? null], 
                [
                    'zip' => $end['zip'],
                    'street' => $end['street'],
                    'number' => $end['number'] ?? null,
                    'complement' => $end['complement'] ?? null,
                    'neighborhood' => $end['neighborhood'] ?? null,
                    'city' => $end['city'],
                    'state' => $end['state'],
                    'country' => $end['country'] ?? 'Brasil',
                ]);

                // Adiciona o ID na lista
                $addressIds[] = $endereco->id;
            }

            
            // O sync remove tudo que não estiver no array $addressIds e adiciona os novos
            $user->addresses()->sync($addressIds);

            Address::doesntHave('users')->delete();

            DB::commit();

            return response()->json([
                'message' => 'Usuário atualizado com sucesso!',
                'user' => $user->load('addresses', 'profile')
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao atualizar usuário: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if (request()->user()->cannot('delete', $user)) {
            return response()->json(['error' => 'Ação não autorizada.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuário deletado com sucesso!'], 200);
    }
}