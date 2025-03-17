// Seed Generator
const generateRandomSeed = () => {
  let randomNumber = "";
  for (let i = 0; i < 16; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  return randomNumber;
};
