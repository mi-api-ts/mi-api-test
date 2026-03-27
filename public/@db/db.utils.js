"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const hmac_sha256_1 = __importDefault(require("crypto-js/hmac-sha256"));
const mongodb_1 = require("mongodb");
const envConfig_1 = require("@core/config/envConfig");
const crypto = __importStar(require("crypto"));
let valid = "";
class _dbUtils {
    constructor() {
        this.objectToStringParser2 = {
            stringify: function (value, context = {}) {
                // MANEJO DE VALORES PRIMITIVOS DIRECTOS
                // Números especiales (NaN, Infinity) - manejo ANTES de typeof number
                if (typeof value === 'number') {
                    if (isNaN(value)) {
                        return JSON.stringify({ __type: 'nan', __value: '_NaN_' });
                    }
                    if (value === Infinity) {
                        return JSON.stringify({ __type: 'infinity', __value: '_Infinity_' });
                    }
                    if (value === -Infinity) {
                        return JSON.stringify({ __type: 'negInfinity', __value: '_NegInfinity_' });
                    }
                    // Números normales - los dejamos como están
                    return JSON.stringify(value);
                }
                // Undefined
                if (value === undefined) {
                    return JSON.stringify({ __type: 'undefined', __value: '_Undefined_' });
                }
                // Booleanos
                if (typeof value === 'boolean') {
                    return JSON.stringify(value);
                }
                // Strings
                if (typeof value === 'string') {
                    return JSON.stringify(value);
                }
                // Null
                if (value === null) {
                    return JSON.stringify(null);
                }
                // Symbol
                if (typeof value === 'symbol') {
                    return JSON.stringify({ __type: 'symbol', __value: '_Symbol_' + value.toString() });
                }
                // Funciones
                if (value instanceof Function || typeof value === 'function') {
                    const fnBody = value.toString();
                    // Analizar qué variables externas usa (simplificado)
                    const usedVars = this._extractExternalVars(fnBody);
                    // Crear objeto que incluye función + contexto necesario
                    const wrapper = {
                        __type: 'function',
                        __value: fnBody,
                        __context: context,
                        __usedVars: usedVars
                    };
                    if (!fnBody.startsWith('function') && !fnBody.startsWith('class')) {
                        wrapper.__type = 'arrowFunction';
                        wrapper.__value = '_NuFrRa_' + fnBody;
                    }
                    return JSON.stringify(wrapper);
                }
                // RegExp
                if (value instanceof RegExp) {
                    return JSON.stringify({ __type: 'regexp', __value: '_PxEgEr_' + value.toString() });
                }
                // Date
                if (value instanceof Date) {
                    return JSON.stringify({ __type: 'date', __value: '_Date_' + value.toISOString() });
                }
                // Para objetos/arrays, usamos el replacer normal
                const replacer = function (key, val) {
                    // Números especiales dentro de objetos
                    if (typeof val === 'number') {
                        if (isNaN(val)) {
                            return '_NaN_';
                        }
                        if (val === Infinity) {
                            return '_Infinity_';
                        }
                        if (val === -Infinity) {
                            return '_NegInfinity_';
                        }
                        return val; // Números normales
                    }
                    // Resto del replacer igual...
                    if (val instanceof Function || typeof val === 'function') {
                        const fnBody = val.toString();
                        if (!fnBody.startsWith('function') && !fnBody.startsWith('class')) {
                            return '_NuFrRa_' + fnBody;
                        }
                        return fnBody;
                    }
                    if (val instanceof RegExp) {
                        return '_PxEgEr_' + val.toString();
                    }
                    if (val instanceof Date) {
                        return '_Date_' + val.toISOString();
                    }
                    if (val === undefined) {
                        return '_Undefined_';
                    }
                    if (typeof val === 'symbol') {
                        return '_Symbol_' + val.toString();
                    }
                    return val;
                };
                return JSON.stringify(value, replacer);
            },
            parse: function (str) {
                const safeEval = (fnString, context = {}) => {
                    try {
                        // Crear función con new Function, incluso sin contexto
                        const contextKeys = Object.keys(context);
                        const contextValues = contextKeys.map(key => context[key]);
                        // Creamos una función que recibe el contexto (si lo hay) y devuelve la función evaluada
                        const fn = new Function(...contextKeys, `return (${fnString})`);
                        return fn(...contextValues);
                    }
                    catch (e) {
                        console.warn('Error evaluating:', fnString, e);
                        return function () { };
                    }
                };
                // Primero, verificamos si es un valor envuelto
                try {
                    const wrapped = JSON.parse(str);
                    // Si tiene la estructura de tipo envuelto, extraemos el valor real
                    if (wrapped && wrapped.__type) {
                        switch (wrapped.__type) {
                            case 'nan':
                                return NaN;
                            case 'infinity':
                                return Infinity;
                            case 'negInfinity':
                                return -Infinity;
                            case 'undefined':
                                return undefined;
                            case 'symbol':
                                const symbolContent = wrapped.__value.slice(8);
                                const match = symbolContent.match(/^Symbol\((.*)\)$/);
                                return match ? Symbol(match[1]) : Symbol(symbolContent);
                            case 'function':
                            case 'arrowFunction':
                                let fnBody = wrapped.__value;
                                if (wrapped.__type === 'arrowFunction') {
                                    fnBody = fnBody.slice(8); // Quitar '_NuFrRa_'
                                }
                                // Usar el contexto guardado
                                return safeEval(fnBody, wrapped.__context || {});
                            case 'regexp':
                                const regexStr = wrapped.__value.slice(8); // Quitamos '_PxEgEr_'
                                const lastSlash = regexStr.lastIndexOf('/');
                                if (lastSlash > 0) {
                                    const pattern = regexStr.slice(1, lastSlash);
                                    const flags = regexStr.slice(lastSlash + 1);
                                    return new RegExp(pattern, flags);
                                }
                                return new RegExp(regexStr);
                            case 'date':
                                return new Date(wrapped.__value.slice(6)); // Quitamos '_Date_'
                        }
                    }
                }
                catch (e) {
                    // No es un valor envuelto, continuamos con el parseo normal
                }
                // Parseo normal con reviver
                return JSON.parse(str, function (key, value) {
                    // Preservar números exactamente
                    if (typeof value === 'number') {
                        return value;
                    }
                    if (typeof value !== 'string') {
                        return value;
                    }
                    // Restaurar NaN (viene como string '_NaN_' dentro de objetos)
                    if (value === '_NaN_') {
                        return NaN;
                    }
                    // Restaurar Infinity
                    if (value === '_Infinity_') {
                        return Infinity;
                    }
                    if (value === '_NegInfinity_') {
                        return -Infinity;
                    }
                    // Restaurar funciones normales
                    if (value.startsWith('function') || value.startsWith('class')) {
                        return safeEval(value);
                    }
                    // Restaurar funciones flecha
                    if (value.startsWith('_NuFrRa_')) {
                        return safeEval(value.slice(8));
                    }
                    // Restaurar RegExp
                    if (value.startsWith('_PxEgEr_')) {
                        const regexStr = value.slice(8);
                        const lastSlash = regexStr.lastIndexOf('/');
                        if (lastSlash > 0) {
                            const pattern = regexStr.slice(1, lastSlash);
                            const flags = regexStr.slice(lastSlash + 1);
                            return new RegExp(pattern, flags);
                        }
                        return new RegExp(regexStr);
                    }
                    // Restaurar fechas
                    if (value.startsWith('_Date_')) {
                        return new Date(value.slice(6));
                    }
                    // Restaurar undefined
                    if (value === '_Undefined_') {
                        return undefined;
                    }
                    // Restaurar símbolos
                    if (value.startsWith('_Symbol_')) {
                        const symbolContent = value.slice(8);
                        const match = symbolContent.match(/^Symbol\((.*)\)$/);
                        return match ? Symbol(match[1]) : Symbol(symbolContent);
                    }
                    return value;
                });
            },
            // Helper para extraer variables externas (simplificado)
            _extractExternalVars: function (fnBody) {
                // Esto es una simplificación - en producción usarías un parser AST
                const varPattern = /[^a-zA-Z0-9_]([a-zA-Z_][a-zA-Z0-9_]*)[^a-zA-Z0-9_]/g;
                const paramsMatch = fnBody.match(/\(([^)]*)\)/);
                const params = paramsMatch ? paramsMatch[1].split(',').map(p => p.trim()) : [];
                // Palabras reservadas a ignorar
                const reserved = ['return', 'function', 'if', 'else', 'for', 'while', 'break',
                    'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally',
                    'var', 'let', 'const', 'true', 'false', 'null', 'undefined',
                    'this', 'arguments', 'new', 'typeof', 'instanceof', 'void',
                    'delete', 'in', 'of', 'class', 'extends', 'super'];
                // Encontrar todas las variables y filtrar parámetros
                const allVars = new Set();
                let match;
                while ((match = varPattern.exec(fnBody)) !== null) {
                    const varName = match[1];
                    if (!params.includes(varName) && !reserved.includes(varName)) {
                        allVars.add(varName);
                    }
                }
                return Array.from(allVars);
            },
            // Método helper para probar cualquier valor
            test: function (value, context = {}) {
                const str = this.stringify(value, context);
                const parsed = this.parse(str);
                console.log('Original:', value);
                console.log('Stringified:', str);
                console.log('Parsed:', parsed);
                console.log('---');
                return parsed;
            },
            // Método para ejecutar funciones con contexto
            execute: function (fn, context = {}, ...args) {
                if (typeof fn !== 'function') {
                    throw new Error('No es una función');
                }
                try {
                    const result = fn(...args);
                    // Si es promesa, manejarla
                    if (result instanceof Promise) {
                        return result.catch(error => {
                            console.error('Error en promesa:', error);
                            throw error;
                        });
                    }
                    return result;
                }
                catch (error) {
                    console.error('Error ejecutando función:', error);
                    throw error;
                }
            }
        };
        this.objectToStringParser = {
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
        this.existIds = (_obect) => {
            const list = [];
            for (const property in _obect) {
                if (_obect[property] &&
                    typeof _obect[property] === 'string' &&
                    _obect[property].match(/^[0-9a-fA-F]{24}$/)) {
                    list.push(_obect[property]);
                    return list;
                }
                else if (!(_obect[property] instanceof mongodb_1.BSON.ObjectId) &&
                    typeof _obect[property] === 'object') {
                    const respo = this.existIds(_obect[property]);
                    list.push(...respo);
                }
            }
            return list;
        };
        this.convertJSON = (_data, _keys = "inicio", _funciont = "inicio") => {
            var data = _data;
            let _filter = {};
            if (typeof data === 'string' && data.match(/^[0-9a-fA-F]{24}$/)) {
                return data;
            }
            else if (Array.isArray(data)) {
                const _list = [];
                for (let value of data) {
                    value = JSON.stringify(value);
                    value = JSON.parse(value);
                    if (value &&
                        typeof value === 'string' &&
                        value.match(/^[0-9a-fA-F]{24}$/)) {
                        _list.push(value);
                    }
                    else if (value && Array.isArray(value)) {
                        valid = "raiz";
                        const result = value.map(x => (this.convertJSON(x, "map", "Array.isArray(value)")));
                        _list.push(...result);
                    }
                    else if (value && typeof value === "object") {
                        const result = this.convertJSON(value, "if", '"value && typeof value ==="object"');
                        _list.push(result);
                    }
                }
                return _list;
            }
            let isVal = false;
            for (var property in data) {
                /**
                 * Capturamos valores necesarios
                 */
                let _item = data[property];
                if (_item && _item instanceof mongodb_1.BSON.ObjectId) {
                    _item = _item.toString();
                }
                if (_item &&
                    property === '_id') {
                    isVal = true;
                    _filter['id'] = _item.toString();
                    ;
                }
                else if (_item &&
                    typeof _item === 'object') {
                    const respo = this.convertJSON(data[property], property, "  this.existIds(_item).length > 0");
                    if (!!respo) {
                        isVal = true;
                        _filter[property] = respo;
                    }
                }
                else if (_item &&
                    typeof data[property] === 'string' &&
                    _item.match(/^[0-9a-fA-F]{24}$/)) {
                    isVal = true;
                    _filter[property] = _item;
                }
                else if (data.hasOwnProperty(property)) {
                    isVal = true;
                    _filter[property] = data[property];
                }
            }
            if (isVal) {
                return _filter;
            }
            else {
                return null;
            }
        };
        this.fullSchema = function (_schema = [], _filter = {}, _options) {
            let modelos = [];
            let unwind = [];
            const filterModel = { $match: _filter };
            const options = [];
            if (_options && _options.projection) {
                const modelo = { $project: { ..._options.projection } };
                options.push(modelo);
            }
            for (const value of _schema) {
                if (value === 'user') {
                    const data = {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'file') {
                    const data = {
                        $lookup: {
                            from: 'files',
                            localField: 'fileId',
                            foreignField: '_id',
                            as: 'file',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$file',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'phone') {
                    const data = {
                        $lookup: {
                            from: 'phones',
                            localField: 'phoneId',
                            foreignField: '_id',
                            as: 'phone',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$phone',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'role') {
                    const data = {
                        $lookup: {
                            from: 'roles',
                            localField: 'roleId',
                            foreignField: '_id',
                            as: 'role',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$role',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'aptitulo') {
                    const data = {
                        $lookup: {
                            from: 'aptitulos',
                            localField: 'aprendizajeId',
                            foreignField: '_id',
                            as: 'aptitulo',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$aptitulo',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'authorizes') {
                    const data = {
                        $lookup: {
                            from: 'authorizes',
                            let: { roleId: '$roleId', id: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$roleId',
                                                        {
                                                            $ifNull: [
                                                                '$$roleId',
                                                                '$$id',
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: 'authorizes',
                        },
                    };
                    modelos.push(data);
                }
                else if (value === 'company') {
                    const data = {
                        $lookup: {
                            from: 'companies',
                            localField: 'companyId',
                            foreignField: '_id',
                            as: 'company',
                        },
                    };
                    modelos.push(data);
                    const wind = {
                        $unwind: {
                            path: '$company',
                            preserveNullAndEmptyArrays: true,
                        },
                    };
                    unwind.push(wind);
                }
                else if (value === 'group') {
                    const data = {
                        $lookup: {
                            from: 'services',
                            localField: 'serviceIds',
                            foreignField: '_id',
                            as: 'group',
                        },
                    };
                    modelos.push(data);
                }
            }
            const response = [filterModel, ...modelos, ...unwind, ...options];
            return response;
        };
        this.hashPassword = async (password) => {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join('');
            const result = hashHex;
            return result;
        };
        this._generateJWTToken = (user) => {
            // Define token header
            const header = {
                alg: 'HS256',
                typ: 'JWT',
            };
            const _appId = envConfig_1.env.AWS_ACCESS_APP_ID;
            const _secret = envConfig_1.env.JWT_SECRET;
            // Calculate the issued at and expiration dates
            const date = new Date();
            const iat = Math.floor(date.getTime() / 1000);
            const exp = Math.floor(date.setDate(date.getDate() + 7) / 1000);
            // Define token payload
            const payload = {
                iat: iat,
                exp: exp,
                sub: user.id,
                aud: _appId,
                user_data: user,
                type: 'access',
            };
            // Stringify and encode the header
            const stringifiedHeader = enc_utf8_1.default.parse(JSON.stringify(header));
            const encodedHeader = this._base64url(stringifiedHeader);
            // Stringify and encode the payload
            const stringifiedPayload = enc_utf8_1.default.parse(JSON.stringify(payload));
            const encodedPayload = this._base64url(stringifiedPayload);
            // Sign the encoded header and mock-api
            let signature = encodedHeader + '.' + encodedPayload;
            signature = (0, hmac_sha256_1.default)(signature, _secret);
            signature = this._base64url(signature);
            // Build and return the token
            return encodedHeader + '.' + encodedPayload + '.' + signature;
        };
        this._base64url = (source) => {
            // Encode in classical base64
            let encodedSource = enc_base64_1.default.stringify(source);
            // Remove padding equal characters
            encodedSource = encodedSource.replace(/=+$/, '');
            // Replace characters according to base64url specifications
            encodedSource = encodedSource.replace(/\+/g, '-');
            encodedSource = encodedSource.replace(/\//g, '_');
            // Return the base64 encoded string
            return encodedSource;
        };
        this.captureObjectId = (_obect = {}) => {
            const _filter = {};
            /**
             * si en el caso fue un string
             */
            if (typeof _obect === 'string' && _obect.match(/^[0-9a-fA-F]{24}$/)) {
                return new mongodb_1.BSON.ObjectId(_obect);
            }
            else if (Array.isArray(_obect) &&
                !(_obect instanceof mongodb_1.BSON.ObjectId)) {
                const _list = [];
                for (const value of _obect) {
                    const result = this.captureObjectId(value);
                    _list.push(result);
                }
                return _list;
            }
            /**
             * si es un objeto
             */
            let isVal = false;
            for (var property in _obect) {
                /**
                 * Capturamos valores necesarios
                 */
                if (typeof _obect[property] !== 'boolean' &&
                    _obect[property] &&
                    !(_obect[property] instanceof mongodb_1.BSON.ObjectId) &&
                    typeof _obect[property] === 'object' &&
                    this.existId(_obect[property]).length > 0) {
                    const respo = this.captureObjectId(_obect[property]);
                    if (!!respo) {
                        isVal = true;
                        _filter[property] = respo;
                    }
                }
                else if (_obect[property] &&
                    typeof _obect[property] === 'string' &&
                    _obect[property].match(/^[0-9a-fA-F]{24}$/)) {
                    isVal = true;
                    _filter[property] = new mongodb_1.BSON.ObjectId(_obect[property]);
                }
                else if (_obect[property] ||
                    typeof _obect[property] === 'boolean' ||
                    _obect[property] === 0 ||
                    _obect[property] instanceof mongodb_1.BSON.ObjectId) {
                    isVal = true;
                    _filter[property] = _obect[property];
                }
            }
            if (isVal) {
                return _filter;
            }
            else {
                return null;
            }
        };
        this.existId = (_obect) => {
            const list = [];
            for (const property in _obect) {
                if (_obect[property] &&
                    typeof _obect[property] === 'string' &&
                    _obect[property].match(/^[0-9a-fA-F]{24}$/)) {
                    list.push(_obect[property]);
                    return list;
                }
                else if (!(_obect[property] instanceof mongodb_1.BSON.ObjectId) &&
                    typeof _obect[property] === 'object') {
                    const respo = this.existId(_obect[property]);
                    list.push(...respo);
                }
            }
            return list;
        };
    }
    static get instance() {
        return this.intance || (this.intance = new this());
    }
    convertBSON(_obect = {}) {
        const _filter = {};
        /**
         * si en el caso fue un string
         */
        if (typeof _obect === 'string' && _obect.match(/^[0-9a-fA-F]{24}$/)) {
            return new mongodb_1.BSON.ObjectId(_obect);
        }
        else if (Array.isArray(_obect) &&
            !(_obect instanceof mongodb_1.BSON.ObjectId)) {
            const _list = [];
            for (const value of _obect) {
                const result = this.convertBSON(value);
                _list.push(result);
            }
            return _list;
        }
        /**
         * si es un objeto
         */
        let isVal = false;
        for (var property in _obect) {
            /**
             * Capturamos valores necesarios
             */
            if (_obect[property] &&
                !(_obect[property] instanceof mongodb_1.BSON.ObjectId) &&
                typeof _obect[property] === 'object' &&
                this.existIds(_obect[property]).length > 0) {
                const respo = this.convertBSON(_obect[property]);
                if (!!respo) {
                    isVal = true;
                    _filter[property] = respo;
                }
            }
            else if (_obect[property] &&
                typeof _obect[property] === 'string' &&
                property === 'id' &&
                _obect[property].match(/^[0-9a-fA-F]{24}$/)) {
                isVal = true;
                _filter['_id'] = new mongodb_1.BSON.ObjectId(_obect[property]);
            }
            else if (_obect[property] &&
                typeof _obect[property] === 'string' &&
                _obect[property].match(/^[0-9a-fA-F]{24}$/)) {
                isVal = true;
                _filter[property] = new mongodb_1.BSON.ObjectId(_obect[property]);
            }
            else if (_obect.hasOwnProperty(property)) {
                isVal = true;
                _filter[property] = _obect[property];
            }
        }
        if (isVal) {
            return _filter;
        }
        else {
            return null;
        }
    }
    captureOptions(options) {
        let _object = {};
        if (!options)
            return _object;
        if (options.limit) {
            _object['limit'] = this.objectToStringParser.parse(options.limit);
        }
        if (options.sort) {
            _object['sort'] = this.objectToStringParser.parse(options.sort);
        }
        if (options.projection) {
            _object['projection'] = this.objectToStringParser.parse(options.projection);
        }
        const _option = options;
        if (_option.project) {
            _object['projection'] = this.objectToStringParser.parse(_option.project);
        }
        return _object;
    }
    isTokenExpired(token, offsetSeconds) {
        // Return if there is no token
        if (!token || token === '') {
            return true;
        }
        // Get the expiration date
        const date = _dbUtils._getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return true;
        }
        // Check if the token is expired
        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    }
    /**
     *
     * @param token
     * @returns
     */
    _decodeTokenUser(token) {
        const decodedToken = _dbUtils._decodeToken(token);
        // Return if the decodedToken doesn't have an 'exp' field
        if (!decodedToken.hasOwnProperty('user_data')) {
            return null;
        }
        return decodedToken.user_data;
    }
    static _getTokenExpirationDate(token) {
        // Get the decoded token
        const decodedToken = this._decodeToken(token);
        // Return if the decodedToken doesn't have an 'exp' field
        if (!decodedToken.hasOwnProperty('exp')) {
            return null;
        }
        // Convert the expiration date
        const date = new Date(0);
        date.setUTCSeconds(decodedToken.exp);
        return date;
    }
    static _decodeToken(token) {
        // Return if there is no token
        if (!token) {
            return null;
        }
        // Split the token
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error("The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.");
        }
        // Decode the token using the Base64 decoder
        const decoded = this._urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token.');
        }
        return JSON.parse(decoded);
    }
    static _urlBase64Decode(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: {
                break;
            }
            case 2: {
                output += '==';
                break;
            }
            case 3: {
                output += '=';
                break;
            }
            default: {
                throw Error('Illegal base64url string!');
            }
        }
        return this._b64DecodeUnicode(output);
    }
    static _b64DecodeUnicode(str) {
        return decodeURIComponent(Array.prototype.map
            .call(this._b64decode(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
    }
    static _b64decode(str) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        str = String(str).replace(/=+$/, '');
        if (str.length % 4 === 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        /* eslint-disable */
        for (
        // initialize result and counters
        let bc = 0, bs, buffer, idx = 0; 
        // get next character
        (buffer = str.charAt(idx++)); 
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer &&
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        /* eslint-enable */
        return output;
    }
}
const dbUtils = _dbUtils.instance;
exports.default = dbUtils;
