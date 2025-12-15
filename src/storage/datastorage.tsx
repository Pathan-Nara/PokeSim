export const dataStorage = {

    saveFavorites: (favorites: any[]) => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    },

    loadFavorites: (): any[] => {
        const data = localStorage.getItem('favorites');
        return data ? JSON.parse(data) : [];
    },

    saveTeam: (team: any[]) => {
        localStorage.setItem('pokemonTeam', JSON.stringify(team));
    },

    loadTeam: (): any[] => {
        const data = localStorage.getItem('pokemonTeam');
        return data ? JSON.parse(data) : [];
    }

}