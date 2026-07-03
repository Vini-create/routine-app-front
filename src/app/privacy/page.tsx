import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/app/LegalPage";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <LegalSection title="1. Dados que tratamos"><p>Tratamos os dados fornecidos na criação e manutenção da conta, como nome, e-mail, idioma, metas, hábitos, itens de rotina e registros de uso necessários para oferecer o Winperium.</p></LegalSection>
      <LegalSection title="2. Como usamos os dados"><p>Usamos essas informações para autenticar sua conta, entregar os recursos solicitados, manter a segurança, melhorar a experiência e prestar suporte. Não vendemos seus dados pessoais.</p></LegalSection>
      <LegalSection title="3. Prestadores de serviço"><p>Podemos utilizar fornecedores de infraestrutura, banco de dados, hospedagem e envio de e-mails. Eles recebem somente os dados necessários para executar seus serviços e devem protegê-los adequadamente.</p></LegalSection>
      <LegalSection title="4. Segurança e retenção"><p>Adotamos controles técnicos e organizacionais para proteger as informações. Mantemos os dados pelo período necessário à prestação do serviço, cumprimento de obrigações e prevenção de abuso. Nenhum sistema conectado à internet é totalmente isento de riscos.</p></LegalSection>
      <LegalSection title="5. Seus direitos"><p>Você pode atualizar dados do perfil, sair das sessões e solicitar a exclusão da conta pelas configurações. Pedidos adicionais sobre acesso, correção ou tratamento de dados podem ser enviados pelo canal de Feedback disponível no produto.</p></LegalSection>
      <LegalSection title="6. Cookies e armazenamento local"><p>Usamos armazenamento local e cookies essenciais para manter preferências de idioma, tema e sessão. Eles são necessários para o funcionamento atual da aplicação.</p></LegalSection>
      <LegalSection title="7. Alterações"><p>Esta política pode ser atualizada conforme o produto evolui. Mudanças relevantes serão comunicadas de forma apropriada no serviço.</p></LegalSection>
    </LegalPage>
  );
}
