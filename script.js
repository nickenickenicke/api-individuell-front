const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const searchPlayerInput = document.getElementById("searchPlayerInput");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");

function Player(id, name, jersey, team, position) {
  this.id = id;
  this.name = name;
  this.jersey = jersey;
  this.team = team;
  this.position = position;
  this.visible = true;
  this.matches = function (searchFor) {
    return (
      this.name.toLowerCase().includes(searchFor) ||
      this.position.toLowerCase().includes(searchFor) ||
      this.team.toLowerCase().includes(searchFor)
    );
  };
}

let searchKeyUpCooldown = false;
const displayProperties = {
  sortBy: "id",
  orderBy: "asc",
};

async function fetchPlayers() {
  return await (
    await fetch(
      `http://localhost:3000/players?sortBy=${displayProperties.sortBy}&orderBy=${displayProperties.orderBy}&search=${searchPlayerInput.value}`
    )
  ).json();
}

let players = await fetchPlayers();

searchPlayer.addEventListener("submit", async (event) => {
  event.preventDefault();
  players = await fetchPlayers();
  updateTable();

  // for (let i = 0; i < players.length; i++) {
  //   // TODO add a matches function
  //   if (players[i].matches(searchFor)) {
  //     players[i].visible = true;
  //   } else {
  //     players[i].visible = false;
  //   }
  // }
  // updateTable();
});

searchPlayerInput.addEventListener("keyup", () => {
  if (searchKeyUpCooldown === false) {
    searchKeyUpCooldown = true;
    const searchCooldownMilliseconds = 500;
    setTimeout(async () => {
      players = await fetchPlayers();
      updateTable();
      searchKeyUpCooldown = false;
    }, searchCooldownMilliseconds);
  }
});

const createTableRow = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

const inputPlayerName = document.getElementById("playerName");
const inputJersey = document.getElementById("jersey");
const inputPosition = document.getElementById("position");
const inputTeam = document.getElementById("team");

let editingPlayer = null;

const onClickPlayer = function (e) {
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
};

updateTable();

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

let sortingButtons = document.getElementsByClassName("sortbutton");

for (let i = 0; i < sortingButtons.length; i++) {
  sortingButtons[i].addEventListener("click", async (event) => {
    const playerProperty = event.target.id.toLowerCase().slice(4);

    if (
      displayProperties.sortBy !== playerProperty ||
      displayProperties.orderBy !== "asc"
    ) {
      displayProperties.sortBy = playerProperty;
      displayProperties.orderBy = "asc";
    } else {
      displayProperties.sortBy = playerProperty;
      displayProperties.orderBy = "desc";
    }

    players = await fetchPlayers();
    updateTable();
  });
}
