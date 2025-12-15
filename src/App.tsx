import { use, useEffect, useState } from 'react'
import { getAllPokemon, getPokemonById } from './pokeApi/services'
import { getCatchRate, getGenderRate } from './tyradex/services';
import './App.css'

interface Pokemon {
  name: string;
  img: string;
  sound: string;
  type: [string];
  gender?: string | null;
  catchRate: number;
}



function App() {
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isShiny, setIsShiny] = useState<boolean | null>(null);
  const [pokemonTeam, setPokemonTeam] = useState<Pokemon[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    console.log("Counter depuis le useEffect:", counter);
    if(counter === 3){
      console.log("Compteur à 3, le pokemon s'enfuit");
      getRandomPokemon();
      setCounter(0);
    }
  }, [counter, pokemonTeam]);

  function dropRate(rate: number) {
      const randomNum = Math.random() * 100;
      console.log("Random Number:", randomNum, "Rate:", rate, randomNum <= rate);
      return randomNum <= rate;
    }

    function capture(pokemonRate: number, ballRate: number = 150) { //taux de capture de la safari ball de base vu qu'on est dans un safari
      setCounter(prev => prev + 1);
      console.log("Capture function called. Counter:", counter + 1);
      const ball = Math.random() * ballRate;
      if (ball <= pokemonRate) {
        console.log('capture reussi reintialisation du compteur');
        setCounter(0);
        return true;
      } else {
        return false;
      }
    }

  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const pokemonData = await getPokemonById(randomId);

    const catch_rate = await getCatchRate(randomId);
    const genders = await getGenderRate(randomId);

    let isMale: string | null = null;

    if (genders === null){
      isMale = 'Pas de sexe';
    }
    else if (genders.male === 0){
      isMale = 'female';
    } else{
      isMale = dropRate(genders.male) ? 'male' : 'female';
    }
    
    const pokemon: Pokemon = {
      name: pokemonData.name,
      img: pokemonData.sprites.front_default,
      sound: pokemonData.cries.latest,
      type: pokemonData.types.map((typeInfo: any) => typeInfo.type.name),
      catchRate: catch_rate,
      gender: isMale,
    };
    
    setPokemon(pokemon);
  }


  const modalReplace = 
  <>
    <div className='modal'>
      <div className='modal-content'>
        <div className='modal-header'>
          <button className='close-button' onClick={() => { setShowModal(false); getRandomPokemon(); }} aria-label="Fermer">&times;</button>
        </div>
        <div className='modal-body'>
          <h2>Équipe Complète!</h2>
          <p>Vous ne pouvez pas capturer plus de 6 Pokémon veuillez en retirer un.</p>
          <div className="grid">
              {pokemonTeam.map((poke, index) => (
                <div key={index} className='pokemon'>
                  <h2>{poke.name}</h2>
                  <img src={poke.img} alt={poke.name} />
                  <button onClick={() => {
                    const newTeam = pokemonTeam.filter((_, i) => i !== index);
                    setPokemonTeam(newTeam);
                    setShowModal(false);
                    console.log("Relâché:", pokemon);
                    newTeam.length < 6 && pokemon && setPokemonTeam([...newTeam, pokemon]);
                    getRandomPokemon();
                  }}>Relâcher</button>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  </>


   
  return (
    <>
      {showModal && modalReplace}
      <div className="App">
        <div className="header">
          <h1>PokéSim</h1>
          <button onClick={() => { getRandomPokemon(); }}>Get Random Pokémon</button>
        </div>
        <div className="pokemon-display">
          {pokemon && (
            <>
              <h2>{pokemon.name}</h2>
              <img src={pokemon.img} alt={pokemon.name} />
              <p>Type: {pokemon.type.join(', ')}</p>
              <p>Catch Rate: {pokemon.catchRate}</p>
              <p>Gender: {pokemon.gender}</p>
            </>
          )}
        </div>
        {(pokemon) && (
          <div className="capture-section">
            <button onClick={() => {
              if(capture(pokemon.catchRate, 150)) {
                if (pokemonTeam.length < 6) {
                  setPokemonTeam([...pokemonTeam, pokemon]);
                  getRandomPokemon();
                } else{
                  setShowModal(true);
                }
              } else {
                console.log("Missed!");
              }
            }}>Capture</button>
          </div>
        )}
        <div className="pokemon-team-section">
          <h1>Pokemon Capturé :</h1>
          <div className="pokemon-team">
            {pokemonTeam.map((poke, index) => (
              <div key={index} className="team-pokemon">
                <h2>{poke.name}</h2>
                <img src={poke.img} alt={poke.name} />
                <button onClick={() => {
                  const newTeam = pokemonTeam.filter((_, i) => i !== index);
                  setPokemonTeam(newTeam);
                }}>Relâcher</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}




export default App
