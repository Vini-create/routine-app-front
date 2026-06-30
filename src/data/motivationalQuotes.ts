import motivationalQuoteTranslations from "./motivationalQuoteTranslations.json";
import type { SupportedLanguage } from "@/lib/i18n";

export type MotivationalQuoteCategory = "philosophy" | "sports" | "science" | "courage";

// Traduções livres de falas e trechos identificados em `source`.
// `category` prepara o acervo para uma futura seleção contextual.
export const motivationalQuotes = [
  // Filosofia — 10 autores
  { author: "Marco Aurélio", quote: "Não discuta mais sobre como deve ser uma boa pessoa. Seja uma.", source: "Meditações, Livro X", category: "philosophy" },
  { author: "Marco Aurélio", quote: "A alma recebe a cor dos pensamentos que você cultiva.", source: "Meditações, Livro V", category: "philosophy" },
  { author: "Marco Aurélio", quote: "Cuide apenas do momento presente; não deixe a vida inteira perturbá-lo.", source: "Meditações, Livro VIII", category: "philosophy" },
  { author: "Epicteto", quote: "Algumas coisas dependem de nós; outras não dependem.", source: "Manual, 1", category: "philosophy" },
  { author: "Epicteto", quote: "Não são os fatos que perturbam, mas os julgamentos sobre eles.", source: "Manual, 5", category: "philosophy" },
  { author: "Epicteto", quote: "Diante de cada dificuldade, procure em si a capacidade de enfrentá-la.", source: "Manual, 10", category: "philosophy" },
  { author: "Sêneca", quote: "Não recebemos uma vida curta; nós é que a tornamos curta.", source: "Sobre a Brevidade da Vida, I", category: "philosophy" },
  { author: "Sêneca", quote: "Enquanto adiamos, a vida passa.", source: "Cartas a Lucílio, 1", category: "philosophy" },
  { author: "Sêneca", quote: "Nenhuma árvore se torna firme sem enfrentar muitos ventos.", source: "Da Providência, IV", category: "philosophy" },
  { author: "Aristóteles", quote: "A felicidade é uma atividade da alma de acordo com a excelência.", source: "Ética a Nicômaco, I.7", category: "philosophy" },
  { author: "Aristóteles", quote: "Nós nos tornamos justos praticando atos justos.", source: "Ética a Nicômaco, II.1", category: "philosophy" },
  { author: "Aristóteles", quote: "Os hábitos adquiridos desde a juventude fazem toda a diferença.", source: "Ética a Nicômaco, II.1", category: "philosophy" },
  { author: "Confúcio", quote: "Estudar sem refletir é esforço perdido; refletir sem estudar é perigoso.", source: "Analectos, II.15", category: "philosophy" },
  { author: "Confúcio", quote: "Ao ver alguém digno, pense em igualá-lo; ao ver o contrário, examine a si mesmo.", source: "Analectos, IV.17", category: "philosophy" },
  { author: "Confúcio", quote: "A pessoa nobre é modesta nas palavras e excede nas ações.", source: "Analectos, XIV.29", category: "philosophy" },
  { author: "Lao-Tsé", quote: "Uma jornada de mil léguas começa sob os seus pés.", source: "Tao Te Ching, 64", category: "philosophy" },
  { author: "Lao-Tsé", quote: "Quem vence os outros é forte; quem vence a si mesmo é poderoso.", source: "Tao Te Ching, 33", category: "philosophy" },
  { author: "Lao-Tsé", quote: "As grandes realizações começam com pequenos atos.", source: "Tao Te Ching, 63", category: "philosophy" },
  { author: "Sócrates", quote: "Uma vida sem exame não vale a pena ser vivida.", source: "Platão, Apologia, 38a", category: "philosophy" },
  { author: "Sócrates", quote: "A sabedoria começa no reconhecimento da própria ignorância.", source: "Platão, Apologia, 21d", category: "philosophy" },
  { author: "Sócrates", quote: "O espanto é o começo da filosofia.", source: "Platão, Teeteto, 155d", category: "philosophy" },
  { author: "Friedrich Nietzsche", quote: "Quem tem um porquê para viver suporta quase qualquer como.", source: "Crepúsculo dos Ídolos", category: "philosophy" },
  { author: "Friedrich Nietzsche", quote: "Aquilo que não me mata torna-me mais forte.", source: "Crepúsculo dos Ídolos", category: "philosophy" },
  { author: "Friedrich Nietzsche", quote: "Torne-se aquilo que você é.", source: "A Gaia Ciência", category: "philosophy" },
  { author: "Michel de Montaigne", quote: "Minha profissão e minha arte são viver.", source: "Ensaios, Livro II", category: "philosophy" },
  { author: "Michel de Montaigne", quote: "Quem ensina alguém a morrer também o ensina a viver.", source: "Ensaios, Livro I", category: "philosophy" },
  { author: "Michel de Montaigne", quote: "A maior coisa do mundo é saber pertencer a si mesmo.", source: "Ensaios, Livro I", category: "philosophy" },
  { author: "Simone de Beauvoir", quote: "Querer-se livre é também querer livres as outras pessoas.", source: "Por uma Moral da Ambiguidade", category: "philosophy" },
  { author: "Simone de Beauvoir", quote: "A vida conserva valor enquanto damos valor à vida dos outros.", source: "Por uma Moral da Ambiguidade", category: "philosophy" },
  { author: "Simone de Beauvoir", quote: "A liberdade é a fonte de onde surgem significados e valores.", source: "Por uma Moral da Ambiguidade", category: "philosophy" },

  // Esporte — 10 atletas
  { author: "Ayrton Senna", quote: "Cada vez que avanço, encontro algo novo em mim.", source: "Entrevista reproduzida pelo Hall da Fama da Fórmula 1", category: "sports" },
  { author: "Ayrton Senna", quote: "Os extremos da velocidade e da fragilidade ajudam você a se conhecer profundamente.", source: "Entrevista reproduzida pelo Hall da Fama da Fórmula 1", category: "sports" },
  { author: "Ayrton Senna", quote: "Quero viver plenamente, com muita intensidade.", source: "Entrevista de 1994 reproduzida pela Fórmula 1", category: "sports" },
  { author: "Marta", quote: "Talento sem esforço não leva você muito longe.", source: "Entrevista à FIFA, 2020", category: "sports" },
  { author: "Marta", quote: "É preciso chorar no começo para poder sorrir no fim.", source: "Discurso após a Copa do Mundo de 2019", category: "sports" },
  { author: "Marta", quote: "Aproveite o momento, persiga seus sonhos e acredite em si.", source: "Entrevista à FIFA, 2017", category: "sports" },
  { author: "Pelé", quote: "Sucesso não é acidente: é trabalho, perseverança, aprendizado e sacrifício.", source: "Pelé: The Autobiography", category: "sports" },
  { author: "Pelé", quote: "Tudo é prática.", source: "Entrevistas reunidas em Pelé: The Autobiography", category: "sports" },
  { author: "Pelé", quote: "Entusiasmo é tudo; precisa estar vibrando como uma corda de violão.", source: "Pelé: The Autobiography", category: "sports" },
  { author: "Muhammad Ali", quote: "Não conte os dias; faça os dias contarem.", source: "Entrevistas de Muhammad Ali", category: "sports" },
  { author: "Muhammad Ali", quote: "O impossível é temporário. O impossível não é nada.", source: "Declaração de Muhammad Ali", category: "sports" },
  { author: "Muhammad Ali", quote: "Odiei cada minuto de treino, mas disse a mim mesmo: não desista.", source: "The Soul of a Butterfly", category: "sports" },
  { author: "Michael Jordan", quote: "Falhei repetidas vezes na minha vida. É por isso que tive sucesso.", source: "Campanha Failure, Nike, 1997", category: "sports" },
  { author: "Michael Jordan", quote: "Obstáculos não precisam pará-lo; encontre uma forma de superá-los.", source: "For the Love of the Game", category: "sports" },
  { author: "Michael Jordan", quote: "Limites, assim como medos, muitas vezes são apenas uma ilusão.", source: "Discurso no Hall da Fama, 2009", category: "sports" },
  { author: "Kobe Bryant", quote: "Dedicação faz os sonhos se tornarem realidade.", source: "The Mamba Mentality", category: "sports" },
  { author: "Kobe Bryant", quote: "Tudo que é negativo é uma oportunidade para eu crescer.", source: "Entrevistas reunidas em The Mamba Mentality", category: "sports" },
  { author: "Kobe Bryant", quote: "Grandes coisas surgem de trabalho duro e perseverança. Sem desculpas.", source: "The Mamba Mentality", category: "sports" },
  { author: "Serena Williams", quote: "Uma campeã é definida pela forma como se recupera quando cai.", source: "Entrevista à National, 2012", category: "sports" },
  { author: "Serena Williams", quote: "Sorte não tem nada a ver com as muitas horas que passei treinando.", source: "On the Line", category: "sports" },
  { author: "Serena Williams", quote: "Eu não gosto de perder em nada, mas cresci mais com as derrotas.", source: "Entrevista à ESPN", category: "sports" },
  { author: "Billie Jean King", quote: "Campeões continuam jogando até acertarem.", source: "Pressure Is a Privilege", category: "sports" },
  { author: "Billie Jean King", quote: "Pressão é um privilégio.", source: "Pressure Is a Privilege", category: "sports" },
  { author: "Billie Jean King", quote: "Não permita que outra pessoa defina você; defina a si mesmo.", source: "Entrevistas de Billie Jean King", category: "sports" },
  { author: "Michael Phelps", quote: "Não coloque limites em nada: quanto mais sonha, mais longe chega.", source: "Beneath the Surface", category: "sports" },
  { author: "Michael Phelps", quote: "Para ser o melhor, faça aquilo que outras pessoas não estão dispostas a fazer.", source: "No Limits", category: "sports" },
  { author: "Michael Phelps", quote: "Quero olhar para trás e saber que fiz tudo o que podia.", source: "Entrevista ao Comitê Olímpico Internacional", category: "sports" },
  { author: "Simone Biles", quote: "Prefiro me arrepender dos riscos que não deram certo às chances que não aproveitei.", source: "Courage to Soar", category: "sports" },
  { author: "Simone Biles", quote: "A saúde mental não deve ser tratada de forma diferente da saúde física.", source: "Depoimento ao Senado dos EUA, 2021", category: "sports" },
  { author: "Simone Biles", quote: "A prática cria confiança; a confiança dá poder.", source: "Courage to Soar", category: "sports" },

  // Ciência e educação — 10 autores
  { author: "Albert Einstein", quote: "A vida é como andar de bicicleta: para manter o equilíbrio, continue em movimento.", source: "Carta a Eduard Einstein, 1930", category: "science" },
  { author: "Albert Einstein", quote: "Quem nunca cometeu um erro nunca tentou algo novo.", source: "Entrevista à imprensa, 1921", category: "science" },
  { author: "Albert Einstein", quote: "A imaginação é mais importante que o conhecimento.", source: "Entrevista ao Saturday Evening Post, 1929", category: "science" },
  { author: "Marie Curie", quote: "Na vida, nada deve ser temido; deve apenas ser compreendido.", source: "Pierre Curie, 1923", category: "science" },
  { author: "Marie Curie", quote: "Precisamos acreditar que somos capazes de alguma coisa.", source: "Madame Curie, de Ève Curie", category: "science" },
  { author: "Marie Curie", quote: "Nunca noto o que já foi feito; vejo apenas o que ainda falta fazer.", source: "Madame Curie, de Ève Curie", category: "science" },
  { author: "Katherine Johnson", quote: "Gostar do que você faz ajuda você a fazer o seu melhor.", source: "Entrevista à NASA", category: "science" },
  { author: "Katherine Johnson", quote: "Faça o seu melhor o tempo todo.", source: "Entrevista à NASA", category: "science" },
  { author: "Katherine Johnson", quote: "Eu ia até a raiz da pergunta — e encontrava a resposta.", source: "Entrevista à NASA", category: "science" },
  { author: "Carl Sagan", quote: "A imaginação frequentemente nos leva a mundos que nunca existiram; sem ela, não vamos a lugar algum.", source: "Cosmos", category: "science" },
  { author: "Carl Sagan", quote: "Somos uma forma de o cosmos conhecer a si mesmo.", source: "Cosmos", category: "science" },
  { author: "Carl Sagan", quote: "A ciência é mais uma maneira de pensar do que um conjunto de conhecimentos.", source: "O Mundo Assombrado pelos Demônios", category: "science" },
  { author: "Paulo Freire", quote: "Ensinar não é transferir conhecimento, mas criar possibilidades para sua construção.", source: "Pedagogia da Autonomia", category: "science" },
  { author: "Paulo Freire", quote: "Ninguém educa ninguém; as pessoas se educam em comunhão, mediadas pelo mundo.", source: "Pedagogia do Oprimido", category: "science" },
  { author: "Paulo Freire", quote: "A leitura do mundo precede a leitura da palavra.", source: "A Importância do Ato de Ler", category: "science" },
  { author: "Maria Montessori", quote: "A educação é um processo natural realizado pela criança, não adquirido ao ouvir palavras.", source: "Education for a New World", category: "science" },
  { author: "Maria Montessori", quote: "O maior sinal de sucesso é poder dizer: as crianças trabalham como se eu não existisse.", source: "The Absorbent Mind", category: "science" },
  { author: "Maria Montessori", quote: "A primeira tarefa da educação é estimular a vida e deixá-la livre para se desenvolver.", source: "The Discovery of the Child", category: "science" },
  { author: "Stephen Hawking", quote: "Por mais difícil que a vida pareça, sempre há algo que você pode fazer e realizar.", source: "Discurso em Hong Kong, 2016", category: "science" },
  { author: "Stephen Hawking", quote: "Olhe para as estrelas, não para os seus pés.", source: "Discurso no 70º aniversário, 2012", category: "science" },
  { author: "Stephen Hawking", quote: "Inteligência é a capacidade de se adaptar à mudança.", source: "Entrevistas de Stephen Hawking", category: "science" },
  { author: "Jane Goodall", quote: "O que você faz produz diferença; decida que diferença quer produzir.", source: "Reason for Hope", category: "science" },
  { author: "Jane Goodall", quote: "Cada pessoa importa, tem um papel e pode fazer diferença.", source: "Reason for Hope", category: "science" },
  { author: "Jane Goodall", quote: "Somente quando entendemos podemos cuidar; somente quando cuidamos podemos ajudar.", source: "In the Shadow of Man", category: "science" },
  { author: "George Washington Carver", quote: "Quando você faz coisas comuns de modo incomum, conquista a atenção do mundo.", source: "Declarações reunidas pelo Tuskegee Institute", category: "science" },
  { author: "George Washington Carver", quote: "A educação é a chave que abre a porta dourada da liberdade.", source: "Declarações reunidas pelo Tuskegee Institute", category: "science" },
  { author: "George Washington Carver", quote: "O quanto você avança depende da ternura com os jovens e da compaixão com quem luta.", source: "Declarações reunidas pelo Tuskegee Institute", category: "science" },
  { author: "Ada Lovelace", quote: "A imaginação é, acima de tudo, a faculdade de descobrir.", source: "Carta a Charles Babbage, 1841", category: "science" },
  { author: "Ada Lovelace", quote: "Quanto mais estudo, mais insaciável sinto que se torna meu talento.", source: "Carta a Mary Somerville, 1840", category: "science" },
  { author: "Ada Lovelace", quote: "A ciência das operações possui verdades próprias, além das verdades da matemática.", source: "Notas sobre a Máquina Analítica, 1843", category: "science" },

  // Coragem, literatura e sociedade — 10 autores
  { author: "Nelson Mandela", quote: "Coragem não é ausência de medo, mas o triunfo sobre ele.", source: "Long Walk to Freedom", category: "courage" },
  { author: "Nelson Mandela", quote: "Depois de subir uma grande montanha, descobrimos que há muitas outras a subir.", source: "Long Walk to Freedom", category: "courage" },
  { author: "Nelson Mandela", quote: "A educação é a arma mais poderosa que podemos usar para mudar o mundo.", source: "Discurso no Planetarium de Joanesburgo, 2003", category: "courage" },
  { author: "Martin Luther King Jr.", quote: "A medida de uma pessoa aparece nos momentos de desafio e controvérsia.", source: "Strength to Love", category: "courage" },
  { author: "Martin Luther King Jr.", quote: "A pergunta mais urgente da vida é: o que você está fazendo pelos outros?", source: "Discurso em Montgomery, 1957", category: "courage" },
  { author: "Martin Luther King Jr.", quote: "Comprometa-se com a nobre luta pelos direitos humanos.", source: "Discurso reproduzido pelo King Center", category: "courage" },
  { author: "Mahatma Gandhi", quote: "A satisfação está no esforço, não apenas na conquista.", source: "The Collected Works of Mahatma Gandhi", category: "courage" },
  { author: "Mahatma Gandhi", quote: "A força não vem da capacidade física; vem de uma vontade indomável.", source: "Young India", category: "courage" },
  { author: "Mahatma Gandhi", quote: "O futuro depende do que fazemos no presente.", source: "The Collected Works of Mahatma Gandhi", category: "courage" },
  { author: "Malala Yousafzai", quote: "Uma criança, um professor, um livro e uma caneta podem mudar o mundo.", source: "Discurso na ONU, 2013", category: "courage" },
  { author: "Malala Yousafzai", quote: "Erguemos nossa voz para que as pessoas sem voz possam ser ouvidas.", source: "Discurso na ONU, 2013", category: "courage" },
  { author: "Malala Yousafzai", quote: "Minhas esperanças são as mesmas. Meus sonhos são os mesmos.", source: "Discurso na ONU, 2013", category: "courage" },
  { author: "Anne Frank", quote: "É maravilhoso que ninguém precise esperar para começar a melhorar o mundo.", source: "O Diário de Anne Frank", category: "courage" },
  { author: "Anne Frank", quote: "Onde há esperança, há vida.", source: "O Diário de Anne Frank", category: "courage" },
  { author: "Anne Frank", quote: "Pense em toda a beleza que ainda existe ao seu redor e seja feliz.", source: "O Diário de Anne Frank", category: "courage" },
  { author: "Maya Angelou", quote: "Faça o melhor que puder até saber mais; quando souber mais, faça melhor.", source: "Entrevistas de Maya Angelou", category: "courage" },
  { author: "Maya Angelou", quote: "As pessoas lembrarão de como você as fez sentir.", source: "Entrevistas de Maya Angelou", category: "courage" },
  { author: "Maya Angelou", quote: "Nada funciona se você não trabalhar.", source: "Wouldn't Take Nothing for My Journey Now", category: "courage" },
  { author: "Helen Keller", quote: "O otimismo é a fé que conduz à realização.", source: "Otimismo", category: "courage" },
  { author: "Helen Keller", quote: "A vida é uma aventura ousada ou não é nada.", source: "The Open Door", category: "courage" },
  { author: "Helen Keller", quote: "Conhecimento é amor, luz e visão.", source: "A História da Minha Vida", category: "courage" },
  { author: "James Baldwin", quote: "Nem tudo que enfrentamos pode ser mudado; nada muda até ser enfrentado.", source: "As Much Truth as One Can Bear", category: "courage" },
  { author: "James Baldwin", quote: "O mundo está diante de você, e não precisa aceitá-lo como ele é.", source: "The Price of the Ticket", category: "courage" },
  { author: "James Baldwin", quote: "Conheça de onde veio; isso abre possibilidades quase ilimitadas para onde ir.", source: "The Price of the Ticket", category: "courage" },
  { author: "Viktor Frankl", quote: "Quando não podemos mudar uma situação, somos desafiados a mudar a nós mesmos.", source: "Em Busca de Sentido", category: "courage" },
  { author: "Viktor Frankl", quote: "Tudo pode ser tirado, menos a liberdade de escolher nossa atitude.", source: "Em Busca de Sentido", category: "courage" },
  { author: "Viktor Frankl", quote: "A busca por sentido é uma motivação fundamental da vida humana.", source: "Em Busca de Sentido", category: "courage" },
  { author: "Theodore Roosevelt", quote: "O crédito pertence a quem está de fato na arena.", source: "Cidadania em uma República, 1910", category: "courage" },
  { author: "Theodore Roosevelt", quote: "O melhor prêmio da vida é trabalhar duro em algo que vale a pena.", source: "Discurso no New York State Fair, 1903", category: "courage" },
  { author: "Theodore Roosevelt", quote: "Nada que valha a pena é alcançado sem esforço, dor e dificuldade.", source: "American Ideals in Education", category: "courage" },
] as const satisfies readonly {
  author: string;
  quote: string;
  source: string;
  category: MotivationalQuoteCategory;
}[];

const quoteRotationStep = 37;

export function getMotivationalQuoteForDay(day: number, language: SupportedLanguage) {
  const index = ((day - 1) * quoteRotationStep) % motivationalQuotes.length;
  const quote = motivationalQuotes[index];

  if (language === "pt-BR") return quote;

  return {
    ...quote,
    quote: motivationalQuoteTranslations[language][index] ?? quote.quote,
  };
}
