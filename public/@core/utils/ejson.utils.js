"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToStringParser = void 0;
exports.deserializeEJSON = deserializeEJSON;
const mongodb_1 = require("mongodb");
/**
 * Deserializa valores en formato EJSON canónico a sus tipos nativos.
 */
function deserializeEJSON(obj) {
    if (obj === null || obj === undefined)
        return obj;
    // Manejar arrays
    if (Array.isArray(obj)) {
        return obj.map(item => deserializeEJSON(item));
    }
    // Manejar objetos que son valores EJSON
    if (typeof obj === 'object') {
        // ObjectId
        if (obj.$oid !== undefined && typeof obj.$oid === 'string') {
            return new mongodb_1.ObjectId(obj.$oid);
        }
        // NumberInt
        if (obj.$numberInt !== undefined) {
            const val = typeof obj.$numberInt === 'string' ? parseInt(obj.$numberInt, 10) : obj.$numberInt;
            return Number.isNaN(val) ? 0 : val;
        }
        // NumberLong
        if (obj.$numberLong !== undefined) {
            const val = typeof obj.$numberLong === 'string' ? BigInt(obj.$numberLong) : obj.$numberLong;
            return val;
        }
        // NumberDouble
        if (obj.$numberDouble !== undefined) {
            const val = typeof obj.$numberDouble === 'string' ? parseFloat(obj.$numberDouble) : obj.$numberDouble;
            return Number.isNaN(val) ? 0 : val;
        }
        // Date
        if (obj.$date !== undefined) {
            const dateStr = typeof obj.$date === 'string' ? obj.$date : obj.$date.$numberLong;
            if (typeof dateStr === 'string')
                return new Date(dateStr);
            if (typeof dateStr === 'number')
                return new Date(dateStr);
            return new Date();
        }
        // Regex
        if (obj.$regex !== undefined) {
            const pattern = obj.$regex;
            const options = obj.$options || '';
            return new RegExp(pattern, options);
        }
        // Binary
        if (obj.$binary !== undefined && obj.$type !== undefined) {
            const base64 = obj.$binary;
            const buffer = Buffer.from(base64, 'base64');
            return buffer;
        }
        // Timestamp
        if (obj.$timestamp !== undefined) {
            return obj.$timestamp; // { t: number, i: number }
        }
        // MinKey / MaxKey
        if (obj.$minKey !== undefined)
            return -1;
        if (obj.$maxKey !== undefined)
            return 1;
        // Si no es un tipo EJSON, procesar recursivamente sus propiedades
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = deserializeEJSON(value);
        }
        return newObj;
    }
    return obj;
}
exports.objectToStringParser = {
    stringify: function (obj) {
        return JSON.stringify(obj, function (key, value) {
            var fnBody;
            //  if( instanceof BSON.ObjectId)
            if (typeof value === 'string' &&
                value.match(/^[0-9a-fA-F]{24}$/)) {
            }
            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();
                if (fnBody.length < 8 ||
                    fnBody.substring(0, 8) !== 'function') {
                    //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    },
    parse: function (str, date2obj) {
        const _eval = eval;
        return JSON.parse(str, function (key, value) {
            var prefix;
            if (typeof value !== 'string') {
                return value;
            }
            if (value.length < 8) {
                return value;
            }
            prefix = value.substring(0, 8);
            if (prefix === 'function') {
                return _eval('(' + value + ')');
            }
            if (prefix === '_PxEgEr_') {
                return _eval(value.slice(8));
            }
            if (prefix === '_NuFrRa_') {
                return _eval(value.slice(8));
            }
            return value;
        });
    },
};
//# sourceMappingURL=ejson.utils.js.map