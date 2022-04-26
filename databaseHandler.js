const bcrypt = require("bcryptjs/dist/bcrypt");
const async = require("hbs/lib/async");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const URL =
  "mongodb+srv://tiennam01:23082001@cluster0.n2pwj.mongodb.net/test";
const DATABASE_NAME = "FPTBook-AsmApplication-Group3";

async function getdbo() {
  const client = await MongoClient.connect(URL);
  const dbo = client.db(DATABASE_NAME);
  return dbo;
}

async function insertObject(collectionName, objectToInsert) {
  const dbo = await getdbo();
  const newObject = await dbo
    .collection(collectionName)
    .insertOne(objectToInsert);
  console.log(
    "Gia tri id moi duoc insert la: ",
    newObject.insertedId.toHexString()
  );
}

async function searchObjectbyName(collectionName, name) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ name: { $regex: name, $options: "i" } })
    .toArray();
  return result;
}
async function getAll(collectionName) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({})
    .sort({ time: -1 })
    .toArray();
  return result;
}
async function deleteDocumentById(collectionName, id) {
  const dbo = await getdbo();
  await dbo.collection(collectionName).deleteOne({ _id: ObjectId(id) });
}

async function deleteDocument(collectionName, objectToDelete) {
  const dbo = await getdbo();
  await dbo.collection(collectionName).deleteOne(objectToDelete)
}

async function getDocumentById(id, collectionName) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .findOne({ _id: ObjectId(id) });
  return result;
}

async function updateDocument(id, updateValues, collectionName) {
  const dbo = await getdbo();
  await dbo
    .collection(collectionName)
    .updateOne({ _id: ObjectId(id) }, updateValues);
}
async function getDocumentByName(collectionName, name) {
  const dbo = await getdbo();
  const result = await dbo.collection(collectionName).findOne({ name: name });
  return result;
}
async function saveDocument(collectionName, id, newValue) {
  const dbo = await getDbo();
  await dbo.collection(collectionName).save({ _id: ObjectId(id), newValue });
}


async function searchObjectbyPrice(collectionName, price) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ price: price })
    .toArray();
  return result;
}

async function searchObjectbyCategory(collectionName, category) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ category: ObjectId(category) })
    .toArray();
  return result;
}

async function deleteOne(collectionName, deleteObject) {
  const dbo = await getdbo();
  const result = await dbo.collection(collectionName).deleteOne(deleteObject);
  if (result.deletedCount > 0) {
    return true;
  } else {
    return false;
  }
}
async function SortdownPrice(collectionName) {
  const dbo = await getdbo()
  const results = await dbo.collection(collectionName).find({}).sort({price:-1}).toArray()   
  return results
}
module.exports = {
  SortdownPrice,
  deleteOne,
  searchObjectbyPrice,
  searchObjectbyCategory,
  getDocumentByName,
  saveDocument,
  searchObjectbyName,
  insertObject,
  getAll,
  deleteDocumentById,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
