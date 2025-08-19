import { Sequelize } from "sequelize";
import pg from "pg";
export function createSequelize(database: string) {
  // return new Sequelize({
  //   dialect: "postgres",
  //   dialectModule: pg,
  //   host: process.env.NEON_DATABASE_HOST,
  //   port: Number(process.env.NEON_DATABASE_PORT),
  //   define: {
  //     underscored: true,
  //   },
  //   database,
  //   username: process.env.NEON_DATABASE_USERNAME,
  //   password: process.env.NEON_DATABASE_PASSWORD,
  //   logging: false,
  // });
  return new Sequelize(
    `${process.env.NEON_DATABASE_URI}/${database}?sslmode=require`,
    {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
    }
  );
}
