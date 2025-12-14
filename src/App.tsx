import { useState } from 'react'
import { getAllPokemon, getPokemonById } from './pokeApi/services'
import { getCatchRate, getGenderRate } from './tyradex/services';
import './App.css'

interface Pokemon {
  name: string;
  img: string;
  sound: string;
  type: [string];
}


function App() {
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isShiny, setIsShiny] = useState<boolean | null>(null);
  const [maleorFemale, setMaleorFemale] = useState<boolean | null>(null);
  const [catchRate, setCatchRate] = useState<number | null>(null);
  const [isCaught, setIsCaught] = useState<boolean | null>(null);


  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const pokemonData = await getPokemonById(randomId);

    function dropRate(rate: number) {
      const randomNum = Math.random() * 100;
      return randomNum < rate;
    }

    const pokemon: Pokemon = {
      name: pokemonData.name,
      img: pokemonData.sprites.front_default,
      sound: pokemonData.cries.latest,
      type: pokemonData.types.map((typeInfo: any) => typeInfo.type.name),
    };


    const catch_rate = await getCatchRate(randomId);
    setCatchRate(catch_rate);
    const isMale = await getGenderRate(randomId);
    console.log(isMale.male);
    setMaleorFemale(dropRate(isMale.male));
    setPokemon(pokemon);
  }

   
  return (
    <>
      <div className="App">
        <h1>PokéSim</h1>
        <button onClick={() => { getRandomPokemon(); console.log(pokemon); }}>Get Random Pokémon</button>
        <div className="pokemon-display">
          {pokemon && (
            <>
              <h2>{pokemon.name}</h2>
              <img src={pokemon.img} alt={pokemon.name} />
              <p>Type: {pokemon.type.join(', ')}</p>
              <p>Catch Rate: {catchRate}</p>
              <p>Gender: {maleorFemale ? 'Male' : 'Female'}</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
