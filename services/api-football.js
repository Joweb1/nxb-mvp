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
    console.error('API Errors:', data.errors);
    throw new Error('Failed to fetch data from API-Football');
  }
  return data.response;
};

export const getLiveFixtures = () => {
  return fetchFromAPI('fixtures?live=all');
};

export const getFixturesByDate = (date) => {
  return fetchFromAPI(`fixtures?date=${date}`);
};
