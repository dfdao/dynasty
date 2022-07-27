import pkg from "json-server";
const { create, router: _router, defaults } = pkg;
import { ethers } from "ethers";
import fs from "fs";
var server = create();
var router = _router("db.json");
import bodyParser from "body-parser";
var middlewares = defaults();

function simpleAuth(req, res, next) {
  console.log("hello!");
  console.log("req", req.body);
  // if not post, delete, patch, or put request execute post request
  // return 401 if no signature attached
  // return 401 if signature's address not found in whitelist
  // execute post request
  if (
    req.method !== "POST" &&
    req.method !== "PATCH" &&
    req.method !== "PUT" &&
    req.method !== "DELETE"
  ) {
    next();
    return;
  }

  const body = req.body;
  console.log(body);
  if (!body.signedMessage) {
    res.status(401).send({ error: "no message included" });
    return;
  } else {
    const address = ethers.utils.verifyMessage(
      body.signedMessage,
      body.signedMessage
    );
    var obj = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const found = !!obj.whitelist.find((item) => item.address == address);
    // if (!found)
    //   res.status(401).send({ error: "message signer not authorized" });
    delete req.body.signedMessage;
    next();
  }
}

// this method overwrites the original json-server's way of response
// with your custom logic, here we will add the user to the response
router.render = function (req, res) {
  // manually wrap any response send by json-server into an object
  // this is something like `res.send()`, but it is cleaner and meaningful
  // as we're sending json object not normal text/response
  res.json({
    user: req.user, // the user we stored previously in `simpleAuth` function
    body: res.locals.data, // the original server-json response is stored in `req.locals.data`
  });
};

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// before proceeding with any request, run `simpleAuth` function
// which should check for basic authentication header .. etc
server.use(simpleAuth);

// continue doing json-server magic
server.use(router);

// start listening to port 3000
server.listen(3000, function () {
  console.log("JSON Server is running on port 3000");
});
