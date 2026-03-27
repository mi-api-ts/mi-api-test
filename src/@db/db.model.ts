/* eslint-disable no-unused-vars */
import EventEmitter from 'events';
import { AggregateOptions, Binary, FindOptions } from 'mongodb';

import moment from 'moment';

import dbUtils from './db.utils';
import { DbMongo } from './db.mongo';
import { Injectable } from '@om/inyects/injector';
import { ApiDb, IoAuthorize } from './db.interfaces';

@Injectable({ providedIn: "root" })
export class ApiEvent extends EventEmitter {


  constructor() {
    super();

    super.setMaxListeners(0);
  }



  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  // Method for emitting an event using .emit
  send(event, data) {
    this.emit(event, data);
  }

  method(event: string, listener: (...args: any[]) => void): this;
  method(event: any, listener: any) {
    /**
     * filtramos los eventos
     */
    this.on('method', (result) => {
      const { colection, ...body } = result;
      if (event === colection) {
        listener(body);
      } else {
      }
    });

    return this;
  }

  pre(event: string, listener: (...args: any[]) => void): this;
  pre(event: any, listener: any) {
    /**
     * filtramos los eventos
     */
    this.on('pre', (result) => {
      const { colection, ...body } = result;

      if (event === colection) {
        listener(body);
      } else {
      }
    });

    return this;
  }
}


@Injectable({ providedIn: "root", dependencies: [DbMongo, ApiEvent] })
export class DbModel {
  mongoClient: DbMongo;
  collection: string;
  database: string = 'abogadoV1';



  /**
   * constructor
   */
  constructor(private _mong: DbMongo, private _apiEvent: ApiEvent) {
    this.mongoClient = _mong;
  }



  private _functionsDb: ApiDb<any> = {
    updateMany: this.updateMany,
    insertMany: this.insertMany,
    deleteMany: this.deleteMany,
    aggregate: this.aggregate,
    find: this.find,
    findOne: this.findOne,
    deleteOne: this.deleteOne,
    insertOne: this.insertOne,
    findOneAndUpdate: this.findOneAndUpdate,
  };

  //#region  MODELOS
  get Authorize(): ApiDb<IoAuthorize> {
    this.collection = 'authorizes';
    return this._functionsDb;
  }



  //#endregion

  private async findOne(query = {}, options?, _schema = []) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    query = dbUtils.captureObjectId(query);

    let response;

    if (options) {
      options = dbUtils.captureObjectId(options);
    }

    if (_schema && _schema.length > 0) {
      response = (await this.fullSchema(query, _schema, options))[0];
    } else {
      if (options && query) {
        response = await _collection.findOne(query, options);
      } else if (query && !options) {
        response = await _collection.findOne(query);
      } else {
        response = await _collection.findOne({});
      }
    }

    response = dbUtils.convertJSON(response);



    return response;
  }

  /**
   *
   * @param body
   * @returns
   */
  private async insertOne(body, options: FindOptions = {}, _schema = []) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);
    const eventModel = this._apiEvent;
    const updatedAt = moment().unix();
    const createdAt = moment().unix();

    const { id, ...resto } = body;

    body = dbUtils.captureObjectId(resto);

    body = Object.assign(body, { updatedAt, createdAt });

    let data = await _collection.insertOne(body);

    let response;

    if (_schema && _schema.length > 0) {
      response = (
        await this.fullSchema({ _id: data.insertedId }, _schema)
      )[0];
      eventModel.send('method', {
        event: 'create',
        body: body,
        response,
        colection: this.collection,
      });
    } else if (Object.keys(options).length > 0) {
      response = await this.findOne(
        { _id: data.insertedId },
        options,
        _schema
      );

      eventModel.send('method', {
        event: 'create',
        body: body,
        response,
        colection: this.collection,
      });
    } else {
      response = await this.findOne(
        { _id: data.insertedId },
        null,
        _schema
      );
      eventModel.send('method', {
        event: 'create',
        body: body,
        response,
        colection: this.collection,
      });
    }

    response = dbUtils.convertJSON(response);



    return response;
  }

  private async deleteOne(query: any) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);
    const eventModel = this._apiEvent

    query = dbUtils.captureObjectId(query);

    let response = await _collection.findOneAndDelete(query);

    eventModel.send('method', {
      event: 'remove',
      body: query,
      response: response.value,
      colection: this.collection,
    });

    return !!response;
  }

  private async deleteMany(query: any) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    query = dbUtils.captureObjectId(query);
    let data = await _collection.deleteMany(query);



    return !!data;
  }

  private async updateMany(query: any, body) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    query = dbUtils.captureObjectId(query);

    body = dbUtils.captureObjectId(body);
    const updatedAt = moment().unix();

    const data = await _collection.updateMany(query, {
      $set: {
        ...body,
        updatedAt,
      },
    });



    return data;
  }

  private async insertMany(query: any[]) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    query = dbUtils.captureObjectId(query);
    const updatedAt = moment().unix();
    const createdAt = moment().unix();

    query = query.map((x) => ({ ...x, createdAt, updatedAt }));

    const data = await _collection.insertMany(query);



    return data;
  }

  private async find(filter: any = {}, options?: any, _schema = []) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    filter = dbUtils.captureObjectId(filter);

    let response;

    if (options) {
      options = dbUtils.captureObjectId(options);
    }

    if (_schema.length > 0) {
      response = await this.fullSchema(filter, _schema, options);
    } else {
      let cursor;

      if (options && filter) {
        cursor = await _collection.find(filter, options);
      } else if (filter && !options) {
        cursor = await _collection.find(filter);
      } else {
        cursor = await _collection.find({});
      }

      let list = [];

      await cursor.forEach((doc) => {
        list.push(doc);
      });

      response = list;
    }

    response = dbUtils.convertJSON(response);



    return response;
  }

  /**
   *
   * @param pipeline
   * @param options
   * @returns
   */
  private async aggregate(pipeline?: any[], options?: AggregateOptions) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);

    pipeline = dbUtils.captureObjectId(pipeline);

    const result = await _collection.aggregate(pipeline);

    let list = [];

    await result.forEach((doc) => {
      list.push(doc);
    });


    list = dbUtils.convertJSON(list);



    return list;
  }


  private async fullSchema(_filter: any = {}, _schema = [], _options?: any) {
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
      } else if (value === 'tags') {
        const data = {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          },
        };

        modelos.push(data);
      } else if (value === 'taskGroup') {
        const data = {
          $lookup: {
            from: 'tasks',
            localField: 'group',
            foreignField: '_id',
            as: 'group',
          },
        };

        modelos.push(data);

        const wind = {
          $unwind: {
            path: '$group',
            preserveNullAndEmptyArrays: true,
          },
        };

        unwind.push(wind);
      } else if (value === 'role') {
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
      } else if (value === 'norma') {
        const data = {
          $lookup: {
            from: 'normas',
            localField: 'normaId',
            foreignField: '_id',
            as: 'norma',
          },
        };

        modelos.push(data);

        const wind = {
          $unwind: {
            path: '$norma',
            preserveNullAndEmptyArrays: true,
          },
        };

        unwind.push(wind);
      } else if (value === 'articulos') {
        const data = {
          $lookup: {
            from: 'articulos',
            localField: '_id',
            foreignField: 'normaId',
            as: 'articulos',
          },
        };

        modelos.push(data);
      } else if (value === 'authorizes') {
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
      } else if (value === 'group') {
        const data = {
          $lookup: {
            from: 'services',
            localField: 'serviceIds',
            foreignField: '_id',
            as: 'group',
          },
        };

        modelos.push(data);
      } else if (value === 'subrsts') {
        const data = {
          $lookup: {
            from: 'subrsts',
            localField: '_id',
            foreignField: 'serviceId',
            as: 'subrsts',
          },
        };

        modelos.push(data);
      } else if (value === 'phone') {
        const data = {
          $lookup: {
            from: 'phones',
            localField: '_id',
            foreignField: 'moduleId',
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
      } else if (value === 'company') {
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
      } else if (value === 'movservs') {
        const data = {
          $lookup: {
            from: 'movservs',
            localField: 'movordId',
            foreignField: '_id',
            as: 'movservs',
          },
        };

        modelos.push(data);
      } else if (value === 'labels') {
        const data = {
          $lookup: {
            from: 'labels',
            localField: 'labelIds',
            foreignField: '_id',
            as: 'labels',
          },
        };

        modelos.push(data);
      }
    }

    const response = await this.aggregate([
      filterModel,
      ...modelos,
      ...unwind,
      ...options,
    ]);

    //const values = await UtilsMongo.convertJSON(response)

    return response;
  }

  private async findOneAndUpdate(query, _body, options?, _schema = []) {
    const client = await this.mongoClient.connect;

    let _collection = client
      .db(this.database)
      .collection(this.collection);
    const eventModel = this._apiEvent;
    const updatedAt = moment().unix();

    query = dbUtils.captureObjectId(query);
    _body = dbUtils.captureObjectId(_body);
    _body = Object.assign(_body, { ..._body, updatedAt });

    let _data = await _collection.findOneAndReplace(query, _body);

    if (_data.lastErrorObject) {
      _data = _data.value as any;
    }

    let response;
    if (_schema.length > 0) {
      response = (await this.fullSchema(query, _schema))[0];
    } else if (options) {
      response = await _collection.findOne(query, options);
    } else {
      response = await _collection.findOne(query);
    }

    response = dbUtils.convertJSON(response);



    return response;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle functions
  // -----------------------------------------------------------------------------------------------------




  captureChange(value) {
    const _list = [];

    for (const protype in value) {
      _list.push(protype);
    }

    return _list;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle Events
  // -----------------------------------------------------------------------------------------------------



  // -----------------------------------------------------------------------------------------------------
  // @ Private Function
  // -----------------------------------------------------------------------------------------------------
}
