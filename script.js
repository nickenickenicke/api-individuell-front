const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
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

async function fetchPlayers() {
  return await (await fetch("http://localhost:3000/players")).json();
}

let players = await fetchPlayers();

searchPlayer.addEventListener("input", function () {
  const searchFor = searchPlayer.value.toLowerCase();
  for (let i = 0; i < players.length; i++) {
    // TODO add a matches function
    if (players[i].matches(searchFor)) {
      players[i].visible = true;
    } else {
      players[i].visible = false;
    }
  }
  updateTable();
});

const createTableRow = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

const playerName = document.getElementById("playerName");
const jersey = document.getElementById("jersey");
const position = document.getElementById("position");

let editingPlayer = null;

const onClickPlayer = function (e) {
  const htmlElementetSomViHarKlickatPa = e.target;
  console.log(htmlElementetSomViHarKlickatPa.dataset.stefansplayerid);
  const player = players.find(
    (player) =>
      player.id.toString() ===
      htmlElementetSomViHarKlickatPa.dataset.stefansplayerid
  );
  playerName.value = player.name;
  jersey.value = player.jersey;
  position.value = player.position;
  editingPlayer = player;

  MicroModal.show("modal-1");
};

closeDialog.addEventListener("click", async (e) => {
  e.preventDefault();
  let url = "";
  let method = "";
  let incomingEdits = {
    name: playerName.value,
    jersey: jersey.value,
    position: position.value,
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
  playerName.value = "";
  jersey.value = 0;
  position.value = "";
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
