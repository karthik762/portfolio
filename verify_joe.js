async function verifyJoe() {
    try {
        console.log('Sending message to Joe...');
        const response = await fetch('http://localhost:8080/joe/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hello Joe, are you there?",
                history: []
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Joe responded successfully!');
            console.log('Joe\'s response:', data.response);
        } else {
            console.log('Joe is still foggy. Status:', response.status);
            console.log('Error details:', data.detailed_error || data.response);
        }
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyJoe();
