import { gestureStrings, knowGestures } from "../utils/gestures.js";

export default class HandGestureService {
  #gestureEstimator;
  #handPoseDetection;
  #handVersion;
  #detector = null;

  constructor({ fingerPose, handPoseDetection, handVersion }) {
    this.#gestureEstimator = new fingerPose.GestureEstimator(knowGestures);
    this.#handPoseDetection = handPoseDetection;
    this.#handVersion = handVersion;
  }

  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandMarksFromKeyPoints(keypoints3D),
      9 //porcentagem de confiança
    );

    return predictions.gestures;
  }

  async * detectGestures(predictions) {    
    for (const hand of predictions) {
      if (!hand || !hand.keypoints3D) continue;
      const gestures = await this.estimate(hand.keypoints3D);

      const result = gestures.reduce(
        (previous, current) => (previous.score > current.score) ? previous : current
        )

        const {x, y} = hand.keypoints.find(keypoint => keypoint.name === "index_finger_tip")
        yield {event: result.name, x,y}

        console.log(`chose: ${gestureStrings[result.name]}`)
    }
  }

  #getLandMarksFromKeyPoints(keypoints3D) {
    return keypoints3D.map((keypoint) => [keypoint.x, keypoint.y, keypoint.z]);
  }

  async estimateHands(video) {
    return this.#detector.estimateHands(video, {
      flipHorizontal: true,
    });
  }

  async initializeDetector() {
    if (this.#detector) return this.#detector;

    const model = this.#handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: "mediapipe", // or 'tfjs',
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${
        this.#handVersion
      }`,
      modelType: "lite",
      maxHands: 2,
    };
    this.#detector = await this.#handPoseDetection.createDetector(
      this.#handPoseDetection.SupportedModels.MediaPipeHands,
      detectorConfig
    );

    return this.#detector;
  }
}
