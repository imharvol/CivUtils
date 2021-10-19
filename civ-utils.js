function inject (bot, option) {
  bot.civUtils = {}

  bot.civUtils.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  bot.civUtils.goTo = async (pos) => {
    const minDistanceSq = 0.2 * 0.2
    const targetPos = pos.clone().offset(0.5, 0, 0.5)

    while (bot.entity.position.distanceSquared(targetPos) > minDistanceSq) {
      await bot.lookAt(targetPos)
      bot.setControlState('forward', true)

      await bot.civUtils.sleep(20)
    }

    bot.setControlState('forward', false)
  }
}

module.exports = inject
