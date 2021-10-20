# CivUtils
A plugin that helps building CivBots

## Install
Use `npm install github:imharvol/CivUtils `

## Update
Use `npm update github:imharvol/CivUtils `

## How to use
```js
const mineflayer = require('mineflayer')
const civUtils = require('civutils')
const vec3 = require('vec3')

const bot = mineflayer.createBot({
  /* ... */
})

bot.loadPlugin(civUtils) // Add this!

bot.once('spawn', async () => {
  await bot.civUtils.sleep(2500)
  await bot.civUtils.goTo(vec3(100, 50, 100))
  console.log('Arrived at destination!')
})
```

## API
### bot.civUtils.sleep(ms)
Returns a `Promise` that can be _awaited_ that will resolve in `ms` ms.
- `ms` - Number of milliseconds to wait to resolve.

### bot.civUtils.goTo(pos)
Orders the bot to go to a certain position. Returns a `Promise` that is resolved once the bot reaches the `pos`.
- `pos` - `vec3` instance that indicates where the bot should go.

### bot.civUtils.goUp(targetY, [buildingBlocks])
Orders the bot to go to a `targetY` making a tower under himself. Returns a `Promise` that resolves once the bot reaches the desired `targetY`.
- `targetY` - y cordinate we want the bot to reach
- `buildingBlocks` - Optional array with the ids of the blocks that the bot should use to build the tower. If not specified it will use whatever item it has on its hand.

### bot.civUtils.goDown(targetY, [tools])
Orders the bot to go to a `targetY` by digging under himself. Returns a `Promise` that resolves once the bot reaches the desired `targetY`.
- `targetY` - y cordinate we want the bot to reach
- `tools` - Optional array with the ids of the tols that the bot should use to dig. If not specified it will use whatever item it has on its hand.
