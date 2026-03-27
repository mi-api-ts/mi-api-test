import { Injectable } from '@om/inyects/injector';

import { DbMongo } from './db.mongo';
import dbUtils from './db.utils';


@Injectable({ providedIn: "root" , dependencies:[DbMongo]})
export class DbCore {
  private static customFunctions: Map<string, Function> = new Map();

  /**
   * constructor
   */
  constructor( private mongoClient: DbMongo) {



  }



  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------


  /**
   * Registra una función personalizada que puede ser llamada desde el cliente.
   */
  static registerFunction(name: string, handler: (args: any, userId: string) => Promise<any>) {
    this.customFunctions.set(name, handler);
  }

  async db(_name: string, _arguments = []) {
    let _object: any = {};

    for (const value of _arguments) {
      for (const key in value) {
        _object[key] = value[key];
      }
    }

    let operationType = '';


    let response;

    if (_name === 'aggregate') {
      operationType = 'aggregate';


      let pipeline = dbUtils.objectToStringParser.parse(_object.pipeline);

      pipeline = dbUtils.captureObjectId(pipeline);

      const result = await this.mongoClient.aggregate(_object.database,_object.collection,pipeline);

      let list = [];

      await result.forEach((doc) => {
        list.push(doc);
      });

      response = list;
    } else if (_name === 'updateMany') {
      operationType = 'update';

      let query = dbUtils.objectToStringParser.parse(_object.query.data);
      let update = dbUtils.objectToStringParser.parse(
        _object.update.data
      );

      update = dbUtils.captureObjectId(update);
      query = dbUtils.captureObjectId(query);

      response = await this.mongoClient.updateMany(_object.database,_object.collection,query, update);
    } else if (_name === 'findOneAndUpdate') {
      operationType = 'update';

      let filter = dbUtils.objectToStringParser.parse(
        _object.filter.data
      );
      let update = dbUtils.objectToStringParser.parse(
        _object.update.data
      );


      const options = dbUtils.captureOptions(_object);


      update = dbUtils.captureObjectId(update);
      filter = dbUtils.captureObjectId(filter);

     response=  await this.mongoClient.findOneAndUpdate(_object.database,_object.collection,filter, update,options);

      //response = await this.mongoClient.findOne(_object.database,_object.collection, filter, options);
    } else if (_name === 'insertMany') {
      operationType = 'insert';



      let documents = dbUtils.objectToStringParser.parse(
        _object.documents
      );


      documents = dbUtils.captureObjectId(documents);

      const result = await this.mongoClient.insertOne(_object.database,_object.collection,documents);

      return result;
    } else if (_name === 'insertOne') {
      operationType = 'insert';

      let _document = dbUtils.objectToStringParser.parse(
        _object.document.data
      );

      const documentBody = dbUtils.captureObjectId(_document);

      response = await this.mongoClient.insertOne(_object.database,_object.collection,documentBody);
    } else if (_name === 'deleteMany') {
      operationType = 'delete';

      let query = dbUtils.objectToStringParser.parse(_object.query.data);

      query = dbUtils.captureObjectId(query);

      await this.mongoClient.deleteMany(_object.database,_object.collection,query);

      response = query;
    } else if (_name === 'find') {
      operationType = 'find';
      let query = dbUtils.objectToStringParser.parse(_object.query.data);

      const options = dbUtils.captureOptions(_object);

      query = dbUtils.captureObjectId(query);


      const cursor = await this.mongoClient.find(_object.database,_object.collection,query ?? {}, options);

      let list = [];

      await cursor.forEach((doc) => {
        list.push(doc);
      });

      response = list;

    } else if (_name === 'findOne') {
      operationType = 'find';
      let query = dbUtils.objectToStringParser.parse(_object.query.data);
      let options = dbUtils.captureOptions(_object);

      query = dbUtils.captureObjectId(query);

      let _data = await this.mongoClient.findOne(_object.database,_object.collection,query, options);

      if (_data && _data.lastErrorObject) {
        response = _data.value as any;
      } else {
        response = _data;
      }

      if (response && _object.collection === 'files' && response?.data) {
        response.data = response.data.toString();
      }
    } else if (_name === 'deleteOne') {
      operationType = 'delete';
      let query = dbUtils.objectToStringParser.parse(_object.query.data);
      const options = dbUtils.captureOptions(_object);

      query = dbUtils.captureObjectId(query);

      await  this.mongoClient.deleteOne(_object.database,_object.collection, query);

      response = query;
    }



    response = dbUtils.convertJSON(response);



    // await _CallModel.mongoClient.close();

    return response;
  }

  async prepararDatos(_arguments = []) {

    console.log(arguments)

  }




}

