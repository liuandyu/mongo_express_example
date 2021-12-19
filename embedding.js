const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
});

const Author = mongoose.model('Author', authorSchema);

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  authors: [authorSchema]
}));

async function createCourse(name, authors) {
  const course = new Course({
    name, 
    authors
  }); 
  
  const result = await course.save();
  console.log(result);
}

async function listCourses() { 
  const courses = await Course.find();
  console.log(courses);
}

async function updateAuthor(courseId) {
  const course = await Course.findById(courseId);
  course.author.name = 'Mosh Updated';
  course.save();
}

//or directly update database
async function updateAuthor2(courseId) {
  const course = await Course.updateOne({ _id:courseId }, {
    $set: {
      'author.name': 'John Smith'
    }
  });
}

async function updateAuthor3(courseId) {
  const course = await Course.updateOne({ _id:courseId }, {
    $unset: {
      'author': ''
    }
  });
}

async function getAuthorId(name) {
  const pattern = /.*name.*/i
  const courses = await Course.find();
  let course = courses[0];
  return course._id.toString();
  //console.log(course._id.toString());
}

async function addAuthor(courseId, author) {
  const course = await Course.findById(courseId);
  course.authors.push(author);
  course.save();
}

async function removeAuthor(courseId, authorId) {
  const course = await Course.findById(courseId);
  const author = course.authors.id(authorId);
  author.remove();
  course.save();
}

//createCourse('Node Course', [new Author({ name: 'Mosh', bio: 'Mosh Bio', website: 'Mosh website' }), new Author({name:'Jone'})]);
//updateAuthor3('61b4eb9ec98861b473e54a4c');
//getAuthorId('Node');

//addAuthor('61b4f2eb535a6351948b0047', new Author({name: "Jone Deo"}));
removeAuthor('61b4f2eb535a6351948b0047', '61b4f6fc89cedb1b718e4d30')
