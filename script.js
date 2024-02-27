import { fetchPlayers } from "./modules/fetchHelpers.js";
import { createTableRow } from "./modules/htmlHelpers.js";

const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const searchPlayerInput = document.getElementById("searchPlayerInput");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");

export let displayProperties = {
  sortBy: "id",
  orderBy: "asc",
  searchQuery: "",
  currentPage: 1,
  pageSize: 10,
  offset: 0,
  totalPlayers: 0,
};
let players = await fetchPlayers();

// === SEARCH AND SORT===

searchPlayer.addEventListener("submit", async (e) => {
  e.preventDefault();
  displayProperties.searchQuery = searchPlayerInput.value;
  players = await fetchPlayers();
  updateTable();
});

let searchKeyUpCooldown = false;
searchPlayerInput.addEventListener("keyup", () => {
  if (searchKeyUpCooldown === false) {
    displayProperties.searchQuery = searchPlayerInput.value;
    searchKeyUpCooldown = true;
    const searchCooldownMilliseconds = 500;
    setTimeout(async () => {
      players = await fetchPlayers();
      updateTable();
      searchKeyUpCooldown = false;
    }, searchCooldownMilliseconds);
  }
});

let sortingButtons = document.getElementsByClassName("sortbutton");

for (let i = 0; i < sortingButtons.length; i++) {
  sortingButtons[i].addEventListener("click", async (e) => {
    displayProperties.orderBy = e.target.dataset.orderBy;
    displayProperties.sortBy = e.target.dataset.sortBy;

    players = await fetchPlayers();
    updateTable();
  });
}

const elementPagination = document.getElementById("pagination");
const generatePagination = () => {
  elementPagination.innerHTML = "";
  const totalPages = Math.ceil(
    displayProperties.totalPlayers / displayProperties.pageSize
  );
  for (let i = 0; i < totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i + 1;
    pageButton.addEventListener("click", async () => {
      displayProperties.currentPage = i + 1;
      displayProperties.offset = displayProperties.pageSize * i;
      players = await fetchPlayers();
      updateTable();
    });
    elementPagination.appendChild(pageButton);
  }
};

//=== MODAL ===

MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`), // [1]
  onClose: (modal) => console.info(`${modal.id} is hidden`), // [2]

  openTrigger: "data-custom-open", // [3]
  closeTrigger: "data-custom-close", // [4]
  openClass: "is-open", // [5]
  disableScroll: true, // [6]
  disableFocus: false, // [7]
  awaitOpenAnimation: false, // [8]
  awaitCloseAnimation: false, // [9]
  debugMode: true, // [10]
});

const inputPlayerName = document.getElementById("playerName");
const inputJersey = document.getElementById("jersey");
const inputPosition = document.getElementById("position");
const inputTeam = document.getElementById("team");

let editingPlayer = null;

const onClickPlayer = (e) => {
  const htmlElementetSomViHarKlickatPa = e.target;
  console.log(htmlElementetSomViHarKlickatPa.dataset.stefansplayerid);
  const player = players.find(
    (player) =>
      player.id.toString() ===
      htmlElementetSomViHarKlickatPa.dataset.stefansplayerid
  );
  inputPlayerName.value = player.name;
  inputJersey.value = player.jersey;
  inputPosition.value = player.position;
  inputTeam.value = player.team;
  editingPlayer = player;

  MicroModal.show("modal-1");
};

closeDialog.addEventListener("click", async (e) => {
  e.preventDefault();
  let url = "";
  let method = "";
  let incomingEdits = {
    name: inputPlayerName.value,
    jersey: inputJersey.value,
    position: inputPosition.value,
    team: inputTeam.value,
  };

  if (editingPlayer != null) {
    incomingEdits.id = editingPlayer.id;
    url = "http://localhost:3000/players/" + incomingEdits.id;
    method = "PUT";
  } else {
    url = "http://localhost:3000/players";
    method = "POST";
  }

  let response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(incomingEdits),
  });

  // let json = await response.json();

  players = await fetchPlayers();
  updateTable();
  MicroModal.close("modal-1");
});

btnAdd.addEventListener("click", () => {
  inputPlayerName.value = "";
  inputJersey.value = 0;
  inputPosition.value = "";
  inputTeam.value = "";
  editingPlayer = null;

  MicroModal.show("modal-1");
});

// === HTML CREATION ===

const updateTable = function () {
  allPlayersTBody.innerHTML = "";

  for (let i = 0; i < players.length; i++) {
    // hrmmm you do foreach if you'd like, much nicer!
    if (players[i].visible == false) {
      continue;
    }
    let tr = document.createElement("tr");

    tr.appendChild(createTableRow("th", players[i].name));
    tr.appendChild(createTableRow("td", players[i].jersey));
    tr.appendChild(createTableRow("td", players[i].position));
    tr.appendChild(createTableRow("td", players[i].team));

    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.textContent = "EDIT";
    btn.dataset.stefansplayerid = players[i].id;
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    allPlayersTBody.appendChild(tr);
  }
  generatePagination();
};

updateTable();
