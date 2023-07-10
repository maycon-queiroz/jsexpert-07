import {prepareRunChecker} from '../../../../lib/share/util.js';

const {shouldRun: ScrollShouldRun} = prepareRunChecker({timeDelay: 200});

export default class HandGestureController {  
  #view
  #service
  #camera
  #lastDirection = {
    direction: '',
    y: 0
  }

  constructor({ camera,view, service }) {
    this.#camera = camera
    this.#view = view
    this.#service = service
  }

  async init() {
    return this.#loop()

  }

  #scrollPage(direction){
    const pixelPerScroll = 100
    if(this.#lastDirection.direction === direction){
      this.#lastDirection.y = (
        direction === 'scroll-down'?
        this.#lastDirection.y + pixelPerScroll:
        this.#lastDirection.y - pixelPerScroll
      )
    }else{
      this.#lastDirection.direction = direction
    }

    this.#view.scrollPage(this.#lastDirection.y)
  }

  async #estimateHands(){
    try {
      const hands = await this.#service.estimateHands(this.#camera.video)
      if(!hands) return;
      for await (const {event, x, y} of this.#service.detectGestures(hands)){
        if(event.includes('scroll')){
          if(!ScrollShouldRun()) continue
          this.#scrollPage(event)
        }        
      }
    } catch (error) {
      console.error(error)
    }
  }

  async #loop(){
    await this.#service.initializeDetector();
    await this.#estimateHands();
    this.#view.loop(this.#loop.bind(this))
  }

  static async initialize(deps) {
    const controller = new HandGestureController(deps)
    return controller.init()
  }
}