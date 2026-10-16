/*
 * Configuração dos serviços externos do site (todos opcionais).
 * Com os campos vazios, o site funciona normalmente: contas ficam "em breve"
 * e o assistente usa a busca local.
 *
 * A chave do Supabase abaixo é a chave PÚBLICA (anon/publishable). Ela foi feita
 * para ficar no navegador: quem protege os dados são as regras de segurança
 * (RLS) criadas pelo ficheiro servicos/supabase/schema.sql.
 */
window.ATALHO_CONFIG = {
  supabase: {
    url: "https://onjmugnpjvflomrevknh.supabase.co",
    chavePublica: "sb_publishable__6ZgOxk9Ir-zZjz_QuDmdQ_rdxDSIhF",
  },
  assistente: {
    url: "",
  },
  // Pagamentos pela Revolut Business (funções revolut-loja e revolut-webhook do Supabase).
  // false = ainda não está à venda: o botão leva para a lista de espera.
  pagamentos: {
    ativo: false,
  },
};
