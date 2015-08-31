/**
 * Created by aris on 8/10/2015.
 */
import chai from 'chai';
let should=chai.should();
import { expect } from 'chai';
import chaiAsPromised from "chai-as-promised";
import NeoError from '../NeoError';
import * as neodb from '../neodb';
import Promise from 'bluebird';
import User from '../models/User';
import UserStore from '../models/UserStore';
import * as testUtil from './testUtil.js';
import util from 'util';
import validate from 'validate.js';

chai.use(chaiAsPromised);

let userStore=new UserStore();

describe('User store test',function() {

    beforeEach(()=>{

        const query='CREATE (user:User {props}) RETURN user';

        return neodb.cypherQuery("MATCH (node:User) WHERE node.username =~ 'test.*' OPTIONAL MATCH node-[rel]-() DELETE node,rel",{}) //clear the db first
            .then(()=>neodb.cypherQuery(query,{props:[{username:'testUser1',email:'testUser1@email.com'}]}))
            .then(()=>neodb.cypherQuery(query,{props:[{username:'testUser2',fullName:'nicolas'}]}))
            .then(()=>neodb.cypherQuery(query,{props:[{username:'testUser3',email:'testUser3@email.com'}]}));
    });

    it('create a username conflict',()=>userStore.create({username:'testUser1'}).should.be.rejected);
    it('create an invalid user',()=>userStore.create({username:'testUser3',email:'test@email'}).should.be.rejected);

    it('create a valid user',()=> {
        let user=userStore.create({username:'testUser4',email:'test@email.com'});

        return Promise.all([
            expect(user).to.eventually.have.property('username','testUser4'),
            ]);
    });

    it('find a user',()=>userStore.find('testUser1').should.eventually.have.property('email','testUser1@email.com'));

    it('find a user and update him',()=>{
        const user=userStore.find('testUser1');
        const savedUser=user.then((u)=> {
            u.location = 'austin,texas,usa';
            return userStore.update(u);
        });

        return Promise.all([
            user.should.eventually.have.property('email','testUser1@email.com'),
            savedUser.should.eventually.have.property('location','austin,texas,usa'),
            ]);
    });

    //integration style test here
    it('search',()=>expect(userStore.search('icol')).to.eventually.have.deep.property('[0].fullName','nicolas'));

    it('follow',()=>{
        const followPromise=userStore.follow('testUser1','testUser2');
        const followPromise2=followPromise.then(userStore.follow('testUser3','testUser2'));
        const getFollowersPromise=followPromise2.then(()=>userStore.getFollowers('testUser2'));

        return Promise.all([
            getFollowersPromise.should.eventually.have.deep.property('[1].username'), //order by latest
            getFollowersPromise.should.eventually.have.length(2),
            ]);
    });
});

describe('User model test', function () {
    it('create a user and validate him', ()=> {
        let user = new User({username: 'testUser3', email: 'test@email',bogus:'something'});
        expect(user).to.have.property('username', 'testUser3');
        expect(user).to.not.have.property('bogus');
        expect(validate(user, User.constraints)).to.have.property('email');
        expect(()=>user.username='bogus').to.throw(TypeError, /Cannot assign to read only/);
    });
});