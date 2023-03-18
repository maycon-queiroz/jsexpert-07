import CardsController from "./../controllers/cardsController.js";
import CardsView from "./../views/cardsView.js";
import CardsService from "./../services/cardsService.js";
const [rootPath] = window.location.href.split("/pages/");

const cardListWorker = new Worker(`./src/workers/cardListWorker.js`, {
  type: "module"
});

const factory = {
  async initialize() {
    return CardsController.initialize({
      view: new CardsView(),
      service: new CardsService({
        cardListWorker,
        dbUrl: `${rootPath}/assets/database.json`
      })
    });
  }
};

export default factory;
