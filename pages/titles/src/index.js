import cardsFactory from "./factories/cardsFactory.js"
import HandGestureFactory from './factories/handGestureFactory.js'

await cardsFactory.initialize()
await HandGestureFactory.initialize()