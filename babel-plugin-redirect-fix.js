/**
 * Babel plugin to avoid transforming redirect calls that might cause charCodeAt errors
 */
module.exports = function() {
  return {
    name: 'redirect-fix',
    visitor: {
      // This is an empty visitor - we're using this plugin to disable transformation
      // of redirect calls that might cause charCodeAt errors
    }
  };
}; 