# PlayHub API

Sistema backend desenvolvido como a base central e de controle da plataforma **PlayHub**. Sua construção é focada em entregar alta performance, segurança de nível corporativo e manutenibilidade a longo prazo.

## Tecnologias e Padrões Arquiteturais

A API adere aos princípios da **Clean Architecture**, estabelecendo uma forte separação de domínios em anéis concêntricos. Aliado a isso, fluxos de requisição e resposta são orquestrados de maneira eficiente usando o padrão **CQRS** (Command Query Responsibility Segregation) através da biblioteca MediatR.

- **Framework Web:** C# e .NET 10 (ASP.NET Core Web API).
- **Banco de Dados (Persistência Principal):** MongoDB (NoSQL) integrado nativamente. Mapeamento inteligente usando convenções em CamelCase e serializadores dinâmicos BSON para otimizar o armazenamento.
- **Padrões de Projeto Adotados:** Layered Clean Architecture, Mediator Pattern, Options Pattern e Repository Abstractions.
- **Containerização e DevOps:** Empacotamento das aplicações através do Docker, com automação dos ambientes de desenvolvimento pelo Docker Compose.

## Domínio: Entidades e Agregados

O núcleo vital de negócios contém entidades agnósticas a tecnologias, bancos de dados relacionais e frameworks web:

1. **User (Usuário)**
   - Elemento central para controle de acesso. Detém atributos críticos que seguem rígidos padrões de proteção (LGPD).
   - Utiliza campos encriptados e contém nativamente um índice de varredura opaca (Blind Indexing) sob o e-mail, gerado via HMAC-SHA256, garantindo segurança na validação de acessos paralelos sem exposição de dados pessoais nas pesquisas de banco.

2. **Court (Quadra - Root Aggregate)**
   - O núcleo gerador de receita do sistema. Agrupa informações estruturais (nome, esporte, capacidade, valor por hora).
   - Gerencia de forma nativa a integridade do seu ciclo de vida (status de operação/manutenção) impedindo lógicas inconsistentes.
   - Contém o registro de infraestrutura auxiliar através das comodidades (`CourtAmenity`).

3. **Reservation (Reserva)**
   - Base transacional do agendamento.
   - Sua validação no construtor bloqueia integralmente erros de coerência temporal (como choque de horário de término anterior ao início).
   - Controlada por um ciclo reativo de status (Pendente, Confirmada, Cancelada).

4. **Payment (Pagamento)**
   - Validador transacional embutido para auditar a confirmação financeira ligada à reserva, servindo como aprovação de negócio.

5. **SystemLog**
   - Coleção apartada voltada à observabilidade do ambiente, garantindo auditoria estruturada sobre exceções críticas e eventos sistêmicos.

## Arquitetura de Cibersegurança e Defesas

O sistema emprega conceitos rigorosos de *Hardening* em múltiplas camadas:

- **Derivação Criptográfica Avançada (Argon2):** Hashes de senhas são persistidos sob a técnica do Argon2, protegendo de forma altamente robusta contra tentativas de força bruta.
- **Criptografia Simétrica de Dados Pessoais (AES-256):** Dados sensíveis identificáveis (PII) entram no banco anonimizados através de interfaces criptográficas simétricas gerenciadas no projeto.
- **Sessões via Refresh Tokens e Cookies Seguros:** A comunicação com o frontend é ancorada em JWT, utilizando validações rigorosas em Cookies `HttpOnly` com a propriedade `SameSite=None` para inviabilizar a extração direta de tokens por scripts maliciosos.
- **Prevenção contra Sobrecarga (Rate Limiting):** Controladores sensíveis possuem defesas para impedir abusos mecanizados de login (DDoS em camada de aplicação).

## Como Executar na Instância de Desenvolvimento (Docker)

A configuração local do projeto baseia-se em provisionamento automático, eliminando a necessidade de configurar e gerenciar bancos de dados e serviços locais de forma isolada.

1. Navegue até a raiz do diretório `Api`.
2. Renomeie e preencha o arquivo protótipo de configurações: de `.env.example` para `.env`.
3. Inicie a infraestrutura através do CLI:

```bash
# Para compilar e executar todos os containers vinculados:
docker compose up --build

# Para executar o processo em segundo plano (detached mode):
docker compose up -d
```

### Links Úteis de Acesso Local

- **Documentação da API (Swagger UI):**  
  [http://localhost:5000/swagger](http://localhost:5000/swagger)

- **Inspeção Visual do MongoDB (Mongo Express):**  
  [http://localhost:8081](http://localhost:8081)

- **String de Conexão MongoDB Local (Acesso por DBeaver/Compass):**  
  `mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/playhub?authSource=admin`  
  *(Certifique-se de referenciar as credenciais configuradas no `.env`)*

## Organização de Diretórios (Separação de Camadas)

A solução C# respeita as barreiras de responsabilidade:

- **`src/PlayHub.Api/` (Delivery/Apresentação):** Foco em roteamento HTTP, middleware de restrições de acesso e injeção de dependências global.
- **`src/PlayHub.Application/` (Casos de Uso):** Carrega orquestração das requisições. Contém validadores (`FluentValidation`), contratos abstratos e DTOs mapeados.
- **`src/PlayHub.Domain/` (Núcleo de Negócio):** Sem vínculo externo. Apenas Entidades, Exceções próprias e Objetos de Valor com pura lógica e comportamento de negócio.
- **`src/PlayHub.Infrastructure/` (Provedores Externos):** Hospeda conectores do banco de dados (Contexto do MongoDB), provedores JWT e serviços dependentes de bibliotecas de terceiros.