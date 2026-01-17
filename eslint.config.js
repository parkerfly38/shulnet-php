import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    reactHooks.configs.flat.recommended,
    ...typescript.configs.recommended,
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'], // Required for React 17+
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { 
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }],
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            'no-constant-binary-expression': 'warn',
            'no-case-declarations': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ignores: ['vendor', 'node_modules', 'public', 'bootstrap/ssr', 'tailwind.config.js'],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            // Suppress React Compiler errors - these are handled by the compiler at build time
            'react-compiler/react-compiler': 'off',
        },
    },
    {
        files: ['resources/js/pages/admin/school/**/*.{ts,tsx}'],
        rules: {
            // School CRUD pages have patterns that trigger React Compiler errors
            // These are safe to ignore as the compiler will handle them at build time
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    prettier, // Turn off all rules that might conflict with Prettier
];
