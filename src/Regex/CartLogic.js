/**
 * The function checks if an item should be added to the cart or if it already exists in the cart and
 * updates its quantity.
 * @param cartData - an array of objects representing the current items in the cart
 * @param payload - The data of the product/item being added to the cart.
 * @param callback - The callback parameter is a function that is passed as an argument to the
 * cartLogic function. It is used to return the result of the cart data comparison logic to the calling
 * function. The callback function takes an object with two properties: shouldPush and sameIndex.
 */
export const cartLogic = (cartData, payload, callback) => {
  if (cartData.length > 0) {
    // if cart is not empty

    let shouldPush = true;
    let sameIndex = -1;

    cartData.forEach((element, index) => {
      if (element.itemName == payload.itemName) {
        // if product name is same
        let elementKeys = Object.keys(element);
        let payloadKeys = Object.keys(payload);

        if (elementKeys.length == payloadKeys.length) {
          // if length of keys in element and payload is same
          let areKeysSame = elementKeys.every(
            (key, index) => key == payloadKeys[index],
          );

          if (areKeysSame) {
            // if all keys are same in both element and payload
            let shouldNotPush = false;
            for (const key in element) {
              // check if all values are same
              if (Array.isArray(element[key])) {
                if (element[key].length == payload[key].length) {
                  shouldNotPush = element[key].every(
                    (el, ind) =>
                      el.id == payload[key][ind].id &&
                      el.quantity == payload[key][ind].quantity,
                  );

                  if (!shouldNotPush) return;
                } else {
                  shouldNotPush = true;
                  return;
                }
              } else {
                if (
                  JSON.stringify(element[key]) == JSON.stringify(payload[key])
                ) {
                  shouldNotPush = true;
                } else {
                  if (
                    key == 'itemQuantity' ||
                    key == 'itemPrice' ||
                    key == 'itemTax'
                  ) {
                    shouldNotPush = true;
                  } else {
                    shouldNotPush = false;
                    return;
                  }
                }
              }
            }

            shouldPush = !shouldNotPush;
            if (shouldNotPush) {
              sameIndex = index;
              return;
            }
          }
        }
      }
    }); // end of cart data loop

    callback({shouldPush, sameIndex});
  } else {
    // if cart is empty
    callback({shouldPush: true, sameIndex: -1});
  }
};

/**
 * This function checks if an item with a specific name and special exists in a cart and returns a
 * boolean value through a callback function.
 * @param cartData - an array of objects representing the current items in the shopping cart
 * @param payload - The payload parameter is an object that contains information about an item that is
 * being added to a shopping cart. It likely includes properties such as itemName and itemSpecial,
 * which are used to identify the item and determine if it already exists in the cart.
 * @param callback - The callback parameter is a function that will be called with the result of the
 * cartLogicWithNoDescription function. It is used to handle the result of the function in the calling
 * code.
 */
export const cartLogicWithNoDescription = (cartData, payload, callback) => {
  let ifExists = cartData.some(
    element =>
      element.itemName == payload.itemName &&
      element.itemSpecial == payload.itemSpecial,
  );

  callback(ifExists);
};
