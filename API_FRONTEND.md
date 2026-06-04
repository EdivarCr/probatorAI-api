# Documentação de API para Frontend

Este documento descreve todos os endpoints atualmente expostos pela API, com exemplos completos de requisição e resposta para facilitar a integração no frontend.

## Visão geral

- Framework: NestJS
- Sem prefixo global de rota (ex.: não usa `/api`)
- CORS habilitado globalmente
- Autenticação por JWT Bearer nas rotas não públicas
- Controle de acesso por papel (`admin` e `professor`) em endpoints específicos

## Base URL

Defina conforme o ambiente (local, staging, produção), por exemplo:

```txt
http://localhost:3000
```

## Autenticação e autorização

### Header padrão para rotas protegidas

```http
Authorization: Bearer <access_token>
```

### Comportamento de acesso

- Rotas com `@Public()` não exigem token
- Rotas sem `@Public()` exigem token JWT válido
- Algumas rotas exigem papel específico:
  - `admin`
  - `professor`

### Estrutura do payload de usuário no token (usado em `/user/me`)

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@email.com",
  "role": "admin"
}
```

## Padrão de erros

As respostas de erro do NestJS normalmente seguem este formato:

```json
{
  "statusCode": 401,
  "message": "Mensagem de erro",
  "error": "Unauthorized"
}
```

> Observação: em alguns cenários o campo `message` pode variar para array de mensagens ou string simples.

---

## Endpoints

## 1) Health Check

### GET `/health`

- Auth: pública
- Role: não exige
- Objetivo: verificar se a API está online

#### Request

- Body: não possui
- Params: não possui
- Query: não possui
- Headers: não obrigatórios

#### Response 200 (sucesso)

```json
{
  "status": "ok",
  "message": "A API está no ar e pronta para receber requisições!",
  "timestamp": "2026-05-06T16:15:00.000Z",
  "environment": "development"
}
```

---

## 2) Auth

### POST `/auth/login`

- Auth: pública
- Role: não exige
- Objetivo: autenticar usuário e retornar token JWT

#### Request

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "email": "professor@escola.com",
  "password": "123456"
}
```

#### Regras de validação de body

- `email`: obrigatório, formato de email válido
- `password`: obrigatório, string com no mínimo 6 caracteres

#### Response 201/200 (sucesso)

```json
{
  "access_token": "jwt_token_aqui"
}
```

#### Responses de erro

- 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "email e password são obrigatórios",
  "error": "Bad Request"
}
```

- 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

---

## 3) Usuários

## 3.1) Criar usuário

### POST `/user`

- Auth: pública
- Role: não exige
- Objetivo: cadastrar usuário (professor por padrão)

#### Request

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "name": "Professor João",
  "email": "joao@escola.com",
  "password": "123456",
  "materiaId": "uuid-da-materia"
}
```

#### Regras de validação de body

- `name`: obrigatório, string não vazia
- `email`: obrigatório, email válido
- `password`: obrigatório, string com no mínimo 6 caracteres
- `materiaId`: obrigatório, string

#### Response 201/200 (sucesso)

```json
{
  "id": "uuid-do-usuario",
  "name": "Professor João",
  "email": "joao@escola.com",
  "createdAt": "2026-05-06T16:20:00.000Z",
  "materias": [
    {
      "id": "uuid-da-materia",
      "name": "Matemática",
      "description": "Conteúdos de álgebra e geometria"
    }
  ]
}
```

#### Responses de erro

- 404 Not Found (matéria não encontrada)

```json
{
  "statusCode": 404,
  "message": "Matéria não encontrada",
  "error": "Not Found"
}
```

- 409 Conflict (email já existe)

```json
{
  "statusCode": 409,
  "message": "Email ja existe",
  "error": "Conflict"
}
```

- 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Erro ao criar usuário",
  "error": "Internal Server Error"
}
```

---

## 3.2) Listar todos os usuários (admin)

### GET `/user/all`

- Auth: obrigatória
- Role: `admin`

#### Request

Headers:

```http
Authorization: Bearer <access_token_admin>
```

#### Response 200 (sucesso)

```json
[
  {
    "id": "uuid-1",
    "email": "admin@escola.com",
    "name": "Administrador",
    "password": "$2b$10$hash...",
    "role": "admin",
    "materias": [],
    "createdAt": "2026-05-01T10:00:00.000Z",
    "updatedAt": "2026-05-01T10:00:00.000Z"
  }
]
```

> Observação: este endpoint retorna também o campo `password` hash, pois o `findMany` atual não filtra campos.

#### Responses de erro

- 401 Unauthorized (sem token/token inválido)
- 403 Forbidden (token válido sem role `admin`)

---

## 3.3) Buscar usuário por ID (admin)

### GET `/user/:id`

- Auth: obrigatória
- Role: `admin`

#### Request

Params:

```txt
id: string (uuid)
```

Headers:

```http
Authorization: Bearer <access_token_admin>
```

#### Response 200 (sucesso)

```json
{
  "id": "uuid-do-usuario",
  "name": "Professor João",
  "email": "joao@escola.com",
  "createdAt": "2026-05-06T16:20:00.000Z",
  "materias": [
    {
      "id": "uuid-da-materia",
      "name": "Matemática",
      "description": "Conteúdos de álgebra e geometria"
    }
  ]
}
```

#### Responses de erro

- 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Usuário nao encontrado",
  "error": "Not Found"
}
```

---

## 3.4) Atualizar usuário por ID (admin)

### PUT `/user/:id`

- Auth: obrigatória
- Role: `admin`

#### Request

Params:

```txt
id: string (uuid)
```

Headers:

```http
Authorization: Bearer <access_token_admin>
Content-Type: application/json
```

Body (todos os campos opcionais):

```json
{
  "name": "Novo Nome",
  "email": "novo-email@escola.com",
  "password": "novaSenha123",
  "materia": "uuid-ou-valor-da-materia"
}
```

#### Regras de validação de body

- `name`: opcional, string, mínimo 3 caracteres
- `email`: opcional, email válido
- `password`: opcional, string, mínimo 6 caracteres
- `materia`: opcional, string

#### Response 200 (sucesso)

```json
{
  "id": "uuid-do-usuario",
  "name": "Novo Nome",
  "email": "novo-email@escola.com",
  "updatedAt": "2026-05-06T16:30:00.000Z",
  "materias": [
    {
      "id": "uuid-da-materia",
      "name": "Matemática",
      "description": "Conteúdos de álgebra e geometria"
    }
  ]
}
```

#### Responses de erro

- 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Usuário nao encontrado",
  "error": "Not Found"
}
```

---

## 3.5) Perfil do usuário logado (professor)

### GET `/user/me`

- Auth: obrigatória
- Role: `professor`

#### Request

Headers:

```http
Authorization: Bearer <access_token_professor>
```

#### Response 200 (sucesso)

```json
{
  "sub": "uuid-do-usuario",
  "email": "joao@escola.com",
  "role": "professor"
}
```

#### Responses de erro

- 401 Unauthorized
- 403 Forbidden (quando role não for `professor`)

---

## 3.6) Atualizar usuário logado (professor)

### PUT `/user/me`

- Auth: obrigatória
- Role: `professor`

#### Request

Headers:

```http
Authorization: Bearer <access_token_professor>
Content-Type: application/json
```

Body (todos os campos opcionais):

```json
{
  "name": "Professor João Silva",
  "email": "joaosilva@escola.com",
  "password": "senhaNova123",
  "materia": "uuid-ou-valor-da-materia"
}
```

#### Response 200 (sucesso)

```json
{
  "id": "uuid-do-usuario-logado",
  "name": "Professor João Silva",
  "email": "joaosilva@escola.com",
  "updatedAt": "2026-05-06T16:40:00.000Z",
  "materias": [
    {
      "id": "uuid-da-materia",
      "name": "Matemática",
      "description": "Conteúdos de álgebra e geometria"
    }
  ]
}
```

#### Responses de erro

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

## 3.7) Excluir usuário logado (professor)

### DELETE `/user/me`

- Auth: obrigatória
- Role: `professor`

#### Request

Headers:

```http
Authorization: Bearer <access_token_professor>
```

#### Response 200 (sucesso)

```json
{
  "message": "deletade com sucesso "
}
```

#### Responses de erro

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

## 3.8) Excluir usuário por ID (admin)

### DELETE `/user/:id`

- Auth: obrigatória
- Role: `admin`

#### Request

Params:

```txt
id: string (uuid)
```

Headers:

```http
Authorization: Bearer <access_token_admin>
```

#### Response 200 (sucesso)

```json
{
  "message": "deletade com sucesso "
}
```

#### Responses de erro

- 404 Not Found

```json
{
  "statusCode": 404,
  "message": "usuario nao encontrado",
  "error": "Not Found"
}
```

---

## 4) Matérias

## 4.1) Listar matérias

### GET `/materias/all`

- Auth: pública
- Role: não exige

#### Request

- Body: não possui
- Params: não possui
- Query: não possui
- Headers: não obrigatórios

#### Response 200 (sucesso)

```json
[
  {
    "id": "uuid-da-materia",
    "name": "Matemática",
    "description": "Conteúdos de álgebra e geometria"
  }
]
```

---

## 4.2) Buscar matéria por ID

### GET `/materias/:id`

- Auth: pública
- Role: não exige

#### Request

Params:

```txt
id: string (uuid)
```

#### Response 200 (sucesso)

```json
{
  "id": "uuid-da-materia",
  "name": "Matemática",
  "description": "Conteúdos de álgebra e geometria"
}
```

#### Responses de erro

- 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Matéria não encontrada",
  "error": "Not Found"
}
```

- 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Erro ao buscar a matéria no banco de dados",
  "error": "Internal Server Error"
}
```

---

## Modelos úteis para tipagem no frontend (TypeScript)

```ts
export type Role = 'admin' | 'professor' | string;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface Materia {
  id: string;
  name: string;
  description: string | null;
}

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
}

export interface UserMePayload {
  sub: string;
  email: string;
  role: Role;
}
```

## Observações importantes para implementação no frontend

- Salve o `access_token` após login e envie no header `Authorization` para rotas protegidas.
- Trate `401` como sessão inválida/expirada (fazer logout).
- Trate `403` como falta de permissão por perfil.
- Para telas administrativas, usar token de usuário com role `admin`.
- Para rotas `/user/me*`, usar token de usuário com role `professor`.
- O backend atualmente não expõe paginação/filtro em listagens.

