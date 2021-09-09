import axios from "axios";

export default {
  // factoriser éventuellement le axios.get(),
  // attention gestion de paramètres non présent dans cet exemple
  apiGetProductsFlask(callback) {
    axios
      .get("/api/products")
      .then((response) => {
        console.log(response.data);
        callback(response.data.products);
      })
      .catch((err) =>
        console.log(
          (process.env.NODE_ENV || "dev") == "build"
            ? err.message
            : JSON.stringify(err)
        )
      );
  },

  apiGetBokehinlinejs(callback) {
    axios
      .get("/api/bokehinlinejs")
      .then((response) => {
        console.log(response.data);
        callback(response.data);
      })
      .catch((err) =>
        console.log(
          (process.env.NODE_ENV || "dev") == "build"
            ? err.message
            : JSON.stringify(err)
        )
      );
  },
  apiGetDatasinus(callback) {
    axios
      .get("/api/datasinus/read")
      .then((response) => {
        //console.log(response.data)
        callback(response.data.sinus);
      })
      .catch((err) =>
        console.log(
          (process.env.NODE_ENV || "dev") == "build"
            ? err.message
            : JSON.stringify(err)
        )
      );
  },
};
