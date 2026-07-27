import type { SupportedLanguage } from "@/lib/i18n";

export type TourPlacement = "auto" | "top" | "bottom" | "left" | "right";

type TourComponentDefinition = {
  title: string;
  description: string;
  tip: string;
  target: string;
  preferredPlacement?: TourPlacement;
  fallbackSelector?: string;
  allowInteraction?: boolean;
};

type TourScreenDefinition = {
  route: string;
  area: string;
  title: string;
  description: string;
  tip: string;
  target?: string;
  preferredPlacement?: TourPlacement;
  fallbackSelector?: string;
  allowInteraction?: boolean;
  components?: TourComponentDefinition[];
};

export type FirstAccessTourStep = {
  id: string;
  selector: string;
  route: string;
  area: string;
  title: string;
  description: string;
  preferredPlacement: TourPlacement;
  fallbackSelector?: string;
  allowInteraction: boolean;
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
  steps: TourScreenDefinition[];
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
  finish: "Concluir",
  skip: "Pular tutorial",
  tipLabel: "Como começar",
  steps: [
    { route: "/dashboard", area: "Início", target: "[data-tour='dashboard-overview']", title: "Sua visão do dia", description: "Este resumo mostra seu progresso e o que merece atenção agora.", tip: "Use esta tela como ponto de partida do seu dia.", components: [
      { target: "[data-tour='app-header']", title: "Você sempre sabe onde está", description: "O cabeçalho mostra o nome da área atual. O botão de informação explica a tela e a logo leva de volta ao Início.", tip: "No celular, o botão de menu fica no canto esquerdo." },
      { target: "[data-tour='app-navigation']", title: "Passe de uma área para outra", description: "Use estes ícones para abrir Início, Rotina, Metas, Hábitos e Alfred.", tip: "O ícone destacado mostra a área em que você está." },
      { target: "[data-tour='dashboard-shortcuts']", title: "Atalhos para as ações principais", description: "Estes botões levam rapidamente às análises do Alfred e aos Hábitos.", tip: "Toque no atalho da tarefa que você quer realizar." },
      { target: "[data-tour='dashboard-today']", title: "O que fazer agora", description: "Aqui aparecem os próximos itens da sua rotina, com ações para concluir, pular ou ajustar.", tip: "Atualizar cada item deixa todo o restante do aplicativo mais preciso." },
    ] },
    { route: "/routine", area: "Rotina", target: "[data-tour='routine-calendar']", title: "Escolha um dia", description: "Use o calendário para abrir uma data e ver o que está planejado nela.", tip: "Os pontos e cores ajudam a identificar dias com atividades.", components: [
      { target: "[data-tour='routine-timeline']", title: "Crie e acompanhe blocos", description: "O botão de novo bloco adiciona tarefas ou compromissos. Os filtros alternam entre hoje, amanhã e semana.", tip: "Comece pelos horários que não podem mudar." },
      { target: "[data-tour='routine-default']", title: "Rotina padrão", description: "Esta área guarda atividades que se repetem em determinados dias e horários.", tip: "Use para estudo, trabalho, exercícios e outros compromissos recorrentes." },
    ] },
    { route: "/goals", area: "Metas", target: "[data-tour='goal-create']", title: "Crie uma meta clara", description: "Preencha nome, prazo e categoria. A descrição é opcional e pode explicar o motivo da meta.", tip: "Uma meta simples e específica é mais fácil de acompanhar.", components: [
      { target: "[data-tour='goal-list']", title: "Acompanhe e ajuste suas metas", description: "Nesta lista você vê o progresso, abre detalhes, edita a meta e adiciona hábitos relacionados.", tip: "Conecte cada meta aos hábitos que ajudam a alcançá-la." },
    ] },
    { route: "/habits", area: "Hábitos", target: "[data-tour='habits-title']", preferredPlacement: "bottom", title: "Crie comportamentos que se repetem", description: "Esta tela reúne os hábitos que apoiam suas metas e mostra sua regularidade.", tip: "Comece com algo pequeno e possível.", components: [
      { target: "[data-tour='page-info-button']", preferredPlacement: "bottom", title: "Ajuda sobre esta tela", description: "Este botão abre uma explicação completa da área sempre que surgir uma dúvida.", tip: "A ajuda continua disponível após o tutorial." },
      { target: "[data-tour='habit-add']", preferredPlacement: "left", title: "Adicione um hábito", description: "Use este botão para abrir a criação de hábitos dentro de uma meta.", tip: "Dê um nome simples e escolha uma frequência realista." },
      { target: "[data-tour='habit-guide']", title: "Resumo de consistência", description: "Este quadro explica as cores e informa quantos hábitos estão ativos no período.", tip: "As cores são sinais para ajustar, não notas." },
      { target: "[data-tour='habit-consistency-fire']", preferredPlacement: "bottom", title: "Consistência muito forte", description: "Fogo indica que o hábito vem sendo cumprido com bastante regularidade.", tip: "Continue sem aumentar a dificuldade rápido demais." },
      { target: "[data-tour='habit-consistency-grass']", preferredPlacement: "bottom", title: "Consistência saudável", description: "Grama indica uma frequência estável, com espaço natural para alguns dias diferentes.", tip: "Mantenha o ritmo sustentável." },
      { target: "[data-tour='habit-consistency-ice']", preferredPlacement: "bottom", title: "Consistência esfriando", description: "Gelo mostra que o hábito está acontecendo menos e talvez precise ser simplificado.", tip: "Reduza duração ou frequência antes de desistir." },
      { target: "[data-tour='habit-consistency-empty']", preferredPlacement: "bottom", title: "Ainda sem histórico", description: "Esta cor aparece quando ainda não existem registros suficientes para avaliar o hábito.", tip: "Registre alguns dias para formar o primeiro padrão." },
      { target: "[data-tour='habit-card']", fallbackSelector: "[data-tour='habit-list']", title: "O cartão do hábito", description: "O cartão reúne frequência, duração, progresso, histórico e vínculo com uma meta.", tip: "Quando não houver hábitos, esta área mostrará como criar o primeiro." },
      { target: "[data-tour='habit-controls']", fallbackSelector: "[data-tour='habit-list']", preferredPlacement: "top", title: "Registre e ajuste", description: "Use as ações do cartão para concluir o hábito, editar seus dados ou removê-lo.", tip: "Férias e outros estados da agenda também aparecem no histórico." },
      { target: "[data-tour='app-navigation']", preferredPlacement: "top", title: "Continue navegando", description: "A navegação leva às demais áreas e mantém Hábitos destacado enquanto você está aqui.", tip: "No desktop ela fica na lateral; no celular, na parte inferior." },
    ] },
    { route: "/calendar", area: "Calendário", target: "[data-tour='calendar-main']", title: "Veja como sua semana se encaixa", description: "Mude o mês pelas setas e toque em um dia para ver seus itens.", tip: "Use esta visão para encontrar conflitos e espaços livres.", components: [
      { target: "[data-tour='calendar-day']", title: "Detalhes do dia escolhido", description: "A lista abaixo reúne atividades e hábitos da data selecionada.", tip: "Se o dia estiver pesado, use o botão de reorganizar com Alfred." },
    ] },
    { route: "/alfred", area: "Alfred", target: "[data-tour='assistant-suggestions']", title: "Comece com uma sugestão", description: "Estes atalhos oferecem perguntas prontas quando você não sabe como iniciar a conversa.", tip: "Toque em uma sugestão para colocá-la no campo de mensagem.", components: [
      { target: "[data-tour='assistant-conversation']", title: "A conversa fica aqui", description: "Suas mensagens e as respostas de Alfred aparecem nesta área em ordem.", tip: "As mensagens mais recentes ficam próximas ao campo de envio." },
      { target: "[data-tour='assistant-composer']", allowInteraction: true, title: "Escreva e envie", description: "Digite sua pergunta neste campo e use a seta para enviar. O campo cresce se a mensagem ficar maior.", tip: "Fale naturalmente, como falaria com uma pessoa ajudando a planejar." },
    ] },
    { route: "/dashboard", area: "Insights", target: "[data-tour='insights-summary']", title: "Veja seu progresso geral", description: "Este indicador resume quanto do planejamento foi concluído no período.", tip: "Use o número como referência, não como cobrança.", components: [
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
  finish: "Finish",
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
    { route: "/habits", area: "Habits", target: "[data-tour='habits-title']", title: "Build repeatable behaviors", description: "This area gathers the habits that support your goals and shows regularity.", tip: "Start with something small.", components: [
      { target: "[data-tour='page-info-button']", title: "Help for this screen", description: "Open a complete explanation of this area whenever you need it.", tip: "Help remains available after the tour." },
      { target: "[data-tour='habit-add']", preferredPlacement: "left", title: "Add a habit", description: "Open habit creation inside one of your goals.", tip: "Choose a simple name and realistic frequency." },
      { target: "[data-tour='habit-guide']", title: "Consistency summary", description: "This panel explains the colors and active habit count.", tip: "Colors guide you; they do not grade you." },
      { target: "[data-tour='habit-consistency-fire']", title: "Very strong consistency", description: "Fire means the habit has been completed very regularly.", tip: "Keep the pace sustainable." },
      { target: "[data-tour='habit-consistency-grass']", title: "Healthy consistency", description: "Grass means a steady rhythm with room for normal variation.", tip: "Protect this realistic pace." },
      { target: "[data-tour='habit-consistency-ice']", title: "Consistency is cooling", description: "Ice means the habit may need to become simpler or easier.", tip: "Reduce duration or frequency before giving up." },
      { target: "[data-tour='habit-consistency-empty']", title: "No history yet", description: "This state appears before enough records exist to identify a pattern.", tip: "Record a few days to begin." },
      { target: "[data-tour='habit-card']", fallbackSelector: "[data-tour='habit-list']", title: "The habit card", description: "It combines frequency, duration, progress, history, and linked goal.", tip: "An empty area will guide you to create the first habit." },
      { target: "[data-tour='habit-controls']", fallbackSelector: "[data-tour='habit-list']", title: "Record and adjust", description: "Use card actions to complete, edit, or remove the habit.", tip: "Vacation and agenda states also appear in history." },
      { target: "[data-tour='app-navigation']", preferredPlacement: "top", title: "Keep moving", description: "Navigation opens other areas and keeps Habits highlighted here.", tip: "It is lateral on desktop and at the bottom on mobile." },
    ] },
    { route: "/calendar", area: "Calendar", title: "See how your week fits together", description: "Change months and select a day to see its activities.", tip: "Look for conflicts, free time, and overloaded days.", components: [
      { target: "[data-tour='calendar-day']", title: "Selected day details", description: "This list combines the activities and habits for the selected date.", tip: "Alfred can help reorganize an overloaded day." },
    ] },
    { route: "/alfred", area: "Alfred", title: "Plan through conversation", description: "Suggestions help you start when you are unsure what to write.", tip: "Select a prepared suggestion to try it.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Your conversation", description: "Your messages and Alfred's replies appear here in order.", tip: "The newest messages stay close to the composer." },
      { target: "[data-tour='assistant-composer']", allowInteraction: true, title: "Write and send", description: "Write naturally, then select the arrow to send your message.", tip: "The field grows automatically for longer messages." },
    ] },
    { route: "/dashboard", area: "Insights", target: "[data-tour='insights-summary']", title: "Understand what works", description: "This indicator summarizes overall progress for the period.", tip: "Use it as a reference, not as pressure.", components: [
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
  eyebrow: "Primeros pasos", progress: (current, total) => `${current} de ${total}`, previous: "Volver", next: "Siguiente", finish: "Concluir", skip: "Saltar tutorial", tipLabel: "Cómo empezar",
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
    { route: "/habits", area: "Hábitos", target: "[data-tour='habits-title']", title: "Crea comportamientos repetibles", description: "Esta pantalla reúne los hábitos que apoyan tus metas y muestra tu regularidad.", tip: "Empieza con algo pequeño.", components: [
      { target: "[data-tour='page-info-button']", title: "Ayuda de esta pantalla", description: "Abre una explicación completa del área cuando tengas dudas.", tip: "La ayuda seguirá disponible." },
      { target: "[data-tour='habit-add']", preferredPlacement: "left", title: "Añade un hábito", description: "Abre la creación de hábitos dentro de una meta.", tip: "Elige una frecuencia realista." },
      { target: "[data-tour='habit-guide']", title: "Resumen de constancia", description: "Este panel explica los colores y los hábitos activos.", tip: "Los colores orientan, no califican." },
      { target: "[data-tour='habit-consistency-fire']", title: "Constancia muy fuerte", description: "Fuego indica que el hábito se cumple con mucha regularidad.", tip: "Mantén un ritmo sostenible." },
      { target: "[data-tour='habit-consistency-grass']", title: "Constancia saludable", description: "Hierba indica un ritmo estable con variaciones normales.", tip: "Protege este ritmo realista." },
      { target: "[data-tour='habit-consistency-ice']", title: "La constancia se enfría", description: "Hielo indica que quizá debas simplificar el hábito.", tip: "Reduce duración o frecuencia." },
      { target: "[data-tour='habit-consistency-empty']", title: "Aún sin historial", description: "Aparece antes de tener registros suficientes para evaluar el patrón.", tip: "Registra algunos días." },
      { target: "[data-tour='habit-card']", fallbackSelector: "[data-tour='habit-list']", title: "La tarjeta del hábito", description: "Reúne frecuencia, duración, progreso, historial y meta vinculada.", tip: "Si no hay hábitos, verás cómo crear el primero." },
      { target: "[data-tour='habit-controls']", fallbackSelector: "[data-tour='habit-list']", title: "Registra y ajusta", description: "Usa las acciones para completar, editar o eliminar el hábito.", tip: "Otros estados también aparecen en el historial." },
      { target: "[data-tour='app-navigation']", preferredPlacement: "top", title: "Sigue navegando", description: "La navegación abre las demás áreas y mantiene Hábitos destacado.", tip: "Es lateral en escritorio e inferior en móvil." },
    ] },
    { route: "/calendar", area: "Calendario", title: "Entiende cómo encaja tu semana", description: "Cambia de mes y toca un día para consultar sus actividades.", tip: "Busca conflictos, espacios libres y días con demasiadas tareas.", components: [
      { target: "[data-tour='calendar-day']", title: "Detalles del día", description: "Esta lista reúne las actividades y hábitos de la fecha seleccionada.", tip: "Alfred puede ayudarte a reorganizar un día demasiado cargado." },
    ] },
    { route: "/alfred", area: "Alfred", title: "Planifica conversando", description: "Las sugerencias ayudan a iniciar una conversación cuando no sabes qué escribir.", tip: "Puedes tocar una sugerencia preparada.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Tu conversación", description: "Tus mensajes y las respuestas de Alfred aparecen aquí en orden.", tip: "Las respuestas más recientes quedan cerca del campo de envío." },
      { target: "[data-tour='assistant-composer']", allowInteraction: true, title: "Escribe y envía", description: "Escribe con naturalidad y toca la flecha para enviar el mensaje.", tip: "El campo crece automáticamente cuando escribes más." },
    ] },
    { route: "/dashboard", area: "Insights", target: "[data-tour='insights-summary']", title: "Descubre qué funciona", description: "Este indicador resume el progreso general del período.", tip: "Úsalo como referencia, no como presión.", components: [
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
  eyebrow: "Premiers pas", progress: (current, total) => `${current} sur ${total}`, previous: "Retour", next: "Suivant", finish: "Terminer", skip: "Passer le tutoriel", tipLabel: "Pour commencer",
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
    { route: "/habits", area: "Habitudes", target: "[data-tour='habits-title']", title: "Créez des comportements réguliers", description: "Cette page rassemble les habitudes qui soutiennent vos objectifs.", tip: "Commencez par quelque chose de simple.", components: [
      { target: "[data-tour='page-info-button']", title: "Aide de cette page", description: "Ouvrez une explication complète de la zone en cas de doute.", tip: "L’aide restera disponible." },
      { target: "[data-tour='habit-add']", preferredPlacement: "left", title: "Ajoutez une habitude", description: "Ouvrez la création d’habitudes dans un objectif.", tip: "Choisissez une fréquence réaliste." },
      { target: "[data-tour='habit-guide']", title: "Résumé de régularité", description: "Ce panneau explique les couleurs et le nombre d’habitudes actives.", tip: "Les couleurs guident sans noter." },
      { target: "[data-tour='habit-consistency-fire']", title: "Très forte régularité", description: "Le feu indique une habitude accomplie très régulièrement.", tip: "Gardez un rythme durable." },
      { target: "[data-tour='habit-consistency-grass']", title: "Régularité saine", description: "L’herbe indique un rythme stable avec des variations normales.", tip: "Préservez ce rythme réaliste." },
      { target: "[data-tour='habit-consistency-ice']", title: "Régularité en baisse", description: "La glace indique que l’habitude devrait peut-être être simplifiée.", tip: "Réduisez la durée ou la fréquence." },
      { target: "[data-tour='habit-consistency-empty']", title: "Pas encore d’historique", description: "Cet état apparaît avant d’avoir assez de données.", tip: "Enregistrez quelques jours." },
      { target: "[data-tour='habit-card']", fallbackSelector: "[data-tour='habit-list']", title: "La carte d’habitude", description: "Elle réunit fréquence, durée, progression, historique et objectif.", tip: "Une zone vide aide à créer la première habitude." },
      { target: "[data-tour='habit-controls']", fallbackSelector: "[data-tour='habit-list']", title: "Enregistrez et ajustez", description: "Utilisez les actions pour terminer, modifier ou supprimer.", tip: "D’autres états apparaissent aussi dans l’historique." },
      { target: "[data-tour='app-navigation']", preferredPlacement: "top", title: "Continuez à naviguer", description: "La navigation ouvre les autres zones et garde Habitudes active.", tip: "Elle est latérale sur ordinateur et en bas sur mobile." },
    ] },
    { route: "/calendar", area: "Calendrier", title: "Visualisez votre semaine", description: "Changez de mois et choisissez un jour pour voir ses activités.", tip: "Repérez les conflits, le temps libre et les journées chargées.", components: [
      { target: "[data-tour='calendar-day']", title: "Détails du jour", description: "Cette liste réunit les activités et habitudes de la date choisie.", tip: "Alfred peut aider à réorganiser une journée chargée." },
    ] },
    { route: "/alfred", area: "Alfred", title: "Planifiez en discutant", description: "Les suggestions vous aident à commencer quand vous ne savez pas quoi écrire.", tip: "Choisissez une suggestion préparée.", components: [
      { target: "[data-tour='assistant-conversation']", title: "Votre conversation", description: "Vos messages et les réponses d’Alfred apparaissent ici dans l’ordre.", tip: "Les messages récents restent près du champ d’envoi." },
      { target: "[data-tour='assistant-composer']", allowInteraction: true, title: "Écrivez et envoyez", description: "Écrivez naturellement puis utilisez la flèche pour envoyer.", tip: "Le champ grandit pour les messages plus longs." },
    ] },
    { route: "/dashboard", area: "Analyses", target: "[data-tour='insights-summary']", title: "Comprenez ce qui fonctionne", description: "Cet indicateur résume la progression générale de la période.", tip: "Utilisez-le comme repère, pas comme pression.", components: [
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
  "/alfred": "[data-tour='assistant-composer']",
  "/settings": "[data-tour='settings-preferences']",
};

function selectorId(selector: string, fallback: string) {
  return selector.match(/data-tour=['"]([^'"]+)/)?.[1] ?? fallback;
}

export function expandedFirstAccessTourSteps(copy: TourCopy): FirstAccessTourStep[] {
  return copy.steps.flatMap((screen, screenIndex) => {
    const selector = screen.target ?? defaultTargetByRoute[screen.route] ?? "main";
    const routeId = screen.route.replace(/^\//, "") || "app";
    const screenStep: FirstAccessTourStep = {
      id: `${routeId}:0:${selectorId(selector, `screen-${screenIndex}`)}`,
      selector,
      route: screen.route,
      area: screen.area,
      title: screen.title,
      description: screen.description,
      preferredPlacement: screen.preferredPlacement ?? "auto",
      fallbackSelector: screen.fallbackSelector,
      allowInteraction: screen.allowInteraction ?? false,
    };

    return [
      screenStep,
      ...(screen.components ?? []).map((component, componentIndex): FirstAccessTourStep => ({
        id: `${routeId}:${componentIndex + 1}:${selectorId(component.target, `component-${componentIndex + 1}`)}`,
        selector: component.target,
        route: screen.route,
        area: screen.area,
        title: component.title,
        description: component.description,
        preferredPlacement: component.preferredPlacement ?? "auto",
        fallbackSelector: component.fallbackSelector,
        allowInteraction: component.allowInteraction ?? false,
      })),
    ];
  });
}

const essentialTourTargets = new Set([
  "dashboard-overview",
  "app-navigation",
  "dashboard-today",
  "routine-calendar",
  "routine-timeline",
  "routine-default",
  "goal-create",
  "goal-list",
  "habit-guide",
  "habit-card",
  "calendar-main",
  "assistant-composer",
  "insights-summary",
  "insights-patterns",
  "settings-preferences",
]);

const essentialTourCopy: Record<SupportedLanguage, Record<string, Pick<FirstAccessTourStep, "title" | "description">>> = {
  "pt-BR": {
    "dashboard-overview": { title: "Seu dia em um olhar", description: "Veja o que importa agora e como seu dia está avançando." },
    "app-navigation": { title: "Tudo a poucos toques", description: "Use a navegação para circular pelas áreas principais." },
    "dashboard-today": { title: "Seu próximo passo", description: "Veja o que vem agora e atualize cada item conforme avança." },
    "routine-calendar": { title: "Planeje por dia", description: "Escolha uma data para ver ou ajustar o que foi planejado." },
    "routine-timeline": { title: "Monte seu dia", description: "Crie blocos para tarefas e compromissos nos melhores horários para você." },
    "routine-default": { title: "O que se repete", description: "Guarde aqui atividades recorrentes, como estudo, treino ou trabalho." },
    "goal-create": { title: "Transforme planos em metas", description: "Defina uma meta clara para acompanhar seu avanço." },
    "goal-list": { title: "Acompanhe suas metas", description: "Veja o progresso e conecte os hábitos que ajudam você a chegar lá." },
    "habit-guide": { title: "Entenda sua consistência", description: "As cores mostram seu ritmo e ajudam a ajustar hábitos sem cobrança." },
    "habit-card": { title: "Cada hábito em um só lugar", description: "Acompanhe frequência, progresso e vínculo com suas metas." },
    "calendar-main": { title: "Sua semana em conjunto", description: "Veja tudo por data para encontrar espaço e evitar conflitos." },
    "assistant-composer": { title: "Converse com Alfred", description: "Escreva naturalmente: Alfred usa seu contexto para ajudar você." },
    "insights-summary": { title: "Veja seu progresso", description: "Use este resumo como orientação, nunca como cobrança." },
    "insights-patterns": { title: "Descubra o que funciona", description: "Observe algumas semanas antes de mudar sua estratégia." },
    "settings-preferences": { title: "Do seu jeito", description: "Ajuste a aparência e refaça este tutorial quando quiser." },
  },
  en: {
    "dashboard-overview": { title: "Your day at a glance", description: "See what matters now and how your day is moving forward." },
    "app-navigation": { title: "Everything within reach", description: "Use navigation to move through the main areas." },
    "dashboard-today": { title: "Your next step", description: "See what comes next and update each item as you go." },
    "routine-calendar": { title: "Plan day by day", description: "Choose a date to review or adjust your plan." },
    "routine-timeline": { title: "Build your day", description: "Create blocks for tasks and commitments at times that suit you." },
    "routine-default": { title: "What repeats", description: "Keep recurring activities like study, exercise, or work here." },
    "goal-create": { title: "Turn plans into goals", description: "Set a clear goal so you can follow your progress." },
    "goal-list": { title: "Follow your goals", description: "See progress and connect the habits that help you get there." },
    "habit-guide": { title: "Understand your consistency", description: "Colors show your rhythm and help you adjust without pressure." },
    "habit-card": { title: "Each habit in one place", description: "Follow its frequency, progress, and connection to your goals." },
    "calendar-main": { title: "Your week together", description: "See everything by date to find space and avoid conflicts." },
    "assistant-composer": { title: "Talk to Alfred", description: "Write naturally: Alfred uses your context to help you." },
    "insights-summary": { title: "See your progress", description: "Use this summary as guidance, never as pressure." },
    "insights-patterns": { title: "Discover what works", description: "Watch a few weeks before changing your strategy." },
    "settings-preferences": { title: "Make it yours", description: "Adjust the appearance and replay this tour whenever you like." },
  },
  es: {
    "dashboard-overview": { title: "Tu día de un vistazo", description: "Mira qué importa ahora y cómo avanza tu día." },
    "app-navigation": { title: "Todo a pocos toques", description: "Usa la navegación para moverte por las áreas principales." },
    "dashboard-today": { title: "Tu próximo paso", description: "Mira qué sigue y actualiza cada elemento mientras avanzas." },
    "routine-calendar": { title: "Planifica cada día", description: "Elige una fecha para revisar o ajustar tu plan." },
    "routine-timeline": { title: "Organiza tu día", description: "Crea bloques para tareas y compromisos en horarios que te sirvan." },
    "routine-default": { title: "Lo que se repite", description: "Guarda aquí actividades recurrentes como estudio, ejercicio o trabajo." },
    "goal-create": { title: "Convierte planes en metas", description: "Define una meta clara para seguir tu avance." },
    "goal-list": { title: "Sigue tus metas", description: "Mira el progreso y conecta los hábitos que te acercan a ellas." },
    "habit-guide": { title: "Entiende tu constancia", description: "Los colores muestran tu ritmo y ayudan a ajustarlo sin presión." },
    "habit-card": { title: "Cada hábito en un lugar", description: "Sigue su frecuencia, progreso y relación con tus metas." },
    "calendar-main": { title: "Tu semana en conjunto", description: "Mira todo por fecha para encontrar espacio y evitar conflictos." },
    "assistant-composer": { title: "Habla con Alfred", description: "Escribe con naturalidad: Alfred usa tu contexto para ayudarte." },
    "insights-summary": { title: "Mira tu progreso", description: "Usa este resumen como guía, nunca como presión." },
    "insights-patterns": { title: "Descubre qué funciona", description: "Observa varias semanas antes de cambiar tu estrategia." },
    "settings-preferences": { title: "A tu manera", description: "Ajusta la apariencia y repite este tutorial cuando quieras." },
  },
  fr: {
    "dashboard-overview": { title: "Votre journée en un coup d’œil", description: "Voyez ce qui compte maintenant et comment avance votre journée." },
    "app-navigation": { title: "Tout à portée de main", description: "Utilisez la navigation pour parcourir les zones principales." },
    "dashboard-today": { title: "Votre prochaine étape", description: "Voyez la suite et actualisez chaque élément en avançant." },
    "routine-calendar": { title: "Planifiez jour après jour", description: "Choisissez une date pour consulter ou ajuster votre planning." },
    "routine-timeline": { title: "Composez votre journée", description: "Créez des blocs aux horaires qui vous conviennent vraiment." },
    "routine-default": { title: "Ce qui se répète", description: "Gardez ici les activités régulières : études, sport ou travail." },
    "goal-create": { title: "Transformez vos plans en objectifs", description: "Définissez un objectif clair pour suivre votre progression." },
    "goal-list": { title: "Suivez vos objectifs", description: "Voyez les progrès et reliez les habitudes qui vous en rapprochent." },
    "habit-guide": { title: "Comprenez votre régularité", description: "Les couleurs montrent votre rythme et aident à l’ajuster sans pression." },
    "habit-card": { title: "Chaque habitude au même endroit", description: "Suivez sa fréquence, sa progression et son objectif associé." },
    "calendar-main": { title: "Votre semaine réunie", description: "Voyez tout par date pour trouver du temps et éviter les conflits." },
    "assistant-composer": { title: "Parlez à Alfred", description: "Écrivez naturellement : Alfred utilise votre contexte pour vous aider." },
    "insights-summary": { title: "Voyez vos progrès", description: "Utilisez ce résumé comme guide, jamais comme pression." },
    "insights-patterns": { title: "Découvrez ce qui fonctionne", description: "Observez plusieurs semaines avant de changer de stratégie." },
    "settings-preferences": { title: "À votre façon", description: "Ajustez l’apparence et relancez ce tutoriel quand vous voulez." },
  },
};

/** A short, flow-oriented tour shared by mobile and desktop. */
export function essentialFirstAccessTourSteps(steps: FirstAccessTourStep[], language: SupportedLanguage) {
  const includedTargets = new Set<string>();
  return steps.flatMap((step) => {
    const target = selectorId(step.selector, step.id);
    if (!essentialTourTargets.has(target) || includedTargets.has(target)) return [];
    includedTargets.add(target);
    return [{ ...step, ...essentialTourCopy[language][target] }];
  });
}
