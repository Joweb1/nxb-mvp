import { API_FOOTBALL_KEY } from '../firebaseConfig';

const API_HOST = 'v3.football.api-sports.io';

const fetchFromAPI = async (endpoint) => {
  const response = await fetch(`https://${API_HOST}/${endpoint}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_FOOTBALL_KEY,
    },
  });
  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = JSON.stringify(data.errors);
    console.error('API Errors:', errorMsg);
    throw new Error(`Failed to fetch data from API-Football: ${errorMsg}`);
  }
  return data.response;
};

export const getLiveFixtures = () => {
  return fetchFromAPI('fixtures?live=all');
};

export const getFixturesByDate = (date) => {
  return fetchFromAPI(`fixtures?date=${date}`);
};

export const getMatchStatistics = (fixtureId) => {
  return fetchFromAPI(`fixtures/statistics?fixture=${fixtureId}`);
};

export const getMatchEvents = (fixtureId) => {
  return fetchFromAPI(`fixtures/events?fixture=${fixtureId}`);
};

export const getMatchLineups = (fixtureId) => {
  return fetchFromAPI(`fixtures/lineups?fixture=${fixtureId}`);
};

export const getLeagueStandings = (season, leagueId) => {
  return fetchFromAPI(`standings?season=${season}&league=${leagueId}`);
};

export const getTeamStatistics = (season, teamId, leagueId) => {
  return fetchFromAPI(`teams/statistics?season=${season}&team=${teamId}&league=${leagueId}`);
};
