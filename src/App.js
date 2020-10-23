import "./App.css";
import React, { Component, useState } from "react";
import tiffImage from "./tiff.png";
import filmLogo from "./noun_Movie_1241202.svg";

function App() {
  return (
    <div className="App">
      <img className="tiff-image" alt="Tiff logo" src={tiffImage} />
      <FilmList />
    </div>
  );
}

function Film(props) {
  const [isOpen, setOpen] = useState(false);

  const genreStrings = props.genres.map((genre) => genre.name);

  return (
    <div onClick={() => setOpen(!isOpen)} className="film-container">
      <div className="title-container">
        <img className="film-reel" src={filmLogo} alt="Film reel icon" />
        <h1>
          {props.title}
          <br />
          {props.release}
        </h1>
      </div>
      {isOpen && (
        <div className="film-properties">
          <p>{props.overview}</p>
          <p>Genres: {genreStrings.join(", ")}</p>
          <p>Runtime: {props.runTime}</p>
          {props.tagline && <p>Tagline: {props.tagline}</p>}
          <p><strong>Actors and their other movies:</strong></p>
          {props.actors && Object.entries(props.actors).map(actor=>actor[1] && <p>{actor[0]}: {actor[1]}</p>)}
        </div>
      )}
    </div>
  );
}

function compareDates(a, b) {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

class FilmList extends Component {
  constructor(props) {
    super();
    this.state = {
      movies: [],
    };
  }

  componentDidMount() {
    const key = "f96326fc134b9e186c6166e945994cbe";

    const getData = async () => {
      // Get movie data for this year so we can use total_pages
      const result = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=movie&include_adult=true&primary_release_year=2020`
      );
      const data = await result.json();

      // Gather all movie data for this year
      for (let i = 1; i <= data["total_pages"]; i++) {
        // Grab single page result, convert to json
        const pageResult = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=movie&include_adult=true&primary_release_year=2020&page=${i}`
        );
        const pageData = await pageResult.json();

        // Getting detailed movie data for each movie on the page
        pageData.results.forEach(async (movie) => {
          // Array to store movie details so they can update final state
          let arr = [];

          // Request
          const movieResult = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${key}`
          );
          const movieData = await movieResult.json();

          const castResult= await fetch(
            `
            https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${key}`
          )
          const castData=await castResult.json();
          
          if (movie.popularity >= 10) {

            movieData.cast=castData.cast;
            movieData.actors_known={};
            movieData.cast.forEach(async(cast)=>{
              const creditResult = await fetch (
                `https://api.themoviedb.org/3/credit/${cast.credit_id}?api_key=${key}`
              );
              const creditData = await creditResult.json();
              creditData.person.known_for.forEach(credit=>cast.known=credit.title);
              movieData.actors_known[cast.name]=cast.known;
            });

            arr = this.state.movies.concat(movieData);

            // Update state
            this.setState({ movies: arr });
          }
        });
      }
    };

    // Calls function to update data state
    getData();
  }
  render() {
    return (
      <div className="film-list">
        {this.state.movies
          .sort((a, b) =>
            compareDates(new Date(a.release_date), new Date(b.release_date))
          )
          .map((movie) => (
            <Film
              actors={movie.actors_known}
              overview={movie.overview}
              title={movie.title}
              genres={movie.genres}
              release={movie.release_date}
              runTime={movie.runtime}
              tagline={movie.tagline}
            />
          ))}
      </div>
    );
  }
}

export default App;
