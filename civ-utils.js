const { once } = require('events')
const vec3 = require('vec3')

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

      await once(bot, 'physicsTick')
    }

    bot.setControlState('forward', false)
  }

  bot.civUtils.goUp = async (targetY, buildingBlocks = []) => {
    if (buildingBlocks.length === 0) throw new Error('goUp should receive at least one building block')

    targetY = Math.floor(targetY)
    const initialY = Math.floor(bot.entity.position.y)
    if (targetY < initialY) throw new Error('The bot is above the targetY')

    for (let y = initialY; y < targetY;) { // y represents where we want to place the next block
      await bot.look(bot.entity.yaw, -90) // Look down
      bot.setControlState('jump', true) // Jump continuously

      // Check if we are above the block where we want to place the block
      if (Math.floor(bot.entity.position.y) >= y + 1) {
        const referenceBlockPos = vec3(bot.entity.position.x, y - 1, bot.entity.position.z).floored()
        const referenceBlock = bot.blockAt(referenceBlockPos)

        // Equip a building block
        for (const buildingBlock of buildingBlocks) {
          if (bot.inventory.count(buildingBlock) > 0) {
            await bot.equip(buildingBlock, 'hand')
            break
          }
        }

        try { // Sometimes placeBlock does fail, maybe because of delay? so we might have to try multiple times
          await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
          y++
        } catch (err) {}
      } else {
        await once(bot, 'physicsTick')
      }
    }
    bot.setControlState('jump', false)
  }

  bot.civUtils.goDown = async (targetY, tools = []) => {
    targetY = Math.floor(targetY)
    const initialY = Math.floor(bot.entity.position.y)
    if (targetY > initialY) throw new Error('The bot is below the targetY')

    for (let y = initialY; y > targetY;) {
      const blockPos = vec3(bot.entity.position.x, y - 1, bot.entity.position.z).floored()
      const block = bot.blockAt(blockPos)

      for (const tool of tools) {
        if (bot.inventory.count(tool) > 0) {
          await bot.equip(tool, 'hand')
          break
        }
      }

      try {
        await bot.dig(block)
        y--
      } catch (err) {}

      await once(bot, `blockUpdate:${blockPos}`)
      await bot.civUtils.sleep(200) // For some reason if you don't wait a bit, it takes much longer to dig the block
    }
  }
}

module.exports = inject
