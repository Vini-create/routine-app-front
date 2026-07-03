import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/app/LegalPage";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso">
      <LegalSection title="1. Aceitação"><p>Ao criar uma conta ou usar o Winperium, você concorda com estes Termos e com a Política de Privacidade. Se não concordar, não utilize o serviço.</p></LegalSection>
      <LegalSection title="2. Conta e segurança"><p>Você deve fornecer informações válidas, manter sua senha em segurança e nos avisar pelo canal de Feedback caso suspeite de acesso indevido. Cada pessoa é responsável pelas ações realizadas em sua conta.</p></LegalSection>
      <LegalSection title="3. Uso permitido"><p>O Winperium deve ser usado para organização pessoal e produtividade. Não é permitido tentar acessar contas ou sistemas de terceiros, contornar limites, introduzir código malicioso ou usar o serviço de forma ilegal ou abusiva.</p></LegalSection>
      <LegalSection title="4. Recomendações e inteligência artificial"><p>Sugestões de rotina e conteúdos gerados pelo produto têm caráter informativo e organizacional. Eles não substituem aconselhamento médico, psicológico, jurídico ou financeiro profissional. Você continua responsável por suas decisões.</p></LegalSection>
      <LegalSection title="5. Disponibilidade"><p>Buscamos manter o serviço disponível e seguro, mas podem ocorrer manutenções, falhas ou mudanças. Recursos podem evoluir à medida que o produto é desenvolvido.</p></LegalSection>
      <LegalSection title="6. Conteúdo do usuário"><p>Você mantém os direitos sobre as informações que registra e nos autoriza a processá-las apenas na medida necessária para operar e melhorar os recursos contratados.</p></LegalSection>
      <LegalSection title="7. Encerramento"><p>Você pode excluir sua conta nas configurações. Também podemos restringir contas que violem estes Termos, comprometam a segurança ou prejudiquem outros usuários.</p></LegalSection>
      <LegalSection title="8. Alterações"><p>Estes Termos podem ser atualizados para refletir mudanças legais ou do produto. Alterações relevantes serão comunicadas de forma apropriada.</p></LegalSection>
    </LegalPage>
  );
}
