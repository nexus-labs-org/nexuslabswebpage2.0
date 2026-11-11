// Projetos exibidos na grade. Para trocar pelos cases reais, edite esta lista e
// substitua as imagens em public/projects/ (6 por projeto, proporção 3:2, ex.: 1200x800).
// `illustrative: true` mostra o aviso "Imagens ilustrativas" no painel do projeto.

export type Project = {
  slug: string
  name: string
  kind: string
  summary: string
  images: string[]
  illustrative?: boolean
}

const placeholder = (slug: string, name: string, kind: string, summary: string): Project => ({
  slug,
  name,
  kind,
  summary,
  images: Array.from({ length: 6 }, (_, i) => `/projects/${slug}-${i + 1}.svg`),
  illustrative: true,
})

export const projects: Project[] = [
  placeholder('financas', 'App de finanças pessoais', 'Aplicativo mobile', 'Controle de gastos, metas e investimentos em um app só.'),
  placeholder('logistica', 'Painel de logística', 'Sistema sob medida', 'Rotas, entregas e frota acompanhadas em tempo real.'),
  placeholder('marketplace', 'Marketplace B2B', 'Plataforma web', 'Fornecedores e compradores negociando no mesmo lugar.'),
  placeholder('cursos', 'Plataforma de cursos', 'Plataforma web', 'Aulas, trilhas e certificados para quem ensina on-line.'),
  placeholder('saude', 'App de agendamento em saúde', 'Aplicativo mobile', 'Consultas marcadas, lembretes e histórico do paciente.'),
  placeholder('gestao', 'Sistema de gestão', 'Sistema sob medida', 'Estoque, financeiro e vendas da operação em um painel.'),
  placeholder('moda', 'E-commerce de moda', 'Plataforma web', 'Vitrine, carrinho e checkout pensados para o celular.'),
  placeholder('imoveis', 'Portal imobiliário', 'Plataforma web', 'Busca por mapa, visitas agendadas e propostas on-line.'),
  placeholder('mobilidade', 'App de mobilidade', 'Aplicativo mobile', 'Corridas, pagamentos e avaliações em poucos toques.'),
  placeholder('crm', 'CRM sob medida', 'Sistema sob medida', 'Funil de vendas desenhado para o jeito do time vender.'),
  placeholder('eventos', 'Plataforma de eventos', 'Plataforma web', 'Ingressos, check-in e programação ao vivo.'),
  placeholder('dados', 'Painel de dados', 'Sistema sob medida', 'Indicadores do negócio reunidos e atualizados sozinhos.'),
]
