import {GetLocationTables} from '../Server/Methods/Listing';

/**
 * The function `getTablesList` checks if a specific table is available at a given location and returns
 * the result through a callback function.
 * @param location - The location parameter is likely a variable or value that represents a specific
 * location, such as a restaurant or cafe. It is used as an input to the GetLocationTables function to
 * retrieve a list of tables associated with that location.
 * @param table - The `table` parameter is a variable that contains the ID of the table being checked
 * for availability.
 * @param callback - The callback parameter is a function that will be called with the result of the
 * operation once it is completed. In this case, it will be called with a boolean value indicating
 * whether the specified table is available or not.
 */
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
