# PlayHub API 🎾

Sistema backend construído para a central sistêmica da plataforma **PlayHub**, focado em entregar altíssima performance, manutenibilidade de longo prazo, disponibilidade contínua e uma camada impenetrável de segurança em nível corporativo.

## 🚀 Tecnologias e Padrões Arquiteturais

Este projeto adere rigidamente aos princípios consolidados da **Clean Architecture**, dividindo sua base em anéis concêntricos garantindo forte aplicação para o princípio de separação de domínios. Em somatório à abstração sólida, fluxos são orquestrados em vias únicas e eficientes utilizando o padrão de design **CQRS** (Command Query Responsibility Segregation) viabilizados pela adoção do MediatR no anel Application.

* **Linguagem e Infraestrutura Web:** C# e .NET (ASP.NET Core Web API 10).
* **Banco de Dados (Persistência Principal):** MongoDB Integrado. Arquitetado com mapeamento inteligente via convenções (CamelCase Map) e serializadores dinâmicos BSON focados no registro otimizado das coleções.
* **Mapeadores de Padrão (Design Patterns):** Layered Clean Arch, Mediator Pattern, Options Pattern, Repository Abstractions/Adapters.
* **Containerização Nativa:** Construção virtual por Docker e automação dos nós locais pelo uso estensivo das Recipes de Deploy integradas no Docker Compose.

---

## 🏛️ O Domínio: Especificações, Entidades e Agregados

O núcleo vital de negócios compreende Entidades autossuficientes e completamente agnósticas à influências externas do mundo relacional HTTP, ORMs ou Serviços externos:

1. **`User` (Usuários)**
   - O objeto de controle e acesso à plataforma.
   - Detém as principais e rígidas propriedades vitais de proteção de dados conformes com a Autoridade Nacional e União Europeia (LGPD e GDPR).
   - Possui campos encriptados e contém nativamente um índice de varredura opaca sob o e-mail codificado através da técnica de `HMACSHA256` (**Blind Indexing**), que assegura verificações exclusivas no MongoDB para registro paralelo de contas e logins seguros de baixíssima latência.
   
2. **`Court` (Quadras de Esporte - Root Aggregate)**
   - O núcleo ativo das finanças. É uma entidade altamente densa, guardando dimensões do produto que será consumido, abrigando atributos centrais de identificação como `Name`, preceitos delimitadores como a lotação máxima `Capacity`, categoria de esportes `CourtType` e também regras de rentabilização por `HourlyRate` (Valor Hora).
   - Abriga as listas ativas nativas de comodidades listadas aos visitantes via representações da classe `CourtAmenity` (vestiário, estacionamento, churrasqueira), e até links em `ImageUrls`.
   - Gerencia dinamicamente através de seus métodos seccionais de negócios `MarkUnderMaintenance()`, `RestoreToService()` o Status global da quadra impedindo logicamente inconsistências antes até da emissão no banco através da validação da regra que controla o enumerador intrínseco `CourtStatus` (Ativa/Inativa/Manutenção).

3. **`Reservation` (Reservas)**
   - A espinha dorsal do ciclo dinâmico do negócio transacional.
   - Vincula instâncias do locatário às estruturas de aluguel validando minuciosamente, num bloco blindado no construtor de classe, se não há choque do `StartTime` antecessor do `EndTime`, validando a coerência espaço temporal orgânica e evitando valores deturpados de pagamento.
   - Regida unificada pelo controle reativo de fases enumeradas no `ReservationStatus` (`Pending`, `Confirmed`, `Canceled`).

4. **`Payment` (Pagamentos)**
   - Agregado embutido gerador de prova real validando a intercessão final em processamento no ciclo de verificação para aprovar o estado persistido da estrutura primária de reservas.

5. **`SystemLog` (Evolução Contínua e Logs de Automação)**
   - Coleção apartada que insere no horizonte infraestrutural o panorama rastreável dos estágios não funcionais ativados por Exceptions Críticas, Erros, Informações sensíveis e Advertências.

---

## 🛡️ Defesas Resilientes e Arquitetura de Cibersegurança

A estratégia macro de implantação foi estruturada aplicando conceitos avançados de Hardening, para que agentes mal intencionados ou até falhas internas de exposição vazem um subconjunto de dados.

* **Função Derivativa Avançada em Autenticidade (Argon2):** Em contramão a modelos padrão, processamos hashing na persistência usando o estado da arte das funções de derivamento — **Argon2**, tornando tentativas e simulações com poder massivo (como GPUs e Servidores Brute Force de Rainbow tables) computacionalmente proibitivas ou praticamente ineficazes via uso da lib nativa `Isopoh.Cryptography.Argon2`.
* **Criptografia Simétrica Base Integrada (AES-256):** Campos em formato plano atrelados ao cliente com peso normatizado de identificação (PII) entram anonimizados e residem restritos a leitura crua da arquitetura pela base matemática gerada nas interfaces criptográficas dependentes de variáveis contidas no ecossistema e ambiente de hospedagem.
* **Sessão baseada em Refresh Tokens por HTTPOnly:** Geração constante e verificação reativa dos perfis por _JSON Web Tokens_ (JWT) distribuídos e ancorados nas políticas modernas do protocolo com _Cookies HttpOnly` (`SameSite=None` na resposta header segura de navegação, mitigando vetores de comprometimento como explorações maliciosas DOM XSS e injeção remota).
* **Deflexão e Restrições Inteligentes de Sobrecarga (Rate Limiting Ativo):** Componentes sensíveis, controladores e ações abertas como login bloqueiam tempestades e acessos mecanizados prevenindo dezenas de DoS Locais.

---

## 🛠️ Como Executar na Instância de Desenvolvimento (Docker)

Todo o ecossistema da equipe dev possui provisionamento declarativo. Sem necessidade explícita em injetar as bibliotecas físicas ou baixar bancos de dados via _package manager_. O Docker Composer cuida de expor o MongoDB para você instantaneamente.

1. Navegue pelo terminal ativo até atingir exatamente esta raiz, a pasta _`Api`_.
2. Verifique o seu arquivo protótipo de ambiente e formalize criando/renomeando: copie de `.env.example` para formar o novo `.env` local.
3. Inicie os pacotes do Container em um CLI:

```bash
# Para buildar
docker compose up --build

# Para subir em segundo plano
docker compose up -d
```

### 📋 Links Mapeados de Utilidade do Módulo Externo

* **Swagger / Open API (Swagger UI):**  
  [http://localhost:5000/swagger](http://localhost:5000/swagger)

* **Mongo Express (Ferramenta Guiada Visual do NoSQL para Inspeção Direta):**  
  [http://localhost:8081](http://localhost:8081)

* **Caminho Universal Driver MongoDB (e.g. acesso pelo Mongo Compass, DataGrip, DBeaver):**  
  `mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/playhub?authSource=admin`  
  *(Ajuste o termo e chaves de credencial referenciados em seu `.env` ou instâncias secretas)*

---

## 📂 Anatomia Sistêmica e Inversão de Dependências

O respeito e obediência vital aos escopos criam as camadas invioláveis da fundação C#:

* **`src/PlayHub.Api/`**: A camada principal, ou Borda de Entrega _Delivery Mechanism_. Foco integral na injeção de dependência e registro dos serviços por extensão, englobando Pipelines unificadores que disparam roteamento HTTP nos seus Controllers, ativam restrição de acesso e disparam rastreamento para Logs centralizados sem intervir no coração do projeto ou conhecer infraestrutura de bancos reais.

* **`src/PlayHub.Application/`**: Orquestrador intermodular. Carrega a implementação explícita de cada uma das rotas. Mapeia comportamentos vitais no MediatR pelas validações densas do `FluentValidation`. Também declara as famosas Interfaces de Abstração, ou contratos agnósticos para os provedores externos da `Infrastructure`.

* **`src/PlayHub.Domain/`**: A parte mais preciosa e protegida livre das abstrações Framework. Sem conexão ao MVC ou ORMs como EF. Contém a tipologia crua (Entidades) expostas unicamente a conceitos restritos de objetos (VO) como modelador abstrato e Exceções Próprias do escopo das lógicas do esporte de quadra.

* **`src/PlayHub.Infrastructure/`**: Todo o universo impuro dependente de pacotes de tecnologia terceira interage e responde nesta fronteira externa. Cria implementações estapafúrdias ou não aos conectores assinados na `Application`. Hospeda provedores reais de JWT Token Generation, provedores criptográficos profundos, mapeadores assíncronos e o Contexto BSON para gravação das requisições brutas no Mongo Driver nativo.