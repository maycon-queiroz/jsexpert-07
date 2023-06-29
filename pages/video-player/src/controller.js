export default class Controller {
  #view
  #camera
  #worker
  #blinkedCount = 0

  constructor({view, worker, camera}) {       
    this.#view = view
    this.#camera = camera
    this.#worker = this.#configureWorker(worker)

    this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
  }

  static async initialize(deps) {
    const controller = new Controller(deps);
    controller.log('not yet detecting eye blink! click in the button to start')
    return controller.init();
  }

  #configureWorker(worker){
    let ready = false;
    worker.onmessage = ({data}) => {      
      if('READY' === data){
        this.log(`lib was detected`)
        this.#view.enableButton();
        ready = true
        return;
      }

      const blinked = data.blinked
      this.#view.togglePlayVideo();
      this.#blinkedCount += blinked

    }

    return {
      send(msg){
        if(!ready) return;
        worker.postMessage(msg)
      }
    }
  }

  async init() {
    console.log('init')
  }

  loop(){
   const video = this.#camera.video
   const image = this.#view.getVideoFrame(video)

   this.#worker.send(image)
   this.log('detecting eye blink...')

   setTimeout(()=>this.loop(), 100)
   
  }

  log(text){
    const times = `  - blinked times ${this.#blinkedCount}`;
    this.#view.log(`status: ${text}`.concat(this.#blinkedCount? times: ""));
  }

  onBtnStart(){
    this.log('initialize detection...')
    this.#view.enableButton()
    this.#blinkedCount = 0;
    this.loop()
  }
}
