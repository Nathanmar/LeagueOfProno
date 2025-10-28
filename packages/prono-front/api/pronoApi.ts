

async function fetchData(endpoint: string) {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${endpoint}`;
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
