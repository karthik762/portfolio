const GEMINI_API_KEY = 'AIzaSyB3RiCJOEswiXnDs4yMM_cOcQ_FmI3ao4I';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function test() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            console.log('Available models:');
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log('Error details:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

test();
