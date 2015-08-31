import * as db from '../neodb';
import User from './User';
import validate from 'validate.js';
import util from 'util';

export default class UserStore {

    create(props) {
        const query='CREATE (user:User {props}) RETURN user';
        const message=validate(props,User.constraints);
        if (typeof message !='undefined') {
            return Promise.reject(new Error(message));
        }
        return db.cypherQuery(query, {props: [props]}).then((data)=>data[0][0]);

    }

    update(user) {
        const validatedUser=new User(user);
        //everything except for the email and username can be updated
        const query='MATCH (user:User) WHERE user.username={username} SET user = { props } RETURN user';
        let props=validatedUser.copy();
        delete props.username;
        delete props.email;
        return db.cypherQuery(query,{username:validatedUser.username,props}).then((data)=>data[0][0]);
    }

    follow(follower,followee) {

        const query='MATCH (a:User),(b:User) WHERE a.username = {follower} AND b.username = {followee} CREATE (a)-[r:FOLLOWS { since: timestamp() }]->(b)';
        return db.cypherQuery(query,{follower,followee});
    }

    getFollowers(username) {
        const query='MATCH (me:User {username:{username}})<-[r:FOLLOWS]-(follower) ' +
            'RETURN follower.foto,follower.username ORDER BY r.since DESC';
        return db.cypherQuery(query,{username}).then((data)=>data.map((u)=>this._parseUserWithColumns(['foto','username'],u)));
    }

    unfollow(follower,folowee) {}


    /**
     * helper function to parse a user from an array of values
     * @param data
     * @private
     */
    _parseUserWithColumns(cols,arr) {
        const newObject={};
        let i=0;
        cols.forEach((c)=>newObject[c]=arr[i++]);
        return new User(newObject);
    }

    /**
     * retrieve an exact username
     * @param username
     * @returns {Promise.<T>}
     */
    find(username) {
        const query = 'MATCH (user:User) WHERE user.username={username} RETURN user';
        return db.cypherQuery(query,{username:username}).then((data)=>data[0][0]);
    }

    /**
     * search if string matches in username or fullName
     * @param s
     * @param skip
     * @param limit
     * @returns {Promise.<T>} with a list of ?
     */
    search(s,skip=0,limit=10){
        const query=`MATCH (user:User) WHERE user.username=~'.*${s}.*' OR user.fullName=~'.*${s}.*' RETURN user SKIP ${skip} LIMIT ${limit}`;
        return db.cypherQuery(query,{}).then((data)=>data[0]);

    }
}
