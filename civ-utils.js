const { once } = require('events')
const vec3 = require('vec3')

const cardinalOffsets = {
  north: vec3(0, 0, -1),
  east: vec3(1, 0, 0),
  south: vec3(0, 0, 1),
  west: vec3(-1, 0, 0)
}

function inject (bot, option) {
  bot.civUtils = {}

  bot.civUtils.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  bot.civUtils.goTo = async (pos) => {
    const minDistanceSq = 0.2 * 0.2
    const targetPos = pos.clone().offset(0.5, 0, 0.5)

    while (bot.entity.position.distanceSquared(targetPos) > minDistanceSq) {
      bot.lookAt(targetPos)
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

    await bot.lookAt(bot.entity.position.floored().offset(0, -1, 0)) // Look down
    for (let y = initialY; y < targetY;) { // y represents where we want to place the next block
      bot.setControlState('jump', true) // Jump continuously

      // Check if we are above the block where we want to place the block
      if (bot.entity.position.y >= y + 1) {
        const referenceBlockPos = vec3(bot.entity.position.x, y - 1, bot.entity.position.z).floored()
        const referenceBlock = bot.blockAt(referenceBlockPos)

        // Equip a building block
        await bot.civUtils.equipHand(buildingBlocks)

        try { // Sometimes placeBlock does fail, maybe because of delay? so we might have to try multiple times
          await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
          y++
        } catch (err) {}
      }
      await once(bot, 'physicsTick')
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

      bot.civUtils.equipHand(tools)

      try {
        await bot.dig(block)
        await once(bot, `blockUpdate:${blockPos}`)
        await bot.civUtils.sleep(500)
        y--
      } catch (err) {
        await once(bot, 'physicsTick')
      }
    }
  }

  // TODO: Check what happens if the bot has armor (I think he wouldn't drop the armor because .items() doesn't return armor slots)
  bot.civUtils.dropAllItems = async (exceptions = {}) => {
    for (const item of bot.inventory.items()) {
      if (exceptions[item.type] == null) {
        await bot.tossStack(item)
      } else {
        if (exceptions[item.type] === 0) continue
        const tossCount = bot.inventory.count(item.type) - exceptions[item.type]
        if (tossCount > 0) await bot.toss(item.type, null, tossCount)
      }
    }
  }

  bot.civUtils.lookAtCardinal = async (cardinal) => {
    const offset = cardinalOffsets[cardinal]
    if (offset == null) throw new Error(`The cardinal doesn't exist: ${cardinal}`)

    await bot.lookAt(bot.entity.position.plus(offset).offset(0, bot.entity.height, 0))
  }

  bot.civUtils.mantainItems = async (chestPos, items = {}) => {
    if (chestPos == null) throw new Error("chestPos can't be null")

    const chestBlock = bot.blockAt(chestPos)

    if (!['chest', 'trapped_chest'].includes(chestBlock?.name)) { throw new Error(`mantainItems has to receive a chest position as argument. Current value of the block: ${chestBlock}`) }

    await bot.lookAt(chestPos)
    const chest = await bot.openChest(chestBlock)

    for (let itemId of Object.keys(items)) {
      itemId = parseInt(itemId)
      const itemCount = items[itemId]

      const withdrawCount = itemCount - bot.inventory.count(itemId)
      if (withdrawCount <= 0) continue

      await chest.withdraw(itemId, null, withdrawCount)
    }

    await chest.close()
  }

  bot.civUtils.equipHand = async (itemIds) => {
    if (typeof itemIds === 'number') itemIds = [itemIds]

    if (itemIds.includes(bot.heldItem?.type)) return

    for (const itemId of itemIds) {
      if (bot.inventory.count(itemId) > 0) {
        await bot.equip(itemId)
        break
      }
    }
  }
}

module.exports = inject
