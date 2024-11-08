
# Reciplast - Sistema de Gestão Financeira e Estoque

Este projeto é uma aplicação para a gestão financeira e de estoque de uma fábrica de sacolas plásticas, incluindo funcionalidades para controle de resíduos, transações financeiras, e estoque de materiais.

## Tecnologias Utilizadas
- **Node.js** e **Express.js**: Backend da aplicação
- **PostgreSQL**: Banco de dados para armazenamento de dados financeiros e de estoque
- **JavaScript (ES6+)**: Linguagem de programação principal

## Estrutura do Banco de Dados

### Tabela `reciplast.financeiro`
Armazena as transações financeiras da empresa, incluindo receitas e despesas.

| Coluna            | Tipo            | Descrição                                                      |
|-------------------|-----------------|----------------------------------------------------------------|
| `id`              | SERIAL          | Identificador único da transação                               |
| `tipo`            | VARCHAR(50)     | Tipo de transação (`receita` ou `despesa`)                     |
| `categoria_id`    | INT             | ID da categoria (FK para `financeiro_categoria`)               |
| `descricao`       | TEXT            | Descrição detalhada da transação                               |
| `valor`           | DECIMAL         | Valor da transação                                             |
| `data`            | TIMESTAMP       | Data e hora da transação                                       |
| `metodo_pagamento`| VARCHAR(50)     | Método de pagamento (ex.: PIX, Cartão)                         |
| `user_create`     | VARCHAR(100)    | Nome do usuário que criou o registro                           |
| `user_id`         | INT             | ID do usuário (FK para `users`)                                |
| `created_at`      | TIMESTAMP       | Data de criação                                                |
| `updated_at`      | TIMESTAMP       | Última atualização                                             |

### Tabela `reciplast.financeiro_categoria`
Define as categorias para as transações financeiras.

| Coluna         | Tipo            | Descrição                                      |
|----------------|-----------------|------------------------------------------------|
| `id`           | SERIAL          | Identificador único da categoria               |
| `categoria`    | VARCHAR(100)    | Nome da categoria                              |
| `descricao`    | TEXT            | Descrição da categoria                         |
| `user_create`  | VARCHAR(100)    | Usuário que criou a categoria                  |
| `created_at`   | TIMESTAMP       | Data de criação                                |
| `updated_at`   | TIMESTAMP       | Última atualização                             |

### Tabela `reciplast.estoque`
Controle de materiais e produtos disponíveis no estoque.

| Coluna         | Tipo            | Descrição                                      |
|----------------|-----------------|------------------------------------------------|
| `id`           | SERIAL          | Identificador único do item no estoque         |
| `material_id`  | INT             | ID do material (FK para `produtos`)            |
| `quantidade`   | DECIMAL         | Quantidade em estoque                          |
| `unidade`      | VARCHAR(50)     | Unidade de medida                              |
| `entrada`      | BOOLEAN         | Indica se é uma entrada                        |
| `saida`        | BOOLEAN         | Indica se é uma saída                          |
| `data`         | TIMESTAMP       | Data da operação                               |
| `custo_compra` | DECIMAL         | Custo de compra                                |
| `custo_venda`  | DECIMAL         | Custo de venda                                 |
| `fornecedor`   | TEXT            | Nome do fornecedor                             |
| `username`     | VARCHAR         | Usuário que registrou                          |
| `user_id`      | INT             | ID do usuário (FK para `users`)                |
| `created_at`   | TIMESTAMP       | Data de criação                                |
| `updated_at`   | TIMESTAMP       | Última atualização                             |

## Instalação e Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/reciplast
   cd reciplast
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=reciplast
   PORT=3000
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

O servidor será iniciado em `http://localhost:3000`.

## Contribuições
Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença
Este projeto é licenciado sob a licença MIT.
