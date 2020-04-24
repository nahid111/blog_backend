const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Load models
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const User = require('../models/User');

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
});


// Read JSON files
const profiles = JSON.parse(fs.readFileSync(`${__dirname}/_data/profiles.json`, 'utf-8'));
const posts = JSON.parse(fs.readFileSync(`${__dirname}/_data/posts.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));



// import into DB
const importData = async () => {
    try {
        await Profile.create(profiles);
        await Post.create(posts);
        await User.create(users);
        console.log('Database Seeded...'.brightGreen.inverse);
        process.exit();
    } catch (err) {
        console.log(`${err.message}`.red.inverse);
        process.exit();
    }
}

// Delete all from  DB
const deleteData = async () => {
    try {
        await Profile.deleteMany();
        await Post.deleteMany();
        await User.deleteMany();
        console.log(`Database destroyed...`.magenta.inverse);
        process.exit();
    } catch (err) {
        console.log(`${err.message}`.red.inverse);
        process.exit();
    }
}




if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}



// run the following command to import data
// node seeder -i
// run the following command to delete data
// node seeder -d
