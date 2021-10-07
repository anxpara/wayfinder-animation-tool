import dts from 'rollup-plugin-dts'
const config = [
  {
    input: './dist/wayfinder.d.ts',
    output: [{ file: 'dist/umd/wayfinder.min.d.ts', format: 'umd' }],
    plugins: [dts()],
  },
]
export default config