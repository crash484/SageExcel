import React, { useEffect } from 'react';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux'
import SendRequest from '../../src/api/SendRequest';

export default function Settings() {
    const  token  = useSelector(selectCurrentToken)
        //this makes so that it will always verify the token once when the page is loaded at first
        useEffect(()=>{
            (async () => {
                try {
                    const data = await SendRequest(token);
                    console.log('Verification result:', data);
                } catch (error) {
                    console.error(error);
                }
            })();
        },[])
    return (
        <div>
            <h1>Settings Page</h1>
        </div>
    )
}