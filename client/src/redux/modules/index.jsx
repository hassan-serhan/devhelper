import { combineReducers } from "redux";
import users from "./users";
import profiles from "./profiles";
import posts from "./posts";

export default combineReducers( {
    users, profiles, posts
});