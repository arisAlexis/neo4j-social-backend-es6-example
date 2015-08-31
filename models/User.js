/**
 * Created by aris on 8/9/2015.
 */
import * as db from '../neodb';
import validate from 'validate.js';

export default class User {

    static getMembers() {
        return ['username','email','fullName','birthdate','location','foto'];
    }

    constructor(props) {
        Object.keys(props).forEach((name)=>{
            if (User.getMembers().includes(name)) this[name]=props[name]
        });
        Object.defineProperty(this,"username",{writable:false});
        Object.defineProperty(this,"email",{writable:false});
    }


    /**
     * returns an copy object that includes only the properties that we allow in our schema
     */
    copy(user) {
        let props={};
        Object.keys(this).forEach((name)=>{
            if (User.getMembers().includes(name)) props[name]=this[name]
        });
        return props;
    }


    //self-validate
    validate() {
        return validate(this,User.constraints);
    }

   static get constraints() {
       return {
           username: {
               presence: true,
               format: {
                   pattern: /^[\w]+$/,
                   message: "username contains invalid characters"
               }
           },
           email: {
               email: {
                   message: "invalid email"
               }
           }
       }
   }
}