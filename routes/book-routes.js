const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload, convertToWebp } = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book-controllers");

router.get("/", bookCtrl.getAllBook);
router.get("/:id", bookCtrl.getOneBook);

router.post("/", auth, upload, convertToWebp, bookCtrl.createBook);

router.put("/:id", auth, upload, convertToWebp, bookCtrl.modifyBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
