# 🏥 ClinicPed+ | Mobile Client

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white)

> **Aplicativo mobile oficial do ecossistema ClinicPed+, focado na experiência do paciente e agendamento ágil.**

---

## 📖 Sobre o App

Este repositório contém o código-fonte do **Front-end Mobile** do projeto ClinicPed+. Desenvolvido em **React Native**, o aplicativo oferece uma interface nativa, fluida e responsiva para que usuários finais possam interagir com as clínicas cadastradas.

O foco principal deste cliente é a **Usabilidade (UX)** e a **Performance**, garantindo que o agendamento de consultas seja um processo simples e sem atritos.

---

## ✨ Funcionalidades (Client-Side)

### 👤 Experiência do Usuário
- **Autenticação Segura:** Login e Cadastro com persistência de sessão.
- **Feedback Visual:** Tratamento de estados de carregamento (Skeletons) e mensagens de erro amigáveis (Toasts/Alerts).
- **Validação em Tempo Real:** Máscaras de input para CPF, Telefone e CEP, prevenindo erros de digitação.

### 📅 Agendamento
- **Busca Inteligente:** Filtros por especialidade e profissional.
- **Agenda Visual:** Visualização clara de slots de horários disponíveis.
- **Histórico:** Acesso rápido às consultas passadas e futuras.

---

## 🛠️ Tech Stack & Arquitetura

O projeto segue uma estrutura modular, visando a reutilização de componentes e a facilidade de manutenção.

| Tecnologia | Função |
| :--- | :--- |
| **React Native** | Framework core para desenvolvimento híbrido (Android/iOS). |
| **TypeScript** | Garantia de tipagem estática e segurança no desenvolvimento. |
| **React Navigation** | Gestão de rotas (Stack e Tab Navigation). |
| **Axios** | Cliente HTTP para comunicação com a API Restful. |
| **Context API** | Gerenciamento de estado global (Autenticação e Perfil). |

### 📂 Estrutura de Pastas

```bash
src/
├── components/   # Componentes atômicos (Button, Input, Card)
├── contexts/     # Estados globais (AuthContext)
├── hooks/        # Custom Hooks para lógicas reutilizáveis
├── routes/       # Configuração de navegação (AppRoutes, AuthRoutes)
├── screens/      # Telas da aplicação (Login, Home, Profile)
├── services/     # Camada de integração com a API (Endpoints)
├── styles/       # Temas e tokens de design
└── utils/        # Funções auxiliares e Máscaras (Regex)
