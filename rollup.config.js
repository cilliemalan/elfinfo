import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from '@wessberg/rollup-plugin-ts';
import pkg from './package.json';

export default [
	{
		input: 'src/index.ts',
		output: [{
			file: pkg.browser,
			format: 'umd',
			name: pkg.name,
			sourcemap: true
		}],
		plugins: [
			resolve(),
			commonjs(),
			ts({
				tsconfig: 'tsconfig.json',
				browserslist: ["last 2 years"],
			})
		]
	}
];