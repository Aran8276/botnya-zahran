// uno.js

// Required for getting user input in a Node.js console environment
const prompt = require("prompt-sync")();
const console = require("console");

// --- GAME STATE & LOGIC ---


function setupGame(numPlayers = 2) {
}

function isCardPlayable(card, topCard) {
  return (
    card.color === "Wild" ||
    card.color === activeColor ||
    card.value === topCard.value
  );
}

function drawCards(player, numCards) {
  for (let i = 0; i < numCards; i++) {
    // Reshuffle discard pile if deck is empty
    if (deck.length === 0) {
      console.log("Deck is empty! Reshuffling the discard pile.");
      const top = discardPile.pop();
      deck = shuffleDeck(discardPile);
      discardPile = [top];
    }
    if (deck.length > 0) {
      player.hand.push(deck.pop());
    } else {
      console.log("No more cards to draw!");
      break;
    }
  }
}

function handleCardEffect(card, isSetupTurn = false) {
  const nextPlayerIndex =
    (currentPlayerIndex + direction + players.length) % players.length;

  switch (card.value) {
    case "Skip":
      console.log(`The next player is skipped! 🚫`);
      currentPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;
      break;
    case "Reverse":
      if (players.length > 2) {
        direction *= -1;
        console.log(`Direction of play is reversed! 🔄`);
      } else {
        // With 2 players, Reverse acts like a Skip
        console.log(`The next player is skipped! 🚫`);
        currentPlayerIndex =
          (currentPlayerIndex + direction + players.length) % players.length;
      }
      break;
    case "Draw Two":
      const playerToDrawTwo = isSetupTurn
        ? players[currentPlayerIndex]
        : players[nextPlayerIndex];
      console.log(
        `${playerToDrawTwo.name} must draw two cards and is skipped!`
      );
      drawCards(playerToDrawTwo, 2);
      currentPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;
      break;
    case "Wild":
      // Color choice is handled in the player turn function
      break;
    case "Wild Draw Four":
      const playerToDrawFour = isSetupTurn
        ? players[currentPlayerIndex]
        : players[nextPlayerIndex];
      console.log(
        `${playerToDrawFour.name} must draw four cards and is skipped!`
      );
      drawCards(playerToDrawFour, 4);
      currentPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;
      break;
  }
  // After an action card is played, set the active color
  if (card.color !== "Wild") {
    activeColor = card.color;
  }
}

function chooseWildColor(player) {
  if (player.isAI) {
    // Simple AI: choose the color it has the most of
    const colorCounts = {};
    COLORS.forEach((c) => (colorCounts[c] = 0));
    player.hand.forEach((card) => {
      if (card.color !== "Wild") {
        colorCounts[card.color]++;
      }
    });
    let maxCount = 0;
    let chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)]; // Fallback
    for (const color in colorCounts) {
      if (colorCounts[color] > maxCount) {
        maxCount = colorCounts[color];
        chosenColor = color;
      }
    }
    console.log(
      `${player.name} chose ${COLOR_EMOJIS[chosenColor]} ${chosenColor}.`
    );
    return chosenColor;
  } else {
    // Human player
    while (true) {
      console.log("Choose a color:");
      console.log(
        `1: ${COLOR_EMOJIS.Red} Red, 2: ${COLOR_EMOJIS.Yellow} Yellow, 3: ${COLOR_EMOJIS.Green} Green, 4: ${COLOR_EMOJIS.Blue} Blue`
      );
      const choice = prompt("> ");
      if (["1", "2", "3", "4"].includes(choice)) {
        return COLORS[parseInt(choice) - 1];
      }
      console.log("Invalid choice. Please enter a number from 1 to 4.");
    }
  }
}

function takeTurn(player) {
  const topCard = discardPile[discardPile.length - 1];

  if (player.isAI) {
    // --- AI LOGIC ---
    console.log(`\n--- It's ${player.name}'s turn. ---`);
    console.log(`${player.name} has ${player.hand.length} cards.`);

    let playableCardIndex = player.hand.findIndex((card) =>
      isCardPlayable(card, topCard)
    );

    if (playableCardIndex !== -1) {
      const cardToPlay = player.hand[playableCardIndex];
      player.hand.splice(playableCardIndex, 1);
      discardPile.push(cardToPlay);
      console.log(`${player.name} played: ${getCardString(cardToPlay)}`);

      if (cardToPlay.color === "Wild") {
        activeColor = chooseWildColor(player);
        console.log(
          `The new active color is ${COLOR_EMOJIS[activeColor]} ${activeColor}.`
        );
      }
      handleCardEffect(cardToPlay);
    } else {
      console.log(`${player.name} has no playable cards and must draw.`);
      drawCards(player, 1);
      const newCard = player.hand[player.hand.length - 1];
      if (isCardPlayable(newCard, topCard)) {
        console.log(
          `${player.name} drew and played: ${getCardString(newCard)}`
        );
        player.hand.pop();
        discardPile.push(newCard);
        if (newCard.color === "Wild") {
          activeColor = chooseWildColor(player);
          console.log(
            `The new active color is ${COLOR_EMOJIS[activeColor]} ${activeColor}.`
          );
        }
        handleCardEffect(newCard);
      } else {
        console.log(`${player.name} drew a card and ends their turn.`);
      }
    }
  } else {
    // --- HUMAN LOGIC ---
    console.log(`\n--- It's your turn! ---`);
    console.log(
      `The top card is: ${getCardString(topCard)} (Active color: ${
        COLOR_EMOJIS[activeColor]
      } ${activeColor})`
    );

    console.log("Your hand:");
    player.hand.forEach((card, i) => {
      console.log(`${i}: ${getCardString(card)}`);
    });

    const playableCards = player.hand
      .map((card, i) => ({ card, i }))
      .filter((item) => isCardPlayable(item.card, topCard));

    if (playableCards.length === 0) {
      console.log("You have no playable cards. You must draw.");
      prompt("Press Enter to draw a card...");
      drawCards(player, 1);
      const newCard = player.hand[player.hand.length - 1];
      console.log(`You drew: ${getCardString(newCard)}`);

      if (isCardPlayable(newCard, topCard)) {
        const playDrawn = prompt(
          "You can play this card! Play it? (y/n) "
        ).toLowerCase();
        if (playDrawn === "y") {
          player.hand.pop();
          discardPile.push(newCard);
          console.log(`You played: ${getCardString(newCard)}`);
          if (newCard.color === "Wild") {
            activeColor = chooseWildColor(player);
            console.log(
              `The new active color is ${COLOR_EMOJIS[activeColor]} ${activeColor}.`
            );
          }
          handleCardEffect(newCard);
        }
      } else {
        console.log("You cannot play the card you drew. Your turn is over.");
      }
    } else {
      while (true) {
        const choice = prompt(
          "Enter the number of the card to play, or type 'draw': "
        ).toLowerCase();
        if (choice === "draw") {
          drawCards(player, 1);
          console.log(
            `You drew: ${getCardString(
              player.hand[player.hand.length - 1]
            )}. Your turn is over.`
          );
          break;
        }

        const cardIndex = parseInt(choice);
        if (
          !isNaN(cardIndex) &&
          cardIndex >= 0 &&
          cardIndex < player.hand.length
        ) {
          const selectedCard = player.hand[cardIndex];
          if (isCardPlayable(selectedCard, topCard)) {
            player.hand.splice(cardIndex, 1);
            discardPile.push(selectedCard);
            console.log(`You played: ${getCardString(selectedCard)}`);
            if (selectedCard.color === "Wild") {
              activeColor = chooseWildColor(player);
              console.log(
                `The new active color is ${COLOR_EMOJIS[activeColor]} ${activeColor}.`
              );
            }
            handleCardEffect(selectedCard);
            break; // Exit the while loop after a valid move
          } else {
            console.log("That card is not playable. Try again.");
          }
        } else {
          console.log("Invalid input. Try again.");
        }
      }
    }
  }

  if (player.hand.length === 1) {
    console.log(`\n*** ${player.name} says UNO! ***\n`);
  }
}

// --- MAIN GAME LOOP ---

function playGame() {
  console.clear();
  console.log("============================");
  console.log("   WELCOME TO 🃏 EMOJI UNO!   ");
  console.log("============================");

  let numAI = 1;
  while (true) {
    const numInput = prompt(
      "How many AI opponents would you like to play against? (1-3): "
    );
    numAI = parseInt(numInput);
    if (!isNaN(numAI) && numAI >= 1 && numAI <= 3) break;
    console.log("Invalid input.");
  }

  setupGame(numAI + 1);

  while (true) {
    const player = players[currentPlayerIndex];
    takeTurn(player);

    if (player.hand.length === 0) {
      console.log(`\n🎉🎉🎉 ${player.name} has won the game! 🎉🎉🎉`);
      break;
    }

    // Move to the next player
    currentPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;
  }

  console.log("\n--- GAME OVER ---");
}

// Start the game
playGame();
