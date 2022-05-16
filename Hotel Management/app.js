const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const {
    Pool
} = require('pg');

const app = express();



app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static("public"));



let pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: '201901085_db',
    password: 'admin',
    port: 5432
});



var CustomerLoginInfo = {
  Customer_ID: "-1",
  Name: "Null",
  Email: "Null",
  Mobile_Number: "Null",
  Address: "Null"
};









app.get("/", function(req, res) {
    res.render("home", {
      data: 0,
      visualLogin: "",
      visualRegister: ""
    });
});


app.get("/userLogin", function(req, res) {
    res.render("userLogin", {
      visualRegister: "",
      visualLogin: ""
    });
});

app.get("/adminLogin", (req, res) => {
    res.render("adminLogin", {
      visualRegister: "",
      visualLogin: ""
    });
});


app.get("/userLoggedIn", function(req, res) {
  res.render("userLoggedIn", {
    visualRegister: "visually-hidden",
    visualLogin: "visually-hidden",
    customerData: CustomerLoginInfo,
    CustomerId: 1
  });
});






app.get("/contect", (req,res)=>{
    res.render("contect",{
      visualRegister: "",
      visualLogin: ""
    });
});


app.get("/rooms", (req,res)=>{

    try {
        pool.connect(async (err, client, release) => {

            client.query('SET SEARCH_PATH TO "HMS"');
      
            const Query = `SELECT * from "Room";`;
            // console.log("my server is connected now");
            let resp = await client.query(Query);

            res.render("room",{
              visualRegister: "visually-hidden",
              visualLogin: "visually-hidden",
              Room: resp.rows
            });

          });
    }catch (err){
        console.log(err);
    }
    
});



app.get("/info_get", (req, res) => {
    try {
        pool.connect(async (err, client, release) => {

            client.query('SET SEARCH_PATH TO "HMS"');
      
            const Query = `SELECT * from "Room";`;
            // console.log("my server is connected now");
            let resp = await client.query(Query);
            res.send(resp.rows);
          });
    }catch (err){
        console.log(err);
    }
});



app.get("/userRegister", function(req, res) {
  res.render("userRegister", {
    visualRegister: "",
    visualLogin: "",
    message: "",
    CustomerId: 1
  });
});



app.get("/payment", function(req, res) {
  res.render("payment", {
    visualRegister: "visually-hidden",
    visualLogin: "visually-hidden",
    amount: "0",
    Room_ID: -1,
    Item_ID: -1
  });
});







app.get("/inventory", function(req, res) {

  try {
    pool.connect(async (err, client, release) => {

        client.query('SET SEARCH_PATH TO "HMS"');
  
        const Query = `SELECT * from "Inventory";`;
        // console.log("my server is connected now");
        let resp = await client.query(Query);

        res.render("inventory",{
          visualRegister: "visually-hidden",
          visualLogin: "visually-hidden",
          Item: resp.rows
        });
      });
  }catch (err){
      console.log(err);
  }

});












app.post("/userLoggedIn", function(req, res) {

    try {
      pool.connect(async (err, client, release) => {

        client.query('SET SEARCH_PATH TO "HMS"');
        const Query = `SELECT * FROM "Customer";`;
        const resp = await client.query(Query);
  
        // console.log(resp.rows.length);
        // res.render("home", {data: resp.rows.length});

        // console.log(req.body);
        
        for (let i = 0; i < resp.rows.length; i++) {
          //console.log(resp.rows[i]);
          // console.log(resp.rows[i]);

          if (req.body.UserName === resp.rows[i].Username) {
            if (req.body.Password_ === resp.rows[i].Password) {
              // console.log(resp1.rows);
  
              CustomerLoginInfo = resp.rows[i];
              // console.log("YES");
              
              res.render("userLoggedIn", {
                visualRegister: "visually-hidden",
                visualLogin: "visually-hidden",
                customerData: resp.rows[i],
                CustomerId: resp.rows[i].Cutomer_ID
              });
            }
          }
        }
        
        // res.redirect("/");
  
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  
  });
  

 





  app.post("/userRegister", function(req, res) {

    const customerName = req.body.CustomerName;
    const email = req.body.Email;
    const Mobile = req.body.Mobile;
    const Address = req.body.Address;
    const Username = req.body.Username;
    const Password = req.body.Password;
  
    try {
      pool.connect(async (err, client, release) => {
        client.query('SET SEARCH_PATH TO "HMS"');
        let Query1 = `SELECT * FROM "Customer"`;
  
        let resp1 = await client.query(Query1);
        var temp = "false";
  
  
        for (let i = 0; i < resp1.rows.length; i++) {
          if (resp1.rows[i].Username === Username) {
            
            temp = "true";
            res.render("userRegister", {
              visualLogin: "",
              visualRegister: "visually-hidden",
              message: "* Username already exists Please try another one",
              CustomerId: 1
            });
          }
        }
  
        if(temp === "false") {
          const id = resp1.rows.length + 1;
  
          const text = `INSERT INTO "Customer"("Customer_ID", "Name", "Address", "Email", "Username", "Password", "Mobile_Number")
                        VALUES ($1, $2, $3, $4, $5, $6, $7)`;
          const values = [id, customerName, Address, email, Username, Password, Mobile];
  
  
  
          client.query('SET SEARCH_PATH TO "HMS"');
  
          let resp2 = await client.query(text, values);
  
          
          res.render("home", {
            visualRegister: "",
            visualLogin: "",
            data: 0
          });
        }
  
  
      });
    } catch (err) {
      console.log(err);
    }
  });







  app.post("/booking/:ID", function(req, res) {
    
  
    try {
      pool.connect(async (err, client, release) => {


          const id = req.params.ID;

          client.query('SET SEARCH_PATH TO "HMS"');
  
          let resp = await client.query(`SELECT "Prices", "Room_ID" from "Room" where "Room_ID" = $1`, [id]);

          //cconsole.log(resp.rows);

          res.render("payment", {
            visualRegister: "visually-hidden",
            visualLogin: "visually-hidden",
            amount: resp.rows[0].Prices,
            Room_ID: id,
            Item_ID: -1
          })

        });

    }catch (err){
      console.log(err);
    }
    
  });





  app.post("/afterPaymentRoom/:ID", function(req, res) {
    
    try {
      pool.connect(async (err, client, release) => {
          
          const id = req.params.ID;

          client.query('SET SEARCH_PATH TO "HMS"');



          let resp1 = await client.query(`UPDATE "Room" SET "Room_Available" = 1 where "Room_ID" = $1`, [id]);
  
          let resp = await client.query(`SELECT "Prices", "Room_Type", "Room_ID" from "Room" where "Room_ID" = $1`, [id]);

          // console.log(resp.rows);

          res.render("confirm", {
            visualRegister: "visually-hidden",
            visualLogin: "visually-hidden",
            Room_ID: id,
            Item_ID: -1,
            type: resp.rows[0].Room_Type
          })

        });
    }catch (err){
      console.log(err);
    }

  });








  app.post("/inventory", function(req, res) {
    
    try {
      pool.connect(async (err, client, release) => {
  
          client.query('SET SEARCH_PATH TO "HMS"');
    
          const Query = `SELECT * from "Inventory";`;
          // console.log("my server is connected now");
          let resp = await client.query(Query);
  
          res.render("inventory",{
            visualRegister: "visually-hidden",
            visualLogin: "visually-hidden",
            Item: resp.rows,
            C_ID: req.body.customerId
          });
        });
    }catch (err){
        console.log(err);
    }

  });






  app.post("/item/:Item_ID", function(req, res) {
    
    try {
      pool.connect(async (err, client, release) => {


          const id = req.params.Item_ID;

          client.query('SET SEARCH_PATH TO "HMS"');
  
          let resp = await client.query(`SELECT "Price" from "Inventory" where "Item_ID" = $1`, [id]);

          //cconsole.log(resp.rows);

          res.render("payment", {
            visualRegister: "visually-hidden",
            visualLogin: "visually-hidden",
            amount: resp.rows[0].Price,
            Room_ID: -1,
            Item_ID: id,
            C_ID: req.body.customerId
          })

        });

    }catch (err){
      console.log(err);
    }


  });






  app.post("/afterPaymentItem/:ID", function(req, res) {
    try {
      pool.connect(async (err, client, release) => {
          
          const id = req.params.ID;
          const customerId = req.body.customerId;

          client.query('SET SEARCH_PATH TO "HMS"');
  
          let resp = await client.query(`SELECT "Item_Name", "Price" from "Inventory" where "Item_ID" = $1`, [id]);

          // console.log(resp.rows);

          let resp1 = await client.query(`SELECT "Name" from "Customer" where "Customer_ID" = $1`, [customerId]);


          res.render("confirm", {
            visualRegister: "visually-hidden",
            visualLogin: "visually-hidden",
            Name: resp1.rows[0].Name,
            Room_ID: -1,
            Item_ID: id,
            Item_Name: resp.rows[0].Item_Name,
            Price: resp.rows[0].Price
          })

        });
    }catch (err){
      console.log(err);
    }
  });






app.listen(3000, function() {
    console.log("Server is running on port 3000");
});
