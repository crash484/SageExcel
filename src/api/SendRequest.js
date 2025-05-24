//contain the method that will send the token to the route 
const SendRequest = async (token)=>{
    try {
            // Your async code here
                const response = await fetch('http://localhost:5000/api/auth/verify', {
                    method: 'POST',
                    headers:{
                    'Content-Type': 'application/json',
                    'Authorization':`Bearer ${token}`
                    }
                })
                const data = await response.json()     
                return data;
            } catch (error) {
                console.error(error);
                throw error;
            }
        }

export default SendRequest;

