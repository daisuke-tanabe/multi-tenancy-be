module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  rules: {
    // アロー関数の中括弧使用は任意とする
    'arrow-body-style': 'off',

    // コールバックにアロー関数を優先しない
    'prefer-arrow-callback': ['off'],

    // コンソールはinfo、warn、errorは使用を許可する
    'no-console': ['warn', {
      allow: ['info', 'warn', 'error']
    }],

    // ブロックとステートメントの深さを制限する
    'max-depth': ['error', 3],

    // パッケージ以外のインポートには拡張子を強制する
    "import/extensions": ["error", "ignorePackages"],

    // import の順番ルールを定義する
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // デフォルトエクスポートを使う場合があるので無効にする
    'import/prefer-default-export': 'off'
  },
}
