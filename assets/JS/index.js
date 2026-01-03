let navLinks = document.querySelectorAll(".nav-link");
let spinnerContainer = document.querySelector(".spinner-container");
let detailsContainer = document.querySelector(".game-details .container");
let gameDetails = document.querySelector(".game-details");
let btnClose = document.querySelector(".game-details .close-btn");
let allGames = [];
let currentIndex = 0; 
const LIMIT = 20;
let currentCategory = "mmorpg";
let currentRow = null;
let isLoading = false;

async function fetchGames(category, row) {
    try {
        spinnerContainer.classList.remove("d-none");
        isLoading = true;
        let response = await fetch(`https://api.allorigins.win/raw?url=https://www.freetogame.com/api/games?category=${category}`);
        if (!response.ok) {
            throw new Error("API ERROR");
        }
        allGames = await response.json();
        currentIndex = 0;
        row.innerHTML = "";
        loadMoreGames();
        
    } catch (error) {
        console.error(error);
    } finally {
        spinnerContainer.classList.add("d-none");
        isLoading = false;
    }
}

function loadMoreGames() {
    if (currentIndex >= allGames.length) return;
    spinnerContainer.classList.remove("d-none");
    let slice = allGames.slice(currentIndex, currentIndex + LIMIT);
    currentIndex += LIMIT;
    let crs = "";
    slice.forEach((d) => {
    crs += `<div class=" col-12 col-md-6 col-lg-4 col-xl-3">
                         <div class="card" data-id = "${d.id}">
                             <div class="d-flex flex-column h-100">
                                 <div class="image p-3">
                                     <img src="${d.thumbnail}" class="card-img-top object-fit-cover d-block w-100" alt="game-boster" title="game-boster" loading="lazy">
                                 </div>
                                 <div class="d-flex justify-content-between align-items-center mx-3">
                                     <h3 class="h6 text-white">${d.title}</h3>
                                     <span class="free badge text-bg-primary p-2">Free</span>
                                 </div>
                                 <p class="card-text text-center opacity-50 small px-3 pt-3">${d.short_description}</p>
                                 <footer class="card-footer small text-white mt-auto d-flex justify-content-between ps-3 pe-3">
                                     <span class="footer-span">${d.genre}</span>
                                     <span class="footer-span">${d.platform}</span>
                                 </footer>
                             </div>
                         </div>
                     </div>`;
    });
    currentRow.insertAdjacentHTML("beforeend", crs);
    spinnerContainer.classList.add("d-none");
}

function showCategory() {
    currentRow = document.querySelector(".tab-pane.active .row");
    fetchGames(currentCategory, currentRow);
    navLinks.forEach((navLink) => {
    navLink.addEventListener("click", function (e) {
        currentCategory = e.target.dataset.category;
        currentRow = document.querySelector(e.target.dataset.bsTarget + " .row");
        fetchGames(currentCategory, currentRow);
        });
    });
}
showCategory();

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
        loadMoreGames();
    }
});

document.addEventListener("click", function (e) {
  let card = e.target.closest(".card");
  if (!card) return;
  let gameId = Number(card.dataset.id);
  let game = allGames.find((g) => g.id === gameId);
    if (!game) return;
    async function getFullDetails() {
        try {
            spinnerContainer.classList.remove("d-none");
            isLoading = true;
            let response = await fetch(`https://api.allorigins.win/raw?url=https://www.freetogame.com/api/game?id=${gameId}`);
            if (!response.ok) {
                throw new Error("API ERROR");
            }
            let data = await response.json();
            let detailsRowContent = `<div class="head-close d-flex justify-content-between align-items-center mb-4">
                    <h3 class="text-white">Details Game</h3>
                    <button class="close-btn"><i class="fa-solid fa-xmark fs-5"></i></button>
            </div>
            <div class="row g-4">
                    <div class="image col-md-4">
                        <img class="w-100" src="${game.thumbnail}" alt="game-poster" title="game-poster" loading="lazy">
                    </div>
                    <div class="details-of-game col-md-8">
                        <h3 class="title text-white mb-3">Title: <span>${data.title}</span></h3>
                        <p class="text-white">Category: <span class="bg-primary text-black rounded-2 px-2 py-1 ">${data.genre}</span></p>
                        <p class="text-white">Platform: <span class="bg-primary text-black rounded-2 px-2 py-1">${data.platform}</span></p>
                        <p class="text-white">Status: <span class="bg-primary text-black rounded-2 px-2 py-1">${data.status}</span></p>
                        <p class="text-white desc">${data.description}</p>
                        <a class="btn btn-outline-warning" href="${data.game_url}" target="_blank">Show Game</a>
                    </div>
            </div>`;
            detailsContainer.innerHTML = detailsRowContent;
        } catch (error) {
            console.error(error);
        } finally {
            spinnerContainer.classList.add("d-none");
            isLoading = false;
        }
    }
    getFullDetails();
    gameDetails.classList.remove("d-none");
    document.body.classList.add("no-scroll");
});

document.addEventListener("click", function (e) {
    if (e.target.closest(".close-btn")) {
        gameDetails.classList.add("d-none");
        document.body.classList.remove("no-scroll");
        detailsContainer.innerHTML = "";
    }
});
