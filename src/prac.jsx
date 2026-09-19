import {useState}  from "react";
import react  from "react";

import { useNavigate } from "react-router-dom";

const Prac = ()=>{
    const [email,setEmail] = useState("");
        const [password,setPassword] = useState(""); 
    const [error, setError] = useState("");

    const navigate = useNavigate();
    function navitologin(e){
           navigate("/login")
        }
        function navitoapp(){
           navigate("/app")
    }
   async function handleSubmit(e){
        e.preventDefault();
       const response = await fetch("http://localhost:5000/api/login" ,{
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                email : email,
                password:password
            }
            ),
        headers:{

                "Content-Type": "application/json"
            },
        credentials:"include"

    }
    )
    
      handleResponse(response)

    }
    function handleResponse(response){
            if(response.status === 200){
               navitoapp()
         }
         else{
               
            setError("Incorrect Password,Try again")
            
        }
        
    }
    return(
        <div>
            Welcome to reqlab
          
         <form action="" onSubmit={handleSubmit}>

            <input onChange = {(e)=>{
                
                setEmail(e.target.value)}
            }
             placeholder="Enter email"  value = {email}>
            
             </input>
             <input type="password" onChange = {(e)=>{
                 setPassword(e.target.value) }}
                 placeholder="Enter password"  value = {password}
                 />
            <button 
            >Log in</button>
         </form>
          
        {error}
        </div>
    );
}
export default Prac;