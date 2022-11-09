import db from "../models/index";
import CRUDservice from "../services/CRUDservice";

//Render data to view
let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    console.log("---------");
    console.log(data);
    console.log("---------");
    return res.render("homePage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
};

let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

let postCRUD = async (req, res) => {
  let mess = await CRUDservice.createNewUser(req.body);
  console.log(mess);
  return res.send("success");
};

let displayUser = async (req, res) => {
  let data = await CRUDservice.getAllUser();
  return res.render("displayCRUD.ejs", {
    dataTable: data,
  });
};

let getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  console.log(userId);
  if (userId) {
    let userData = await CRUDservice.getUserById(userId);
    console.log(userData);
    return res.render("editCRUD.ejs", {
      user: userData,
    });
  } else {
    return res.send("User not found");
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  let allUser = await CRUDservice.updateUserData(data);
  return res.render("displayCRUD.ejs", {
    dataTable: allUser,
  });
};

let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDservice.deleteUser(id);
    return res.send("delete user success");
  } else return res.send("USer not found");
};
module.exports = {
  getHomePage: getHomePage,
  postCRUD,
  getCRUD,
  displayUser: displayUser,
  getEditCRUD: getEditCRUD,
  putCRUD: putCRUD,
  deleteCRUD: deleteCRUD,
};
