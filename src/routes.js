import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import OrganizingController from './app/controllers/OrganizingController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/meetups', MeetupController.index);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:id', MeetupController.update);
routes.delete('/meetup/:id', MeetupController.delete);

routes.post('/subscribe/:meetupId', SubscriptionController.store);

routes.get('/subscriptions', SubscriptionController.index);

routes.get('/organizing', OrganizingController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
