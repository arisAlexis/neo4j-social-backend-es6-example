/**
 * Created by aris on 8/27/2015.
 */
import util from 'util';

export function print(result) {
    console.log(util.inspect(result,{depth:null}));
    return result;
}