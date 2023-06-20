import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import {WINDOW_WIDTH} from '../Utils/Size';
import {cartLogic, cartLogicWithNoDescription} from '../Regex/CartLogic';

import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Colors from '../Assets/Colors';
import Swiper from 'react-native-swiper';
import NewProductCard from '../Components/NewProductCard';
import {useFocusEffect} from '@react-navigation/native';

const ProductDetails = ({baseURL, setViewFlag, mainCategories}) => {
  const dispatch = useDispatch();

  const {cartData, count} = useSelector(store => store.cartReducer);
  const {product} = useSelector(store => store.productReducer);
  const {user} = useSelector(store => store.sessionReducer);

  const {layout_setting} = user;

  const bgStyle = {
    backgroundColor: layout_setting?.basecolor,
  };

  const {decimal_places} = user.assignedLocations[0].Location;

  const {
    menu_id,
    menu_name,
    menu_price,
    menu_photo,
    menu_description,
    MenuOptions,
    MenuAllergyItems,
    menu_tax,
    menu_type,
    MenuMedia,
    MenuItemRecommendations,
  } = product;

  const [quantity, setQuantity] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [hasRequired, setHasRequired] = useState('');
  const [instructions, setInstructions] = useState('');
  const [displayPrice, setDisplayPrice] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [basePriceValue, setBasePriceValue] = useState(menu_price);
  const [recItems, setRecItems] = useState([]);

  /* The above code is using the `useEffect` hook in React to iterate over an array of `MenuOptions`
  and check if certain conditions are met for each element. If an element has a `base_price` value
  of 1, it sets the `basePriceValue` state to 0. If an element has a `required` value of 1, it sets
  the `hasRequired` state to the `option_name` of that element. This code is executed once when the
  component mounts, as indicated by the empty dependency array `[]` passed as the second argument to
  `use */
  useEffect(() => {
    MenuOptions.forEach(el => {
      if (el.base_price == 1) setBasePriceValue(0);
      if (el.required == 1) setHasRequired(el.Option.option_name);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let oldrec = [];
      for (var i = 0; i < MenuItemRecommendations.length; i++) {
        for (var a = 0; a < mainCategories.length; a++) {
          if (
            MenuItemRecommendations[i].Menu.menu_category_id ==
            mainCategories[a].category_id
          ) {
            for (var b = 0; b < mainCategories[a].Menus.length; b++) {
              if (
                MenuItemRecommendations[i].recommendation_item_id ==
                mainCategories[a].Menus[b].menu_id
              ) {
                oldrec.push(mainCategories[a].Menus[b]);
                setRecItems(oldrec);
                break;
              }
            }
          }
        }
      }
      if (oldrec.length === 0) {
        setRecItems([]);
      }
    }, [product]),
  );

  /* The above code is using the useEffect hook in React to add a new price object to an array of
  prices stored in the state variable displayPrice. The new price object includes the calculated
  price of a menu item with tax added, and has optionId and optionValueId set to -1. The useEffect
  hook is triggered when the component mounts, indicated by the empty dependency array passed as the
  second argument. */
  useEffect(() => {
    let prices = [...displayPrice];
    prices.push({
      optionId: -1,
      optionValueId: -1,
      price: calculateTaxPercentOfPrice(menu_price, menu_tax) + menu_price,
    });

    setDisplayPrice(prices);
  }, []);

  /* The above code is using the useEffect hook in React to set the initial state of a selected options
  object. It is iterating through an array of menu options and for each option, it is finding the
  default value and setting it in the selected options object. If the display type of the option is
  'radio' or 'select', it sets the value, id, menuOptionId, optionId, displayType, optionValueId,
  optionPrice, and menuOptionType properties in the selected options object. If the display type is
  not 'radio' or 'select', it sets an empty array for the */
  useEffect(() => {
    let option = {};

    MenuOptions.forEach(element => {
      let defaultValue = element.MenuOptionValues.find(
        el => el.menu_option_value_id == element.default_value_id,
      );

      if (element.Option.display_type == 'radio') {
        option = {
          ...option,
          [element.Option.option_name]: {
            value: defaultValue?.OptionValue.value || '',
            id: defaultValue?.menu_option_value_id || -1,
            menuOptionId: element.menu_option_id,
            optionId: element.Option.option_id,
            displayType: element.Option.display_type,
            optionValueId: defaultValue?.option_value_id || -1,
            optionPrice: defaultValue?.new_price,
            menuOptionType: element.option_menu_type,
          },
        };
      } else if (element.Option.display_type == 'select') {
        option = {
          ...option,
          [element.Option.option_name]: {
            value: defaultValue?.OptionValue.value || '',
            id: defaultValue?.menu_option_value_id || -1,
            menuOptionId: element.menu_option_id,
            optionId: element.Option.option_id,
            displayType: element.Option.display_type,
            optionValueId: defaultValue?.option_value_id || -1,
            optionPrice: defaultValue?.new_price || 0,
            menuOptionType: element.option_menu_type,
          },
        };
      } else {
        option = {
          ...option,
          [element.Option.option_name]: [],
        };
      }
    });

    setSelectedOptions(option);
  }, []);

  /* The above code is using the `useEffect` hook in React to calculate the total price of a list of
  items (`displayPrice`) based on their individual prices and the quantity of items (`quantity`).
  The `price` variable is initialized to 0 and then incremented by each element's price using a
  `forEach` loop. The final price is then multiplied by the quantity and set as the new price using
  the `setNewPrice` function. This effect will re-run whenever `displayPrice` or `quantity` changes. */
  useEffect(() => {
    let price = 0;
    displayPrice.forEach(element => {
      price += element.price;
    });

    setNewPrice(price * quantity);
  }, [displayPrice, quantity]);

  /**
   * The function handleClosePress navigates back to the previous screen.
   */
  const handleClosePress = () => {
    setViewFlag(false);
    // navigation.goBack();
  };

  /**
   * The function handles changes in price based on menu options and taxes.
   * @param value - an object containing information about the menu option and its value, including the
   * new price
   * @param basePrice - The base price of an item.
   * @param itemTax - The tax percentage to be applied to the item price.
   * @param [isCheckbox=false] - is a boolean parameter that is optional and defaults to false. It is
   * used to determine whether the price change is for a checkbox option or not.
   */
  const handlePriceChange = (value, basePrice, itemTax, isCheckbox = false) => {
    if (basePrice == 1) {
      let prices = [...displayPrice];

      prices[0] = {
        optionId: value.menu_option_id,
        optionValueId: value.menu_option_value_id,
        price:
          calculateTaxPercentOfPrice(value.new_price, itemTax) +
          value.new_price,
        percentage_tax: itemTax,
        calculated_tax: calculateTaxPercentOfPrice(value.new_price, itemTax),
      };

      setDisplayPrice(prices);
    } else {
      let prices = [...displayPrice];
      let index = prices.findIndex(el =>
        isCheckbox
          ? el.optionId == value.menu_option_id &&
            el.optionValueId == value.menu_option_value_id
          : el.optionId == value.menu_option_id,
      );

      if (index > -1) {
        let current = prices[index];
        if (current.optionValueId == value.menu_option_value_id) {
          // prices.splice(index, 1);
        } else {
          current.optionValueId = value.menu_option_value_id;
          current.price =
            calculateTaxPercentOfPrice(value.new_price, itemTax) +
            value.new_price;
          current.percentage_tax = itemTax;
          current.calculated_tax = calculateTaxPercentOfPrice(
            value.new_price,
            itemTax,
          );
          prices[index] = current;
        }
      } else {
        prices.push({
          optionId: value.menu_option_id,
          optionValueId: value.menu_option_value_id,
          price:
            calculateTaxPercentOfPrice(value.new_price, itemTax) +
            value.new_price,
          percentage_tax: itemTax,
          calculated_tax: calculateTaxPercentOfPrice(value.new_price, itemTax),
        });
      }

      setDisplayPrice(prices);
    }
  };

  /**
   * The function handles the selection of a radio button option and updates the selected options
   * object with the chosen option's details.
   * @param value - The selected radio button value and its corresponding information such as the
   * option value, ID, price, tax percentage, and calculated tax.
   * @param menu - The `menu` parameter is an object that contains information about a menu item,
   * including its base price, item tax, and an option object that contains the name of the option and
   * its possible values.
   */
  const handleRadioSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax);

    let options = {...selectedOptions};
    options[menu.Option.option_name] = {
      ...options[menu.Option.option_name],
      value: value.OptionValue.value,
      id: value.menu_option_value_id,
      optionValueId: value.option_value_id,
      optionPrice: value.new_price,
      percentage_tax: menu.item_tax,
      calculated_tax: calculateTaxPercentOfPrice(
        value.new_price,
        menu.item_tax,
      ),
    };

    await setSelectedOptions(options);
  };

  /**
   * This function handles the selection of a menu option and updates the selected options object
   * accordingly.
   * @param value - The selected option value from a dropdown menu.
   * @param menu - The `menu` parameter is an object that contains information about a menu item's
   * options and prices. It likely includes properties such as `base_price`, `item_tax`, `Option`, and
   * `menu_option_value_id`.
   */
  const handleSelectorSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax);

    let options = {...selectedOptions};
    let current = options[menu.Option.option_name];

    if (current.value == value.OptionValue.value)
      current = {
        ...current,
        value: '',
        id: '',
      };
    else
      current = {
        ...current,
        value: value.OptionValue.value,
        id: value.menu_option_value_id,
        optionValueId: value.option_value_id,
        optionPrice: value.new_price,
        percentage_tax: menu.item_tax,
        calculated_tax: calculateTaxPercentOfPrice(
          value.new_price,
          menu.item_tax,
        ),
      };

    options[menu.Option.option_name] = current;

    await setSelectedOptions(options);
  };

  /**
   * This function handles the selection of checkboxes and updates the selected options object
   * accordingly.
   * @param value - The value of the checkbox that was selected/deselected.
   * @param menu - The `menu` parameter is an object that contains information about a menu option. It
   * has the following properties:
   */
  const handleCheckboxSelection = async (value, menu) => {
    handlePriceChange(value, menu.base_price, menu.item_tax, true);

    let options = {...selectedOptions};
    let current = options[menu.Option.option_name];

    let ind = current.findIndex(el => el?.value == value.OptionValue.value);

    if (ind > -1) {
      let selections = [...current];

      selections.splice(ind, 1);
      current = selections;
    } else {
      let selections = [...current];
      selections.push({
        value: value.OptionValue.value,
        id: value.menu_option_value_id,
        menuOptionId: menu.menu_option_id,
        optionId: menu.Option.option_id,
        displayType: menu.Option.display_type,
        optionValueId: value.option_value_id,
        optionPrice: value.new_price,
        menuOptionType: menu.option_menu_type,
        percentage_tax: menu.item_tax,
        calculated_tax: calculateTaxPercentOfPrice(
          value.new_price,
          menu.item_tax,
        ),
        quantity: 1,
      });

      current = selections;
    }

    options[menu.Option.option_name] = current;
    await setSelectedOptions(options);
  };

  /**
   * This is a function that takes in a text parameter and sets it as the instructions.
   */
  const handleInstructionChange = text => setInstructions(text);

  /**
   * This function handles incrementing a quantity state by one.
   */
  const handleIncreament = () => setQuantity(prevState => prevState + 1);

  /**
   * The function handles decrementing a quantity state, ensuring it never goes below 1.
   */
  const handleDecreament = () =>
    setQuantity(prevState => (prevState > 1 ? prevState - 1 : 1));

  /**
   * This function adds an item to the cart in Redux and displays a success message.
   */
  const handleAddToRedux = item => {
    let n = count + quantity;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {item, n},
    });

    showMessage({
      message: 'Added to cart',
      type: 'success',
    });

    handleClosePress();
  };

  /**
   * The function updates the quantity and price of an item in a shopping cart and dispatches the
   * changes to the Redux store.
   * @param [sameIndex] - sameIndex is an optional parameter that represents the index of the item in
   * the cartData array that needs to be updated. If sameIndex is not provided, the function will
   * search for the item in the cartData array based on the menu_name and instructions parameters.
   */
  const handleChangeReduxQuantity = (sameIndex = -1) => {
    let n = count + quantity;
    if (sameIndex == -1) {
      sameIndex = cartData.findIndex(
        el => el.itemName == menu_name && el.itemSpecial == instructions,
      );
    }

    const newState = cartData.map((item, ind) => {
      const newItem = {...item};
      let price = newPrice || menu_price * quantity;

      if (ind == sameIndex) {
        newItem.itemQuantity = newItem.itemQuantity + quantity;
        newItem.itemPrice = newItem.itemPrice + price;
      }
      return newItem;
    });

    dispatch({
      type: 'CHANGE_QUANTITY',
      payload: {newState, n},
    });

    handleClosePress();
  };

  /**
   * The function handles adding an item to the cart with selected options and checks if the required
   * option is selected.
   */
  const handleAddToCart = () => {
    if (selectedOptions[hasRequired]?.id != -1) {
      let item = {
        itemId: menu_id,
        itemName: menu_name,
        itemOwnPrice: basePriceValue,
        itemPrice: newPrice || menu_price,
        itemDescription: menu_description,
        itemSpecial: instructions,
        itemQuantity: quantity,
        itemImage: menu_photo,
        itemTax: menu_tax,
        menu_type,
        ...selectedOptions,
      };

      if (Object.keys(selectedOptions).length == 0) {
        cartLogicWithNoDescription(cartData, item, ifExists => {
          if (!ifExists) {
            handleAddToRedux(item);
          } else {
            handleChangeReduxQuantity();
          }
        });
      } else {
        cartLogic(cartData, item, res => {
          if (res.shouldPush) {
            handleAddToRedux(item);
          } else {
            handleChangeReduxQuantity(res.sameIndex);
          }
        });
      }
    } else {
      showMessage({
        message: 'Please select the required option',
        type: 'warning',
      });
    }
  };

  /**
   * The function calculates the tax percentage of a given price.
   * @param price - The price of a product or service.
   * @param tax - The tax parameter is the percentage of tax to be applied on the price. For example,
   * if the tax is 10%, then tax parameter would be 10.
   * @returns The function `calculateTaxPercentOfPrice` returns the tax amount as a percentage of the
   * given price.
   */
  const calculateTaxPercentOfPrice = (price, tax) => {
    let taxPercentOfPrice = (price * tax) / 100;
    return taxPercentOfPrice;
  };

  /**
   * This function handles the increment of quantity for a selected option and updates the display
   * price accordingly.
   * @param key - The key is a string that represents the identifier of a specific option group in the
   * selectedOptions object.
   * @param value - The `value` parameter is an object that contains information about a menu option
   * and its selected value. It has properties such as `OptionValue`, `menu_option_id`, and
   * `menu_option_value_id`.
   */
  const handleOptionQuantityIncrement = (key, value) => {
    let selectedOptionsTemp = {...selectedOptions};
    let checkboxOptions = [...selectedOptionsTemp[key]];

    let prices = [...displayPrice];

    const index = checkboxOptions?.findIndex(
      el => el.value == value?.OptionValue?.value,
    );

    const priceIndex = displayPrice.findIndex(
      el =>
        el.optionId == value.menu_option_id &&
        el.optionValueId == value.menu_option_value_id,
    );

    let checkboxOptionValues = {...checkboxOptions[index]};
    let currentPrice = {...prices[priceIndex]};

    currentPrice.price =
      currentPrice.price / checkboxOptionValues.quantity + currentPrice.price;

    currentPrice.calculated_tax =
      currentPrice.calculated_tax / checkboxOptionValues.quantity +
      currentPrice.calculated_tax;

    checkboxOptionValues.quantity += 1;

    checkboxOptions[index] = checkboxOptionValues;
    selectedOptionsTemp[key] = checkboxOptions;
    prices[priceIndex] = currentPrice;

    setSelectedOptions(selectedOptionsTemp);
    setDisplayPrice(prices);
  };

  /**
   * This function handles the decrement of quantity for a selected option in a menu.
   * @param key - The key is a string that represents the identifier of the selected option. It is used
   * to access and update the corresponding option in the selectedOptions object.
   * @param value - The `value` parameter is an object that contains information about the option value
   * being decremented, including its `OptionValue` object, `menu_option_id`, and
   * `menu_option_value_id`.
   */
  const handleOptionQuantityDecrement = (key, value) => {
    let selectedOptionsTemp = {...selectedOptions};
    let checkboxOptions = [...selectedOptionsTemp[key]];

    let prices = [...displayPrice];

    let index = checkboxOptions?.findIndex(
      el => el.value == value?.OptionValue?.value,
    );

    const priceIndex = displayPrice.findIndex(
      el =>
        el.optionId == value.menu_option_id &&
        el.optionValueId == value.menu_option_value_id,
    );

    let checkboxOptionValues = {...checkboxOptions[index]};
    let currentPrice = {...prices[priceIndex]};

    currentPrice.price =
      currentPrice.price - currentPrice.price / checkboxOptionValues.quantity;

    currentPrice.calculated_tax =
      currentPrice.calculated_tax -
      currentPrice.calculated_tax / checkboxOptionValues.quantity;

    checkboxOptionValues.quantity -= 1;

    if (checkboxOptionValues.quantity == 0) {
      checkboxOptions.splice(index, 1);
      prices.splice(priceIndex, 1);

      selectedOptionsTemp[key] = checkboxOptions;

      setSelectedOptions(selectedOptionsTemp);
      setDisplayPrice(prices);
    } else {
      checkboxOptions[index] = checkboxOptionValues;
      selectedOptionsTemp[key] = checkboxOptions;
      prices[priceIndex] = currentPrice;

      setSelectedOptions(selectedOptionsTemp);
      setDisplayPrice(prices);
    }
  };

  /**
   * The function renders radio buttons with options and prices for a menu item.
   * @param value - an object representing a single option value for a menu item option
   * @param index - The index of the current element being rendered in the array.
   * @param menu - The `menu` parameter is an object that contains information about a menu item,
   * including its options and option values.
   * @returns A function that renders a list of radio buttons with their corresponding option values
   * and prices. The function also checks if an option value is selected and highlights it accordingly.
   */
  const renderRadioBtns = (value, index, menu) => {
    let isSelected =
      selectedOptions[menu.Option.option_name]?.value ==
      value?.OptionValue?.value;

    return (
      <TouchableOpacity
        key={index}
        style={styles.menuOptionContainer}
        onPress={() => handleRadioSelection(value, menu)}>
        <View style={styles.menuOptionNameContainer}>
          {isSelected ? (
            <Ionicons name="radio-button-on" size={18} color={Colors.primary} />
          ) : (
            <Ionicons name="radio-button-off" size={18} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </View>
        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * The function renders selector buttons with their names and prices based on the selected options
   * and menu.
   * @param value - an object representing a menu option value
   * @param index - The index of the current element being rendered in the array.
   * @param menu - The `menu` parameter is an object that contains information about a menu item,
   * including its options and option values.
   * @returns A JSX element is being returned, specifically a TouchableOpacity component with nested
   * View and Text components. The content of the View and Text components depend on the values of the
   * parameters passed to the function and the state of the selectedOptions object.
   */
  const renderSelectorBtns = (value, index, menu) => {
    let isSelected =
      selectedOptions[menu.Option.option_name]?.value ==
      value?.OptionValue?.value;
    return (
      <TouchableOpacity
        key={index}
        style={styles.menuOptionContainer}
        onPress={() => handleSelectorSelection(value, menu)}>
        <View style={styles.menuOptionNameContainer}>
          {isSelected ? (
            <Fontisto name="checkbox-active" size={15} color={Colors.primary} />
          ) : (
            <Fontisto name="checkbox-passive" size={15} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </View>
        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * This function renders a checkbox button with quantity and price options for a menu item.
   * @param value - an object representing a single option value for a menu item option
   * @param index - The index of the current element being rendered in the array.
   * @param menu - The `menu` parameter is an object that represents a menu item. It contains
   * information such as the name of the menu item, its price, and any options or variations available
   * for that item. The `renderCheckboxBtns` function is using the `menu` object to render a list of
   * checkbox
   * @returns A function component that renders a checkbox button with its name, price, and quantity.
   * The component also checks if the checkbox button is selected and displays the quantity and
   * increment/decrement buttons accordingly.
   */
  const renderCheckboxBtns = (value, index, menu) => {
    let isSelected = selectedOptions[menu.Option.option_name]?.some(
      el => el?.value == value?.OptionValue?.value,
    );

    let qty = 0;
    selectedOptions[menu.Option.option_name]?.forEach(el => {
      if (el?.value == value?.OptionValue?.value) qty = el.quantity;
    });

    return (
      <View key={index} style={styles.menuOptionContainer}>
        <TouchableOpacity
          style={[styles.menuOptionNameContainer, {width: '40%'}]}
          onPress={() => handleCheckboxSelection(value, menu)}>
          {isSelected ? (
            <Fontisto name="checkbox-active" size={15} color={Colors.primary} />
          ) : (
            <Fontisto name="checkbox-passive" size={15} color={Colors.black} />
          )}
          <Text style={styles.menuOptionNameText}>
            {value?.OptionValue?.value}
          </Text>
        </TouchableOpacity>

        {/* {isSelected && (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() =>
                handleOptionQuantityDecrement(menu.Option.option_name, value)
              }>
              <AntDesign
                name="minussquare"
                size={30}
                color={layout_setting?.basecolor}
              />
            </TouchableOpacity>

            <Text
              style={{fontSize: 18, color: Colors.black, marginHorizontal: 5}}>
              {qty}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleOptionQuantityIncrement(menu.Option.option_name, value)
              }>
              <AntDesign
                name="plussquare"
                size={30}
                color={layout_setting?.basecolor}
              />
            </TouchableOpacity>
          </View>
        )} */}

        <View style={styles.menuOptionPriceContainer}>
          <Text style={styles.menuOptionPriceText}>
            {value?.new_price == 0 ||
            value?.new_price === null ||
            value?.new_price === undefined
              ? 'Free'
              : `€ ${parseFloat(
                  calculateTaxPercentOfPrice(value?.new_price, menu.item_tax) +
                    value?.new_price,
                ).toFixed(2)}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{flex: 0.93}}
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.productInfoContainer}>
          {MenuMedia.length == 0 ? (
            <View style={styles.productImageContainer}>
              <FastImage
                source={{uri: baseURL + '/restaurant_data/' + menu_photo}}
                style={styles.productImage}
                resizeMode="stretch"
              />
            </View>
          ) : (
            <Swiper
              removeClippedSubviews={false}
              autoplayTimeout={3.5}
              style={{height: WINDOW_WIDTH < 420 ? 125 : 220}}
              showsButtons={true}
              showsPagination={false}
              autoplay={true}
              nextButton={
                <AntDesign name="caretright" size={24} color={'white'} />
              }
              prevButton={
                <AntDesign name="caretleft" size={24} color={'white'} />
              }>
              {MenuMedia.map((item, index) => {
                return (
                  <View style={styles.productImageContainer}>
                    <FastImage
                      key={index}
                      source={{
                        uri: baseURL + '/restaurant_data/' + item.menu_photo,
                      }}
                      style={styles.productImage}
                      resizeMode="stretch"
                    />
                  </View>
                );
              })}
            </Swiper>
          )}

          <View style={styles.productDescriptionContainer}>
            <View style={styles.productNameContainer}>
              <Text
                style={[
                  styles.productNameText,
                  {color: layout_setting?.h2_text_color},
                ]}>
                {menu_name.replaceAll('�', '')}
              </Text>
              {/* <Text
                style={[
                  styles.productNameText,
                  {color: layout_setting?.h2_text_color},
                ]}>
                €{' '}
                {displayPrice.length == 0
                  ? menu_price.toFixed(decimal_places)
                  : newPrice.toFixed(decimal_places)}
              </Text> */}
            </View>

            <Text style={styles.productDescription}>
              {menu_description || 'No description added'}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalLine} />

        {MenuAllergyItems.length > 0 && (
          <View style={styles.menuOptionsWrapper}>
            <View style={styles.menuOptionTitleContainer}>
              <Text style={styles.productNameText}>Allergens</Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              {MenuAllergyItems.map((value, index) => {
                return (
                  <Text
                    key={index}
                    style={[
                      styles.allergensText,
                      {
                        backgroundColor: layout_setting?.basecolor,
                      },
                    ]}>
                    {value.Allergy_Item.item_name}
                  </Text>
                );
              })}
            </View>
          </View>
        )}

        {MenuOptions.map((menu, index1) => {
          return (
            <View key={index1} style={styles.menuOptionsWrapper}>
              <View style={styles.menuOptionTitleContainer}>
                <Text style={styles.productNameText}>
                  {menu.Option.option_name}
                </Text>
                {menu.required == 1 && (
                  <Text style={styles.requiredText}>REQUIRED</Text>
                )}
              </View>

              {menu.MenuOptionValues.map((value, index2) => {
                return menu.Option.display_type == 'radio'
                  ? renderRadioBtns(value, index2, menu)
                  : menu.Option.display_type == 'select'
                  ? renderSelectorBtns(value, index2, menu)
                  : renderCheckboxBtns(value, index2, menu);
              })}
            </View>
          );
        })}

        <View style={styles.menuOptionsWrapper}>
          <Text style={styles.productNameText}>Add Special Instructions</Text>

          <TextInput
            value={instructions}
            style={styles.instrctionsInput}
            placeholderTextColor={Colors.grey}
            placeholder="e.g. add something extra"
            onChangeText={handleInstructionChange}
          />
        </View>

        {recItems.length > 0 && (
          <View style={styles.menuOptionsWrapper}>
            <View style={styles.menuOptionTitleContainer}>
              <Text style={styles.productNameText}>Recommended Item</Text>
            </View>

            <View style={styles.productDetailsWrapper}>
              {recItems.map((prod, index) => {
                let priceWithTax =
                  prod.menu_price + prod.menu_price * (prod.menu_tax / 100);

                return (
                  <NewProductCard
                    baseURL={baseURL}
                    key={index}
                    item={prod}
                    price={priceWithTax}
                    setViewFlag={setViewFlag}
                  />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBtnsWrapper}>
        <View style={styles.countingBtns}>
          <TouchableOpacity onPress={handleDecreament}>
            <AntDesign
              name="minussquare"
              size={30}
              color={layout_setting?.basecolor}
            />
          </TouchableOpacity>

          <Text style={styles.productPriceText}>{quantity}</Text>

          <TouchableOpacity onPress={handleIncreament}>
            <AntDesign
              name="plussquare"
              size={30}
              color={layout_setting?.basecolor}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, bgStyle]}
          onPress={handleAddToCart}>
          <Text style={styles.orderBtnText}>ADD TO ORDER</Text>
        </TouchableOpacity>
        <View>
          <Text
            style={[
              styles.productNameText,
              {color: layout_setting?.h2_text_color},
            ]}>
            €{' '}
            {displayPrice.length == 0
              ? menu_price.toFixed(decimal_places)
              : newPrice.toFixed(decimal_places)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  productDetailsWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {flex: 1},

  topContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
  },

  backBtn: {padding: 10},

  waiterBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: 7,
  },
  waiterTxt: {
    color: Colors.white,
    fontSize: 10,
  },

  cartBtnContainer: {
    marginRight: 10,
    backgroundColor: '#43b149',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
  },

  cartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartCounterView: {
    zIndex: 1,
    width: 18,
    height: 18,
    borderRadius: 10,
    marginRight: -7,
    marginBottom: -5,
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    backgroundColor: Colors.offWhite,
  },

  cartCounter: {fontSize: 14, color: Colors.primary, fontWeight: 'bold'},

  productInfoContainer: {
    width: '90%',
    marginVertical: 10,
    alignSelf: 'center',
  },

  productImageContainer: {
    flex: 1,
    alignItems: 'center',
  },

  productImage: {
    width: '100%',
    height: WINDOW_WIDTH < 420 ? 125 : 220,

    // width: WINDOW_WIDTH < 420 ? 125 : 150,
    // height: WINDOW_WIDTH < 420 ? 125 : 150,
    // borderRadius: 75,
  },

  productDescriptionContainer: {
    flex: 2,
    justifyContent: 'center',
  },

  productNameContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productNameText: {
    fontSize: WINDOW_WIDTH < 420 ? 18 : 20,
    color: Colors.black,
    fontWeight: 'bold',
    fontFamily: 'FreeSans',
  },

  productPriceText: {fontSize: 18, color: Colors.black},

  productDescription: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'FreeSans',
  },

  productType: {fontSize: 14, color: Colors.grey, marginTop: 5},

  horizontalLine: {
    width: '95%',
    borderWidth: 0.3,
    marginBottom: 10,
    alignSelf: 'center',
    borderColor: Colors.grey,
  },

  menuOptionsWrapper: {
    padding: 15,
    width: '90%',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'center',
    borderColor: Colors.offWhite,
    backgroundColor: Colors.white,
  },

  menuOptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  allergensText: {
    fontSize: 15,
    marginTop: 5,
    borderRadius: 20,
    paddingVertical: 5,
    color: Colors.white,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },

  requiredText: {
    fontSize: 12,
    borderRadius: 5,
    color: Colors.white,
    paddingHorizontal: 3,
    backgroundColor: Colors.primary,
  },

  menuOptionContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuOptionNameContainer: {
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },

  menuOptionNameText: {color: Colors.black, marginLeft: 10},

  menuOptionPriceContainer: {
    width: '15%',
    paddingVertical: 5,
    alignItems: 'flex-end',
  },

  menuOptionPriceText: {color: Colors.black},

  instrctionsInput: {
    width: '100%',
    marginTop: 20,
    borderWidth: 0.5,
    borderRadius: 10,
    color: Colors.black,
    paddingHorizontal: 10,
    borderColor: Colors.grey,
  },

  bottomBtnsWrapper: {
    flex: 0.1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  countingBtns: {
    flex: WINDOW_WIDTH < 420 ? 0.2 : 0.12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderBtn: {
    flex: WINDOW_WIDTH < 420 ? 0.7 : 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
  },

  orderBtnText: {fontSize: 18, color: Colors.white},
});
