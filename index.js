const axios = require("axios");
const inquirer = require('inquirer');

function getOptions(route) {

  const options = {
    // "method"  : "GET",
    "hostname": "api.themoviedb.org",
    "port"    : null,
    "path"    : `/3/${route}`,
    "headers" : {},
    queries: {
      api_key: 'c22109c5302841a4f772b809e777c8bf'
    }
  };

  options.url = `https://${options.hostname}${options.path}`;
  return options;
}

function getNewToken() {
  const options = getOptions('authentication/token/new');

  return axios.get(options.url, {params: options.queries});
}

function validateTokenvWithLogin(requestToken) {
  const options = getOptions('authentication/token/validate_with_login');

  // TODO change : https://developers.themoviedb.org/3/authentication/how-do-i-generate-a-session-id
  Object.assign(options.queries, {
    username: 'kharenlaurent',
    password: '09098_eufThe',
    request_token: requestToken
  });

  return axios.get(options.url, {params: options.queries});
}

function getNewSession(requestToken) {
  const options = getOptions('authentication/session/new');

  Object.assign(options.queries, {
    request_token: requestToken
  });

  return axios.get(options.url, {params: options.queries});
}

function getRatedMovie(requestToken, session) {
  const options = getOptions('account/%7Baccount_id%7D/rated/movies');

  Object.assign(options.queries, {
    // language: 'fr-FR', // title en japonais sinon
    session_id: session,
    request_token: requestToken
  });

  return axios.get(options.url, {params: options.queries});
}

function searchMovie(query) {
  const options = getOptions('search/movie');

  Object.assign(options.queries, {
    language: 'fr-FR',
    include_adult: false,
    query: query
  });

  return axios.get(options.url, {params: options.queries});
}

function addToList(session, movieId) {
  const options = getOptions('list/50306/add_item');

  Object.assign(options.queries, {
    session_id: session,
  });

  Object.assign(options.headers, {
    'Content-Type': 'application/json;charset=utf-8' // TOOD
  });

  console.log(options);

  return axios.post(options.url, {params: options.queries, data: {media_id: movieId}});
}

function getAuth() {
  return new Promise((resolve, reject) => {
    getNewToken().then(
      response => {
        const token = response.data.request_token;
        console.log('token', token);

        validateTokenvWithLogin(token).then(response => {
          console.log('validate', response.data.success);

          getNewSession(token).then(response => {
            console.log('session', response.data.session_id);
            resolve({token: token, session: response.data.session_id});
          });
        });
      }, error => console.log(error.response.data)
    );
  });
}

// get rated movies
function showRatedMovie() {
  getAuth.then(auth => {
    getRatedMovie(auth.token, auth.session).then(
      response => {
        const results = response.data.results;
        console.log('results', results.map(r => r.title));
      },
      error => console.log(error.response.data)
    );
  });
}

function searchMovieInListByQuery() {
  getAuth.then(auth => {
    let query = 'La verite';
    searchMovie('La verite').then(
      response => {
        console.log(response.data.results);
        const results = response.data.results.map(r => {
          return {
            name : `[${r.id}] - ${r.title} (${r.original_title}) : "${r.overview.slice(0, 100)}..."`,
            value: r.id,
            short: r.title
          }
        });

        const question = {
          type   : 'list',
          message: `Choisir le film pour la recherche "${query}"`,
          name   : 'movie',
          choices: results
        };

        inquirer.prompt([question]).then(
          answers => {
            console.log(answers);
          },
          error => console.log(error)
        );
      },
      error => console.log(error.response.data)
    );
  });
}

function addMovieToListById() {
  getAuth.then(auth => {
    addToList(auth.session, 204).then(
      response => {
        console.log(response.data);
      },
      error => console.log(error.response.data)
    );
  });
}

// showRatedMovie();
// addMovieToListById();

addToList('73a185c29b709173326b9f01f7cb703ee10c1bd5', 204).then(
  response => {
    console.log(response.data);
  },
  error => console.log(error.response.data)
);