import {GetLocationTables} from '../Server/Methods/Listing';

export const getTablesList = (location, table, callback) => {
  try {
    GetLocationTables(location)
      .then(res => {
        const {status, data} = res;
        if (status == 200 || status == 201) {
          let isRunning = data.Tables.find(
            el => el.table_id == table,
          )?.is_table_available;
          callback(!isRunning);
        }
      })
      .catch(error => {
        console.log('GetLocationTablesErrorInsideTry: ', error);
      });
  } catch (error) {
    console.log('GetLocationTablesError: ', error);
  }
};
