const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2309-FTB-ET-WEB-FT';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players/`;

const state = {
  players: [],
};

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
      const response = await fetch (APIURL);
      const json = await response.json();
      state.players = json.data
      console.log(state.players)
      return json.data
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
      const response = await fetch (APIURL + `${playerId}`);
      const json = await response.json();

      const playerDetailsContainer = document.getElementById('player-details-container');
      const playerDetails = json.data.player;

      playerDetailsContainer.innerHTML = `
          <h2>${playerDetails.name}</h2>
          <img src='${playerDetails.imageUrl}' />
          <p>Breed: ${playerDetails.breed}</p>
          <p>Status: ${playerDetails.status}</p>
          <p>Created At: ${playerDetails.createdAt}</p>
          <p>Updated At: ${playerDetails.updatedAt}</p>
          <p>Team: ${playerDetails.team}</p>

      `;

      console.log(json)
      return json.data.player; 

      
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};


const addNewPlayer = async (playerObj) => {
    try {
      const response = await fetch(APIURL,{
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(playerObj)
      });
      const json = await response.json();
      return json;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
  try {
    const response = await fetch(APIURL + `${playerId}`, {
        method: 'DELETE'
    });
    const json = await response.json();
    return json;
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = async (playerList) => {
    try {
        const playerCards = state.players.players.map ((player) => {
          const section = document.createElement('section');
          section.classList.add('player-card')
          section.innerHTML = `
            <h2>${player.name}</h2> <br>
            <img src='${player.imageUrl}' />
            <button class="details-btn" data-playerid="${player.id}">See details</button>
            <button class="remove-btn" data-playerid="${player.id}">Remove from roster</button>
            `;

            return section;
        });
        playerContainer.replaceChildren (...playerCards)

        const detailsButtons = document.querySelectorAll('.details-btn');
        detailsButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const playerId = event.target.dataset.playerid;
                const playerDetails = await fetchSinglePlayer(playerId);
                console.log('Player Details:', playerDetails);
                
            });
        });

        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const playerId = event.target.dataset.playerid;
                await removePlayer(playerId);
                const updatedPlayers = await fetchAllPlayers();
                renderAllPlayers(updatedPlayers);
            });
        });
        
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }

};

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
      newPlayerFormContainer.innerHTML = `
      <form id="add-player-form">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required>

          <label for="breed">Breed:</label>
          <input type="text" id="breed" name="breed" required>

          <label for="img">Image Url:</label>
          <input type="text" id="img" name="img">
          
          <button type="submit">Add Player</button>
      </form>
  `;

  const addPlayerForm = document.getElementById('add-player-form');
  addPlayerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value;
      const breed = document.getElementById('breed').value;
      const imageUrl = document.getElementById('img').value;
      const newPlayer = { name, breed, imageUrl };
      await addNewPlayer(newPlayer);
      const updatedPlayers = await fetchAllPlayers();
      renderAllPlayers(updatedPlayers);
  });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();

