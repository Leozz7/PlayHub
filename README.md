<h1 align="center">
  🎾 PlayHub
</h1>

<p align="center">
  <strong>O Sistema Definitivo de Gerenciamento e Reservas de Quadras Esportivas</strong>
</p>

## 🌐 Visão Geral do Projeto

O **PlayHub** é uma plataforma inovadora projetada para revolucionar o aluguel e gerenciamento de quadras esportivas. Criado tanto para os **proprietários de espaços esportivos** que buscam modernizar sua gestão, quanto para os **jogadores** que necessitam de praticidade para encontrar e reservar horários.

A infraestrutura foi dividida em dois eixos principais altamente escaláveis:

### 📱 Frontend (Web Client)
Uma interface rica, veloz e responsiva, desenvolvida utilizando as melhores práticas do ecossistema moderno do JavaScript.
- **Tecnologias:** React.js construído sob a velocidade do **Vite**.
- **Foco:** Oferecer uma experiência de usuário (UX) excepcional, com atualizações rápidas, design moderno e feedback visual imediato nos processos de busca, reserva e pagamentos opcionais.

### ⚙️ Backend (API RESTful)
Um backend corporativo ultra-seguro, arquitetado para garantir a máxima integridade e proteção aos dados dos usuários.
- **Tecnologias:** C# .NET 10 e banco de dados NoSQL **MongoDB**.
- **Arquitetura:** Clean Architecture (Arquitetura Limpa) acompanhada do padrão de mensageria **CQRS** via MediatR.
- **Foco:** Alta performance, processamento concorrente seguro de reservas, isolamento completo de lógicas de negócio e conformidade robusta com protocolos de cibersegurança e proteção de dados (LGPD), incluindo encriptação bidirecional de dados sensíveis e mecanismos de índices cegos (Blind Indexing).

---

## 🚀 Arquitetura do Sistema

O ecossistema do PlayHub foca na descentralização e resiliência:

- **Isolamento de Responsabilidades:** O cliente front-end consome serviços e dados expostos unicamente pela API Gateway corporativa (.NET).
- **Tratamento de Regras e Overbooking:** O backend possui tratamento explícito para coibir _overbooking_ (reservas duplas acidentais) e garantir consistência na gestão de status de liberação das quadras dinamicamente.
- **Proteção dos Dados em Repouso e em Trânsito:** A segurança de PII (_Personally Identifiable Information_) atende aos moldes de cidadania de primeira classe e protocolos globais.
- **Observabilidade:** Logs robustos de informações intrínsecas e monitoramento analítico sistêmico de ponta a ponta.

---

## ✨ Principais Funcionalidades

1. **Gestão Dinâmica do Catálogo de Quadras:** Configuração e cadastro de quadras por modalidade, capacidade em jogo, precificações customizáveis por hora, inserção descritiva de amenidades e infraestrutura local (via `Court`).
2. **Sistema Inteligente de Reservas:** Agendamentos fluidos com regras parametrizáveis e de segurança no motor financeiro; define disponibilidade, avalia se o espaço encontra-se em modo Ativo ou em Manutenção, e processa o cálculo dinâmico da locação com base no tempo alugado.
3. **Fluxo de Atividade e Pagamento:** Acompanhamento constante do registro do usuário para auditorias transacionais e histórico fidedigno de suas interações na plataforma (`Payment`).
4. **Governança Unificada e Autorização Contínua:** Controle e gerenciamento por papéis em sistema de autenticação, validando os _Claims_ ativamente e mantendo total controle do perfil logado.

---

## 🏁 Como Começar (Ambiente Local)

1. Entre no subdiretório `./Api` deste projeto.
2. Certifique-se de ter Docker e o Docker Compose aptos e ativados.
3. Siga minuciosamente a documentação interna orientada no `Api/README.MD` para descobrir como orquestrar toda a infraestrutura base (Back-End + Banco NoSQL).
4. Em breve, a camada de Client Side (React) possuíra seu próprio manual de compilação.

---
