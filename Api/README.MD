# PlayHub API

Sistema backend desenvolvido como a base central e de controle da plataforma **PlayHub**. Sua construção é focada em entregar alta performance, segurança de nível corporativo e manutenibilidade a longo prazo.

## Tecnologias e Padrões Arquiteturais

A API adere aos princípios da **Clean Architecture**, estabelecendo uma forte separação de domínios em anéis concêntricos. Aliado a isso, fluxos de requisição e resposta são orquestrados de maneira eficiente usando o padrão **CQRS** (Command Query Responsibility Segregation) através da biblioteca MediatR.

- **Framework Web:** C# e .NET 10 (ASP.NET Core Web API).
- **Banco de Dados:** MongoDB (NoSQL) integrado nativamente com mapeamento inteligente e serializadores dinâmicos BSON.
- **Logging Estruturado:** **Serilog** configurado com *Sinks* para Console, MongoDB e **Seq**.
- **Observabilidade:** Integração nativa com **Seq** para análise de logs em tempo real e monitoramento de performance.
- **Diagnóstico e Saúde:** **ASP.NET Core Health Checks** para monitoramento proativo de dependências (MongoDB, Seq, etc).
- **Padrões de Resposta:** Padronização de erros via **RFC 7807 (Problem Details)**, garantindo respostas de erro semânticas e consistentes.

## Domínio: Entidades e Agregados

O núcleo vital de negócios contém entidades agnósticas a tecnologias:

1. **User (Usuário)**
   - Elemento central para controle de acesso. Detém atributos críticos que seguem rígidos padrões de proteção (LGPD).
   - Utiliza campos encriptados e contém nativamente um índice de varredura opaca (Blind Indexing).
2. **Court (Quadra)**
   - O núcleo gerador de receita. Gerencia integridade do ciclo de vida e comodidades (`CourtAmenity`).
3. **Reservation (Reserva)**
   - Base transacional com validações de coerência temporal e ciclo de status reativo.
4. **Payment (Pagamento)**
   - Validador financeiro para auditoria de confirmações ligadas às reservas.
5. **SystemLog**
   - Auditoria estruturada sobre eventos sistêmicos e exceções críticas.

## Observabilidade e Robustez

### Logging Estruturado com Serilog
A API utiliza o **Serilog** para garantir que cada evento seja uma fonte de dados rica e filtrável:
- **Enriquecimento Dinâmico:** Logs incluem `CorrelationId`, `MachineName`, e metadados de requisição.
- **PII Masking:** Políticas de segurança automáticas mascaram dados sensíveis (como e-mails e senhas) antes da persistência, garantindo conformidade com a LGPD.
- **Múltiplos Sinks:** Sincronização em tempo real com o console de desenvolvimento, auditoria no MongoDB e telemetria avançada no **Seq**.

### Tratamento de Erros e Validação
- **RFC 7807 (Problem Details):** Todas as falhas seguem o padrão internacional de mensagens de erro, facilitando a integração com o frontend.
- **FluentValidation:** Validação "Fail-Fast" acoplada ao pipeline do MediatR, impedindo que dados inconsistentes atinjam a camada de domínio.

## Como Executar na Instância de Desenvolvimento (Docker)

A configuração local do projeto baseia-se em provisionamento automático, eliminando a necessidade de configurar e gerenciar bancos de dados e serviços locais de forma isolada.

1. Navegue até a raiz do diretório `Api`.
2. Configure os arquivos de parametrização:
   - **Variáveis de Ambiente:** Renomeie `.env.example` para `.env`.
   - **Configurações da Aplicação:** Em `src/PlayHub.Api/`, renomeie `appsettings.example.json` para `appsettings.json`.

3. Inicie a infraestrutura:
```bash
# Para compilar e executar todos os containers vinculados:
docker compose up --build

# Para executar o processo em segundo plano (detached mode):
docker compose up -d
```

### Links Úteis de Acesso Local

- **Documentação (Swagger UI):** [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **Painel de Logs (Seq):** [http://localhost:8082](http://localhost:8082)
- **Saúde do Sistema (Health Checks):** [http://localhost:5000/health](http://localhost:5000/health)
- **Inspeção de Dados (Mongo Express):** [http://localhost:8081](http://localhost:8081)
- **String de Conexão MongoDB Local (Acesso por DBeaver/Compass):**  
  `mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/playhub?authSource=admin`  
  *(Certifique-se de referenciar as credenciais configuradas no `.env`)*

## Organização de Diretórios

- **`src/PlayHub.Api/` (Apresentação):** Roteamento HTTP, Middlewares (Error Handling, Auth, Serilog) e Injeção de Dependência.
- **`src/PlayHub.Application/` (Casos de Uso):** Orquestração, Comandos/Queries, Validadores e Mapeamentos.
- **`src/PlayHub.Domain/` (Núcleo):** Entidades puras, Exceções de domínio e lógica de negócio.
- **`src/PlayHub.Infrastructure/` (Infra):** Implementação de persistência (MongoDB), Criptografia, JWT e Logging Providers.