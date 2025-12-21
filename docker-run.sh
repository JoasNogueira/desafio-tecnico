#!/bin/bash

# Interrompe a execução se qualquer comando falhar
set -e

echo "[INFO] Iniciando configuração do ambiente..."

# 1. Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] O Docker não está em execução. Inicie o serviço e tente novamente."
    exit 1
fi

# 2. Configuração de Variáveis de Ambiente
if [ ! -f backend/.env ]; then
    echo "[INFO] Configurando arquivo .env do backend..."
    cp backend/.env.example backend/.env
    
    # Muda de 127.0.0.1 para db (nome do serviço no docker network)
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=db/g' backend/.env
    
fi

# 3. Build e Start dos Containers
echo "[INFO] Construindo e iniciando containers..."
docker compose up -d --build

# 4. Configuração do Backend (Laravel)
echo "[INFO] Instalando dependências do Backend..."
docker compose run --rm api composer install --no-interaction --prefer-dist

echo "[INFO] Configurando chave de criptografia..."
docker compose run --rm api php artisan key:generate

# Espera inteligente pelo MySQL
echo "[INFO] Aguardando o MySQL inicializar..."
# O sleep inicial garante que o processo começou a subir
sleep 5 
until docker compose exec db mysqladmin ping -h"localhost" --silent; do
    echo "Aguardando banco de dados..."
    sleep 2
done

echo "[INFO] Banco de dados conectado! Aguardando estabilização..."
# Pequena pausa extra para garantir que a porta TCP esteja acessível externamente
sleep 3

echo "[INFO] Executando migrações e seeders..."
docker compose run --rm api php artisan migrate:fresh --seed

# 5. Configuração do Frontend (Vue)
echo "[INFO] Instalando dependências do Frontend..."
docker compose run --rm web npm install

# 6. Reinicialização para aplicar configurações
echo "[INFO] Reiniciando serviço web..."
docker compose restart web


echo "-------------------------------------------------------"
echo "Ambiente configurado com sucesso."
echo ""
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:8000"
echo "-------------------------------------------------------"