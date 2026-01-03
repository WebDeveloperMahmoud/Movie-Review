class GameService {
  async getGamesByCategory(category) {
    const response = await fetch(
      `https://corsproxy.io/?https://www.freetogame.com/api/games?category=${category}`
    );
    if (!response.ok) throw new Error("Games API Error");
    return await response.json();
  }

  async getGameDetails(gameId) {
    const response = await fetch(
      `https://corsproxy.io/?https://www.freetogame.com/api/game?id=${gameId}`
    );
    if (!response.ok) throw new Error("Game Details API Error");
    return await response.json();
  }
}

class GameUI {
  constructor() {
    this.spinner = document.querySelector(".spinner-container");
    this.detailsContainer = document.querySelector(".game-details .container");
    this.gameDetails = document.querySelector(".game-details");
  }

  showSpinner() {
    this.spinner.classList.remove("d-none");
  }

  hideSpinner() {
    this.spinner.classList.add("d-none");
  }

  renderGames(games, row) {
    let html = "";
    games.forEach((game) => {
      html += `<div class=" col-12 col-md-6 col-lg-4 col-xl-3">
                         <div class="card" data-id = "${game.id}">
                             <div class="d-flex flex-column h-100">
                                 <div class="image p-3">
                                     <img src="${game.thumbnail}" class="card-img-top object-fit-cover d-block w-100" alt="game-boster" title="game-boster" loading="lazy">
                                 </div>
                                 <div class="d-flex justify-content-between align-items-center mx-3">
                                     <h3 class="h6 text-white">${game.title}</h3>
                                     <span class="free badge text-bg-primary p-2">Free</span>
                                 </div>
                                 <p class="card-text text-center opacity-50 small px-3 pt-3">${game.short_description}</p>
                                 <footer class="card-footer small text-white mt-auto d-flex justify-content-between ps-3 pe-3">
                                     <span class="footer-span">${game.genre}</span>
                                     <span class="footer-span">${game.platform}</span>
                                 </footer>
                             </div>
                         </div>
                     </div>`;
    });
    row.insertAdjacentHTML("beforeend", html);
  }

  showDetails(game) {
    this.detailsContainer.innerHTML = `
    <div class="head-close d-flex justify-content-between align-items-center mb-4">
                    <h3 class="text-white">Details Game</h3>
                    <button class="close-btn"><i class="fa-solid fa-xmark fs-5"></i></button>
            </div>
            <div class="row g-4">
                    <div class="image col-md-4">
                        <img class="w-100" src="${game.thumbnail}" alt="game-poster" title="game-poster" loading="lazy">
                    </div>
                    <div class="details-of-game col-md-8">
                        <h3 class="title text-white mb-3">Title: <span>${game.title}</span></h3>
                        <p class="text-white">Category: <span class="bg-primary text-black rounded-2 px-2 py-1 ">${game.genre}</span></p>
                        <p class="text-white">Platform: <span class="bg-primary text-black rounded-2 px-2 py-1">${game.platform}</span></p>
                        <p class="text-white">Status: <span class="bg-primary text-black rounded-2 px-2 py-1">${game.status}</span></p>
                        <p class="text-white desc">${game.description}</p>
                        <a class="btn btn-outline-warning" href="${game.game_url}" target="_blank">Show Game</a>
                    </div>
            </div>`;
    this.gameDetails.classList.remove("d-none");
    document.body.classList.add("no-scroll");
  }

  closeDetails() {
    this.gameDetails.classList.add("d-none");
    document.body.classList.remove("no-scroll");
    this.detailsContainer.innerHTML = "";
  }
}

class GameApp {
  constructor() {
    this.service = new GameService();
    this.ui = new GameUI();

    this.navLinks = document.querySelectorAll(".nav-link");
    this.currentCategory = "mmorpg";
    this.currentRow = document.querySelector(".tab-pane.active .row");

    this.allGames = [];
    this.currentIndex = 0;
    this.LIMIT = 20;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.loadCategory(this.currentCategory);
    this.handleNav();
    this.handleScroll();
    this.handleClicks();
  }

  async loadCategory(category) {
    try {
      this.ui.showSpinner();
      this.isLoading = true;
      this.allGames = await this.service.getGamesByCategory(category);
      this.currentIndex = 0;
      this.currentRow.innerHTML = "";
      this.loadMore();
    } finally {
      this.ui.hideSpinner();
      this.isLoading = false;
    }
  }

  loadMore() {
    if (this.currentIndex >= this.allGames.length) return;
    const slice = this.allGames.slice(
      this.currentIndex,
      this.currentIndex + this.LIMIT
    );
    this.currentIndex += this.LIMIT;
    this.ui.renderGames(slice, this.currentRow);
  }

  handleNav() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        this.currentCategory = e.target.dataset.category;
        this.currentRow = document.querySelector(
          e.target.dataset.bsTarget + " .row"
        );
        this.loadCategory(this.currentCategory);
      });
    });
  }

  handleScroll() {
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !this.isLoading
      ) {
        this.loadMore();
      }
    });
  }

  handleClicks() {
    document.addEventListener("click", async (e) => {
      const card = e.target.closest(".card");
      if (card) {
        const gameId = Number(card.dataset.id);
        this.ui.showSpinner();
        const game = await this.service.getGameDetails(gameId);
        this.ui.hideSpinner();
        this.ui.showDetails(game);
      }

      if (e.target.closest(".close-btn")) {
        this.ui.closeDetails();
      }
    });
  }
}

new GameApp();
