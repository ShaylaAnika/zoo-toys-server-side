const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

//midleware
app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.armlh7w.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   

    const toysInfoCollection = client.db('toysInfodb').collection('toysInfo');

    const indexKeys = { productName: 1 };
    const indexOptions = { name: "toyName" };

    //const result = await toysInfoCollection.createIndex(indexKeys, indexOptions);

    app.get('/toySearch/:text' , async (req , res) => {
        const searchToy = req.params.text;
         const result = await toysInfoCollection.find({ productName: { $regex: searchToy, $options: "i" } }).toArray();
         res.send(result);
    })


    app.get('/toys' , async(req , res) => {
        const cursor = toysInfoCollection.find();
        const result = await cursor.limit(20).toArray();
        res.send(result);
    })

    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        // console.log(id);
        const query = {_id: new ObjectId(id)}
        const result = await toysInfoCollection.findOne(query);
        res.send(result);
    })

    app.get('/categoriesToy/:text' , async(req , res) => {
        const categoryName = req.params.text;
        // console.log(categoryName);
        if(categoryName == "teddy bear" || categoryName == "Dinosaur" || categoryName == "Unicorn"){
            const result = await toysInfoCollection.find({subCategory : categoryName}).limit(2).toArray();
            return res.send(result);
        }
    })

    app.get("/toys-email/:email", async (req, res) => {
        //console.log(req.params.email);
        const myToys = await toysInfoCollection.find({
            sellerEmail: req.params.email,
          }).toArray();
        res.send(myToys);
      });

      app.get('/sortprice/:text' , async (req , res) => {
        const sortText = req.params.text;
         
        let sortDirection = 0;
        if(sortText == 'low'){
             sortDirection = -1;
             const result = await toysInfoCollection.find().sort({price: sortDirection}).collation({locale: "en_US , numericOrdering: true"}).toArray();
             return res.send(result);

        }
        else if(sortText == 'high'){
             sortDirection = 1;
             const result = await toysInfoCollection.find().sort({ price: sortDirection}).collation({locale: "en_US , numericOrdering: true"}).toArray();
             return res.send(result);

        }   
      })

      

    app.post('/toys' , async (req , res) => {
        const toys = req.body;
        //console.log(toys);
        const result = await toysInfoCollection.insertOne(toys);
        res.send(result);
    })

    app.patch('/toys/:id' , async (req , res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updatedToy = req.body;
        const options = { upsert: true };
        console.log(updatedToy);

        const toy = {
            $set: {
                price: updatedToy.price, 
                quantity: updatedToy.quantity,  
                details: updatedToy.details,
            }
        }

        const result = await toysInfoCollection.updateOne(filter, toy, options);
        res.send(result);

    })

    

    app.delete('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toysInfoCollection.deleteOne(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.get('/' , (req , res) =>{
    res.send('animal toys server is running')
})

app.listen(port , () => {
    console.log(`animal toys server is running on port ${port}`)
})