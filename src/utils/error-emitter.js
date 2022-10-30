const errorEmitter = (errorType, ctx) => {
  const error = new Error(errorType);
  return ctx.app.emit('error', error, ctx)
}

module.exports = errorEmitter