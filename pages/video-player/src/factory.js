import Camera from "../../../lib/share/camera.js";
import { supportsWorkerType } from "../../../lib/share/util.js";
import Controller from "./controller.js";
import Service from "./service.js";
import View from "./view.js";

const [rootPath] = window.location.href.split("/pages/");
const videoUrl = `${rootPath}/assets/video.mp4`;
const view = new View();
view.setVideoSRC(videoUrl);

async function getWorker() {
  if (supportsWorkerType()) {
    console.log("suporta");
    return new Worker(`./src/worker.js`, {
      type: "module"
    });
  }

  console.log("Your browser doesn't support esm modules on webworkers")
  console.log("importing libraries...")

  import ("https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js");
  import ("https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js");
  import ("https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js");
  import ("https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js");

  console.warn("Using worker mocking")

  const { faceLandmarksDetection } = window;
  // tf.setBackend("webgl");

  const service = new Service({ faceLandmarksDetection });

  const workerMock = {
   async postMessage(video){
    const blinked = await service.handBlinked(video)
    if(!blinked) return;

    workerMock.onmessage({data:{blinked}})

   },
   // vai ser sobre escrito pela controller
    onmessage(msg){}
  }  

  console.log('loading tf model')
  await service.loadModel();
  console.log('tf model loded')

  setTimeout(()=>workerMock.onmessage({data: 'READY'}), 500)

  return workerMock;
}

const worker = await getWorker();
worker.postMessage("message")

const camera = await Camera.init();


const factory = {
  async initialize() {
    return Controller.initialize({
      view,
      camera,
      worker
    });
  }
};

export default factory;
