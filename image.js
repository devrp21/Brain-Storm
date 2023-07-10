import { access, constants } from 'fs';

var imagePath = 'D:/Dev/Languages/Projects/Brain Storm/images/0.6647985323-IMG20221028083723.jpg';

access(imagePath, constants.F_OK, (err) => {
  if (err) {
    console.error('File not found');
    imagePath="123"
    
  }
console.log(imagePath);
  // File exists, you can do whatever you want here
  console.log('File found');
});