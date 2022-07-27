import axios from "axios";

// await axios
//   .get("http://localhost:3000/rounds", {
//     params: {
//       endTime: 1,
//     },
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//   })
//   .then(function (res) {
//     console.log(res.data);
//   })
//   .catch(function (res) {
//     console.log(res);
//   });

await axios
  .post("http://localhost:3000/rounds", {
    signedMessage: "hello its me",
    timeScoreWeight: 131,
    moveScoreWeight: 121,
    winner: "me",
    startTime: 10,
    endTime: 1,
  })
  .then(function (res) {
    console.log(res.data);
  })
  .catch(function (res) {
    console.log(res);
  });

// await axios
//   .put("http://localhost:3000/rounds", {
//     params: {
//       id: 15555,
//       winner: "not me",
//     },
//   })
//   .then(function (res) {
//     console.log(res.data);
//   })
//   .catch(function (res) {
//     console.log(res);
//   });

// await axios
//   .delete("http://localhost:3000/rounds/15555", {
//     params: {
//       id: 15555,
//     },
//   })
//   .then(function (res) {
//     console.log(res.data);
//   })
//   .catch(function (res) {
//     console.log(res);
//   });
