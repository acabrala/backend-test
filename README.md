# Projeto Backend

## Descrição

Este projeto é uma API backend construída com **NestJS** que implementa uma arquitetura limpa (Clean Architecture). O sistema está dividido em camadas bem definidas para garantir alta manutenibilidade, testabilidade e isolamento das regras de negócio.

### Estrutura das Camadas

- **Presentation:** Camada de entrada responsável pelos Controllers que recebem as requisições HTTP.
- **Application:** Camada que contém os Use Cases, responsáveis por orquestrar as operações e regras de negócio.
- **Domain:** Núcleo do sistema, com as entidades (models) e contratos (interfaces de repositórios).
- **Infrastructure:** Implementações concretas das interfaces, como repositórios que acessam o banco de dados, validações e integrações externas.

## Tecnologias

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- pnpm (gerenciador de pacotes)

---

## Requisitos

- Node.js >= 18.x
- PostgreSQL rodando localmente ou remoto
- pnpm instalado globalmente (`npm i -g pnpm`)

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com a seguinte variável:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prisma_db"
```

## Executando Projeto

pnpm run start:dev

## Documentaçao

http://localhost:3000/api
