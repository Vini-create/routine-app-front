import type { SupportedLanguage } from "@/lib/i18n";

export type PageInfoKey = "dashboard" | "routine" | "goals" | "habits" | "assistant" | "insights" | "calendar" | "settings";

type PageInfoEntry = {
  what: string;
  why: string;
  how: string;
  connections: string;
  example?: string;
};

type PageInfoLocale = {
  buttonLabel: string;
  close: string;
  sections: { what: string; why: string; how: string; connections: string; example: string };
  pages: Record<PageInfoKey, PageInfoEntry>;
};

export const pageInfo: Record<SupportedLanguage, PageInfoLocale> = {
  "pt-BR": {
    buttonLabel: "Sobre esta área",
    close: "Fechar",
    sections: { what: "O que é", why: "Por que existe", how: "Como usar", connections: "Como se conecta", example: "Exemplo prático" },
    pages: {
      dashboard: {
        what: "É a visão rápida do seu momento: o que acontece agora, o que vem depois e como a semana está avançando.",
        why: "Existe para reduzir decisões e mostrar a próxima ação importante sem exigir que você abra várias áreas.",
        how: "Consulte no início do dia e volte durante as transições. Use os atalhos para detalhar rotina, hábitos ou pedir ajuda ao Alfred.",
        connections: "Reúne dados da Rotina, Hábitos e Metas; também leva ao Alfred quando você precisa analisar ou ajustar o plano.",
        example: "Ao abrir pela manhã, você vê o primeiro bloco pendente e percebe que há três tarefas concluídas na semana.",
      },
      routine: {
        what: "É a agenda executável do Winperium, formada por blocos únicos, compromissos recorrentes e hábitos previstos para cada dia.",
        why: "Transforma objetivos abstratos em tempo reservado e deixa o plano fácil de corrigir quando a vida muda.",
        how: "Crie blocos com horário e duração, registre o resultado e use a rotina padrão para compromissos que se repetem.",
        connections: "Metas dão direção aos blocos, Hábitos entram automaticamente nos dias previstos, Calendário organiza por data e Alfred ajuda a reorganizar.",
        example: "Cadastre “Faculdade” de segunda a sexta às 19h e ela aparecerá automaticamente nos dias correspondentes.",
      },
      goals: {
        what: "É onde você define destinos concretos e conecta os hábitos que sustentam cada resultado.",
        why: "Evita metas soltas: cada objetivo ganha prazo, contexto e ações recorrentes que tornam o progresso observável.",
        how: "Crie uma meta, escolha uma data realista e adicione poucos hábitos diretamente relacionados ao resultado desejado.",
        connections: "Os hábitos ligados aparecem em Hábitos e Rotina; o progresso alimenta Insights e o contexto do Alfred.",
        example: "Para “Concluir meu portfólio”, conecte o hábito “Estudar design por 40 minutos” em cinco dias da semana.",
      },
      habits: {
        what: "É o acompanhamento das ações que você quer repetir até que se tornem parte estável da sua rotina.",
        why: "Mostra consistência real, inclusive falhas e dias pendentes, sem transformar um dia ruim em abandono do processo.",
        how: "Marque o que foi concluído, observe o ritmo da semana e ajuste duração ou frequência quando o plano estiver pesado demais.",
        connections: "Cada hábito pode apoiar uma Meta, ocupar horários na Rotina e gerar padrões usados por Insights e Alfred.",
        example: "Se “Treinar” falhar sempre às segundas, reduza a duração nesse dia ou mova o bloco para um horário mais viável.",
      },
      assistant: {
        what: "Alfred é o copiloto conversacional que ajuda a interpretar prioridades, organizar decisões e adaptar o seu plano.",
        why: "Oferece uma forma natural de pedir ajuda sem precisar descobrir sozinho qual tela ou configuração deve mudar.",
        how: "Explique o contexto, a limitação e o resultado desejado. Quanto mais concreto o pedido, mais prática será a orientação.",
        connections: "Pode considerar Rotina, Hábitos, Metas e progresso recente para sugerir ajustes coerentes com o restante da plataforma.",
        example: "Diga “Dormi mal e tenho prova amanhã; reorganize meu dia preservando duas horas de estudo”.",
      },
      insights: {
        what: "É a área que resume consistência e padrões de execução ao longo do tempo.",
        why: "Ajuda a enxergar tendências que ficam invisíveis quando você observa apenas um dia isolado.",
        how: "Revise periodicamente, compare metas e procure padrões recorrentes antes de mudar sua rotina.",
        connections: "Consolida registros de Hábitos, Metas e Rotina; seus padrões ajudam Alfred a oferecer recomendações melhores.",
        example: "Uma meta com baixa consistência pode indicar frequência excessiva, horário ruim ou hábito amplo demais.",
      },
      calendar: {
        what: "É a visualização da sua rotina organizada por data, incluindo blocos, hábitos e seus respectivos estados.",
        why: "Facilita entender a distribuição de carga e encontrar dias vazios, sobrecarregados ou que precisam de correção.",
        how: "Navegue pelos meses, selecione um dia e confira os itens previstos. Use Alfred quando precisar redistribuir compromissos.",
        connections: "É outra perspectiva da Rotina e dos Hábitos; alterações nesses itens se refletem automaticamente aqui.",
        example: "Antes de aceitar um compromisso, abra a data e confirme se o dia já possui muitos blocos importantes.",
      },
      settings: {
        what: "É a área de preferências, dados pessoais, aparência, idioma e segurança da sua conta.",
        why: "Centraliza escolhas que afetam toda a experiência e mantém controles sensíveis separados do uso diário.",
        how: "Atualize seus dados quando necessário, escolha idioma e tema e use as opções de segurança com atenção.",
        connections: "Idioma e aparência valem em toda a plataforma; alterações de conta afetam autenticação e acesso aos seus dados.",
        example: "Ao trocar o idioma aqui, menus, orientações e conteúdos localizados passam a usar a nova preferência.",
      },
    },
  },
  en: {
    buttonLabel: "About this area",
    close: "Close",
    sections: { what: "What it is", why: "Why it exists", how: "How to use it", connections: "How it connects", example: "Practical example" },
    pages: {
      dashboard: { what: "A quick view of what is happening now, what comes next, and how your week is progressing.", why: "It reduces decisions by showing the next important action without requiring several screens.", how: "Check it at the start of the day and during transitions. Use shortcuts for deeper detail.", connections: "It brings together Routine, Habits, and Goals, with a path to Alfred for analysis and adjustments.", example: "In the morning, see your first pending block and the week's completed items." },
      routine: { what: "Your executable schedule of one-time blocks, recurring commitments, and planned habits.", why: "It turns goals into protected time and makes plans easier to adjust when life changes.", how: "Create blocks with a time and duration, record outcomes, and use the default routine for recurring commitments.", connections: "Goals guide blocks, Habits populate planned days, Calendar organizes dates, and Alfred helps reorganize.", example: "Add “College” Monday through Friday at 7 PM to place it automatically on those days." },
      goals: { what: "Where you define concrete destinations and connect the habits that support each result.", why: "It gives every objective a deadline, context, and observable recurring actions.", how: "Create a goal, choose a realistic date, and attach a small number of relevant habits.", connections: "Linked habits appear in Habits and Routine; progress feeds Insights and Alfred.", example: "For “Finish my portfolio,” attach “Study design for 40 minutes” five days a week." },
      habits: { what: "Tracking for actions you want to repeat until they become a stable part of your routine.", why: "It shows real consistency, including misses and pending days, without turning one bad day into abandonment.", how: "Log completion, observe the weekly rhythm, and adjust duration or frequency when the plan is too heavy.", connections: "Habits can support Goals, occupy Routine slots, and create patterns for Insights and Alfred.", example: "If a workout always fails on Mondays, shorten it or move it to a more realistic time." },
      assistant: { what: "Alfred is the conversational copilot for priorities, decisions, and plan adaptation.", why: "It lets you ask naturally for help without first knowing which setting or screen must change.", how: "Share the context, limitation, and desired result. Concrete requests produce more practical guidance.", connections: "It can consider Routine, Habits, Goals, and recent progress in its suggestions.", example: "Say, “I slept badly and have a test tomorrow; preserve two hours of study.”" },
      insights: { what: "A summary of consistency and execution patterns over time.", why: "It reveals trends that are invisible when you look at one isolated day.", how: "Review periodically, compare goals, and look for recurring patterns before changing your routine.", connections: "It consolidates Habits, Goals, and Routine records to improve Alfred recommendations.", example: "Low consistency may signal excessive frequency, a poor time slot, or a habit that is too broad." },
      calendar: { what: "Your routine organized by date, including blocks, habits, and their status.", why: "It makes overloaded, empty, or correctable days easy to spot.", how: "Browse months, select a date, and review planned items. Ask Alfred when commitments need redistribution.", connections: "It is a date-based view of Routine and Habits; changes there appear here automatically.", example: "Before accepting a commitment, check whether that date already has several important blocks." },
      settings: { what: "Preferences, personal details, appearance, language, and account security.", why: "It centralizes platform-wide choices and keeps sensitive controls away from daily workflows.", how: "Update details as needed, select language and theme, and use security controls carefully.", connections: "Language and appearance apply everywhere; account changes affect authentication and access to your data.", example: "Changing the language here updates localized menus and guidance across the platform." },
    },
  },
  es: {
    buttonLabel: "Acerca de esta área",
    close: "Cerrar",
    sections: { what: "Qué es", why: "Por qué existe", how: "Cómo usarla", connections: "Cómo se conecta", example: "Ejemplo práctico" },
    pages: {
      dashboard: { what: "Es una vista rápida de lo que sucede ahora, lo que viene después y el avance de tu semana.", why: "Reduce decisiones al mostrar la siguiente acción importante sin abrir varias áreas.", how: "Consúltala al empezar el día y durante las transiciones. Usa los accesos para ver más detalles.", connections: "Reúne Rutina, Hábitos y Metas, y conecta con Feedback y Alfred.", example: "Por la mañana puedes ver el primer bloque pendiente y lo que ya completaste en la semana." },
      routine: { what: "Es tu agenda ejecutable de bloques únicos, compromisos recurrentes y hábitos planificados.", why: "Convierte metas en tiempo reservado y permite ajustar el plan cuando cambia la vida real.", how: "Crea bloques con hora y duración, registra el resultado y usa la rutina predeterminada para lo recurrente.", connections: "Las Metas orientan, los Hábitos ocupan sus días, el Calendario ordena fechas y Alfred ayuda a reorganizar.", example: "Añade “Universidad” de lunes a viernes a las 19:00 para verla automáticamente esos días." },
      goals: { what: "Es donde defines destinos concretos y conectas los hábitos que sostienen cada resultado.", why: "Da a cada objetivo una fecha, contexto y acciones recurrentes observables.", how: "Crea una meta, elige una fecha realista y vincula pocos hábitos realmente relacionados.", connections: "Los hábitos vinculados aparecen en Hábitos y Rutina; el progreso alimenta Insights, Feedback y Alfred.", example: "Para “Terminar mi portafolio”, vincula “Estudiar diseño 40 minutos” cinco días por semana." },
      habits: { what: "Es el seguimiento de acciones que quieres repetir hasta integrarlas de forma estable.", why: "Muestra constancia real, incluidos fallos y pendientes, sin convertir un mal día en abandono.", how: "Registra lo completado, observa el ritmo semanal y ajusta duración o frecuencia si pesa demasiado.", connections: "Cada hábito puede apoyar una Meta, ocupar la Rutina y crear patrones para Insights, Feedback y Alfred.", example: "Si el entrenamiento siempre falla los lunes, acórtalo o muévelo a una hora más viable." },
      assistant: { what: "Alfred es el copiloto conversacional para prioridades, decisiones y adaptación del plan.", why: "Permite pedir ayuda de forma natural sin saber primero qué pantalla debes cambiar.", how: "Explica el contexto, la limitación y el resultado deseado. Cuanto más concreto, más útil será.", connections: "Puede considerar Rutina, Hábitos, Metas y progreso reciente en sus sugerencias.", example: "Di: “Dormí mal y mañana tengo examen; conserva dos horas de estudio”." },
      insights: { what: "Es el resumen de tu constancia y de los patrones de ejecución a lo largo del tiempo.", why: "Revela tendencias invisibles al observar solamente un día aislado.", how: "Revísala periódicamente, compara metas y busca patrones antes de cambiar la rutina.", connections: "Consolida Hábitos, Metas y Rutina para mejorar las recomendaciones de Feedback y Alfred.", example: "Una constancia baja puede indicar frecuencia excesiva, mal horario o un hábito demasiado amplio." },
      calendar: { what: "Es tu rutina organizada por fecha, con bloques, hábitos y sus estados.", why: "Facilita detectar días vacíos, sobrecargados o que necesitan corrección.", how: "Navega por los meses, selecciona una fecha y revisa lo previsto.", connections: "Es una perspectiva de Rutina y Hábitos; sus cambios aparecen aquí automáticamente.", example: "Antes de aceptar un compromiso, comprueba si esa fecha ya tiene varios bloques importantes." },
      settings: { what: "Es el área de preferencias, datos personales, apariencia, idioma y seguridad.", why: "Centraliza decisiones globales y mantiene los controles sensibles fuera del flujo diario.", how: "Actualiza tus datos, elige idioma y tema, y utiliza la seguridad con atención.", connections: "Idioma y apariencia afectan toda la plataforma; la cuenta controla autenticación y acceso a datos.", example: "Cambiar el idioma aquí actualiza los menús y orientaciones localizadas." },
    },
  },
  fr: {
    buttonLabel: "À propos de cette section",
    close: "Fermer",
    sections: { what: "De quoi s’agit-il ?", why: "Pourquoi existe-t-elle ?", how: "Comment l’utiliser", connections: "Comment elle se connecte", example: "Exemple pratique" },
    pages: {
      dashboard: { what: "Une vue rapide de ce qui se passe maintenant, de la suite et de l’avancement de la semaine.", why: "Elle réduit les décisions en montrant la prochaine action importante sans ouvrir plusieurs sections.", how: "Consultez-la au début de la journée et pendant les transitions.", connections: "Elle réunit Routine, Habitudes et Objectifs, avec des accès au Feedback et à Alfred.", example: "Le matin, voyez le premier bloc en attente et les éléments déjà terminés cette semaine." },
      routine: { what: "Votre agenda exécutable de blocs uniques, engagements récurrents et habitudes planifiées.", why: "Elle transforme les objectifs en temps réservé et facilite les ajustements.", how: "Créez des blocs avec horaire et durée, enregistrez le résultat et utilisez la routine par défaut pour les récurrences.", connections: "Objectifs, Habitudes, Calendrier et Alfred travaillent ensemble autour de ce planning.", example: "Ajoutez « Université » du lundi au vendredi à 19 h pour la placer automatiquement." },
      goals: { what: "L’endroit où définir des destinations concrètes et relier les habitudes qui les soutiennent.", why: "Chaque objectif reçoit une date, un contexte et des actions observables.", how: "Créez un objectif réaliste et associez-lui quelques habitudes pertinentes.", connections: "Les habitudes apparaissent dans Habitudes et Routine ; le progrès alimente Insights, Feedback et Alfred.", example: "Pour « Terminer mon portfolio », associez « Étudier le design 40 minutes » cinq jours par semaine." },
      habits: { what: "Le suivi des actions à répéter jusqu’à ce qu’elles deviennent stables.", why: "Il montre la régularité réelle, y compris les échecs et jours en attente.", how: "Enregistrez les réalisations et ajustez durée ou fréquence si le plan est trop lourd.", connections: "Les habitudes soutiennent les Objectifs, occupent la Routine et alimentent Insights, Feedback et Alfred.", example: "Si le sport échoue chaque lundi, raccourcissez-le ou changez son horaire." },
      assistant: { what: "Alfred est le copilote conversationnel des priorités, décisions et adaptations.", why: "Il permet de demander de l’aide naturellement sans connaître d’abord le bon réglage.", how: "Expliquez le contexte, la contrainte et le résultat souhaité.", connections: "Il peut tenir compte de Routine, Habitudes, Objectifs et progrès récents.", example: "Dites : « J’ai mal dormi et j’ai un examen demain ; garde deux heures d’étude »." },
      insights: { what: "Le résumé de votre régularité et de vos schémas d’exécution dans le temps.", why: "Il révèle des tendances invisibles sur une seule journée.", how: "Consultez-le régulièrement et cherchez des répétitions avant de modifier la routine.", connections: "Il consolide Habitudes, Objectifs et Routine pour améliorer Feedback et Alfred.", example: "Une faible régularité peut signaler une fréquence excessive ou un mauvais horaire." },
      calendar: { what: "Votre routine organisée par date avec blocs, habitudes et statuts.", why: "Il aide à repérer les journées vides, chargées ou à corriger.", how: "Parcourez les mois, choisissez une date et examinez les éléments prévus.", connections: "C’est une vue de Routine et Habitudes ; leurs changements apparaissent ici.", example: "Avant d’accepter un engagement, vérifiez si la date contient déjà plusieurs blocs importants." },
      settings: { what: "Les préférences, informations personnelles, apparence, langue et sécurité.", why: "Elle centralise les choix globaux et isole les contrôles sensibles.", how: "Mettez à jour vos données et utilisez les options de sécurité avec attention.", connections: "Langue et apparence s’appliquent partout ; le compte contrôle l’authentification et les données.", example: "Changer la langue ici met à jour les menus et conseils localisés." },
    },
  },
};
