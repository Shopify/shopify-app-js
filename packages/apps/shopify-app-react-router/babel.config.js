module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
  // Jest transforms this ESM dependency to CommonJS, where import.meta is unsupported.
  plugins: [
    () => ({
      visitor: {
        MemberExpression(path) {
          const {object, property} = path.node;

          if (
            object.type === 'MetaProperty' &&
            object.meta.name === 'import' &&
            object.property.name === 'meta' &&
            property.type === 'Identifier' &&
            property.name === 'hot'
          ) {
            path.replaceWith({type: 'BooleanLiteral', value: false});
          }
        },
      },
    }),
  ],
};
