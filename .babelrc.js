module.exports = api => {
    api.cache(true);

    return {
        presets: ['@babel/env'],

        plugins: [
            '@babel/proposal-class-properties',
            '@babel/syntax-object-rest-spread',
            process.env.BABEL_ENV !== 'module' && 'add-module-exports',
            [
                'transform-inline-environment-variables',
                { include: ['BABEL_ENV'] }
            ]
        ].filter(Boolean),

        env: {
            test: {
                plugins: ['istanbul']
            },
            development: {
                plugins: [
                    process.env.ENV !== 'browser' && 'source-map-support'
                ].filter(Boolean)
            },
            module: {
                presets: [['@babel/env', { modules: false }]]
            }
        }
    };
};
