import * as Joi from 'joi';
import {
  DatabaseEnvironments,
  ServerEnvironments,
} from '../types/environment.type';

export const ConfigModuleSchema = Joi.object<
  Record<DatabaseEnvironments | ServerEnvironments, string>
>({
  PORT: Joi.number().required(),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.number().required(),
});
