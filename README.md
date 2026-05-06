# PlayHub

**O Sistema Definitivo de Gerenciamento e Reservas de Quadras Esportivas**

## Visão Geral do Projeto

O **PlayHub** é uma plataforma projetada para o aluguel e gerenciamento de quadras esportivas, atendendo tanto a proprietários e gestores de espaços esportivos quanto aos jogadores que buscam reservar horários com praticidade e agilidade.

O ecossistema do sistema é dividido em dois eixos principais e independentes:

### Frontend (Web Client)
Interface rica, responsiva e performática, desenvolvida com as melhores práticas do ecossistema JavaScript moderno.
- **Tecnologias:** React.js e TypeScript, construído com o bundler Vite.
- **Foco:** Oferecer uma experiência de usuário (UX) excepcional e direta, com feedback visual consistente, sistema de roteamento fluido e processos simplificados para busca, agendamento de reservas e acompanhamento financeiro.

### Backend (API RESTful)
API corporativa projetada sob rigorosos padrões de integridade e segurança.
- **Tecnologias:** C# .NET 10 e banco de dados NoSQL MongoDB.
- **Arquitetura:** Clean Architecture aliada ao padrão CQRS (via MediatR).
- **Foco:** Alta performance, processamento transacional seguro de reservas em concorrência, e forte proteção de dados, utilizando encriptação avançada e Blind Indexing em conformidade com políticas de privacidade como LGPD e GDPR.

## Arquitetura do Sistema

A infraestrutura do projeto foi planejada para escalabilidade e separação clara de responsabilidades:

- **Isolamento de Responsabilidades:** O cliente front-end atua apenas na apresentação e interatividade, consumindo serviços e regras de negócio geridas estritamente pela API.
- **Tratamento de Concorrência:** O backend possui regras transacionais rigorosas para impedir *overbooking* (reservas duplas acidentais) no mesmo horário e espaço físico.
- **Segurança de Dados:** As informações de identificação pessoal (PII) dos usuários são protegidas tanto em repouso quanto em trânsito com os mais altos níveis de segurança criptográfica.
- **Observabilidade:** Coleta estruturada de logs e monitoramento sistêmico de erros, auditorias e processos internos.

## Funcionalidades Principais

1. **Gestão de Quadras:** Cadastro e controle de infraestrutura esportiva, categorizando modalidades, capacidade máxima, valores por hora e descrição de comodidades.
2. **Motor de Reservas:** Sistema que garante consistência no agendamento, validando disponibilidade de calendário e calculando os custos de forma dinâmica com base no tempo solicitado.
3. **Controle Financeiro:** Geração, registro e auditoria de pagamentos, atrelando as finanças de forma imutável às reservas confirmadas.
4. **Governança e Autorização (RBAC):** Restrição inteligente baseada em papéis (Usuários, Gestores e Administradores), garantindo o acesso compartimentado da aplicação e das informações.

## Como Começar (Ambiente Local)

Para detalhes profundos sobre como preparar o ambiente, compilar e executar o projeto, consulte a documentação dedicada de cada módulo:

- [Documentação da API (Backend)](./Api/README.MD)
- [Documentação do Frontend (Cliente Web)](./Frontend/README.md)