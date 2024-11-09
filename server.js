// файл server.js нужен для старта сервера на node.js heroku
// название файла может быть любым (главное его потом прописать в package.json, где start:prod)

// код пишется на JavaScript
// данный файл никак не связан с кодом в папке src - этот файл нужен только для запуска сервера node.js, куда затем будет установлено само приложение


// импорт сторонних библиотек (будут подключены в папку node_modules, т.к. в файле package.json указан "type": "module",
import * as https from "https"; // чтобы выполнять запрос по https
import express from 'express'; // используем более легковесный сервер express https://www.geeksforgeeks.org/node-js-vs-express-js/#:~:text=js%3A-,Node.,a%20framework%20based%20on%20Node.
import proxy from 'http-proxy-middleware'; // для создания прокси сервера
import path from 'path'; // для путей к скомпилированным файлам
import fs from 'fs';

const app = express(); // создаем объект express для настройки и старта

// хостинг (веб контейнер), где находится  backend
const herokuBackendUrl = 'https://todo-spring-backend-0afdbc42067b.herokuapp.com/'; // здесь должен быть фактический адрес контейнера


const rootPath = path.resolve(); // путь до папки, где будет расположен проект в heroku
const appName = 'frontend-server'; // должно совпадать с названием проекта



// по-умолчанию не будут разрешены запросы из сторонних сайтов, т.к. не включена библиотека cors - т.е. только пользователь из браузера сможет обратиться

// основная причина исп-я прокси - это отправка браузером куков в запросы на backend
// при установке на Heroku - домены клиента и сервера отличаются (не localhost), поэтому браузер не будет отправлять куки из-за параметра Strict

app.use('/api', proxy.createProxyMiddleware({
  target: herokuBackendUrl, // куда будет перенаправлен запрос
  changeOrigin: true, // изменить параметр origin - откуда приходит запрос - будет убрано слово "api"
  secure: true, // только по каналу нttps
  withCredentials: true, // отправлять кук (т.к. это решает уже не браузер, то куки будут отправлены)
  pathRewrite: { // удалить слово api из url
    "^/api/": ""
  }
}));

// путь до скомпилированных файлов в папке dist - все входящие запросы будут направляться именно в эту папку
app.use(express.static(rootPath + '/dist/' + appName)); // название берется из файла package.json, поле name

// проверяем все входящие запросы
app.get('*', function (req, res, next) {
  if (req.headers['x-forwarded-proto'] != 'https') // если запрос не содержит https
    res.redirect(herokuBackendUrl + req.url) // тогда явно перебросить на https
  else
    next() // иначе продолжить запрос (значит уже содержит https)
})

// все запросы направляем в папку dist
app.get('/*', function (req, res) {
  const fullPath = path.join(rootPath + '/dist/' + appName + '/index.html');
  res.sendFile(fullPath);
})


// для проверки и локального запуска ---------------------------------------------

// const options = {
//   key: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/javabegin_ssl.key'),
//   cert: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/javabegin_ssl.cer')
// };
// const appServer = https.createServer(options, app);
//
//
// const port = process.env.PORT || 3001;
//
// // запуск сервера - нужно закомментировать строки ниже "запуск сервер на heroku"
// appServer.listen(port, () => console.log(`App running on: https://localhost:${port}`));

// ---------------------------------------------


// запуск сервера на heroku
const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});


