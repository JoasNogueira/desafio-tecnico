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
        try {
            // Validação dos Dados
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
                'password' => bcrypt('senha123'), // Senha padrão para o teste
            ]);

            // Processa os Endereços
            foreach ($validated['addresses'] as $end) {
                // firstOrCreate: Tenta achar o endereço pelo dados preenchidos.
                // Se achar, usa o ID existente. Se não, cria um novo.
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

                // Vincula o endereço ao usuário na tabela pivô (address_user)
                $user->addresses()->attach($endereco->id);
            }

            DB::commit();

            return response()->json([
                'message' => 'Usuário criado com sucesso!',
                'user' => $user->load('addresses', 'profile')
            ], 201);

        } catch (\Exception $e) {
            // Se der erro, desfaz tudo
            DB::rollBack();
            return response()->json(['error' => 'Erro ao criar usuário: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // findOrFail retorna erro 404 se não achar o ID
        $user = User::with(['profile', 'addresses'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // findOrFail retorna erro 404 se não achar o ID
        $user = User::with(['profile', 'addresses'])->findOrFail($id);

        try {
            // Validação dos Dados
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

            // Atualiza os dados do usuário
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cpf' => $validated['cpf'],
                'profile_id' => $validated['profile_id'],
            ]);

            // Processa os Endereços
            foreach ($validated['addresses'] as $end) {
                // firstOrCreate: Tenta achar o endereço pelo dados preenchidos.
                // Se achar, usa o ID existente. Se não, cria um novo.
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

                // Vincula o endereço ao usuário na tabela pivô (address_user)
                $user->addresses()->attach($endereco->id);
            }

            DB::commit();

            return response()->json([
                'message' => 'Usuário atualizado com sucesso!',
                'user' => $user->load('addresses', 'profile')
            ], 200);
        } catch (\Exception $e) {
            // Se der erro, desfaz tudo
            DB::rollBack();
            return response()->json(['error' => 'Erro ao atualizar usuário: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Retorna erro 404 se não achar o ID
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuário deletado com sucesso!'], 200);
    }
}
