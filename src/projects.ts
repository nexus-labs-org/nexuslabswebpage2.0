// Projetos exibidos na grade e na galeria. Para trocar pelos cases reais, edite esta lista e
// substitua os arquivos em public/projects/ (6 imagens por projeto, proporção 3:2, ex.: 1200x800).
//
// A ordem das imagens segue o desenho da grade:
//   1 larga · 2 · 3      (fileira de cima)
//   4 · 5 · 6 larga      (fileira de baixo)
// A imagem 6 pode ter um vídeo (`video`): ele toca no lugar dela na galeria e, em versão leve
// (`videoSmall`, ex.: 480x320), na grade. A imagem 6 continua sendo o quadro de espera do vídeo.
//
// `illustrative: true` marca o projeto como exemplo ilustrativo em todos os lugares onde aparece.
// Os exemplos atuais são produtos fictícios; as telas foram desenhadas para o site e as fotos vêm
// do Unsplash, sob a Licença Unsplash (uso comercial gratuito, sem atribuição obrigatória).

export type Project = {
  slug: string
  name: string
  kind: string
  summary: string
  images: string[]
  video?: string
  videoSmall?: string
  illustrative?: boolean
}

const example = (slug: string, name: string, kind: string, summary: string): Project => ({
  slug,
  name,
  kind,
  summary,
  images: [
    `/projects/${slug}-1.jpg`,
    `/projects/photos/${slug}-a.jpg`,
    `/projects/${slug}-3.jpg`,
    `/projects/${slug}-4.jpg`,
    `/projects/photos/${slug}-b.jpg`,
    `/projects/${slug}-6.jpg`,
  ],
  video: `/projects/${slug}-6.webm`,
  videoSmall: `/projects/${slug}-6-sm.webm`,
  illustrative: true,
})

export const projects: Project[] = [
  example('financas', 'App de finanças pessoais', 'Aplicativo mobile', 'Controle de gastos, metas e investimentos em um app só.'),
  example('logistica', 'Painel de logística', 'Sistema sob medida', 'Rotas, entregas e frota acompanhadas em tempo real.'),
  example('marketplace', 'Marketplace B2B', 'Plataforma web', 'Fornecedores e compradores negociando no mesmo lugar.'),
  example('cursos', 'Plataforma de cursos', 'Plataforma web', 'Aulas, trilhas e certificados para quem ensina on-line.'),
  example('saude', 'App de agendamento em saúde', 'Aplicativo mobile', 'Consultas marcadas, lembretes e histórico do paciente.'),
  example('gestao', 'Sistema de gestão', 'Sistema sob medida', 'Estoque, financeiro e vendas da operação em um painel.'),
  example('moda', 'E-commerce de moda', 'Plataforma web', 'Vitrine, carrinho e checkout pensados para o celular.'),
  example('imoveis', 'Portal imobiliário', 'Plataforma web', 'Busca por mapa, visitas agendadas e propostas on-line.'),
  example('mobilidade', 'App de mobilidade', 'Aplicativo mobile', 'Corridas, pagamentos e avaliações em poucos toques.'),
  example('crm', 'CRM sob medida', 'Sistema sob medida', 'Funil de vendas desenhado para o jeito do time vender.'),
  example('eventos', 'Plataforma de eventos', 'Plataforma web', 'Ingressos, check-in e programação ao vivo.'),
  example('dados', 'Painel de dados', 'Sistema sob medida', 'Indicadores do negócio reunidos e atualizados sozinhos.'),
]
