import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.resolve();
const mongo_id = process.env.MONGO_ID;
const mongo_password = process.env.MONGO_PASSWORD;
const mongo_url = "mongodb+srv://" + mongo_id + ":" + mongo_password + "@cluster0.jab1y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let db;

const mongoClient = MongoClient.connect(mongo_url, (error, result) => {
    if (error) return console.log(err);
    db = result.db("todo-app");  // DB 불러오기

    app.post("/add", (req, res) => {
        // number 값을 정해주기 위해 total post count 값 가져옴
        db.collection("counter").findOne({ name: "postCount" }, (error, result) => {
            let totalCount = result.totalPost

            // add a post with number
            db.collection("post").insertOne({ number: totalCount+1, todo: req.body.todo, detail: req.body.detail }, (err, result) => {
                res.send("<script>alert('저장');location.href = document.referrer</script>");
                
                // total post count 증가
                db.collection("counter").updateOne({name : "postCount"}, {$inc: {totalPost:1}}, (error, result) => {
                    if(error) return console.log(error);
                });
            });
        })
    });

    app.get("/list", (req, res) => {
        db.collection("post").find().toArray((error, result) => {
            res.render("list.ejs", { posts: result });
        });
    });

    app.delete("/delete", (req, res) => {
        // console.log(req.body);
        req.body.number = parseInt(req.body.number);
        db.collection("post").deleteOne(req.body, (error, result) => {
            if(error) res.status(400);    // 실패
            else res.status(200).send({message: "성공"});    // 성공 응답 코드
        });
    });

    app.get("/detail/:id", (req, res) => {
        db.collection("post").findOne({number : parseInt(req.params.id)}, (error, result) => {
            if(error) console.log(error)
            res.render("detail.ejs", {data : result});
        })
    })

    app.get("/edit/:id", (req, res) => {
        db.collection("post").findOne({number : parseInt(req.params.id)}, (error, result) => {
            if(error) console.log(error)
            res.render("edit.ejs", {data : result});
        })
    })

    app.put("/edit", (req, res) => {
        db.collection("post").updateOne({number:parseInt(req.body.number)}, {$set: {todo:req.body.todo, detail:req.body.detail}}, (error, result) => {
            if(error) res.status(400);    // 실패
            else res.status(200).send({message: "성공"});    // 성공 응답 코드
            // res.redirect("/list");
        })
    })

    // app.put("/edit", (req, res) => {
    //     db.collection("post").updateOne({number:parseInt(req.body.number)}, {$set: {todo:req.body.todo, detail:req.body.detail}}, (error, result) => {
    //         if(error) console.log(error)
    //     })
    // })
});



app.listen(8080, () => {  // callback function(함수에서 함수를 호출함)
    console.log("Listening on 8080");
});

app.get("/", (req, res) => {
    // res.sendFile(path.join(__dirname, "/index.ejs"));
    res.render("index.ejs");
});

app.get("/write", (req, res) => {
    // res.sendFile(path.join(__dirname, "/write.ejs"));
    res.render("write.ejs");
});
// // tag의 name으로 불러오기
// app.post("/add", (req, res) => {  
//     res.send(req.body.todo + " " + req.body.detail);
// });

