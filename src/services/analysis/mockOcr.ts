// Leitura de imagem SIMULADA (modo demonstração).
// O OCR real (Tesseract) roda no backend; sem backend o app usa estes textos de exemplo.
const SAMPLES: readonly string[] = [
  'Comprovante de Pix: valor R$ 1.980,00. Para liberar seu prêmio faça o pagamento da taxa de liberação agora mesmo e não conte a ninguém.',
  'Banco Seguro: sua conta será bloqueada em 24h. Clique no link para regularizar: bit.ly/seguro123',
  'Oi mãe, mudei de número. Salva o novo? Preciso que faça um Pix urgente, depois te explico.',
];

export function simulateOcr(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100003;
  }
  return SAMPLES[hash % SAMPLES.length] ?? SAMPLES[0] ?? '';
}
