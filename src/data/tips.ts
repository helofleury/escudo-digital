export interface QuickTip {
  id: string;
  text: string;
}

export const QUICK_TIPS: readonly QuickTip[] = [
  { id: 'tip-1', text: 'Desconfie de ofertas boas demais para ser verdade!' },
  { id: 'tip-2', text: 'Golpes podem se disfarçar como mensagens comuns.' },
  { id: 'tip-3', text: 'Bancos nunca pedem sua senha ou código por mensagem.' },
  { id: 'tip-4', text: 'Recebeu um pedido de dinheiro de um parente? Ligue antes de fazer o Pix.' },
  { id: 'tip-5', text: 'Links encurtados escondem o destino. Pense duas vezes antes de tocar.' },
  { id: 'tip-6', text: 'Urgência é a arma favorita do golpista. Respire e confirme.' },
  { id: 'tip-7', text: 'Ative a verificação em duas etapas no WhatsApp e nos seus aplicativos.' },
  { id: 'tip-8', text: 'Na dúvida, entre no site oficial digitando o endereço você mesmo.' },
];
