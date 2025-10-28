const BASE_URL = 'http://localhost:3001/api'; 

async function fetchData(endpoint: string) {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${endpoint}`);
    }

    const result = await response.json();
    

    if (result.success === false) {
        throw new Error(result.error || 'API call failed');
    }
    
    return result.data; 
}

export const fetchMatches = () => fetchData('matches');
