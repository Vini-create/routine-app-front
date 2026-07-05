import type { SupportedLanguage } from "@/lib/i18n";

export type FirstAccessTourStep = {
  route: string;
  area: string;
  title: string;
  description: string;
  tip: string;
  target?: string;
  components?: Array<{
    title: string;
    description: string;
    tip: string;
    target: string;
  }>;
};

type TourCopy = {
  invitationEyebrow: string;
  invitationTitle: string;
  invitationDescription: string;
  invitationAccept: string;
  invitationDecline: string;
  eyebrow: string;
  progress: (current: number, total: number) => string;
  previous: string;
  next: string;
  finish: string;
  skip: string;
  tipLabel: string;
  steps: FirstAccessTourStep[];
};

const ptBR: TourCopy = {
  invitationEyebrow: "Bem-vindo ao Winperium",
  invitationTitle: "Deseja fazer o tutorial para conhecer melhor as funcionalidades?",
  invitationDescription: "Preparamos uma visita curta e tranquila pelas principais áreas. Você verá, passo a passo, onde organizar sua rotina, criar metas e hábitos e conversar com Alfred.",
  invitationAccept: "Fazer tutorial",
  invitationDecline: "Agora não",
  eyebrow: "Primeiros passos",
  progress: (current, total) => `${current} de ${total}`,
  previous: "Voltar",
  next: "Continuar",
  finish: "Começar a usar",
  skip: "Pular tutorial",
  tipLabel: "Como começar",
  steps: [
    { route: "/dashboard", area: "Início", target: "[data-tour='dashboard-overview']", title: "Sua visão do dia", description: "Este resumo mostra seu progresso e o que merece atenção agora.", tip: "Use esta tela como ponto de partida do seu dia.", components: [
      { target: "[data-tour='app-header']", title: "Você sempre sabe onde está", description: "O cabeçalho mostra o nome da área atual. O botão de informação explica a tela e a logo leva de volta ao Início.", tip: "No celular, o botão de menu fica no canto esquerdo." },
      { target: "[data-tour='app-navigation']", title: "Passe de uma área para outra", description: "Use estes ícones para abrir Início, Rotina, Metas, Hábitos, Feedback e Alfred.", tip: "O ícone destacado mostra a área em que você está." },
      { target: "[data-tour='dashboard-shortcuts']", title: "Atalhos para as ações principais", description: "Estes botões levam rapidamente ao Feedback, ao Alfred e aos Hábitos.", tip: "Toque no atalho da tarefa que você quer realizar." },
      { target: "[data-tour='dashboard-today']", title: "O que fazer agora", description: "Aqui aparecem os próximos itens da sua rotina, com ações para concluir, pular ou ajustar.", tip: "Atualizar cada item deixa todo o restante do aplicativo mais preciso." },
    ] },
    { route: "/routine", area: "Rotina", target: "[data-tour='routine-calendar']", title: "Escolha um dia", description: "Use o calendário para abrir uma data e ver o que está planejado nela.", tip: "Os pontos e cores ajudam a identificar dias com atividades.", components: [
      { target: "[data-tour='routine-timeline']", title: "Crie e acompanhe blocos", description: "O botão de novo bloco adiciona tarefas ou compromissos. Os filtros alternam entre hoje, amanhã e semana.", tip: "Comece pelos horários que não podem mudar." },
      { target: "[data-tour='routine-default']", title: "Rotina padrão", description: "Esta área guarda atividades que se repetem em determinados dias e horários.", tip: "Use para estudo, trabalho, exercícios e outros compromissos recorrentes." },
    ] },
    { route: "/goals", area: "Metas", target: "[data-tour='goal-create']", title: "Crie uma meta clara", description: "Preencha nome, prazo e categoria. A descrição é opcional e pode explicar o motivo da meta.", tip: "Uma meta simples e específica é mais fácil de acompanhar.", components: [
      { target: "[data-tour='goal-list']", title: "Acompanhe e ajuste suas metas", description: "Nesta lista você vê o progresso, abre detalhes, edita a meta e adiciona hábitos relacionados.", tip: "Conecte cada meta aos hábitos que ajudam a alcançá-la." },
    ] },
    { route: "/habits", area: "Hábitos", target: "[data-tour='habit-guide']", title: "Entenda as cores de consistência", description: "As cores mostram, de forma rápida, como a frequência do hábito está evoluindo.", tip: "Elas orientam, não julgam: um resultado baixo é apenas um sinal para ajustar.", components: [
      { target: "[data-tour='habit-list']", title: "Registre e cuide dos hábitos", description: "Cada cartão mostra frequência, progresso e ações para concluir, editar ou excluir.", tip: "Marque o hábito no mesmo dia para manter os dados corretos." },
    ] },
    { route: "/calendar", area: "Calendário", target: "[data-tour='calendar-main']", title: "Veja como sua semana se encaixa", description: "Mude o mês pelas setas e toque em um dia para ver seus itens.", tip: "Use esta visão para encontrar conflitos e espaços livres.", components: [
      { target: "[data-tour='calendar-day']", title: "Detalhes do dia escolhido", description: "A lista abaixo reúne atividades e hábitos da data selecionada.", tip: "Se o dia estiver pesado, use o botão de reorganizar com Alfred." },
    ] },
    { route: "/feedback", area: "Feedback", target: "[data-tour='feedback-form']", title: "Peça uma análise da sua semana", description: "Digite a prioridade que deseja melhorar e toque em gerar feedback.", tip: "Você pode escrever com suas próprias palavras; não existe resposta certa." },
    { route: "/assistant", area: "Alfred", target: "[data-tour='assistant-suggestions']", title: "Comece com uma sugestão", description: "Estes atalhos oferecem perguntas prontas quando você não sabe como iniciar a conversa.", tip: "Toque em uma sugestão para colocá-la no campo de mensagem.", components: [
      { target: "[data-tour='assistant-conversation']", title: "A conversa fica aqui", description: "Suas mensagens e as respostas de Alfred aparecem nesta área em ordem.", tip: "As mensagens mais recentes ficam próximas ao campo de envio." },
      { target: "[data-tour='assistant-composer']", title: "Escreva e envie", description: "Digite sua pergunta neste campo e use a seta para enviar. O campo cresce se a mensagem ficar maior.", tip: "Fale naturalmente, como falaria com uma pessoa ajudando a planejar." },
    ] },
    { route: "/insights", area: "Insights", target: "[data-tour='insights-summary']", title: "Veja seu progresso geral", description: "Este indicador resume quanto do planejamento foi concluído no período.", tip: "Use o número como referência, não como cobrança.", components: [
      { target: "[data-tour='insights-patterns']", title: "Encontre padrões úteis", description: "Os cartões mostram o desempenho de cada meta e ajudam a perceber o que funciona melhor.", tip: "Compare algumas semanas antes de fazer mudanças grandes." },
    ] },
    { route: "/settings", area: "Perfil", target: "[data-tour='settings-personal']", title: "Seus dados básicos", description: "Aqui você altera nome e idioma e salva as mudanças.", tip: "Escolha o idioma em que se sente mais confortável.", components: [
      { target: "[data-tour='settings-preferences']", title: "Aparência e tutorial", description: "Troque o tema visual e abra este tutorial novamente sempre que precisar.", tip: "Essas escolhas podem ser alteradas a qualquer momento." },
      { target: "[data-tour='settings-security']", title: "Segurança da conta", description: "Esta área permite alterar ou criar uma senha, conforme a forma usada para entrar.", tip: "Nunca compartilhe sua senha ou códigos de acesso." },
    ] },
  ],
};

const en: TourCopy = {
  invitationEyebrow: "Welcome to Winperium",
  invitationTitle: "Would you like to take the tutorial and learn about the features?",
  invitationDescription: "We prepared a short, relaxed visit through the main areas. Step by step, you will see where to organize your routine, create goals and habits, and talk to Alfred.",
  invitationAccept: "Take tutorial",
  invitationDecline: "Not now",
  eyebrow: "Getting started",
  progress: (current, total) => `${current} of ${total}`,
  previous: "Back",
  next: "Next",
  finish: "Start using",
  skip: "Skip tutorial",
  tipLabel: "How to start",
  steps: [
    { route: "/dashboard", area: "Home", title: "Your day at a glance", description: "See commitments, key habits, progress, and your weekly focus.", tip: "Start your day here and update items as you move forward.", components: [
      { target: "[data-tour='app-header']", title: "Always know where you are", description: "The header names the current area, offers help, and lets you return Home.", tip: "On mobile, the menu button is in the left corner." },
      { target: "[data-tour='app-navigation']", title: "Move between areas", description: "These icons open the main areas; the highlighted one shows your current location.", tip: "You can use the highlighted control during the tour." },
      { target: "[data-tour='dashboard-today']", title: "What to do now", description: "Your next routine items and their actions appear here.", tip: "Keeping items updated improves every summary." },
    ] },
    { route: "/routine", area: "Routine", title: "Organize tasks and commitments", description: "Choose a date to see what is planned.", tip: "Dots and colors identify days with activities.", components: [
      { target: "[data-tour='routine-timeline']", title: "Create and review blocks", description: "New block adds an activity; the buttons switch between today, tomorrow, and week.", tip: "Add fixed commitments first." },
      { target: "[data-tour='routine-default']", title: "Your regular routine", description: "Keep activities that repeat on selected days and times here.", tip: "Use it for study, work, exercise, and rest." },
    ] },
    { route: "/goals", area: "Goals", title: "Turn intention into direction", description: "Enter a name, date, and category to create a goal.", tip: "A simple and specific goal is easier to follow.", components: [
      { target: "[data-tour='goal-list']", title: "Track and adjust goals", description: "This list shows progress and actions to view, edit, or add habits.", tip: "Link each goal to habits that support it." },
    ] },
    { route: "/habits", area: "Habits", title: "Build consistency", description: "Colors quickly show how your frequency is changing.", tip: "They guide you; they do not judge you.", components: [
      { target: "[data-tour='habit-list']", title: "Record your habits", description: "Each card shows progress and lets you complete, edit, or delete.", tip: "Record a habit on the same day for accurate data." },
    ] },
    { route: "/calendar", area: "Calendar", title: "See how your week fits together", description: "Change months and select a day to see its activities.", tip: "Look for conflicts, free time, and overloaded days.", components: [
      { target: "[data-tour='calendar-day']", title: "Selected day details", description: "This list combines the activities and habits for the selected date.", tip: "Alfred can help reorganize an overloaded day." },
    ] },
    { route: "/feedback", area: "Feedback", title: "Learn from your patterns", description: "Share your priority and receive a weekly reading with progress, obstacles, and practical adjustments.", tip: "Use it at the end of the week and describe what you want to improve." },
    { route: "/assistant", area: "Alfred", title: "Plan through conversation", description: "Suggestions help you start when you are unsure what to write.", tip: "Select a prepared suggestion to try it.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Your conversation", description: "Your messages and Alfred's replies appear here in order.", tip: "The newest messages stay close to the composer." },
      { target: "[data-tour='assistant-composer']", title: "Write and send", description: "Write naturally, then select the arrow to send your message.", tip: "The field grows automatically for longer messages." },
    ] },
    { route: "/insights", area: "Insights", title: "Understand what works", description: "This indicator summarizes overall progress for the period.", tip: "Use it as a reference, not as pressure.", components: [
      { target: "[data-tour='insights-patterns']", title: "Find useful patterns", description: "These cards show how each goal is progressing.", tip: "Compare several weeks before making a large change." },
    ] },
    { route: "/settings", area: "Profile", title: "Make Winperium yours", description: "Manage your basic details and application language.", tip: "Choose the language that feels most comfortable.", components: [
      { target: "[data-tour='settings-preferences']", title: "Appearance and tutorial", description: "Change the theme and replay this tutorial whenever you need it.", tip: "You can change these choices at any time." },
      { target: "[data-tour='settings-security']", title: "Account security", description: "Create or change your password here.", tip: "Never share passwords or access codes." },
    ] },
  ],
};

const es: TourCopy = {
  ...en,
  invitationEyebrow: "Bienvenido a Winperium", invitationTitle: "¿Quieres hacer el tutorial para conocer mejor las funciones?", invitationDescription: "Preparamos una visita breve y sencilla por las áreas principales. Verás paso a paso dónde organizar tu rutina, crear metas y hábitos y hablar con Alfred.", invitationAccept: "Hacer el tutorial", invitationDecline: "Ahora no",
  eyebrow: "Primeros pasos", progress: (current, total) => `${current} de ${total}`, previous: "Volver", next: "Siguiente", finish: "Empezar a usar", skip: "Saltar tutorial", tipLabel: "Cómo empezar",
  steps: [
    { route: "/dashboard", area: "Inicio", title: "Tu día de un vistazo", description: "Consulta compromisos, hábitos principales, progreso y enfoque semanal.", tip: "Empieza el día aquí y actualiza cada elemento mientras avanzas.", components: [
      { target: "[data-tour='app-header']", title: "Siempre sabes dónde estás", description: "El encabezado muestra el área actual, ofrece información y permite volver al Inicio.", tip: "En el móvil, el menú está en la esquina izquierda." },
      { target: "[data-tour='app-navigation']", title: "Muévete por la aplicación", description: "Estos iconos abren las áreas principales; el icono destacado indica dónde estás.", tip: "Puedes tocar el elemento resaltado durante el tutorial." },
      { target: "[data-tour='dashboard-today']", title: "Lo que debes hacer ahora", description: "Aquí aparecen los próximos elementos de tu rutina y sus acciones.", tip: "Actualizar cada elemento mejora los resúmenes de la aplicación." },
    ] },
    { route: "/routine", area: "Rutina", title: "Organiza tareas y compromisos", description: "Crea bloques únicos o recurrentes con horarios, duración y días flexibles.", tip: "Añade primero los compromisos fijos y después las tareas flexibles.", components: [
      { target: "[data-tour='routine-timeline']", title: "Crea y revisa bloques", description: "Nuevo bloque añade una actividad; los botones cambian entre hoy, mañana y semana.", tip: "Empieza por los horarios que no pueden cambiar." },
      { target: "[data-tour='routine-default']", title: "Tu rutina habitual", description: "Guarda aquí las actividades que se repiten en días y horarios determinados.", tip: "Es útil para estudio, trabajo, ejercicio y descanso." },
    ] },
    { route: "/goals", area: "Metas", title: "Convierte intención en dirección", description: "Completa nombre, fecha y categoría para crear una meta.", tip: "Una meta clara y sencilla es más fácil de seguir.", components: [
      { target: "[data-tour='goal-list']", title: "Sigue y ajusta tus metas", description: "La lista muestra progreso y acciones para ver detalles, editar o añadir hábitos.", tip: "Relaciona cada meta con los hábitos que la apoyan." },
    ] },
    { route: "/habits", area: "Hábitos", title: "Construye constancia", description: "Los colores muestran rápidamente cómo evoluciona la frecuencia.", tip: "Los colores orientan; no sirven para juzgar.", components: [
      { target: "[data-tour='habit-list']", title: "Registra tus hábitos", description: "Cada tarjeta muestra progreso y permite completar, editar o eliminar.", tip: "Registra el hábito el mismo día para mantener los datos correctos." },
    ] },
    { route: "/calendar", area: "Calendario", title: "Entiende cómo encaja tu semana", description: "Cambia de mes y toca un día para consultar sus actividades.", tip: "Busca conflictos, espacios libres y días con demasiadas tareas.", components: [
      { target: "[data-tour='calendar-day']", title: "Detalles del día", description: "Esta lista reúne las actividades y hábitos de la fecha seleccionada.", tip: "Alfred puede ayudarte a reorganizar un día demasiado cargado." },
    ] },
    { route: "/feedback", area: "Feedback", title: "Aprende de tus patrones", description: "Recibe una lectura semanal con avances, obstáculos y ajustes prácticos.", tip: "Úsalo al final de la semana y explica qué deseas mejorar." },
    { route: "/assistant", area: "Alfred", title: "Planifica conversando", description: "Las sugerencias ayudan a iniciar una conversación cuando no sabes qué escribir.", tip: "Puedes tocar una sugerencia preparada.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Tu conversación", description: "Tus mensajes y las respuestas de Alfred aparecen aquí en orden.", tip: "Las respuestas más recientes quedan cerca del campo de envío." },
      { target: "[data-tour='assistant-composer']", title: "Escribe y envía", description: "Escribe con naturalidad y toca la flecha para enviar el mensaje.", tip: "El campo crece automáticamente cuando escribes más." },
    ] },
    { route: "/insights", area: "Insights", title: "Descubre qué funciona", description: "Este indicador resume el progreso general del período.", tip: "Úsalo como referencia, no como presión.", components: [
      { target: "[data-tour='insights-patterns']", title: "Encuentra patrones útiles", description: "Las tarjetas muestran el desempeño de cada meta.", tip: "Compara varias semanas antes de hacer grandes cambios." },
    ] },
    { route: "/settings", area: "Perfil", title: "Haz tuyo Winperium", description: "Gestiona tus datos básicos y el idioma de la aplicación.", tip: "Elige el idioma que te resulte más cómodo.", components: [
      { target: "[data-tour='settings-preferences']", title: "Apariencia y tutorial", description: "Cambia el tema y abre este tutorial de nuevo cuando lo necesites.", tip: "Puedes cambiar estas opciones en cualquier momento." },
      { target: "[data-tour='settings-security']", title: "Seguridad de la cuenta", description: "Aquí puedes cambiar o crear una contraseña.", tip: "Nunca compartas contraseñas ni códigos de acceso." },
    ] },
  ],
};

const fr: TourCopy = {
  ...en,
  invitationEyebrow: "Bienvenue sur Winperium", invitationTitle: "Souhaitez-vous suivre le tutoriel pour mieux connaître les fonctionnalités ?", invitationDescription: "Nous avons préparé une visite courte et simple des principales zones. Vous verrez pas à pas où organiser votre routine, créer des objectifs et des habitudes, et parler à Alfred.", invitationAccept: "Faire le tutoriel", invitationDecline: "Pas maintenant",
  eyebrow: "Premiers pas", progress: (current, total) => `${current} sur ${total}`, previous: "Retour", next: "Suivant", finish: "Commencer", skip: "Passer le tutoriel", tipLabel: "Pour commencer",
  steps: [
    { route: "/dashboard", area: "Accueil", title: "Votre journée en un coup d’œil", description: "Consultez engagements, habitudes, progrès et priorité de la semaine.", tip: "Commencez votre journée ici.", components: [
      { target: "[data-tour='app-header']", title: "Sachez toujours où vous êtes", description: "L’en-tête indique la zone actuelle, offre de l’aide et permet de revenir à l’Accueil.", tip: "Sur mobile, le menu se trouve à gauche." },
      { target: "[data-tour='app-navigation']", title: "Passez d’une zone à l’autre", description: "Ces icônes ouvrent les zones principales ; l’icône active indique votre position.", tip: "Vous pouvez utiliser l’élément mis en évidence." },
      { target: "[data-tour='dashboard-today']", title: "Ce qu’il faut faire maintenant", description: "Vos prochains éléments et leurs actions apparaissent ici.", tip: "Les mettre à jour améliore tous les résumés." },
    ] },
    { route: "/routine", area: "Routine", title: "Organisez tâches et engagements", description: "Choisissez une date pour voir ce qui est prévu.", tip: "Les points et couleurs signalent les jours occupés.", components: [
      { target: "[data-tour='routine-timeline']", title: "Créez et consultez des blocs", description: "Nouveau bloc ajoute une activité ; les boutons affichent aujourd’hui, demain ou la semaine.", tip: "Ajoutez d’abord les engagements fixes." },
      { target: "[data-tour='routine-default']", title: "Votre routine habituelle", description: "Enregistrez ici les activités répétées à certains jours et horaires.", tip: "Utilisez-la pour les études, le travail, l’exercice et le repos." },
    ] },
    { route: "/goals", area: "Objectifs", title: "Donnez une direction à vos intentions", description: "Indiquez un nom, une date et une catégorie pour créer un objectif.", tip: "Un objectif simple et précis est plus facile à suivre.", components: [
      { target: "[data-tour='goal-list']", title: "Suivez vos objectifs", description: "Cette liste présente la progression et les actions pour consulter, modifier ou ajouter des habitudes.", tip: "Associez chaque objectif aux habitudes qui le soutiennent." },
    ] },
    { route: "/habits", area: "Habitudes", title: "Développez votre régularité", description: "Les couleurs montrent rapidement l’évolution de votre fréquence.", tip: "Elles vous guident sans vous juger.", components: [
      { target: "[data-tour='habit-list']", title: "Enregistrez vos habitudes", description: "Chaque carte montre la progression et permet de terminer, modifier ou supprimer.", tip: "Enregistrez l’habitude le jour même." },
    ] },
    { route: "/calendar", area: "Calendrier", title: "Visualisez votre semaine", description: "Changez de mois et choisissez un jour pour voir ses activités.", tip: "Repérez les conflits, le temps libre et les journées chargées.", components: [
      { target: "[data-tour='calendar-day']", title: "Détails du jour", description: "Cette liste réunit les activités et habitudes de la date choisie.", tip: "Alfred peut aider à réorganiser une journée chargée." },
    ] },
    { route: "/feedback", area: "Feedback", title: "Apprenez de vos habitudes", description: "Recevez une analyse hebdomadaire avec progrès, obstacles et ajustements pratiques.", tip: "Utilisez-la en fin de semaine et précisez ce que vous souhaitez améliorer." },
    { route: "/assistant", area: "Alfred", title: "Planifiez en discutant", description: "Les suggestions vous aident à commencer quand vous ne savez pas quoi écrire.", tip: "Choisissez une suggestion préparée.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Votre conversation", description: "Vos messages et les réponses d’Alfred apparaissent ici dans l’ordre.", tip: "Les messages récents restent près du champ d’envoi." },
      { target: "[data-tour='assistant-composer']", title: "Écrivez et envoyez", description: "Écrivez naturellement puis utilisez la flèche pour envoyer.", tip: "Le champ grandit pour les messages plus longs." },
    ] },
    { route: "/insights", area: "Analyses", title: "Comprenez ce qui fonctionne", description: "Cet indicateur résume la progression générale de la période.", tip: "Utilisez-le comme repère, pas comme pression.", components: [
      { target: "[data-tour='insights-patterns']", title: "Repérez les tendances utiles", description: "Les cartes montrent la progression de chaque objectif.", tip: "Comparez plusieurs semaines avant un grand changement." },
    ] },
    { route: "/settings", area: "Profil", title: "Personnalisez Winperium", description: "Gérez vos informations et la langue de l’application.", tip: "Choisissez la langue la plus confortable.", components: [
      { target: "[data-tour='settings-preferences']", title: "Apparence et tutoriel", description: "Changez le thème et relancez ce tutoriel quand vous en avez besoin.", tip: "Ces choix restent modifiables à tout moment." },
      { target: "[data-tour='settings-security']", title: "Sécurité du compte", description: "Créez ou modifiez votre mot de passe ici.", tip: "Ne partagez jamais vos mots de passe ou codes d’accès." },
    ] },
  ],
};

export const firstAccessTourCopy: Record<SupportedLanguage, TourCopy> = { "pt-BR": ptBR, en, es, fr };

const defaultTargetByRoute: Record<string, string> = {
  "/dashboard": "[data-tour='dashboard-overview']",
  "/routine": "[data-tour='routine-calendar']",
  "/goals": "[data-tour='goal-create']",
  "/habits": "[data-tour='habit-guide']",
  "/calendar": "[data-tour='calendar-main']",
  "/feedback": "[data-tour='feedback-form']",
  "/assistant": "[data-tour='assistant-composer']",
  "/insights": "[data-tour='insights-summary']",
  "/settings": "[data-tour='settings-preferences']",
};

export function expandedFirstAccessTourSteps(copy: TourCopy): FirstAccessTourStep[] {
  return copy.steps.flatMap((step) => [
    { ...step, target: step.target ?? defaultTargetByRoute[step.route] ?? "main" },
    ...(step.components ?? []).map((component) => ({
      ...component,
      route: step.route,
      area: step.area,
    })),
  ]);
}
