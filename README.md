# Desafio Tecnico

Este projeto é uma **aplicação fullstack moderna**, construída utilizando **Docker**.
O backend é desenvolvido com **Laravel** como **API REST**, enquanto o frontend utiliza **Vue.js 3** com **Composition API**.

---

## Tecnologias Utilizadas

### Backend

* **Framework:** Laravel 12 (API REST)
* **Banco de Dados:** MySQL 8
* **Autenticação:** Laravel Sanctum
* **Servidor Web:** Nginx

### Frontend

* **Framework:** Vue.js 3 (Composition API + TypeScript)
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS 4.1
* **HTTP Client:** Axios

### Infraestrutura

* **Containerização:** Docker & Docker Compose

---

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

* Docker
* Docker Compose
* Git

---

## Passo a Passo para Instalação (Do Zero)

Siga estes passos caso tenha acabado de clonar o projeto ou resetado os containers.

---

### 1. Configuração Inicial

Na pasta raiz do projeto, execute:

```bash
# 1. Copie o arquivo de ambiente do Laravel
cp backend/.env.example backend/.env

# 2. Suba os containers (pode demorar na primeira vez)
docker compose up -d --build
```

---

### 2. Configurando o Backend (API)

Instalação das dependências do PHP e preparação do banco de dados:

```bash
# 1. Instalar dependências do Composer
docker compose run --rm api composer install

# 2. Gerar a chave da aplicação
docker compose run --rm api php artisan key:generate

# 3. Rodar Migrations e Seeders (Cria tabelas e Usuário Admin)
docker compose run --rm api php artisan migrate:fresh --seed

# 4. (Apenas Linux) Corrigir permissões de arquivos
sudo chown -R $USER:$USER .
```

---

### 3. Configurando o Frontend (Vue)

Instalação das dependências do Node.js:

```bash
# 1. Instalar dependências dentro do container
docker compose run --rm web npm install

# 2. Reiniciar o container web para garantir o carregamento
docker compose restart web
```

---

## Acesso ao Sistema

Após concluir os passos acima, o sistema estará disponível em:

| Serviço              | URL                                            |
| -------------------- | ---------------------------------------------- |
| Frontend (Aplicação) | [http://localhost:5173](http://localhost:5173) |
| Backend (API)        | [http://localhost:8000](http://localhost:8000) |

---

## Credenciais Padrão (Admin)

Admin:
* **E-mail:** [admin@teste.com]
* **Senha:** 123456

Usuario:
* **E-mail:** [test@teste.com]
* **Senha:** 123456

Convidado:
* **E-mail:** [guest@teste.com]
* **Senha:** 123456

> ⚠️ **Importante:** Altere as credenciais em ambiente de produção.

---

## Comandos Úteis (Cheatsheet)

| Ação                      | Comando                                           |
| ------------------------- | ------------------------------------------------- |
| Parar o projeto           | `docker compose stop`                             |
| Iniciar (se já instalado) | `docker compose up -d`                            |
| Verificar status          | `docker compose ps`                               |
| Acessar terminal Laravel  | `docker compose exec api bash`                    |
| Rodar Migrations          | `docker compose run --rm api php artisan migrate` |

---

## Solução de Problemas (Troubleshooting)

### Erro: `Table 'sessions' or 'personal_access_tokens' not found`

Isso indica que o banco de dados está desatualizado ou foi resetado.

```bash
docker compose run --rm api php artisan migrate:fresh --seed
```

---

### Erro no Frontend: `Exited (1)` ou página não carrega

Geralmente ocorre quando a pasta `node_modules` está vazia ou corrompida.

```bash
docker compose run --rm web npm install
docker compose up -d web
```

---

### Erro de Permissão no VS Code (Linux)

Se não conseguir salvar arquivos ou o Laravel falhar ao escrever logs.

```bash
sudo chown -R $USER:$USER .
```

---

### Resetar tudo do zero (Atenção: apaga o banco de dados)

```bash
docker compose down --volumes --remove-orphans
```

Depois, repita todo o **passo a passo de instalação**.

---

## Autor

Desenvolvido por **Joás Magalhães**
