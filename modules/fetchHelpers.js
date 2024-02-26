import { displayProperties } from "../script.js";

async function fetchPlayers() {
  let allPlayers = await (
    await fetch(
      `http://localhost:3000/players?sortBy=${displayProperties.sortBy}&orderBy=${displayProperties.orderBy}&search=${displayProperties.searchQuery}&pageSize=${displayProperties.pageSize}&offset=${displayProperties.offset}`
    )
  ).json();
  displayProperties.totalPlayers = allPlayers.total;
  return allPlayers.result;
}

export { fetchPlayers };
