import { useEffect } from "react";
import { configDotenv } from "dotenv";
import { response } from "express";

export default function GoogleLoginButton(){
    useEffect(()=>{
        if(!window.google) return;

        window.google.accounts.id.intialize({
            client_id:process.env.GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin
        });
        
        window.google.accounts.id.renderButton(
            document.getElementById("google-btn"),
             {
        theme: "outline",
        size: "large",
        text: "signin_with",
            }
        );
    },[])
    
    const handleGoogleLogin = async()=>{
        await fetch("api/auth/google",{
            method:"POST",
            headers:{ "Content-type":"application/json"},
            body: JSON.stringify({token:response.credential})
        });
    }

    return <div id="google-btn"></div>
}