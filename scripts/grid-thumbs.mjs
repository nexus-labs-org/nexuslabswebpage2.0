// Gera as miniaturas que a grade da página inicial usa (public/projects/grid/).
// A grade desenha cada imagem pequena, então baixar os arquivos originais só pesa no celular.
// Rode depois de trocar ou adicionar imagens em public/projects/:  npm run thumbs
import { mkdir, readdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../public/projects/', import.meta.url))
const out = join(root, 'grid')
// Um espaço do atlas tem no máximo 512 px de largura (atlas de 4096 px, 8 colunas).
const WIDTH = 512

async function* jpgs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) { if (path !== out) yield* jpgs(path) }
    else if (/\.jpe?g$/i.test(entry.name)) yield path
  }
}

let count = 0
for await (const src of jpgs(root)) {
  const dest = join(out, relative(root, src))
  await mkdir(dirname(dest), { recursive: true })
  await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(dest)
  count++
}
console.log(`${count} miniaturas em public/projects/grid/`)
