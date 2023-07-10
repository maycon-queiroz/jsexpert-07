export default class HandGestureView {
  loop(fn) {
    requestAnimationFrame(fn);
  }

  scrollPage(direction) {
    scrollTo({
      top: direction,
      behavior: "smooth",
    });
  }
}
