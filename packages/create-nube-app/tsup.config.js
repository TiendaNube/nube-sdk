// tsup.config.js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // ponto de entrada do seu projeto
  format: ['esm'],  // formatos de saída
  bundle: false,           // não agrupa os módulos em um único arquivo
  minify: false,           // desabilita a minificação
  sourcemap: false,         // gera sourcemaps para facilitar o debug
  clean: true,             // limpa a pasta de saída antes de cada build
  target: 'node16',        // define o alvo (ajuste conforme sua versão do Node)
  dts: false,               // gera arquivos de definição TypeScript (.d.ts)
});
