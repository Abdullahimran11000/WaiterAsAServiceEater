import AsyncStorage from '@react-native-async-storage/async-storage';

let rooturl = 'https://api.tabletordercard.be/';
let cloudIp = AsyncStorage.getItem('cloudIp');
console.log('CLOUDIP', cloudIp);
const Path = {
  imagePath: cloudIp != null ? cloudIp : rooturl,
};

export default Path;
