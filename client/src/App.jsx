import { useEffect, useState } from 'react'
import './App.css'
import Landing from './components/Landing'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Fragment } from 'react';
import Navbar from './components/Navbar';
import { Provider } from 'react-redux';
import store from "./redux/store"
import Register from './components/users/Register';
import Login from './components/users/Login';
import Private from './components/Private';
import Home from './components/Home';
import ProfileForm from './components/ProfileForms/ProfileForm';
import  AddEducation from './components/ProfileForms/AddEducation';
import AddExperience  from './components/ProfileForms/AddExperience';
import Developers from "./components/Developers";
import Profile from "./components/Profile";
import { setAuthToken } from './utils';
import { loadUser } from './redux/modules/users';
import Settings from './components/Settings';
import Post from './components/Posts/Post';
import Posts from './components/Posts/Posts';


function App() {

  useEffect(()=> {
    if(localStorage.token) {
      setAuthToken(localStorage.token)
    }
    store.dispatch(loadUser())
  }, [])

  return (
    <>
    <Provider store={store}>
      <BrowserRouter>
      <Fragment>
      <Navbar />
      <Routes>
              <Route exact path="/" element={<Landing />} />
              <Route exact path="/register" element={<Register />} />
              <Route exact path="/login" element={ <Login />} />
              <Route exact path="/home" element={ <Private component= {Home}/>} />
              <Route exact path="/create-profile" element={<Private component={ProfileForm}/>} />
              <Route exact path="/add-education" element={<Private component={AddEducation}/>} />
              <Route exact path="/add-experience" element={<Private component={AddExperience}/>} />
              <Route exact path="/developers" element={<Private component={Developers}/>} />
              <Route exact path="/profile/:id" element={<Private component={Profile}/>} />
              <Route exact path="/settings" element={<Private component={Settings}/>} />
              <Route exact path="/edit-profile" element={<Private component={ProfileForm}/>} />
              <Route exact path="/posts" element={<Private component={Posts}/>} />
              <Route exact path="/posts/:id" element={<Private component={Post}/>} />
      </Routes>
      </Fragment>
      </BrowserRouter>
    </Provider>
    </>
  )
}

export default App
