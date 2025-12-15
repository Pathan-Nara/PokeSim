import { useEffect, useState } from 'react'
import { getPokemonById } from './pokeApi/services'
import { getCatchRate, getGenderRate } from './tyradex/services';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { dataStorage } from './storage/datastorage';

import './App.css'

interface Pokemon {
  name: string;
  img: string;
  sound: string;
  type: [string];
  gender?: string | null;
  catchRate: number;
  shiny?: boolean;
  favorite?: boolean;
}



function App() {
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonTeam, setPokemonTeam] = useState<Pokemon[]>(dataStorage.loadTeam());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [userFavorite, setUserFavorite] = useState<Pokemon[]>(dataStorage.loadFavorites());

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

  function isShiny(): boolean {
    const shinyChance = 512; 
    const randomNum = Math.floor(Math.random() * shinyChance);
    return randomNum === 0;
  }

  function addToFavorites(pokemon: Pokemon) {
    if(!userFavorite.some(fav => fav.name === pokemon.name)) {
      const newFavorites = [...userFavorite, pokemon];
      setUserFavorite(newFavorites);
      dataStorage.saveFavorites(newFavorites);
    } else {
      return;
    }
  }

  function removeFromFavorites(pokemon: Pokemon) {
    const newFavorites = userFavorite.filter(fav => fav.name !== pokemon.name);
    setUserFavorite(newFavorites);
    dataStorage.saveFavorites(newFavorites);
  }


  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const pokemonData = await getPokemonById(randomId);

    const catch_rate = await getCatchRate(randomId);
    const shiny = isShiny();
    if (shiny) {
      console.log("Un shiny est apparu !");
    }
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
      img: shiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default,
      sound: pokemonData.cries.latest,
      type: pokemonData.types.map((typeInfo: any) => typeInfo.type.name),
      catchRate: catch_rate,
      gender: isMale,
      shiny: shiny,
      favorite: userFavorite.some(fav => fav.name === pokemonData.name)
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
                    if (newTeam.length < 6 && pokemon) {
                      const finalTeam = [...newTeam, pokemon];
                      setPokemonTeam(finalTeam);
                      dataStorage.saveTeam(finalTeam);
                    }
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
          <button onClick={() => { getRandomPokemon(); console.log("Random Pokémon generated"); console.log(pokemon)}}>Get Random Pokémon</button>
        </div>          
          {pokemon && (

            <>
            <div className="pokemon-display">
              <div className="fav-btn">
                <button 
                  onClick={() => { 
                    if (pokemon.favorite) {
                      removeFromFavorites(pokemon);
                      setPokemon({...pokemon, favorite: false});
                    } else {
                      addToFavorites(pokemon);
                      setPokemon({...pokemon, favorite: true});
                    }
                  }}
                  className="fav-btn"
                >
                  {pokemon.favorite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
              <h2>{pokemon.name}</h2>
              <img src={pokemon.img} alt={pokemon.name} />
              <p>Type: {pokemon.type.join(', ')}</p>
              <p>Catch Rate: {pokemon.catchRate}</p>
              <p>Gender: {pokemon.gender}</p>
            </div>
            </>
          )}
        {(pokemon) && (
          <div className="capture-section">
            <button onClick={() => {
              if(capture(pokemon.catchRate, 150)) {
                if (pokemonTeam.length < 6) {
                  setPokemonTeam([...pokemonTeam, pokemon]);
                  dataStorage.saveTeam([...pokemonTeam, pokemon]);
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
