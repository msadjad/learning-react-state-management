import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

export interface Pokemon {
  id: number;
  name: string;
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

function usePokemonSource(): {
  pokemon: Pokemon[];
  search: string;
  setSearch: (search: string) => void;
} {
  type PokemonState = {
    pokemon: Pokemon[];
    search: string;
  };

  type PokemonActions =
    | { type: "setPokemon"; payload: Pokemon[] }
    | { type: "setSearch"; payload: string };

  const [{ pokemon, search }, dispatch] = useReducer(
    (state: PokemonState, action: PokemonActions) => {
      switch (action.type) {
        case "setPokemon":
          return { ...state, pokemon: action.payload };
        case "setSearch":
          return { ...state, search: action.payload };
        default:
          return state;
      }
    },
    {
      pokemon: [],
      search: "",
    }
  );

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p: Pokemon) =>
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }, [pokemon, search]);

  useEffect(() => {
    fetch("/pokemon.json")
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: "setPokemon", payload: data });
      });
  }, []);

  const setSearch = useCallback((search: string) => {
    dispatch({ type: "setSearch", payload: search });
  }, []);

  return { pokemon: filteredPokemon, search, setSearch };
}

const PokemonContext = createContext<ReturnType<typeof usePokemonSource>>(
  {} as unknown as ReturnType<typeof usePokemonSource>
);

export function usePokemon() {
  return useContext(PokemonContext);
}

export const PokemonProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PokemonContext.Provider value={usePokemonSource()}>
      {children}
    </PokemonContext.Provider>
  );
};
