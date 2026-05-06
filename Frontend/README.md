# PlayHub Frontend

Interface de usuário e aplicação cliente da plataforma **PlayHub**. Construída para garantir interações rápidas, um fluxo de reserva sem fricção e acesso aos painéis de controle para gestores e administradores, apresentando design moderno e alta responsividade.

## Ferramentas e Tecnologias

A aplicação front-end é uma SPA (Single Page Application) e segue os padrões modernos de engenharia web do ecossistema JavaScript:

- **Framework Core:** React.js construído sob a plataforma de empacotamento Vite, conferindo velocidade no desenvolvimento e na montagem de pacotes para produção.
- **Tipagem Estática:** TypeScript integrado, garantindo robustez e auto-documentação nas interfaces de comunicação com o Backend.
- **Roteamento:** React Router DOM para fluxos de página modulares e controle de proteção de rotas (Private Routes).
- **Gerenciamento de Estado e Cache:** TanStack Query (React Query) empregado na camada de requisições, unificando estado do servidor de forma assíncrona.
- **Estilização e Interface:** Tailwind CSS integrado, estruturando componentes e layouts com o auxílio de design tokens coesos para garantir consistência visual e experiência tátil.

## Estrutura Funcional

A interface engloba três fluxos vitais baseados no nível hierárquico do usuário:

1. **Jogadores (Visão Pública e Perfil Autenticado):** Visualização de catálogos e filtros dinâmicos das quadras esportivas, fluxo transparente do agendamento (Reservation Flow) e painéis para monitoramento do histórico de atividades.
2. **Gestores de Quadra (`/lz_gestor`):** Módulo restrito onde os donos controlam suas disponibilidades horárias em formato de grade (Dashboard), verificam reservas das suas próprias instalações e fecham manutenções operacionais da estrutura.
3. **Administradores (`/lz_admin`):** Escopo de governança total, possuindo telas com relatórios globais de faturamento, monitoramento da integridade via logs remotos e exportação de demonstrativos PDF da operação.

## Organização de Diretórios

A divisão do código-fonte atende à separação arquitetural e de reuso:

- **`src/assets/`:** Repositório de imagens estáticas e elementos vetoriais usados na UI global.
- **`src/components/`:** Elementos atomizados (Cards, Botões, Modais, Loaders), permitindo reutilização através do sistema de design estabelecido.
- **`src/pages/`:** Arquivos que consolidam os componentes em fluxos lógicos amarrados no roteador do sistema. Dividido pelos escopos de usuário (`/admin/`, `/gestor/`).
- **`src/services/` (ou chamadas API):** Intermediários da conexão HTTP, validadores de requisições REST, interceptores e funções atreladas ao ciclo do axios ou fetch para enviar dados à API principal.

## Instruções de Execução do Ambiente Local

Assegure-se de que o Node.js e o NPM estão devidamente configurados no sistema.

1. Acesse o diretório base do `Frontend`.
2. Configure o mapeamento de ambiente duplicando o `.env.example` para `.env`.
3. Garanta que a variável responsável pela conexão Backend (ex: `VITE_API_URL`) referencie a URL local da API em processamento (`http://localhost:5000/api`).
4. Execute o comando de instalação das bibliotecas listadas no `package.json`:

```bash
npm install
```

5. Com o término das dependências, inicialize o servidor de desenvolvimento:

```bash
npm run dev
```

6. Acesse a aplicação na porta exposta indicada no terminal local, tipicamente estabelecida em `http://localhost:5173`.
