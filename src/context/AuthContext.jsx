import {createContext,useState, useEffect} from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user') || null)
    );


const [loading,setLoading] = useState(false);
const [error, setError] = useState(null);

//Register user
const register = async(userData) =>{
    setLoading(true);
    setError(null);
    try{
        const {data} = await API.post('/auth/register', userData);
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return {success:true}
    }
    catch(err){
        const message = err.response?.data?.message || "User registration failed";
        setError(message);
        return {success:false, message};
    }
    finally{
        setLoading(false);
    }
}

//login user
const login = async(email, password)=>{
    setLoading(true);
    setError(null);
    try{
        const {data} = await API.post('/auth/login', {email,password});
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        return {success:true, role: data.data.role}
    }
    catch(err){
        const message = err.response?.data?.message || "User login failed";
        setError(message);
        return {success:false, message};
    }
    finally{
        setLoading(false);
    }
}

//logout

const logout = ()=>{
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
};

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{user, loading, error, register, login, logout, clearError}}>
        {children}
    </AuthContext.Provider>
  );
};