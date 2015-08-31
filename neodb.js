/**
 * Created by aris on 8/10/2015.
 */
import config from 'config';
import Promise from 'bluebird';
import request from 'request';
let requestAsync=Promise.promisifyAll(require('request'));
import NeoError from './NeoError';
import util from 'util';

let dbUrl='http://'+config.get('neo4j.username')+':'+config.get('neo4j.password')
    +'@'+config.get('neo4j.host')+':'+config.get('neo4j.port');


export function cypherQuery(query,params) {

    return new Promise(function(resolve,reject) {
        return requestAsync.postAsync({
            uri: dbUrl+'/db/data/transaction/commit',
            json: {statements: [{statement: query, parameters: params}]}
        }).then(function(result) {
            if (result[1].errors.length > 0) {
                const error=new NeoError(result[1].errors[0].message,result[1].errors[0].code);
                console.log('db error:'+error);
                reject(error);
            }
            resolve(transformData(result[1].results));
        });
    });
}

//untested and unused
export function addToIndex(index,nodeId,key,value) {

    let dbUri = dbUrl + '/db/data/index/node/user_data_fulltext';
    return deleteFromIndex(index, nodeId).then(
        requestAsync.postAsync({
            uri: dbUri,
            json: {
                uri: dbUrl + '/db/data/node/' + nodeId,
                key,
                value
            }
        }));
}

function deleteFromIndex(index,nodeId) {

    return requestAsync.delete({
        uri:dbUrl+`/db/data/index/{index}/{nodeId}`
    });

}

function transformData(results) {
    //console.log('results:\n'+util.inspect(results,{depth:null}));
    let rows=[];
    for(let i of results) {
        for (let j of i.data) {
            rows.push(j.row);
        }
    }
    //console.log('transformed data:'+util.inspect(rows));
    return rows;
}
