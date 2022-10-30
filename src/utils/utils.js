const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime = d => {
  const date = new Date(d)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    getDate() {
      return [year, month, day].map(formatNumber).join('-')
    },
    getTime() {
      return [hour, minute].map(formatNumber).join(':')
    }
  }
}

module.exports = {
  formatTime
}