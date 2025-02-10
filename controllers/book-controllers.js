const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const grade =
    bookObject.ratings && bookObject.ratings[0]
      ? bookObject.ratings[0].grade
      : 0;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    ratings: [
      {
        userId: req.auth.userId,
        grade: grade,
      },
    ],
    averageRating: grade,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      console.log("Erreur lors de l'enregistrement du livre:", error);
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.file) {
          const oldImage = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${oldImage}`, (err) => {
            if (err) console.log("L'image n'a pas pu être supprimé :", err);
          });
        }
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;
  const grade = rating;
  const bookId = req.params.id;

  if (!userId || !bookId || grade === undefined) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  if (typeof grade !== "number" || grade < 0 || grade > 5) {
    return res
      .status(400)
      .json({ error: "La note doit être un nombre entre 0 et 5." });
  }

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre introuvable." });
      }

      const existingRating = book.ratings.find(
        (r) => r.userId.toString() === userId
      );
      if (existingRating) {
        return res.status(400).json({ error: "Vous avez déjà noté ce livre." });
      }
      book.ratings.push({ userId, grade });
      book.averageRating =
        book.ratings.reduce((acc, r) => {
          if (typeof r.grade === "number" && !isNaN(r.grade)) {
            return acc + r.grade;
          }
          return acc;
        }, 0) / book.ratings.length;

      return book.save();
    })
    .then((updatedBook) => {
      const bookWithId = updatedBook.toObject();
      bookWithId.id = bookWithId._id;
      delete bookWithId._id;
      res.status(200).json(bookWithId);
    })
    .catch((error) => {
      console.error("Erreur interne du serveur:", error);
      res
        .status(500)
        .json({ error: "Une erreur est survenue.", details: error.message });
    });
};

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
