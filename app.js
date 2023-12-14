const express = require('express');
const mongoose = require('mongoose');

const app = express();


const dbURI = 'mongodb+srv://ganeshawate:8779@cluster0.awnqmvc.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas: ', err);
  });


const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});
const Item = mongoose.model('Item', itemSchema);


const createSampleData = async () => {
  for (let i = 1; i <= 100; i++) {
    await Item.create({ name: `Item ${i}`, description: `Description for Item ${i}` });
  }
};

createSampleData();

const validatePageParam = (req,res,next)=>{
  const page = parseInt(req.query.page);
  if(isNaN(page) || page<1){
    return res.status(400).json({ message:'Invalid page parameter. Page should be a positive integer.'})
  }
  next();
}

app.get('/items',validatePageParam, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; 

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < (await Item.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  try {
    results.items = await Item.find().limit(limit).skip(startIndex).exec();
    res.json(results);
  } catch (err) {
    console.error('Error fetching data: ', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
