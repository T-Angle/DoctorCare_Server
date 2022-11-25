import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayUser);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  //Login
  router.post("/api/login", userController.handleLogin);
  //User
  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/create-new-user", userController.handleCreateNewUser);
  router.delete("/api/delete-user", userController.handleDeleteUser);
  router.put("/api/edit-user", userController.handleEditUser);
  router.get('/api/allcode', userController.getAllCode)


  return app.use("/", router);
};

module.exports = initWebRoutes;
