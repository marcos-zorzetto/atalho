/*
 * Configuração dos serviços externos do site (todos opcionais).
 * Com os campos vazios, o site funciona normalmente: contas ficam "em breve"
 * e o assistente usa a busca local.
 *
 * A chave do Supabase abaixo é a chave PÚBLICA (anon/publishable). Ela foi feita
 * para ficar no navegador: quem protege os dados são as regras de segurança
 * (RLS) criadas pelo arquivo servicos/supabase/schema.sql.
 */
window.ATALHO_CONFIG = {
  supabase: {
    url: "",
    chavePublica: "",
  },
  assistente: {
    url: "",
  },
};
