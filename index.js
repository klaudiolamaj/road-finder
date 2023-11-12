const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000; // You can change this to your desired port

app.use(express.static('public'));

// app.get('/getTransitOptions', async (req, res) => {
//   try {
//     const start = req.query.start;
//     const end = req.query.end;

//     const response = await getTransitOptionsFromAPI(start, end);

//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// async function getTransitOptionsFromAPI(start, end) {
//   const apiUrl = 'https://maps.googleapis.com/maps/api/directions/json';
//   const response = await axios.get(apiUrl, {
//     params: {
//       origin: start,
//       destination: end,
//       key: 'YOUR_API_KEY', // Replace with your actual API key
//       mode: 'transit',
//     },
//   });

//   return response;
// }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
