import "./App.css";
import React, { Component,useState } from "react";
import tiffImage from "./tiff.png";

function App() {
  return (
    <div className="App">
      <img className="tiff-image" alt="Tiff logo" src={tiffImage} />
      <FilmList />
    </div>
  );
}

function Film(props) {
  const [isOpen,setOpen]=useState(false);

  const genreStrings = props.genres.map(genre => genre.name);

  console.log(props.obj);
  return (
    <div onClick={()=>setOpen(!isOpen)} className="film-container">
      <h1>
        {props.title}
      </h1>
      <h1>
        {props.release}
      </h1>
       {isOpen && 
       <div className="film-properties">
        <p>{props.overview}</p>
        <p>Genres: {genreStrings.join(", ")}</p>
        <p>Runtime: {props.runTime}</p>
        {props.tagline && <p>Tagline: {props.tagline}</p>}
      </div>}
    </div>
  );
}

class FilmList extends Component {
  constructor(props) {
    super();
    this.state = {
      data: [],
      movies:[]
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
          pageData.results.forEach(async(movie)=>{
            // Array to store movie details so they can update final state
            let arr=[]

            // Request
            const movieResult = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${key}`);
            const movieData = await movieResult.json();

            // Combining previous array and current arr details to update state
            arr = this.state.movies.concat(movieData);

            // Update state
            this.setState({movies:arr});
        });
      }

      function compareDates(a,b){
        if (a<b){
          return -1;
        }
      
        if (a>b){
          return 1;
        }
      
        return 0;
      }

      // Grabbing current movie list
      const arr = this.state.movies;

      // Sorting list with above compare function
      arr.sort((a,b) => compareDates(new Date(a.release_date),new Date(b.release_date)));

      // Set new state of movies array
      this.setState({ movies: arr });
    };

    // Calls function to update data state
    getData();
  }
  render() {
    return (
      <div className="film-list">
        {this.state.movies.map(
          (movie) =>
            movie.popularity >= 10 && (
              <Film
                overview={movie.overview}
                title={movie.title}
                genres={movie.genres}
                release={movie.release_date}
                obj={movie}
                runTime={movie.runtime}
                tagline={movie.tagline}
              />
            )
        )}
      </div>
    );
  }
}

export default App;
