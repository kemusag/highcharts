/* *
 *
 *  Data module
 *
 *  (c) 2012-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type DataTable from './DataTable';
import DataConverter from './DataConverter.js';
import DataJSON from './DataJSON.js';
import U from '../Core/Utilities.js';
const {
    addEvent,
    fireEvent,
    merge,
    uniqueKey
} = U;

/** eslint-disable valid-jsdoc */

class DataRow implements DataJSON.Class {

    /* *
     *
     *  Static Properties
     *
     * */

    public static _DATA_CLASS_NAME_ = 'DataRow';

    /* *
     *
     *  Static Functions
     *
     * */

    public static fromJSON(json: DataRow.JSON): DataRow {
        const dataTableClass = DataJSON.getClass('DataTable') as typeof DataTable,
            keys = Object.keys(json),
            columns: DataRow.Columns = {};

        let key: (string|undefined),
            value;

        while (typeof (key = keys.pop()) !== 'undefined') {

            if (key[0] === '_') {
                continue;
            }

            value = json[key];

            if (
                typeof value === 'object' &&
                value !== null
            ) {
                if (value instanceof Array) {
                    columns[key] = dataTableClass.fromJSON({
                        _DATA_CLASS_NAME_: 'DataTable',
                        rows: value
                    });
                } else {
                    columns[key] = dataTableClass.fromJSON(value);
                }
            } else {
                columns[key] = value;
            }
        }

        return new DataRow(columns);
    }

    /* *
     *
     *  Constructors
     *
     * */

    constructor(
        columns: DataRow.Columns = {},
        converter: DataConverter = new DataConverter()
    ) {
        this.columns = columns = merge(columns);
        this.converter = converter;

        if (typeof columns.id === 'string') {
            this.id = columns.id;
        } else {
            this.id = uniqueKey();
        }

        delete columns.id;
    }

    /* *
     *
     *  Properties
     *
     * */

    private columns: DataRow.Columns;

    private converter: DataConverter;

    public readonly id: string;

    /* *
     *
     *  Functions
     *
     * */

    public clear(): boolean {
        const row = this;

        let succeeded = false;

        fireEvent(
            row,
            'clearRow',
            {},
            function (): void {
                row.columns.length = 0;
                succeeded = true;
                fireEvent(row, 'afterClearRow', {});
            }
        );

        return succeeded;
    }

    public deleteColumn(columnKey: string): boolean {
        const row = this;
        const columnValue = row.columns[columnKey];

        let succeeded = false;

        if (columnKey === 'id') {
            return succeeded;
        }

        fireEvent(
            row,
            'deleteColumn',
            { columnKey, columnValue },
            function (e: DataRow.ColumnEventObject): void {
                delete row.columns[e.columnKey];
                succeeded = true;
                fireEvent(row, 'afterDeleteColumn', { columnKey, columnValue });
            }
        );

        return succeeded;
    }

    public getAllColumns(): DataRow.Columns {
        return merge(this.columns);
    }

    public getColumn(columnKey: string): DataRow.ColumnTypes {
        return this.columns[columnKey];
    }

    public getColumnAsBoolean(columnKey: string): boolean {
        return this.converter.asBoolean(this.getColumn(columnKey));
    }

    public getColumnAsDataTable(columnKey: string): DataTable {
        return this.converter.asDataTable(this.getColumn(columnKey));
    }

    public getColumnAsDate(columnKey: string): Date {
        return this.converter.asDate(this.getColumn(columnKey));
    }

    public getColumnAsNumber(columnKey: string): number {
        return this.converter.asNumber(this.getColumn(columnKey));
    }

    public getColumnAsString(columnKey: string): string {
        return this.converter.asString(this.getColumn(columnKey));
    }

    public getColumnCount(): number {
        return this.getColumnKeys().length;
    }

    public getColumnKeys(): Array<string> {
        return Object.keys(this.columns);
    }

    public insertColumn(
        columnKey: string,
        columnValue: DataRow.ColumnTypes
    ): boolean {
        const row = this;

        let succeeded = false;

        if (
            columnKey === 'id' ||
            row.getColumnKeys().indexOf(columnKey) !== -1
        ) {
            return succeeded;
        }

        fireEvent(
            row,
            'insertColumn',
            { columnKey, columnValue },
            function (): void {
                row.columns[columnKey] = columnValue;
                succeeded = true;
                fireEvent(row, 'afterInsertColumn', { columnKey, columnValue });
            }
        );

        return succeeded;
    }

    public on(
        event: (DataRow.ColumnEvents|DataRow.RowEvents),
        callback: (DataRow.ColumnEventListener|DataRow.RowEventListener)
    ): Function {
        return addEvent(this, event, callback);
    }

    public toJSON(): DataRow.JSON {
        const columns = this.getAllColumns(),
            columnKeys = Object.keys(columns),
            json: DataRow.JSON = {
                _DATA_CLASS_NAME_: 'DataRow',
                id: this.id
            };

        let key: string,
            value: DataRow.ColumnTypes;

        for (let i = 0, iEnd = columnKeys.length; i < iEnd; ++i) {
            key = columnKeys[i];
            value = columns[key];

            /* eslint-disable @typescript-eslint/indent */
            switch (typeof value) {
                default:
                    if (value === null) {
                        json[key] = value;
                    } else if (value instanceof Date) {
                        json[key] = value.getTime();
                    } else { // DataTable
                        json[key] = value.toJSON();
                    }
                    continue;
                case 'undefined':
                    continue;
                case 'boolean':
                case 'number':
                case 'string':
                    json[key] = value;
                    continue;
            }
        }

        return json;
    }

    public updateColumn(
        columnKey: string,
        columnValue: DataRow.ColumnTypes
    ): boolean {
        const row = this;

        let succeeded = false;

        if (columnKey === 'id') {
            return succeeded;
        }

        fireEvent(
            row,
            'updateColumn',
            { columnKey, columnValue },
            function (): void {
                row.columns[columnKey] = columnValue;
                succeeded = true;
                fireEvent(row, 'afterUpdateColumn', { columnKey, columnValue });
            }
        );

        return succeeded;
    }

}

namespace DataRow {

    export type ColumnEvents = (
        'deleteColumn'|'afterDeleteColumn'|
        'insertColumn'|'afterInsertColumn'|
        'updateColumn'|'afterUpdateColumn'
    );

    export type Columns = Record<string, ColumnTypes>;

    export type ColumnTypes = (boolean|null|number|string|Date|DataTable|undefined);

    export type RowEvents = (
        'clearRow'|'afterClearRow'
    );

    export interface ColumnEventListener {
        (this: DataRow, e: ColumnEventObject): void;
    }

    export interface ColumnEventObject {
        readonly columnKey: string;
        readonly columnValue: ColumnTypes;
        readonly type: ColumnEvents;
    }

    export interface JSON extends DataJSON.ClassJSON {
        id: string;
        [key: string]: (DataJSON.Primitives|DataTable.JSON|Array<DataRow.JSON>);
    }

    export interface RowEventListener {
        (this: DataRow, e: RowEventObject): void;
    }

    export interface RowEventObject {
        readonly type: RowEvents;
    }

}

DataJSON.addClass(DataRow);

export default DataRow;
