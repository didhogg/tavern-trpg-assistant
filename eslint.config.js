import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'

export default tseslint.config(
  { ignores: ['dist/**', 'reference/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      // 旧格式退役（D2-P2 B2-9，2026-11-07）：旧扩展包、旧条目格式、旧推导、旧库与人物界面已整块删除，
      // 条目数据只经【库】（src/library）取。这些路径再出现就是第二套格式回来了，直接报错。
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '(^|/)(core/packs|core/library|core/libraryQueue|core/source|schemas/pack|schemas/people|rules/dnd5e2014/(data|derive)|stores/library|stores/people|ui/library|ui/people)(/|$)',
          message: '旧格式已退役（B2-9）：条目数据只经【库】src/library 取，不另建格式',
        }],
      }],
    },
  },
)
