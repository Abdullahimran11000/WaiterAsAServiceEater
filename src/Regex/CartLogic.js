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
                    (el, ind) => el.id == payload[key][ind].id,
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

export const cartLogicWithNoDescription = (cartData, payload, callback) => {
  let ifExists = cartData.some(
    element =>
      element.itemName == payload.itemName &&
      element.itemSpecial == payload.itemSpecial,
  );

  callback(ifExists);
};
