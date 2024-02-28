import { fetchPlayers } from "./modules/fetchHelpers.js";
import { createTableRow } from "./modules/htmlHelpers.js";

const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const searchPlayerInput = document.getElementById("searchPlayerInput");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");
const dialogHeader = document.getElementById("modal-1-title");
const errorMessage = document.getElementById("modal-error");

export let displayProperties = {
  sortBy: "id",
  orderBy: "asc",
  searchQuery: "",
  currentPage: 1,
  pageSize: 15,
  offset: 0,
  totalPlayers: 0,
};
let players = await fetchPlayers();

// === SEARCH AND SORT===

searchPlayer.addEventListener("submit", async (e) => {
  e.preventDefault();
  displayProperties.searchQuery = searchPlayerInput.value;
  fetchAndUpdate();
});

let searchKeyUpCooldown = false;
searchPlayerInput.addEventListener("keyup", () => {
  if (searchKeyUpCooldown === false) {
    displayProperties.searchQuery = searchPlayerInput.value;
    searchKeyUpCooldown = true;
    const searchCooldownMilliseconds = 500;
    setTimeout(async () => {
      fetchAndUpdate();
      searchKeyUpCooldown = false;
    }, searchCooldownMilliseconds);
  }
});

let sortingButtons = document.getElementsByClassName("sortbutton");

for (let i = 0; i < sortingButtons.length; i++) {
  sortingButtons[i].addEventListener("click", async (e) => {
    displayProperties.orderBy = e.target.dataset.orderBy;
    displayProperties.sortBy = e.target.dataset.sortBy;
    fetchAndUpdate();
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
    pageButton.classList.add("pageButton");
    if (i === displayProperties.currentPage - 1) {
      pageButton.disabled = true;
    }
    pageButton.innerText = i + 1;
    pageButton.addEventListener("click", async () => {
      displayProperties.currentPage = i + 1;
      displayProperties.offset = displayProperties.pageSize * i;
      fetchAndUpdate();
    });
    elementPagination.appendChild(pageButton);
  }
};

//=== MODAL ===

let clearError = () => {
  errorMessage.innerText = "";
};

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
  clearError();
  dialogHeader.textContent = "Edit player";
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

  if (response.ok) {
    fetchAndUpdate();
    MicroModal.close("modal-1");
    clearError();
  } else {
    let data = await response.json();
    console.log(data);
    errorMessage.innerText = data.errors[0].msg;
  }
});

btnAdd.addEventListener("click", () => {
  clearError();
  dialogHeader.textContent = "Add new player";
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
    if (players[i].visible == false) {
      continue;
    }
    let tr = document.createElement("tr");

    tr.appendChild(createTableRow("th", players[i].name, "playerName"));
    tr.appendChild(createTableRow("td", players[i].jersey));
    tr.appendChild(createTableRow("td", players[i].position));
    tr.appendChild(createTableRow("td", players[i].team));

    let td = document.createElement("td");
    td.classList.add("editButtonContainer");
    let btn = document.createElement("button");
    btn.textContent = "EDIT";
    btn.dataset.stefansplayerid = players[i].id;
    btn.classList.add("editButton");
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    allPlayersTBody.appendChild(tr);
  }
  generatePagination();
};

const fetchAndUpdate = async () => {
  players = await fetchPlayers();
  updateTable();
};

updateTable();
