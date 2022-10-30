const res = ({code = 200, message = "success", data}) => {
  return {
    code,
    data,
    message
  }
}

module.exports = res