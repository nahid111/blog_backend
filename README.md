# Blog_Backend : Node.js Backend for The-Blog-Project
<p>
Backend: Express.js,     Database: MongoDB,     ORM: Mongoose
</p>


## API Documentation
- [Postman Doc](https://documenter.getpostman.com/view/7833390/SzfB176U?version=latest)


## installation
- install NodeJs & npm
- install dependencies 
```
$ npm install
```
- Copy & rename .env.example file to .env
- Set env variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
```
- Seed the DB using
```
$ node seeder -i
```
- Run the application using 
```
$ npm run dev
```

