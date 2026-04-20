# 🏦 CR Bank API

Um sistema bancário robusto construído em Node.js, focado em segurança, integridade de dados e comunicação em tempo real. Este projeto simula o núcleo de uma instituição financeira moderna.

## 🚀 Funcionalidades Principais

- **Gestão de Contas Automática:** Criação simultânea de usuário e conta corrente (Nested Writes).
- **Segurança de Dados:** Senhas fortemente criptografadas com Bcrypt.
- **Transações ACID:** Garantia absoluta de integridade em depósitos e transferências (Pix) utilizando `$transaction` do Prisma. O dinheiro nunca se perde.
- **Histórico Completo:** Geração de extrato bancário ordenado cronologicamente.
- **Suporte Real-time:** Canal de comunicação instantânea via WebSockets para chat de atendimento.

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js com Express e TypeScript.
- **Banco de Dados:** PostgreSQL hospedado na nuvem (Neon.tech).
- **ORM:** Prisma (versão 7+ com tipagem forte e Connection Pooling).
- **Segurança:** Bcrypt para hash de senhas.
- **Tempo Real:** Socket.io para comunicação bidirecional.

## 🛣️ Rotas da API (Endpoints)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/usuarios` | Cria um novo usuário e gera sua conta bancária. |
| `POST` | `/depositos` | Adiciona saldo a uma conta e gera o recibo. |
| `POST` | `/transferencias` | Realiza transferência entre contas de forma segura. |
| `GET` | `/contas/:numero/extrato` | Retorna o saldo atual e o histórico de transações. |

*Nota: Para o chat em tempo real, conecte um cliente WebSocket em `ws://localhost:3333` e ouça/emita os eventos `enviar_mensagem` e `nova_mensagem`.*

## ⚙️ Como Rodar o Projeto Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install