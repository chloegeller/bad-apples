const MDXrule = {
    test: /\.mdx?$/,
    use: [
        {loader: "babel-loader", options: {}},
        {loader: "@mdx-js/loader", options: {}},
    ]
}

const YAMLrule = {
    test: /\.ya?ml$/,
    type: 'json',
    use: [
        {options: {merge: true}, loader: 'yaml-loader'}
    ]
}

/** @param {import("webpack").Configuration} config */
export const webpack = (config) => {
    config.module.rules.push(MDXrule)
    config.module.rules.push(YAMLrule)

    return config;
}
