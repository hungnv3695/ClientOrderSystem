// ESLint configuration for ClientOrderWeb
// Install (dev):
//   npm i -D eslint eslint-plugin-vue
// Optionally add: prettier eslint-config-prettier eslint-plugin-prettier

module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        // Mỗi attribute một dòng
        'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: 1 }],
        // 4 spaces cho template
        'vue/html-indent': ['error', 4, { attribute: 1, baseIndent: 1, closeBracket: 0, alignAttributesVertically: true }],
        // Cho phép component tự đóng <MyComp />
        'vue/html-self-closing': ['error', {
            html: { void: 'always', normal: 'never', component: 'always' },
            svg: 'always',
            math: 'always'
        }],
        // Tắt vài rule dễ gây nhiễu
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multiline-html-element-content-newline': 'off',
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                // Giữ indent script 4 spaces nếu dùng Volar format
                'indent': 'off',
            }
        }
    ]
};
