export default {
  bracketSpacing: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  importOrder: [
    '(^(react/(.*)$)|^(react$))',
    '<THIRD_PARTY_MODULES>',
    '^@/styles/(.*)$',
    '^@/public/(.*)$',
    '^@/lib/(.*)$',
    '^@/components/(.*)$',
  ],
  importOrderSortSpecifiers: true,
  importOrderSeparation: true,
  importOrderCaseInsensitive: true,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
};