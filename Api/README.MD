# PlayHub API

Sistema backend construído para a plataforma **PlayHub**, focado em alta performance, manutenibilidade e segurança corporativa.

## 🚀 Tecnologias e Arquitetura

Este projeto foi desenhado sob os rígidos padrões da **Clean Architecture** (Arquitetura Limpa), dividindo o sistema em camadas de Responsabilidade Única (API, Application, Domain e Infrastructure). 

Além disso, a orquestração do sistema de negócios utiliza o padrão **CQRS** (Command Query Responsibility Segregation) através da biblioteca MediatR.

* **Linguagem / Framework:** C# / .NET (ASP.NET Core Web API)
* **Banco de Dados:** MongoDB (com drivers BSON configurados para ignorar campos dinâmicos e aplicar mapeamento CamelCase de forma nativa)
* **Design Patterns:** Clean Architecture, CQRS, Repository/Context Abstraction
* **Containerização:** Docker e Docker Compose

## 🛡️ Destaques de Segurança (Security Features)

Este projeto implementa metodologias rigorosas de proteção de dados:
* **Hashing de Senha:** Utilização do algorítmo **Argon2** (O mais seguro atualmente), via `Isopoh.Cryptography.Argon2`.
* **Proteção de PII (Adequação LGPD):** Dados sensíveis (como e-mail do usuário) são **encriptados localmente** usando o padrão criptográfico governamental **AES-256**.
* **Blind Indexing:** Para permitir login e consultas em banco utilizando e-mails mesmo estando eles encriptados bidirecionalmente, aplicamos índices cegos aplicando um cálculo estático via `HMACSHA256`. 
* **Autenticação:** Json Web Tokens (JWT) atrelados a um modelo de _Refresh Tokens_ emitidos diretamente em cabeçalho criptografado (Cookies HttpOnly `SameSite=None`), protegendo os clientes de ataques de injeção XSS.
* **Throttling e Limitação:** As extremidades públicas contam com Rate-Limiting para prevenção de ataques DDoS locais ou Força-Bruta de senhas.

---

## 🛠️ Como Executar na Instância de Desenvolvimento

O ambiente da API já conta com uma rede containerizada pronta contendo o .NET, um conteiner do MongoDB, e o Mongo Express para visualizar os dados pelo navegador.

1. Navegue pelo terminal até esta pasta `Api`
2. Certifique-se de que tenha renomeado ou copiado o arquivo `.env.example` para `.env`
3. Execute através do docker:

```bash
# Para buildar
docker compose up --build

# Para subir em segundo plano
docker compose up -d
```

### 📋 Links e Serviços Úteis Subidos

* **Swagger / Open API (Swagger UI):**  
  [http://localhost:5000/swagger](http://localhost:5000/swagger)

* **Mongo Express (UI Visual do Banco de Dados):**  
  [http://localhost:8081](http://localhost:8081)

* **String de Conexão do MongoDB Interna (Para se conectar via Compass):**  
  `mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/playhub?authSource=admin`  
  *(Ajuste o termo `${MONGO_USER}` e a senha de acordo com o seu `.env`)*

---

## 📂 Estrutura de Pastas

* `src/PlayHub.Api/`: Foco 100% na inicialização, DI (Injeção de dependências global), Middlewares e Exposição RESTful em Controllers. Não contém regras de negócio.
* `src/PlayHub.Application/`: Contém os casos de uso abstratos, validadores de dados de entrada com FluentValidation, orquestrações por CQRS (Commands/ Queries) e interfaces como contratos.
* `src/PlayHub.Domain/`: Centro do sistema. Entidades Ricas que dominam a lógica intrínseca e geram eventos de mudança. Totalmente independente de qualquer tecnologia externa.
* `src/PlayHub.Infrastructure/`: Implementações concretas e dependentes de SDK de terceiros. Geração do token, persistência com o banco MongoDB, Serviços de Criptografia Baseados no SO, etc.