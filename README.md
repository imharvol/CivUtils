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

### bot.civUtils.dropAllItems([exceptions])
Drops all items into the ground except the ones in exceptions. Returns a `Promise` that is resolved once it's done.
- `exceptions` - Optional object that says which (key) and how many (value) of a item we want to keep.
Por example, the following code will drop everything except 5 iron_pickaxes and 64 of dirt. If it has 6 iron_pickaxes, the bot will drop 1 iron_pickaxe only and will keep the rest (5 iron_pickaxes).
```js
bot.civUtils.dropAllItems({
  '600': 5, // 600 is the id for iron_pickaxe
  '9': 64 // 9 is the id for dirt
})
```
### bot.civUtils.lookAtCardinal(cardinal)
Looks straight to a cardinal direction. Returns a `Promise` that is resolved once it's done.
- `cardinal` - String of the cardinal we want to look at: north, east, south and west.
This function is usually useful with `bot.civUtils.dropAllItems([exceptions])`.

### bot.civUtils.mantainItems(chestPos, items)
Takes out items from a chest until the bot has the desired ammount. Returns a `Promise` that is resolved once it's done.
- `chestPos` - `vec3` instance that represents the position of the chest.
- `items` - Object that says how many items (value) of which type (key) we want to have in the inventory
For example, the following code will make sure that the bot ends up with (at least) 5 iron pickaxes. If he doesn't have any iron pickaxes in the inventory, he will take 5; if he only has 1 iron pickaxe, he will take 4; if he has 5 or more, he will take none from the chest.
```js
bot.civUtils.mantainItems(vec3(100, 50, 100), {
  '600': 5 // 600 is the id for iron_pickaxe
}})
```

### bot.civUtils.equipHand(itemIds)
Equips an item out of a list of item ids. Returns a `Promise` that is resolved once it's done.
- `itemIds` - A item id or of a list of item ids of possible objects that we want the bot to equip.

### bot.civUtils.eat(itemIds)
Eats items from a item id list untill food is full. Returns a `Promise` that is resolved once it's done.
`itemIds` - A item id or a list of item ids of possible food that we want the bot to eat.